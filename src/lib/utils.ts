import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatChartString(input: string): string {
  const withSpaces = input.replace(/(?<!^)([A-Z])/g, ' $1');
  let result = withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);

  const replacements: Array<[string, string]> = [
    ['Ltcg', 'LTCG'],
    ['Tax Free', 'Tax-Free'],
    ['Tax Deferred', 'Tax-Deferred'],
    ['Tax Deductible', 'Tax-Deductible'],
    ['Tax Exempt', 'Tax-Exempt'],
    ['Fica', 'FICA'],
    ['Niit', 'NIIT'],
    ['Federal', 'Fed.'],
    ['Cumulative', 'Cumul.'],
    ['Required Minimum Distributions', 'RMDs'],
    ['Early Withdrawal Penalties', 'EW Penalties'],
    ['Percentage', '%'],
    ['Cagr', 'CAGR'],
  ];

  for (const [search, replace] of replacements) {
    result = result.replace(new RegExp(search, 'g'), replace);
  }

  return result;
}
