/**
 * Table column generators for simulation data tables.
 *
 * Each generator reads a table config (column key → title + format) and produces
 * an array of TableColumn objects with pre-bound format functions.
 */

import type { TableColumn } from '@/lib/types/table-column';
import type { ColumnFormat } from '@/lib/types/column-format';
import {
  type SingleSimulationNetWorthTableRow,
  SIMULATION_NET_WORTH_TABLE_CONFIG,
  type SingleSimulationCashFlowTableRow,
  SIMULATION_CASH_FLOW_TABLE_CONFIG,
  type SingleSimulationTaxesTableRow,
  SIMULATION_TAXES_TABLE_CONFIG,
  type SingleSimulationReturnsTableRow,
  SIMULATION_RETURNS_TABLE_CONFIG,
  type SingleSimulationContributionsTableRow,
  SIMULATION_CONTRIBUTIONS_TABLE_CONFIG,
  type SingleSimulationWithdrawalsTableRow,
  SIMULATION_WITHDRAWALS_TABLE_CONFIG,
} from '@/lib/schemas/tables/single-simulation-table-schema';
import {
  type MultiSimulationTableRow,
  MULTI_SIMULATION_TABLE_CONFIG,
  type YearlyAggregateTableRow,
  YEARLY_AGGREGATE_TABLE_CONFIG,
} from '@/lib/schemas/tables/multi-simulation-table-schema';
import { formatCurrency, formatPercentage } from '@/lib/utils/number-formatters';

/** Dispatches a cell value to the appropriate formatter based on the column's ColumnFormat. */
const formatValue = (value: unknown, format: ColumnFormat): string => {
  if (value == null) return '–';
  if (typeof value !== 'number' && format !== 'string' && format !== 'historicalRanges') return '–';

  switch (format) {
    case 'currency':
      return formatCurrency(value as number);
    case 'percentage':
      return formatPercentage(value as number);
    case 'number':
      return String(value);
    case 'string':
      if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
      }
      return String(value);
    case 'historicalRanges':
      return formatHistoricalRanges(value as Array<{ startYear: number; endYear: number }>);
    default:
      return String(value);
  }
};

const formatHistoricalRanges = (ranges: Array<{ startYear: number; endYear: number }>): string => {
  if (!ranges || ranges.length === 0) return '–';

  return ranges
    .map((range) => (range.startYear === range.endYear ? `${range.startYear}` : `${range.startYear}–${range.endYear}`))
    .join(', ');
};

type TableConfig<T> = Record<keyof T, { title: string; format: ColumnFormat }>;

function generateTableColumns<T extends Record<string, unknown>>(config: TableConfig<T>): TableColumn<T>[] {
  return Object.entries(config).map(([key, { title, format }]) => ({
    key,
    title,
    format: (value: T[keyof T]) => formatValue(value, format),
  }));
}

export const generateNetWorthTableColumns = () => generateTableColumns<SingleSimulationNetWorthTableRow>(SIMULATION_NET_WORTH_TABLE_CONFIG);
export const generateCashFlowTableColumns = () => generateTableColumns<SingleSimulationCashFlowTableRow>(SIMULATION_CASH_FLOW_TABLE_CONFIG);
export const generateTaxesTableColumns = () => generateTableColumns<SingleSimulationTaxesTableRow>(SIMULATION_TAXES_TABLE_CONFIG);
export const generateReturnsTableColumns = () => generateTableColumns<SingleSimulationReturnsTableRow>(SIMULATION_RETURNS_TABLE_CONFIG);
export const generateContributionsTableColumns = () =>
  generateTableColumns<SingleSimulationContributionsTableRow>(SIMULATION_CONTRIBUTIONS_TABLE_CONFIG);
export const generateWithdrawalsTableColumns = () =>
  generateTableColumns<SingleSimulationWithdrawalsTableRow>(SIMULATION_WITHDRAWALS_TABLE_CONFIG);

export const generateMultiSimulationTableColumns = () => generateTableColumns<MultiSimulationTableRow>(MULTI_SIMULATION_TABLE_CONFIG);
export const generateYearlyAggregateTableColumns = () => generateTableColumns<YearlyAggregateTableRow>(YEARLY_AGGREGATE_TABLE_CONFIG);
