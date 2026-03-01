import { useMemo } from 'react';

export function getUniqueItems(items: Array<{ id: string; name: string }>): Array<{ id: string; name: string }> {
  return Array.from(new Map(items.map((item) => [item.id, { id: item.id, name: item.name }])).values());
}

export function useUniqueChartItems<T>(
  rawChartData: T[],
  extractor: (dataPoint: T) => Array<{ id: string; name: string }>
): Array<{ id: string; name: string }> {
  return useMemo(() => getUniqueItems(rawChartData.flatMap(extractor)), [rawChartData, extractor]);
}
