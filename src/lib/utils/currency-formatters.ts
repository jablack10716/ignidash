/**
 * Currency display formatting via Intl.NumberFormat.
 *
 * Provides full-precision and compact formatters for currency values.
 * All formatters use the locale and symbol from CURRENCY_CONFIG.
 */

export const CURRENCY_CONFIG = {
  currency: 'USD',
  locale: 'en-US',
  symbol: '$',
} as const;

const currencyFormatter = new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
  style: 'currency',
  currency: CURRENCY_CONFIG.currency,
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const currencyFormatterWithCents = new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
  style: 'currency',
  currency: CURRENCY_CONFIG.currency,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(amount: number, options?: { cents?: boolean }): string {
  if (options?.cents) {
    return currencyFormatterWithCents.format(amount);
  }
  return currencyFormatter.format(amount);
}

export function formatCompactCurrency(amount: number, fractionDigits: number = 2): string {
  const absNum = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  const symbol = CURRENCY_CONFIG.symbol;

  if (absNum >= 1000000000) return sign + symbol + (absNum / 1000000000).toFixed(2) + 'B';
  if (absNum >= 1000000) return sign + symbol + (absNum / 1000000).toFixed(2) + 'M';
  if (absNum >= 1000) return sign + symbol + (absNum / 1000).toFixed(1) + 'k';

  return sign + symbol + absNum.toFixed(fractionDigits);
}

export function getCurrencySymbol(): string {
  return CURRENCY_CONFIG.symbol;
}

export function formatCurrencyPlaceholder(amount: number): string {
  return currencyFormatter.format(amount);
}

const percentageFormatters = new Map<number, Intl.NumberFormat>();

function getPercentageFormatter(fractionDigits: number): Intl.NumberFormat {
  let formatter = percentageFormatters.get(fractionDigits);
  if (!formatter) {
    formatter = new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
      style: 'percent',
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
    percentageFormatters.set(fractionDigits, formatter);
  }
  return formatter;
}

export function formatPercentage(value: number, fractionDigits: number = 1): string {
  return getPercentageFormatter(fractionDigits).format(value);
}
