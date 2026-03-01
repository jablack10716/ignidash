import { describe, it, expect } from 'vitest';
import { expenseFormSchema } from './expense-form-schema';

const validExpense = {
  id: 'test-id',
  name: 'Rent',
  amount: 24000,
  frequency: 'yearly' as const,
  timeframe: {
    start: { type: 'now' as const },
    end: { type: 'atRetirement' as const },
  },
};

describe('expenseFormSchema', () => {
  it('should accept a valid recurring expense', () => {
    expect(expenseFormSchema.safeParse(validExpense).success).toBe(true);
  });

  it('should accept a one-time expense without end date', () => {
    const result = expenseFormSchema.safeParse({
      ...validExpense,
      frequency: 'oneTime',
      timeframe: { start: { type: 'now' } },
    });
    expect(result.success).toBe(true);
  });

  it('should accept an expense with growth and no limit', () => {
    const result = expenseFormSchema.safeParse({
      ...validExpense,
      growth: { growthRate: 3 },
    });
    expect(result.success).toBe(true);
  });

  it('should accept string amount via coercion', () => {
    const result = expenseFormSchema.safeParse({
      ...validExpense,
      amount: '24000',
    });
    expect(result.success).toBe(true);
  });

  it('should reject amount = 0', () => {
    const result = expenseFormSchema.safeParse({
      ...validExpense,
      amount: 0,
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty string amount', () => {
    const result = expenseFormSchema.safeParse({
      ...validExpense,
      amount: '',
    });
    expect(result.success).toBe(false);
  });

  it('should reject name too short', () => {
    const result = expenseFormSchema.safeParse({
      ...validExpense,
      name: 'R',
    });
    expect(result.success).toBe(false);
  });

  it('should reject positive growth with growthLimit <= amount', () => {
    const result = expenseFormSchema.safeParse({
      ...validExpense,
      growth: { growthRate: 3, growthLimit: 20000 },
    });
    expect(result.success).toBe(false);
  });

  it('should reject negative growth with growthLimit >= amount', () => {
    const result = expenseFormSchema.safeParse({
      ...validExpense,
      growth: { growthRate: -3, growthLimit: 30000 },
    });
    expect(result.success).toBe(false);
  });

  it('should accept positive growth with growthLimit > amount', () => {
    const result = expenseFormSchema.safeParse({
      ...validExpense,
      growth: { growthRate: 3, growthLimit: 50000 },
    });
    expect(result.success).toBe(true);
  });

  it('should accept negative growth with growthLimit < amount', () => {
    const result = expenseFormSchema.safeParse({
      ...validExpense,
      growth: { growthRate: -3, growthLimit: 10000 },
    });
    expect(result.success).toBe(true);
  });
});
