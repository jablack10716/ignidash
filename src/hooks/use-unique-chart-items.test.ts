import { describe, it, expect } from 'vitest';
import { getUniqueItems } from './use-unique-chart-items';

describe('getUniqueItems', () => {
  it('should return unique items by id', () => {
    const items = [
      { id: '1', name: 'A' },
      { id: '2', name: 'B' },
      { id: '1', name: 'A' },
    ];
    expect(getUniqueItems(items)).toEqual([
      { id: '1', name: 'A' },
      { id: '2', name: 'B' },
    ]);
  });

  it('should return empty array for empty input', () => {
    expect(getUniqueItems([])).toEqual([]);
  });

  it('should strip extra fields from items', () => {
    const items = [
      { id: '1', name: 'A', balance: 1000 },
      { id: '2', name: 'B', balance: 2000 },
    ];
    expect(getUniqueItems(items)).toEqual([
      { id: '1', name: 'A' },
      { id: '2', name: 'B' },
    ]);
  });

  it('should keep the last occurrence when duplicates have different names', () => {
    const items = [
      { id: '1', name: 'First' },
      { id: '1', name: 'Second' },
    ];
    expect(getUniqueItems(items)).toEqual([{ id: '1', name: 'Second' }]);
  });

  it('should preserve insertion order', () => {
    const items = [
      { id: 'c', name: 'C' },
      { id: 'a', name: 'A' },
      { id: 'b', name: 'B' },
    ];
    expect(getUniqueItems(items)).toEqual([
      { id: 'c', name: 'C' },
      { id: 'a', name: 'A' },
      { id: 'b', name: 'B' },
    ]);
  });
});
