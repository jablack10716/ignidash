import type { MultiSimulationPhasesChartDataPoint } from '@/lib/types/chart-data-points';

import MultiSimulationPhasesBarChart from '../../charts/multi-simulation/multi-simulation-phases-bar-chart';
import ChartCard from '../chart-card';

interface MultiSimulationPhasesBarChartCardProps {
  selectedAge: number;
  rawChartData: MultiSimulationPhasesChartDataPoint[];
}

export default function MultiSimulationPhasesBarChartCard({ selectedAge, rawChartData }: MultiSimulationPhasesBarChartCardProps) {
  return (
    <ChartCard title="Simulations in Phase" subtitle={`Age ${selectedAge}`}>
      <MultiSimulationPhasesBarChart age={selectedAge} rawChartData={rawChartData} />
    </ChartCard>
  );
}
