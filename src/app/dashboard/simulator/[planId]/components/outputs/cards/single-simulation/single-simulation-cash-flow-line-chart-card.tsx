'use client';

import { useShowReferenceLines } from '@/lib/stores/simulator-store';
import type { KeyMetrics } from '@/lib/types/key-metrics';
import { Select } from '@/components/catalyst/select';
import type { SingleSimulationCashFlowChartDataPoint } from '@/lib/types/chart-data-points';
import type { CashFlowDataView } from '@/lib/types/chart-data-views';
import { useUniqueChartItems } from '@/hooks/use-unique-chart-items';
import { useDataViewSelectHandler } from '@/hooks/use-data-view-select';

import SingleSimulationCashFlowLineChart from '../../charts/single-simulation/single-simulation-cash-flow-line-chart';
import ChartTimeFrameDropdown from '../../chart-time-frame-dropdown';
import ChartCard from '../chart-card';

const CASH_FLOW_NON_CUSTOM_VIEWS = ['surplusDeficit', 'cashFlow', 'incomes', 'expenses', 'savingsRate'] as const satisfies readonly Exclude<
  CashFlowDataView,
  'custom'
>[];

const extractIncomes = (dp: SingleSimulationCashFlowChartDataPoint) => dp.perIncomeData;
const extractExpenses = (dp: SingleSimulationCashFlowChartDataPoint) => dp.perExpenseData;
const extractDebtsAndLoans = (dp: SingleSimulationCashFlowChartDataPoint): Array<{ id: string; name: string }> => [
  ...dp.perDebtData,
  ...dp.perAssetData.filter((asset) => asset.paymentType === 'loan'),
];

interface SingleSimulationCashFlowLineChartCardProps {
  onAgeSelect: (age: number) => void;
  selectedAge: number;
  setDataView: (view: CashFlowDataView) => void;
  dataView: CashFlowDataView;
  setCustomDataID: (name: string) => void;
  customDataID: string;
  rawChartData: SingleSimulationCashFlowChartDataPoint[];
  keyMetrics: KeyMetrics;
  startAge: number;
}

export default function SingleSimulationCashFlowLineChartCard({
  onAgeSelect,
  selectedAge,
  setDataView,
  dataView,
  setCustomDataID,
  customDataID,
  rawChartData,
  keyMetrics,
  startAge,
}: SingleSimulationCashFlowLineChartCardProps) {
  const showReferenceLines = useShowReferenceLines();

  const uniqueIncomes = useUniqueChartItems(rawChartData, extractIncomes);
  const uniqueExpenses = useUniqueChartItems(rawChartData, extractExpenses);
  const uniqueDebtsAndLoans = useUniqueChartItems(rawChartData, extractDebtsAndLoans);

  const { handleSelectChange, getSelectValue } = useDataViewSelectHandler(setDataView, setCustomDataID, CASH_FLOW_NON_CUSTOM_VIEWS);

  return (
    <ChartCard
      title="Cash Flow"
      subtitle="Time Series"
      truncateTitle
      controls={
        <>
          <Select
            aria-label="Cash flow data view options"
            className="max-w-48 sm:max-w-64"
            id="cash-flow-data-view"
            name="cash-flow-data-view"
            value={getSelectValue(dataView, customDataID)}
            onChange={handleSelectChange}
          >
            <option value="cashFlow">Cash Flow</option>
            <option value="surplusDeficit">Surplus/Deficit</option>
            <option value="incomes">Incomes</option>
            <option value="expenses">Expenses</option>
            <option value="savingsRate">Savings Rate</option>
            <optgroup label="By Income">
              {uniqueIncomes.map((income) => (
                <option key={income.id} value={income.id}>
                  {income.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="By Expense">
              {uniqueExpenses.map((expense) => (
                <option key={expense.id} value={expense.id}>
                  {expense.name}
                </option>
              ))}
            </optgroup>
            {uniqueDebtsAndLoans.length > 0 && (
              <optgroup label="By Debt">
                {uniqueDebtsAndLoans.map((debt) => (
                  <option key={debt.id} value={debt.id}>
                    {debt.name}
                  </option>
                ))}
              </optgroup>
            )}
          </Select>
          <ChartTimeFrameDropdown timeFrameType="single" />
        </>
      }
    >
      <SingleSimulationCashFlowLineChart
        onAgeSelect={onAgeSelect}
        selectedAge={selectedAge}
        keyMetrics={keyMetrics}
        showReferenceLines={showReferenceLines}
        rawChartData={rawChartData}
        dataView={dataView}
        customDataID={customDataID}
        startAge={startAge}
      />
    </ChartCard>
  );
}
