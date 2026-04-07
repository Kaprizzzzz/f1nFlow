import { getFallbackRate, normalizeIsoDate, normalizeQuickLimit } from './normalization.utils';

describe('normalization utils', () => {
  it('normalizes valid iso date and rejects invalid values', () => {
    expect(normalizeIsoDate('2026-04-07')).toBe('2026-04-07');
    expect(normalizeIsoDate('2026-02-31')).toBeUndefined();
    expect(normalizeIsoDate('07-04-2026')).toBeUndefined();
  });

  it('clamps quick limit into [3..10] range', () => {
    expect(normalizeQuickLimit(undefined)).toBe(5);
    expect(normalizeQuickLimit(1)).toBe(3);
    expect(normalizeQuickLimit(20)).toBe(10);
    expect(normalizeQuickLimit(6.6)).toBe(7);
  });

  it('returns fallback conversion rate', () => {
    const eurToUah = getFallbackRate('EUR', 'UAH');
    const usdToUsd = getFallbackRate('USD', 'USD');

    expect(eurToUah).toBeGreaterThan(40);
    expect(usdToUsd).toBe(1);
  });
});
