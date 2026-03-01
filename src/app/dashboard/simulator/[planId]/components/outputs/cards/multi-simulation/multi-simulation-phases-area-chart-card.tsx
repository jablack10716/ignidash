import type { MultiSimulationPhasesChartDataPoint } from '@/lib/types/chart-data-points';
import type { KeyMetrics } from '@/lib/types/key-metrics';

import MultiSimulationPhasesAreaChart from '../../charts/multi-simulation/multi-simulation-phases-area-chart';
import ChartTimeFrameDropdown from '../../chart-time-frame-dropdown';
import ChartCard from '../chart-card';

interface MultiSimulationPhasesAreaChartCardProps {
  rawChartData: MultiSimulationPhasesChartDataPoint[];
  keyMetrics: KeyMetrics;
  onAgeSelect: (age: number) => void;
  selectedAge: number;
  startAge: number;
}

export default function MultiSimulationPhasesAreaChartCard({
  rawChartData,
  keyMetrics,
  onAgeSelect,
  selectedAge,
  startAge,
}: MultiSimulationPhasesAreaChartCardProps) {
  return (
    <ChartCard title="Phases" subtitle="Time Series" controls={<ChartTimeFrameDropdown timeFrameType="monteCarlo" />}>
      <MultiSimulationPhasesAreaChart
        rawChartData={rawChartData}
        keyMetrics={keyMetrics}
        startAge={startAge}
        onAgeSelect={onAgeSelect}
        selectedAge={selectedAge}
      />
    </ChartCard>
  );
}
