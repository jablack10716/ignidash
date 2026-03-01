import type { MultiSimulationPortfolioChartDataPoint } from '@/lib/types/chart-data-points';

import MultiSimulationPortfolioBarChart from '../../charts/multi-simulation/multi-simulation-portfolio-bar-chart';
import ChartCard from '../chart-card';

interface MultiSimulationPortfolioBarChartCardProps {
  selectedAge: number;
  rawChartData: MultiSimulationPortfolioChartDataPoint[];
}

export default function MultiSimulationPortfolioBarChartCard({ selectedAge, rawChartData }: MultiSimulationPortfolioBarChartCardProps) {
  return (
    <ChartCard title="Portfolio Value Percentiles" subtitle={`Age ${selectedAge}`}>
      <MultiSimulationPortfolioBarChart age={selectedAge} rawChartData={rawChartData} />
    </ChartCard>
  );
}
