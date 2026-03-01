import { describe, it, expect } from 'vitest';
import { resolveSelectChange, computeSelectValue } from './use-data-view-select';

describe('resolveSelectChange', () => {
  const nonCustomViews = new Set(['netWorth', 'assetClass', 'taxCategory']);

  it('should return non-custom view when value is in the set', () => {
    expect(resolveSelectChange('netWorth', nonCustomViews)).toEqual({
      dataView: 'netWorth',
      customDataID: '',
    });
  });

  it('should return custom view when value is not in the set', () => {
    expect(resolveSelectChange('account-123', nonCustomViews)).toEqual({
      dataView: 'custom',
      customDataID: 'account-123',
    });
  });

  it('should treat empty string as custom if not in non-custom views', () => {
    expect(resolveSelectChange('', nonCustomViews)).toEqual({
      dataView: 'custom',
      customDataID: '',
    });
  });

  it('should handle empty non-custom views set', () => {
    const empty = new Set<string>();
    expect(resolveSelectChange('anything', empty)).toEqual({
      dataView: 'custom',
      customDataID: 'anything',
    });
  });
});

describe('computeSelectValue', () => {
  it('should return customDataID when dataView is custom', () => {
    expect(computeSelectValue('custom', 'account-123')).toBe('account-123');
  });

  it('should return dataView when not custom', () => {
    expect(computeSelectValue('netWorth', '')).toBe('netWorth');
    expect(computeSelectValue('assetClass', 'stale-id')).toBe('assetClass');
  });
});
