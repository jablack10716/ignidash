'use client';

import { Select } from '@/components/catalyst/select';
import type { SingleSimulationContributionsChartDataPoint } from '@/lib/types/chart-data-points';
import type { ContributionsDataView } from '@/lib/types/chart-data-views';
import { useShowReferenceLines } from '@/lib/stores/simulator-store';
import type { KeyMetrics } from '@/lib/types/key-metrics';
import { useUniqueChartItems } from '@/hooks/use-unique-chart-items';
import { useDataViewSelectHandler } from '@/hooks/use-data-view-select';

import SingleSimulationContributionsLineChart from '../../charts/single-simulation/single-simulation-contributions-line-chart';
import ChartTimeFrameDropdown from '../../chart-time-frame-dropdown';
import ChartCard from '../chart-card';

const CONTRIBUTIONS_NON_CUSTOM_VIEWS = [
  'annualAmounts',
  'cumulativeAmounts',
  'taxCategory',
  'employerMatch',
  'shortfall',
] as const satisfies readonly Exclude<ContributionsDataView, 'custom'>[];

const extractAccounts = (dp: SingleSimulationContributionsChartDataPoint) => dp.perAccountData;

interface SingleSimulationContributionsLineChartCardProps {
  onAgeSelect: (age: number) => void;
  selectedAge: number;
  setDataView: (view: ContributionsDataView) => void;
  dataView: ContributionsDataView;
  setCustomDataID: (name: string) => void;
  customDataID: string;
  rawChartData: SingleSimulationContributionsChartDataPoint[];
  keyMetrics: KeyMetrics;
  startAge: number;
}

export default function SingleSimulationContributionsLineChartCard({
  onAgeSelect,
  selectedAge,
  setDataView,
  dataView,
  setCustomDataID,
  customDataID,
  rawChartData,
  keyMetrics,
  startAge,
}: SingleSimulationContributionsLineChartCardProps) {
  const showReferenceLines = useShowReferenceLines();

  const uniqueAccounts = useUniqueChartItems(rawChartData, extractAccounts);

  const { handleSelectChange, getSelectValue } = useDataViewSelectHandler(setDataView, setCustomDataID, CONTRIBUTIONS_NON_CUSTOM_VIEWS);

  return (
    <ChartCard
      title="Contributions"
      subtitle="Time Series"
      truncateTitle
      controls={
        <>
          <Select
            aria-label="Contributions data view options"
            className="max-w-48 sm:max-w-64"
            id="contributions-data-view"
            name="contributions-data-view"
            value={getSelectValue(dataView, customDataID)}
            onChange={handleSelectChange}
          >
            <option value="taxCategory">Tax Category</option>
            <option value="annualAmounts">Annual Contributions</option>
            <option value="cumulativeAmounts">Cumulative Contributions</option>
            <option value="employerMatch">Employer Match</option>
            <option value="shortfall">Shortfall Repaid</option>
            <optgroup label="By Account">
              {uniqueAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </optgroup>
          </Select>
          <ChartTimeFrameDropdown timeFrameType="single" />
        </>
      }
    >
      <SingleSimulationContributionsLineChart
        onAgeSelect={onAgeSelect}
        selectedAge={selectedAge}
        rawChartData={rawChartData}
        keyMetrics={keyMetrics}
        showReferenceLines={showReferenceLines}
        dataView={dataView}
        customDataID={customDataID}
        startAge={startAge}
      />
    </ChartCard>
  );
}
