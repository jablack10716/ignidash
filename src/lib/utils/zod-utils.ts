import { z, ZodNumber } from 'zod';

// ================================
// HELPER FUNCTIONS
// ================================

/**
 * Coerces values to numbers for required fields
 * Converts empty strings, null, and undefined to NaN so z.number() rejects with a proper error
 *
 * @param zodNumber - The Zod number schema to apply after coercion
 * @returns A preprocessed Zod schema that handles empty values
 */
export const coerceNumber = (zodNumber: ZodNumber) => {
  return z.preprocess((val) => {
    if (val === '' || val === null || val === undefined) {
      return NaN;
    }

    return Number(val);
  }, zodNumber);
};

/**
 * Coerces values to numbers for optional fields with proper empty handling
 * Converts empty strings, null, and undefined to undefined so the field clears correctly.
 * Unlike `coerceNumber(...).optional()`, the preprocess returns undefined (not null),
 * so empty fields don't revert to their default value when editing existing records.
 *
 * @param zodNumber - The Zod number schema to apply after coercion
 * @returns A preprocessed optional Zod schema that handles empty values as undefined
 */
export const optionalCoerceNumber = (zodNumber: ZodNumber) => {
  // Inner .optional() lets Zod accept the `undefined` returned by preprocess for empty values.
  // Outer .optional() creates a ZodOptional wrapper so TypeScript infers `{ field?: T }` (with ?)
  // instead of `{ field: T | undefined }` in object schemas — this matters for RHF's Control type inference.
  return z
    .preprocess((val) => {
      if (val === '' || val === null || val === undefined) {
        return undefined;
      }

      return Number(val);
    }, zodNumber.optional())
    .optional();
};

/**
 * Creates a currency field validator that allows zero values
 * Used for fields like annual income where zero is valid (unemployed/retired)
 *
 * @param customMessage - Optional custom error message for validation failures
 * @returns Zod schema for currency fields that accepts zero and positive values
 */
export const currencyFieldAllowsZero = (customMessage?: string) => {
  return coerceNumber(
    z
      .number('Must be a valid number')
      .nonnegative(customMessage || 'Must be 0 or greater')
      .max(99999999999, 'Whoa there, Bezos!')
  );
};

/**
 * Creates an optional currency field validator that allows zero values
 * Used for optional fields like costBasis, downPayment where zero is valid
 *
 * @param customMessage - Optional custom error message for validation failures
 * @returns Optional Zod schema for currency fields that accepts zero and positive values
 */
export const optionalCurrencyFieldAllowsZero = (customMessage?: string) => {
  return optionalCoerceNumber(
    z
      .number('Must be a valid number')
      .nonnegative(customMessage || 'Must be 0 or greater')
      .max(99999999999, 'Whoa there, Bezos!')
  );
};

/**
 * Creates a currency field validator that forbids zero values
 * Used for fields like annual expenses where zero is not realistic
 *
 * @param customMessage - Optional custom error message for validation failures
 * @returns Zod schema for currency fields that requires positive values only
 */
export const currencyFieldForbidsZero = (customMessage?: string) => {
  return coerceNumber(
    z
      .number('Must be a valid number')
      .positive(customMessage || 'Must be greater than 0')
      .max(99999999999, 'Whoa there, Bezos!')
  );
};

/**
 * Creates an optional currency field validator that forbids zero values
 * Used for optional fields like maxBalance, employerMatch where zero is not valid
 *
 * @param customMessage - Optional custom error message for validation failures
 * @returns Optional Zod schema for currency fields that requires positive values only
 */
export const optionalCurrencyFieldForbidsZero = (customMessage?: string) => {
  return optionalCoerceNumber(
    z
      .number('Must be a valid number')
      .positive(customMessage || 'Must be greater than 0')
      .max(99999999999, 'Whoa there, Bezos!')
  );
};

/**
 * Creates a percentage field validator with configurable range
 * Expects percentage as a number (e.g., 50 for 50%, not 0.5)
 * Used for growth rates, allocation percentages, etc.
 *
 * @param min - Minimum allowed percentage value (default: 0)
 * @param max - Maximum allowed percentage value (default: 100)
 * @param fieldName - Name of the field for error messages (default: "Value")
 * @returns Zod schema for percentage fields with specified range
 */
export const percentageField = (min = 0, max = 100, fieldName = 'Value') => {
  return coerceNumber(
    z
      .number('Must be a valid percentage')
      .min(min, `${fieldName} must be at least ${min}%`)
      .max(max, `${fieldName} must be at most ${max}%`)
  );
};

/**
 * Creates an optional percentage field validator with configurable range
 * Expects percentage as a number (e.g., 50 for 50%, not 0.5)
 * Used for optional fields like growthRate, withholding
 *
 * @param min - Minimum allowed percentage value (default: 0)
 * @param max - Maximum allowed percentage value (default: 100)
 * @param fieldName - Name of the field for error messages (default: "Value")
 * @returns Optional Zod schema for percentage fields with specified range
 */
export const optionalPercentageField = (min = 0, max = 100, fieldName = 'Value') => {
  return optionalCoerceNumber(
    z
      .number('Must be a valid percentage')
      .min(min, `${fieldName} must be at least ${min}%`)
      .max(max, `${fieldName} must be at most ${max}%`)
  );
};

/**
 * Creates an age field validator with configurable range and custom messages
 * Used for current age, retirement age, life expectancy, etc.
 *
 * @param min - Minimum allowed age value (default: 16)
 * @param max - Maximum allowed age value (default: 100)
 * @param customMessages - Optional custom error messages for min/max validation
 * @returns Zod schema for age fields with specified range and messages
 */
export const ageField = (min = 16, max = 100, customMessages?: { min?: string; max?: string }) => {
  return coerceNumber(
    z
      .number('Must be a valid age')
      .min(min, customMessages?.min || `Age must be at least ${min}`)
      .max(max, customMessages?.max || `Age must be at most ${max}`)
  );
};
