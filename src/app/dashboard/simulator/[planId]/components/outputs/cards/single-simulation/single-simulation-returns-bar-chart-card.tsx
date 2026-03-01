'use client';

import type { SingleSimulationReturnsChartDataPoint } from '@/lib/types/chart-data-points';
import type { ReturnsDataView } from '@/lib/types/chart-data-views';
import { useAccountData, usePhysicalAssetData } from '@/hooks/use-convex-data';
import { taxCategoryFromAccountTypeForDisplay } from '@/lib/schemas/inputs/account-form-schema';

import SingleSimulationReturnsBarChart from '../../charts/single-simulation/single-simulation-returns-bar-chart';
import ChartCard from '../chart-card';

interface SingleSimulationReturnsBarChartCardProps {
  selectedAge: number;
  rawChartData: SingleSimulationReturnsChartDataPoint[];
  dataView: ReturnsDataView;
  customDataID: string;
}

export default function SingleSimulationReturnsBarChartCard({
  selectedAge,
  rawChartData,
  dataView,
  customDataID,
}: SingleSimulationReturnsBarChartCardProps) {
  const accountData = useAccountData(customDataID !== '' ? customDataID : null);
  const physicalAssetData = usePhysicalAssetData(customDataID !== '' ? customDataID : null);

  let title;
  switch (dataView) {
    case 'rates':
      title = 'Real Returns';
      break;
    case 'cagr':
      title = 'Real CAGR';
      break;
    case 'annualAmounts':
      title = 'Annual Growth';
      break;
    case 'cumulativeAmounts':
      title = 'Cumulative Growth';
      break;
    case 'taxCategory':
      title = 'By Tax Category';
      break;
    case 'appreciation':
      title = 'Asset Appreciation';
      break;
    case 'custom':
      if (accountData) {
        title = `${accountData.name} — ${taxCategoryFromAccountTypeForDisplay(accountData.type)}`;
      } else if (physicalAssetData) {
        title = `${physicalAssetData.name} — Physical Asset`;
      } else {
        title = 'Custom';
      }
      break;
  }

  return (
    <ChartCard title={title} subtitle={`Age ${selectedAge}`}>
      <SingleSimulationReturnsBarChart age={selectedAge} rawChartData={rawChartData} dataView={dataView} customDataID={customDataID} />
    </ChartCard>
  );
}
