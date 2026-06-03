import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppLanguage, GoalsPreferences, SphereLayout } from '../models/finance.models';
import { Currency } from '../models/history-shared.models';
import { normalizeGoalsPreferences, normalizeQuickLimit } from '../utils/normalization.utils';

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private readonly currencySubject = new BehaviorSubject<Currency>('EUR');
  private readonly sphereLayoutSubject = new BehaviorSubject<SphereLayout | null>(null);
  private readonly quickTransactionsLimitSubject = new BehaviorSubject<number>(3);
  private readonly goalsPreferencesSubject = new BehaviorSubject<GoalsPreferences>({
    theme: 'default',
    visualizationMode: 'amount'
  });
  private readonly languageSubject = new BehaviorSubject<AppLanguage>('en');

  currency$ = this.currencySubject.asObservable();
  sphereLayout$ = this.sphereLayoutSubject.asObservable();
  quickTransactionsLimit$ = this.quickTransactionsLimitSubject.asObservable();
  goalsPreferences$ = this.goalsPreferencesSubject.asObservable();
  language$ = this.languageSubject.asObservable();

  get currency(): Currency {
    return this.currencySubject.value;
  }

  get sphereLayout(): SphereLayout | null {
    return this.normalizeSphereLayout(this.sphereLayoutSubject.value);
  }

  get quickTransactionsLimit(): number {
    return this.quickTransactionsLimitSubject.value;
  }

  get goalsPreferences(): GoalsPreferences {
    return this.goalsPreferencesSubject.value;
  }

  get language(): AppLanguage {
    return this.languageSubject.value;
  }

  setCurrency(currency: Currency): void {
    this.currencySubject.next(currency);
  }

  setSphereLayout(layout: SphereLayout): void {
    this.sphereLayoutSubject.next(this.normalizeSphereLayout(layout));
  }

  setQuickTransactionsLimit(limit: number): void {
    this.quickTransactionsLimitSubject.next(normalizeQuickLimit(limit));
  }

  setGoalsPreferences(preferences: Partial<GoalsPreferences>): void {
    const current = this.goalsPreferencesSubject.value;
    this.goalsPreferencesSubject.next(normalizeGoalsPreferences({ ...current, ...preferences }));
  }

  setLanguage(language: AppLanguage): void {
    this.languageSubject.next(language);
  }

  hydrate(payload: {
    currency?: Currency;
    sphereLayout?: SphereLayout | null;
    quickTransactionsLimit?: number;
    goalsPreferences?: Partial<GoalsPreferences> | null;
    language?: AppLanguage;
  }): void {
    this.currencySubject.next(payload.currency ?? 'EUR');
    this.sphereLayoutSubject.next(this.normalizeSphereLayout(payload.sphereLayout ?? null));
    this.quickTransactionsLimitSubject.next(normalizeQuickLimit(payload.quickTransactionsLimit));
    this.goalsPreferencesSubject.next(normalizeGoalsPreferences(payload.goalsPreferences));
    this.languageSubject.next(payload.language ?? 'en');
  }

  private normalizeSphereLayout(layout: SphereLayout | null): SphereLayout | null {
    if (!layout || !this.hasCompleteSphereLayout(layout)) {
      return this.sphereLayoutSubject.value && this.hasCompleteSphereLayout(this.sphereLayoutSubject.value)
        ? { ...this.sphereLayoutSubject.value }
        : null;
    }

    return {
      income: { ...layout.income },
      expense: { ...layout.expense },
      saving: { ...layout.saving },
      news: { ...layout.news },
      recent: { ...layout.recent }
    };
  }

  private hasCompleteSphereLayout(layout: Partial<SphereLayout>): layout is SphereLayout {
    return ['income', 'expense', 'saving', 'news', 'recent'].every((tab) => {
      const position = layout[tab as keyof SphereLayout];
      return (
        !!position &&
        Number.isFinite(position.top) &&
        Number.isFinite(position.left)
      );
    });
  }
}
