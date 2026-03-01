'use client';

import { Select } from '@/components/catalyst/select';
import type { SingleSimulationReturnsChartDataPoint } from '@/lib/types/chart-data-points';
import type { ReturnsDataView } from '@/lib/types/chart-data-views';
import { useShowReferenceLines } from '@/lib/stores/simulator-store';
import type { KeyMetrics } from '@/lib/types/key-metrics';
import { useUniqueChartItems } from '@/hooks/use-unique-chart-items';
import { useDataViewSelectHandler } from '@/hooks/use-data-view-select';

import SingleSimulationReturnsLineChart from '../../charts/single-simulation/single-simulation-returns-line-chart';
import ChartTimeFrameDropdown from '../../chart-time-frame-dropdown';
import ChartCard from '../chart-card';

const RETURNS_NON_CUSTOM_VIEWS = [
  'rates',
  'cagr',
  'annualAmounts',
  'cumulativeAmounts',
  'taxCategory',
  'appreciation',
] as const satisfies readonly Exclude<ReturnsDataView, 'custom'>[];

const extractAccounts = (dp: SingleSimulationReturnsChartDataPoint) => dp.perAccountData;
const extractAssets = (dp: SingleSimulationReturnsChartDataPoint) => dp.perAssetData;

interface SingleSimulationReturnsLineChartCardProps {
  onAgeSelect: (age: number) => void;
  selectedAge: number;
  setDataView: (view: ReturnsDataView) => void;
  dataView: ReturnsDataView;
  rawChartData: SingleSimulationReturnsChartDataPoint[];
  keyMetrics: KeyMetrics;
  startAge: number;
  setCustomDataID: (name: string) => void;
  customDataID: string;
}

export default function SingleSimulationReturnsLineChartCard({
  onAgeSelect,
  selectedAge,
  setDataView,
  dataView,
  rawChartData,
  keyMetrics,
  startAge,
  setCustomDataID,
  customDataID,
}: SingleSimulationReturnsLineChartCardProps) {
  const showReferenceLines = useShowReferenceLines();

  const uniqueAccounts = useUniqueChartItems(rawChartData, extractAccounts);
  const uniquePhysicalAssets = useUniqueChartItems(rawChartData, extractAssets);

  const { handleSelectChange, getSelectValue } = useDataViewSelectHandler(setDataView, setCustomDataID, RETURNS_NON_CUSTOM_VIEWS);

  return (
    <ChartCard
      title="Returns"
      subtitle="Time Series"
      truncateTitle
      controls={
        <>
          <Select
            aria-label="Returns data view options"
            className="max-w-48 sm:max-w-64"
            id="returns-data-view"
            name="returns-data-view"
            value={getSelectValue(dataView, customDataID)}
            onChange={handleSelectChange}
          >
            <optgroup label="Return Rates">
              <option value="rates">Real Annual Rates</option>
              <option value="cagr">Real CAGR</option>
            </optgroup>
            <optgroup label="Return Amounts">
              <option value="annualAmounts">Annual Gains</option>
              <option value="cumulativeAmounts">Cumulative Gains</option>
              <option value="taxCategory">Tax Category</option>
            </optgroup>
            <optgroup label="Appreciation Amounts">
              <option value="appreciation">Asset Appreciation</option>
            </optgroup>
            <optgroup label="By Account">
              {uniqueAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </optgroup>
            {uniquePhysicalAssets.length > 0 && (
              <optgroup label="By Physical Asset">
                {uniquePhysicalAssets.map((physicalAsset) => (
                  <option key={physicalAsset.id} value={physicalAsset.id}>
                    {physicalAsset.name}
                  </option>
                ))}
              </optgroup>
            )}
          </Select>
          <ChartTimeFrameDropdown timeFrameType="single" />
        </>
      }
    >
      <SingleSimulationReturnsLineChart
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
