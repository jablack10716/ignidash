import type { MultiSimulationPortfolioChartDataPoint } from '@/lib/types/chart-data-points';
import type { KeyMetrics } from '@/lib/types/key-metrics';

import MultiSimulationPortfolioAreaChart from '../../charts/multi-simulation/multi-simulation-portfolio-area-chart';
import ChartTimeFrameDropdown from '../../chart-time-frame-dropdown';
import ChartCard from '../chart-card';

interface MultiSimulationPortfolioAreaChartCardProps {
  rawChartData: MultiSimulationPortfolioChartDataPoint[];
  keyMetrics: KeyMetrics;
  onAgeSelect: (age: number) => void;
  selectedAge: number;
  startAge: number;
}

export default function MultiSimulationPortfolioAreaChartCard({
  rawChartData,
  keyMetrics,
  onAgeSelect,
  selectedAge,
  startAge,
}: MultiSimulationPortfolioAreaChartCardProps) {
  return (
    <ChartCard title="Portfolio" subtitle="Time Series" controls={<ChartTimeFrameDropdown timeFrameType="monteCarlo" />}>
      <MultiSimulationPortfolioAreaChart
        rawChartData={rawChartData}
        keyMetrics={keyMetrics}
        startAge={startAge}
        onAgeSelect={onAgeSelect}
        selectedAge={selectedAge}
      />
    </ChartCard>
  );
}
