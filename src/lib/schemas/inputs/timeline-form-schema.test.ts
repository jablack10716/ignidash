import { describe, it, expect } from 'vitest';
import { timelineFormSchema } from './timeline-form-schema';

// birthYear=2000, birthMonth=1 → age 26 in Feb 2026 (birthday already passed)
const validTimeline = {
  birthMonth: 1,
  birthYear: 2000,
  lifeExpectancy: 85,
  retirementStrategy: {
    type: 'fixedAge' as const,
    retirementAge: 65,
  },
};

describe('timelineFormSchema', () => {
  it('should accept valid fixedAge strategy', () => {
    expect(timelineFormSchema.safeParse(validTimeline).success).toBe(true);
  });

  it('should accept valid swrTarget strategy', () => {
    const result = timelineFormSchema.safeParse({
      ...validTimeline,
      retirementStrategy: { type: 'swrTarget', safeWithdrawalRate: 4 },
    });
    expect(result.success).toBe(true);
  });

  it('should coerce string values for numeric fields', () => {
    const result = timelineFormSchema.safeParse({
      ...validTimeline,
      lifeExpectancy: '85',
      retirementStrategy: { type: 'fixedAge', retirementAge: '65' },
    });
    expect(result.success).toBe(true);
  });

  it('should reject current age < 18', () => {
    const result = timelineFormSchema.safeParse({
      ...validTimeline,
      birthYear: 2010, // age ~16
    });
    expect(result.success).toBe(false);
  });

  it('should reject current age > 100', () => {
    const result = timelineFormSchema.safeParse({
      ...validTimeline,
      birthYear: 1925, // age ~101
      retirementStrategy: { type: 'swrTarget', safeWithdrawalRate: 4 },
    });
    expect(result.success).toBe(false);
  });

  it('should reject lifeExpectancy <= current age', () => {
    // Need someone older than 50 so lifeExpectancy can pass the ageField(50,110) min check
    const result = timelineFormSchema.safeParse({
      ...validTimeline,
      birthYear: 1970, // age ~56
      lifeExpectancy: 55,
      retirementStrategy: { type: 'swrTarget', safeWithdrawalRate: 4 },
    });
    expect(result.success).toBe(false);
  });

  it('should reject fixedAge retirement age < current age', () => {
    const result = timelineFormSchema.safeParse({
      ...validTimeline,
      retirementStrategy: { type: 'fixedAge', retirementAge: 20 }, // current age ~26
    });
    expect(result.success).toBe(false);
  });

  it('should reject fixedAge retirement age >= life expectancy', () => {
    const result = timelineFormSchema.safeParse({
      ...validTimeline,
      lifeExpectancy: 65,
      retirementStrategy: { type: 'fixedAge', retirementAge: 65 },
    });
    expect(result.success).toBe(false);
  });

  it('should reject SWR rate below 2%', () => {
    const result = timelineFormSchema.safeParse({
      ...validTimeline,
      retirementStrategy: { type: 'swrTarget', safeWithdrawalRate: 1 },
    });
    expect(result.success).toBe(false);
  });

  it('should reject SWR rate above 6%', () => {
    const result = timelineFormSchema.safeParse({
      ...validTimeline,
      retirementStrategy: { type: 'swrTarget', safeWithdrawalRate: 7 },
    });
    expect(result.success).toBe(false);
  });

  it('should reject lifeExpectancy below 50', () => {
    const result = timelineFormSchema.safeParse({
      ...validTimeline,
      lifeExpectancy: 45,
    });
    expect(result.success).toBe(false);
  });

  it('should reject lifeExpectancy above 110', () => {
    const result = timelineFormSchema.safeParse({
      ...validTimeline,
      lifeExpectancy: 115,
    });
    expect(result.success).toBe(false);
  });
});
