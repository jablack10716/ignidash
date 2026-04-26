'use client';

import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCompactCurrency } from '@/lib/utils/number-formatters';
import { useChartTheme } from '@/hooks/use-chart-theme';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProgressSnapshot {
  _id: string;
  date: string;
  netWorth: number;
  note?: string;
}

interface ProgressChartProps {
  snapshots: ProgressSnapshot[];
}

export default function ProgressChart({ snapshots }: ProgressChartProps) {
  const { gridColor, foregroundMutedColor, foregroundColor } = useChartTheme();
  const isMobile = useIsMobile();

  const data = useMemo(() => {
    return snapshots.map((s) => ({
      ...s,
      displayDate: new Date(s.date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: snapshots.length > 5 ? '2-digit' : undefined,
      }),
    }));
  }, [snapshots]);

  if (snapshots.length < 2) {
    return (
      <div className="flex h-48 w-full flex-col items-center justify-center rounded-lg border border-dashed border-stone-300 bg-stone-50/50 p-6 text-center dark:border-stone-700 dark:bg-stone-900/50">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Not enough data points yet. 
          Take at least two snapshots to see your progress over time.
        </p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis
            dataKey="displayDate"
            axisLine={false}
            tickLine={false}
            tick={{ fill: foregroundMutedColor, fontSize: 12 }}
            minTickGap={30}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: foregroundMutedColor, fontSize: 12 }}
            tickFormatter={(value) => formatCompactCurrency(value, 0)}
            hide={isMobile}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-background)',
              borderColor: 'var(--color-border)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            itemStyle={{ color: 'var(--chart-1)' }}
            formatter={(value: any) => [formatCompactCurrency(Number(value), 2), 'Net Worth']}
            labelStyle={{ color: foregroundColor, fontWeight: 'bold', marginBottom: '4px' }}
          />
          <Area
            type="monotone"
            dataKey="netWorth"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorNetWorth)"
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
