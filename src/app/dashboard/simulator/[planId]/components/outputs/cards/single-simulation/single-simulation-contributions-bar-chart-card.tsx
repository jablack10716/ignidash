'use client';

import type { SingleSimulationContributionsChartDataPoint } from '@/lib/types/chart-data-points';
import type { ContributionsDataView } from '@/lib/types/chart-data-views';
import { useAccountData } from '@/hooks/use-convex-data';
import { taxCategoryFromAccountTypeForDisplay } from '@/lib/schemas/inputs/account-form-schema';

import SingleSimulationContributionsBarChart from '../../charts/single-simulation/single-simulation-contributions-bar-chart';
import ChartCard from '../chart-card';

interface SingleSimulationContributionsBarChartCardProps {
  selectedAge: number;
  rawChartData: SingleSimulationContributionsChartDataPoint[];
  dataView: ContributionsDataView;
  customDataID: string;
}

export default function SingleSimulationContributionsBarChartCard({
  selectedAge,
  rawChartData,
  dataView,
  customDataID,
}: SingleSimulationContributionsBarChartCardProps) {
  const accountData = useAccountData(customDataID !== '' ? customDataID : null);

  let title;
  switch (dataView) {
    case 'annualAmounts':
      title = 'Annual Contributions';
      break;
    case 'cumulativeAmounts':
      title = 'Cumulative Contributions';
      break;
    case 'taxCategory':
      title = 'By Tax Category';
      break;
    case 'employerMatch':
      title = 'Employer Match';
      break;
    case 'shortfall':
      title = 'Shortfall Repaid';
      break;
    case 'custom':
      title = accountData ? `${accountData.name} — ${taxCategoryFromAccountTypeForDisplay(accountData.type)}` : 'Custom Account';
      break;
  }

  return (
    <ChartCard title={title} subtitle={`Age ${selectedAge}`}>
      <SingleSimulationContributionsBarChart
        age={selectedAge}
        rawChartData={rawChartData}
        dataView={dataView}
        customDataID={customDataID}
      />
    </ChartCard>
  );
}
