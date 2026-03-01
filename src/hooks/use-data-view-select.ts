import { useCallback, useMemo, type ChangeEvent } from 'react';

export function resolveSelectChange(value: string, nonCustomViews: ReadonlySet<string>): { dataView: string; customDataID: string } {
  if (nonCustomViews.has(value)) return { dataView: value, customDataID: '' };
  return { dataView: 'custom', customDataID: value };
}

export function computeSelectValue(dataView: string, customDataID: string): string {
  return dataView === 'custom' ? customDataID : dataView;
}

export function useDataViewSelectHandler<T extends string>(
  setDataView: (view: T) => void,
  setCustomDataID: (id: string) => void,
  nonCustomViews: readonly string[]
): {
  handleSelectChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  getSelectValue: (dataView: T, customDataID: string) => string;
} {
  const nonCustomViewSet = useMemo(() => new Set<string>(nonCustomViews), [nonCustomViews]);

  const handleSelectChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const result = resolveSelectChange(e.target.value, nonCustomViewSet);
      setDataView(result.dataView as T);
      setCustomDataID(result.customDataID);
    },
    [nonCustomViewSet, setDataView, setCustomDataID]
  );

  const getSelectValue = useCallback((dataView: T, customDataID: string) => computeSelectValue(dataView, customDataID), []);

  return { handleSelectChange, getSelectValue };
}
