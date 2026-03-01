import { describe, it, expect } from 'vitest';
import { timePointSchema, frequencyTimeframeSchema, growthSchema } from './income-expenses-shared-schemas';

describe('timePointSchema', () => {
  it('should accept type "now" with no extra fields', () => {
    expect(timePointSchema.safeParse({ type: 'now' }).success).toBe(true);
  });

  it('should accept type "atRetirement" with no extra fields', () => {
    expect(timePointSchema.safeParse({ type: 'atRetirement' }).success).toBe(true);
  });

  it('should accept type "atLifeExpectancy"', () => {
    expect(timePointSchema.safeParse({ type: 'atLifeExpectancy' }).success).toBe(true);
  });

  it('should accept customDate with month + year, no age', () => {
    const result = timePointSchema.safeParse({ type: 'customDate', month: 6, year: 2030 });
    expect(result.success).toBe(true);
  });

  it('should accept customAge with age, no month/year', () => {
    const result = timePointSchema.safeParse({ type: 'customAge', age: 65 });
    expect(result.success).toBe(true);
  });

  it('should reject customDate missing month', () => {
    const result = timePointSchema.safeParse({ type: 'customDate', year: 2030 });
    expect(result.success).toBe(false);
  });

  it('should reject customDate missing year', () => {
    const result = timePointSchema.safeParse({ type: 'customDate', month: 6 });
    expect(result.success).toBe(false);
  });

  it('should reject customAge missing age', () => {
    const result = timePointSchema.safeParse({ type: 'customAge' });
    expect(result.success).toBe(false);
  });

  it('should reject customDate with age set', () => {
    const result = timePointSchema.safeParse({ type: 'customDate', month: 6, year: 2030, age: 65 });
    expect(result.success).toBe(false);
  });

  it('should reject customAge with month/year set', () => {
    const result = timePointSchema.safeParse({ type: 'customAge', age: 65, month: 6, year: 2030 });
    expect(result.success).toBe(false);
  });
});

describe('frequencyTimeframeSchema', () => {
  it('should accept oneTime with no end', () => {
    const result = frequencyTimeframeSchema.safeParse({
      frequency: 'oneTime',
      timeframe: { start: { type: 'now' } },
    });
    expect(result.success).toBe(true);
  });

  it('should accept yearly with end', () => {
    const result = frequencyTimeframeSchema.safeParse({
      frequency: 'yearly',
      timeframe: {
        start: { type: 'now' },
        end: { type: 'atRetirement' },
      },
    });
    expect(result.success).toBe(true);
  });

  it('should reject oneTime with end date', () => {
    const result = frequencyTimeframeSchema.safeParse({
      frequency: 'oneTime',
      timeframe: {
        start: { type: 'now' },
        end: { type: 'atRetirement' },
      },
    });
    expect(result.success).toBe(false);
  });

  it('should reject yearly without end date', () => {
    const result = frequencyTimeframeSchema.safeParse({
      frequency: 'yearly',
      timeframe: { start: { type: 'now' } },
    });
    expect(result.success).toBe(false);
  });

  it('should accept monthly with end', () => {
    const result = frequencyTimeframeSchema.safeParse({
      frequency: 'monthly',
      timeframe: {
        start: { type: 'customDate', month: 1, year: 2026 },
        end: { type: 'customAge', age: 65 },
      },
    });
    expect(result.success).toBe(true);
  });
});

describe('growthSchema', () => {
  it('should accept both undefined (no growth)', () => {
    expect(growthSchema.safeParse({}).success).toBe(true);
  });

  it('should accept growthRate set with no limit', () => {
    expect(growthSchema.safeParse({ growthRate: 3 }).success).toBe(true);
  });

  it('should accept growthRate and growthLimit both set', () => {
    expect(growthSchema.safeParse({ growthRate: 3, growthLimit: 100000 }).success).toBe(true);
  });

  it('should reject growthLimit set without growthRate', () => {
    const result = growthSchema.safeParse({ growthLimit: 100000 });
    expect(result.success).toBe(false);
  });

  it('should reject growthRate outside -50 to 50 range', () => {
    expect(growthSchema.safeParse({ growthRate: 51 }).success).toBe(false);
    expect(growthSchema.safeParse({ growthRate: -51 }).success).toBe(false);
  });

  it('should reject negative growthLimit', () => {
    const result = growthSchema.safeParse({ growthRate: 3, growthLimit: -100 });
    expect(result.success).toBe(false);
  });

  it('should accept growthLimit of zero', () => {
    const result = growthSchema.safeParse({ growthRate: -5, growthLimit: 0 });
    expect(result.success).toBe(true);
  });
});
