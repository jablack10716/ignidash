'use client';

import { ConvexError } from 'convex/values';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useEffect, useState } from 'react';
import { CameraIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import posthog from 'posthog-js';
import { v4 as uuidv4 } from 'uuid';

import { FinancialSimulationEngine } from '@/lib/calc/simulation-engine';
import { FixedReturnsProvider } from '@/lib/calc/returns-providers/fixed-returns-provider';
import type { SimulatorInputs } from '@/lib/schemas/inputs/simulator-schema';

import { DialogTitle, DialogBody, DialogActions } from '@/components/catalyst/dialog';
import { progressSnapshotFormSchema, type ProgressSnapshotInputs } from '@/lib/schemas/finances/progress-snapshot-form-schema';
import NumberInput from '@/components/ui/number-input';
import { Fieldset, FieldGroup, Field, Label, ErrorMessage } from '@/components/catalyst/fieldset';
import ErrorMessageCard from '@/components/ui/error-message-card';
import { Button } from '@/components/catalyst/button';
import { Input } from '@/components/catalyst/input';
import { Textarea } from '@/components/catalyst/textarea';
import { Select } from '@/components/catalyst/select';
import { getErrorMessages } from '@/lib/utils/form-utils';
import { getCurrencySymbol, formatCurrencyPlaceholder, formatCompactCurrency } from '@/lib/utils/number-formatters';
import { Divider } from '@/components/catalyst/divider';
import { Heading } from '@/components/catalyst/heading';

interface ProgressSnapshotDialogProps {
  onClose: () => void;
}

export default function ProgressSnapshotDialog({ onClose }: ProgressSnapshotDialogProps) {
  const currentAssets = useQuery(api.finances.getAssets);
  const currentLiabilities = useQuery(api.finances.getLiabilities);
  const userPlans = useQuery(api.plans.listPlans);

  const [prefillSource, setPrefillSource] = useState<string>('current');
  const [isSimulating, setIsSimulating] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProgressSnapshotInputs>({
    resolver: zodResolver(progressSnapshotFormSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      note: '',
      assets: [],
      liabilities: [],
    },
  });

  const { fields: assetFields, append: appendAsset, remove: removeAsset } = useFieldArray({
    control,
    name: 'assets',
  });

  const { fields: liabilityFields, append: appendLiability, remove: removeLiability } = useFieldArray({
    control,
    name: 'liabilities',
  });

  const selectedDate = useWatch({ control, name: 'date' });

  // Pre-populate logic
  useEffect(() => {
    if (prefillSource === 'current') {
      if (currentAssets && assetFields.length === 0) {
        setValue('assets', currentAssets.map((a: any) => ({
          id: a.id,
          name: a.name,
          value: a.value,
          type: a.type
        })));
      }
      if (currentLiabilities && liabilityFields.length === 0) {
        setValue('liabilities', currentLiabilities.map((l: any) => ({
          id: l.id,
          name: l.name,
          balance: l.balance,
          type: l.type
        })));
      }
    } else if (prefillSource && userPlans) {
      const plan = userPlans.find(p => p._id === prefillSource);
      if (plan && plan.timeline) {
        setIsSimulating(true);
        try {
          const arrayToRecord = <T extends { id: string }>(arr: T[]): Record<string, T> => {
            return arr.reduce((acc, item) => {
              acc[item.id] = item;
              return acc;
            }, {} as Record<string, T>);
          };

          // Construct SimulatorInputs by converting arrays to Records
          const inputs = {
            timeline: plan.timeline,
            incomes: arrayToRecord(plan.incomes),
            expenses: arrayToRecord(plan.expenses),
            debts: arrayToRecord(plan.debts || []),
            physicalAssets: arrayToRecord(plan.physicalAssets || []),
            accounts: arrayToRecord(plan.accounts),
            contributionRules: arrayToRecord(plan.contributionRules),
            baseContributionRule: plan.baseContributionRule,
            marketAssumptions: plan.marketAssumptions,
            taxSettings: plan.taxSettings,
            privacySettings: plan.privacySettings,
            simulationSettings: plan.simulationSettings,
          } as unknown as SimulatorInputs;
          
          if (plan.glidePath) {
            inputs.glidePath = plan.glidePath;
          }

          const engine = new FinancialSimulationEngine(inputs);
          const returnsProvider = new FixedReturnsProvider(inputs);
          const result = engine.runSimulation(returnsProvider, plan.timeline);

          // Find closest data point
          const targetTime = new Date(selectedDate || new Date()).getTime();
          let closestPoint = result.data[0];
          let minDiff = Math.abs(new Date(closestPoint.date).getTime() - targetTime);

          for (const point of result.data) {
            const diff = Math.abs(new Date(point.date).getTime() - targetTime);
            if (diff < minDiff) {
              minDiff = diff;
              closestPoint = point;
            }
          }

          // Map projected data to form
          const projectedAssets: any[] = [];
          Object.values(closestPoint.portfolio.perAccountData).forEach((acc: any) => {
            projectedAssets.push({ id: acc.id, name: acc.name, value: acc.balance, type: acc.type });
          });
          Object.values(closestPoint.physicalAssets?.perAssetData || {}).forEach((asset: any) => {
            if (!asset.isSold) {
              projectedAssets.push({ id: asset.id, name: asset.name, value: asset.marketValue, type: asset.assetType });
            }
          });

          const projectedLiabilities: any[] = [];
          Object.values(closestPoint.debts?.perDebtData || {}).forEach((debt: any) => {
            if (!debt.isPaidOff) {
              projectedLiabilities.push({ id: debt.id, name: debt.name, balance: debt.balance, type: debt.type });
            }
          });
          // Also include physical asset loans
          Object.values(closestPoint.physicalAssets?.perAssetData || {}).forEach((asset: any) => {
            if (!asset.isSold && asset.loanBalance > 0) {
              projectedLiabilities.push({ id: asset.id + '-loan', name: asset.name + ' Loan', balance: asset.loanBalance, type: 'mortgage' });
            }
          });

          setValue('assets', projectedAssets);
          setValue('liabilities', projectedLiabilities);
        } catch (e) {
          console.error('Failed to run local simulation for pre-fill', e);
        } finally {
          setIsSimulating(false);
        }
      }
    }
  }, [prefillSource, selectedDate, currentAssets, currentLiabilities, userPlans, setValue]); // Note: Removed assetFields.length to allow overwriting when source/date changes

  // Watch values for live NW calculation
  const watchedAssets = useWatch({ control, name: 'assets' }) || [];
  const watchedLiabilities = useWatch({ control, name: 'liabilities' }) || [];
  
  const totalAssets = watchedAssets.reduce((sum, a) => sum + (Number(a?.value) || 0), 0);
  const totalLiabilities = watchedLiabilities.reduce((sum, l) => sum + (Number(l?.balance) || 0), 0);
  const calculatedNetWorth = totalAssets - totalLiabilities;

  const createManualSnapshot = useMutation((api as any).progress_snapshots.createManualSnapshot);
  const [saveError, setSaveError] = useState<string | null>(null);

  const onSubmit = async (data: ProgressSnapshotInputs) => {
    try {
      setSaveError(null);
      posthog.capture('create_manual_snapshot_detailed');
      
      // Map to Convex format (adding timestamps)
      const now = Date.now();
      const assets = data.assets.map((a: any) => ({ ...a, updatedAt: now }));
      const liabilities = data.liabilities.map((l: any) => ({ ...l, updatedAt: now }));

      await createManualSnapshot({
        date: data.date,
        note: data.note,
        assets,
        liabilities,
      });
      onClose();
    } catch (error) {
      setSaveError(error instanceof ConvexError ? error.message : 'Failed to save snapshot.');
      console.error('Error saving snapshot: ', error);
    }
  };

  return (
    <>
      <DialogTitle onClose={onClose}>
        <div className="flex items-center gap-4">
          <CameraIcon className="text-primary size-8 shrink-0" aria-hidden="true" />
          <span>Manual Progress Snapshot</span>
        </div>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Fieldset aria-label="Snapshot details">
          <DialogBody className="max-h-[70vh] overflow-y-auto">
            <FieldGroup>
              {(saveError || Object.keys(errors).length > 0) && (
                <ErrorMessageCard errorMessage={saveError || "Please check the form for errors."} />
              )}
              
              <div className="mb-6 rounded-lg bg-stone-50 p-4 dark:bg-stone-800/50">
                <Field>
                  <Label htmlFor="prefillSource">Pre-fill Data Source</Label>
                  <Select 
                    id="prefillSource" 
                    value={prefillSource} 
                    onChange={(e) => setPrefillSource(e.target.value)}
                    disabled={isSimulating}
                  >
                    <option value="current">Current Account Balances</option>
                    {userPlans?.map(plan => (
                      <option key={plan._id} value={plan._id}>
                        Projected from: {plan.name}
                      </option>
                    ))}
                  </Select>
                  <p className="mt-2 text-xs text-stone-500">
                    {prefillSource === 'current' 
                      ? "Automatically filled with your current real-world balances." 
                      : "Automatically filled with simulated values for the selected date. You can modify these to match reality."}
                  </p>
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Field>
                  <Label htmlFor="date">Snapshot Date</Label>
                  <Input
                    {...register('date')}
                    id="date"
                    name="date"
                    type="date"
                    invalid={!!errors.date}
                  />
                  {errors.date && <ErrorMessage>{errors.date?.message}</ErrorMessage>}
                </Field>
                <div className="flex flex-col justify-end pb-1">
                   <div className="text-sm font-medium text-stone-500 dark:text-stone-400 text-right">
                      Estimated Net Worth
                   </div>
                   <div className="text-2xl font-bold text-stone-900 dark:text-white text-right">
                      {formatCompactCurrency(calculatedNetWorth, 2)}
                   </div>
                </div>
              </div>

              <Field>
                <Label htmlFor="note">Note</Label>
                <Input
                  {...register('note')}
                  id="note"
                  name="note"
                  placeholder="e.g., Reached $500k NW milestone!"
                />
              </Field>

              <Divider className="my-2" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Heading level={4}>Assets</Heading>
                  <Button outline onClick={() => appendAsset({ id: uuidv4(), name: '', value: 0, type: 'other' })}>
                    <PlusIcon className="size-4 mr-1" /> Add Asset
                  </Button>
                </div>
                <div className="space-y-4">
                  {assetFields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-3 p-3 rounded-lg bg-stone-50 dark:bg-stone-800/50">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Field>
                          <Input {...register(`assets.${index}.name`)} placeholder="Asset Name" />
                        </Field>
                        <Field>
                          <NumberInput
                            id={`assets.${index}.value`}
                            inputMode="decimal"
                            name={`assets.${index}.value`}
                            control={control}
                            prefix={getCurrencySymbol()}
                            placeholder={formatCurrencyPlaceholder(10000)}
                          />
                        </Field>
                        <Field>
                          <Select {...register(`assets.${index}.type`)}>
                            <option value="savings">Savings</option>
                            <option value="checking">Checking</option>
                            <option value="taxableBrokerage">Brokerage</option>
                            <option value="401k">401(k)</option>
                            <option value="ira">IRA</option>
                            <option value="rothIra">Roth IRA</option>
                            <option value="hsa">HSA</option>
                            <option value="realEstate">Real Estate</option>
                            <option value="vehicle">Vehicle</option>
                            <option value="other">Other</option>
                          </Select>
                        </Field>
                      </div>
                      <Button plain className="mt-1" onClick={() => removeAsset(index)}>
                        <TrashIcon className="size-4 text-stone-400 hover:text-red-500" />
                      </Button>
                    </div>
                  ))}
                  {assetFields.length === 0 && (
                    <p className="text-sm text-stone-500 italic text-center py-4">No assets added.</p>
                  )}
                </div>
              </div>

              <Divider className="my-2" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Heading level={4}>Liabilities</Heading>
                  <Button outline onClick={() => appendLiability({ id: uuidv4(), name: '', balance: 0, type: 'other' })}>
                    <PlusIcon className="size-4 mr-1" /> Add Debt
                  </Button>
                </div>
                <div className="space-y-4">
                  {liabilityFields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-3 p-3 rounded-lg bg-stone-50 dark:bg-stone-800/50">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Field>
                          <Input {...register(`liabilities.${index}.name`)} placeholder="Debt Name" />
                        </Field>
                        <Field>
                          <NumberInput
                            id={`liabilities.${index}.balance`}
                            inputMode="decimal"
                            name={`liabilities.${index}.balance`}
                            control={control}
                            prefix={getCurrencySymbol()}
                            placeholder={formatCurrencyPlaceholder(10000)}
                          />
                        </Field>
                        <Field>
                          <Select {...register(`liabilities.${index}.type`)}>
                            <option value="mortgage">Mortgage</option>
                            <option value="autoLoan">Auto Loan</option>
                            <option value="studentLoan">Student Loan</option>
                            <option value="creditCard">Credit Card</option>
                            <option value="other">Other</option>
                          </Select>
                        </Field>
                      </div>
                      <Button plain className="mt-1" onClick={() => removeLiability(index)}>
                        <TrashIcon className="size-4 text-stone-400 hover:text-red-500" />
                      </Button>
                    </div>
                  ))}
                  {liabilityFields.length === 0 && (
                    <p className="text-sm text-stone-500 italic text-center py-4">No debts added.</p>
                  )}
                </div>
              </div>

            </FieldGroup>
          </DialogBody>
        </Fieldset>
        <DialogActions>
          <Button plain onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button color="rose" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Snapshot'}
          </Button>
        </DialogActions>
      </form>
    </>
  );
}
