import { GoalsPreferences } from '../models/finance.models';

export function roundToCents(value: number): number {
  return Number(value.toFixed(2));
}

export function normalizeIsoDate(value: string | undefined): string | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }

  const [year, month, day] = value.split('-').map((part) => Number(part));
  const parsed = new Date(year, month - 1, day);
  const isValidDate =
    Number.isFinite(parsed.getTime()) &&
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day;

  return isValidDate ? value : undefined;
}

export function normalizeQuickLimit(limit: number | undefined): number {
  const raw = Number(limit);
  if (!Number.isFinite(raw)) {
    return 5;
  }
  return Math.min(10, Math.max(3, Math.round(raw)));
}

export function normalizeGoalsPreferences(preferences?: Partial<GoalsPreferences> | null): GoalsPreferences {
  const theme = preferences?.theme === 'girly' ? 'girly' : 'default';
  const visualizationMode = preferences?.visualizationMode === 'segments' ? 'segments' : 'amount';
  const periodStart = normalizeIsoDate(preferences?.periodStart);
  const periodEnd = normalizeIsoDate(preferences?.periodEnd);
  const deadline = normalizeIsoDate(preferences?.deadline);

  return {
    theme,
    visualizationMode,
    ...(periodStart ? { periodStart } : {}),
    ...(periodEnd ? { periodEnd } : {}),
    ...(deadline ? { deadline } : {})
  };
}

export function getFallbackRate(
  fromCurrency: 'EUR' | 'USD' | 'UAH',
  toCurrency: 'EUR' | 'USD' | 'UAH'
): number {
  const ratesInUsd: Record<'EUR' | 'USD' | 'UAH', number> = {
    USD: 1,
    EUR: 1.09,
    UAH: 1 / 41
  };

  const fromInUsd = ratesInUsd[fromCurrency];
  const toInUsd = ratesInUsd[toCurrency];
  return fromInUsd / toInUsd;
}
