import { Injectable } from '@angular/core';
import { GoalsPreferences, SphereLayout, Transaction, WeeklyChallenge } from './models/finance.models';
import { CategoryItem, Currency, NewsItem } from './models/history-shared.models';
import { CategoriesService } from './services/categories.service';
import { EngagementService } from './services/engagement.service';
import { PreferencesService } from './services/preferences.service';
import { PersistedStatePayload, StateSyncService } from './services/state-sync.service';
import { TransactionsService } from './services/transactions.service';

export type { GoalsPreferences, SphereLayout, Transaction, WeeklyChallenge };
export type { CategoryItem, NewsItem };

@Injectable({ providedIn: 'root' })
export class BalanceService {
  private isHydrating = false;
  private isCurrencyConverting = false;

  balance$ = this.transactionsService.balance$;
  transactions$ = this.transactionsService.transactions$;
  incomeCategories$ = this.categoriesService.incomeCategories$;
  expenseCategories$ = this.categoriesService.expenseCategories$;
  currency$ = this.preferencesService.currency$;
  sphereLayout$ = this.preferencesService.sphereLayout$;
  quickTransactionsLimit$ = this.preferencesService.quickTransactionsLimit$;
  goalsPreferences$ = this.preferencesService.goalsPreferences$;
  news$ = this.engagementService.news$;
  streakCurrent$ = this.engagementService.streakCurrent$;
  streakBest$ = this.engagementService.streakBest$;
  badges$ = this.engagementService.badges$;
  weeklyChallenge$ = this.engagementService.weeklyChallenge$;

  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly categoriesService: CategoriesService,
    private readonly preferencesService: PreferencesService,
    private readonly engagementService: EngagementService,
    private readonly stateSyncService: StateSyncService
  ) {
    this.restoreState();
    this.stateSyncService.fetchRemoteState((payload) => this.hydrateFromRemote(payload), () => {
      this.isHydrating = false;
    });
  }

  addTransaction(amount: number, category: string, type: 'plus' | 'minus'): void {
    const transaction = this.transactionsService.addTransaction(amount, category, type);
    if (!transaction) {
      return;
    }
    this.categoriesService.adjustCategoryAmount(type, category, transaction.amount);
    this.persistState();
  }

  removeTransaction(transactionId: string): void {
    const removed = this.transactionsService.removeTransaction(transactionId);
    if (!removed) {
      return;
    }
    this.categoriesService.adjustCategoryAmount(removed.type, removed.category, -removed.amount);
    this.persistState();
  }

  async setCurrency(currency: Currency): Promise<void> {
    const currentCurrency = this.preferencesService.currency;
    if (currency === currentCurrency || this.isCurrencyConverting) {
      return;
    }

    this.isCurrencyConverting = true;
    try {
      const rate = await this.transactionsService.convertCurrency(currentCurrency, currency, this.stateSyncService.isBrowser);
      this.categoriesService.setCategories('plus', this.transactionsService.scaleCategories(this.categoriesService.getCategories('plus'), rate));
      this.categoriesService.setCategories('minus', this.transactionsService.scaleCategories(this.categoriesService.getCategories('minus'), rate));
      this.preferencesService.setCurrency(currency);
      this.persistState();
    } finally {
      this.isCurrencyConverting = false;
    }
  }

  setSphereLayout(layout: SphereLayout): void {
    this.preferencesService.setSphereLayout(layout);
    this.persistState();
  }

  getSphereLayout(): SphereLayout | null {
    return this.preferencesService.sphereLayout;
  }

  setQuickTransactionsLimit(limit: number): void {
    this.preferencesService.setQuickTransactionsLimit(limit);
    this.persistState();
  }

  markAllNewsRead(): void {
    this.engagementService.markAllNewsRead();
    this.persistState();
  }

  setGoalsPreferences(preferences: Partial<GoalsPreferences>): void {
    this.preferencesService.setGoalsPreferences(preferences);
    this.persistState();
  }

  addCategory(type: 'plus' | 'minus', categoryName: string, icon = '📁'): void {
    if (this.categoriesService.addCategory(type, categoryName, icon)) {
      this.persistState();
    }
  }

  renameCategory(type: 'plus' | 'minus', oldName: string, newName: string): void {
    if (!this.categoriesService.renameCategory(type, oldName, newName)) {
      return;
    }
    this.transactionsService.renameCategoryTransactions(type, oldName, newName);
    this.persistState();
  }

  deleteCategory(type: 'plus' | 'minus', categoryName: string): void {
    if (!this.categoriesService.deleteCategory(type, categoryName)) {
      return;
    }
    this.transactionsService.deleteCategoryTransactions(type, categoryName);
    this.persistState();
  }

  swapCategories(type: 'plus' | 'minus', firstIndex: number, secondIndex: number): void {
    if (this.categoriesService.swapCategories(type, firstIndex, secondIndex)) {
      this.persistState();
    }
  }

  private hydrateFromRemote(payload: PersistedStatePayload): void {
    this.isHydrating = true;

    const remoteTransactions = (payload.transactions ?? []).map((tx) => ({ ...tx, date: new Date(tx.date) }));
    const localLayout = this.preferencesService.sphereLayout;

    this.transactionsService.setTransactions(remoteTransactions);
    this.categoriesService.setCategories('plus', payload.user?.incomeCategories ?? []);
    this.categoriesService.setCategories('minus', payload.user?.expenseCategories ?? []);
    this.preferencesService.hydrate({
      currency: payload.user?.currency,
      sphereLayout: localLayout ?? payload.user?.sphereLayout ?? null,
      quickTransactionsLimit: payload.user?.quickTransactionsLimit,
      goalsPreferences: payload.user?.goalsPreferences
    });
    this.engagementService.hydrate({
      news: payload.user?.news,
      streakCurrent: payload.user?.streakCurrent,
      streakBest: payload.user?.streakBest,
      badges: payload.user?.badges,
      weeklyChallenge: payload.user?.weeklyChallenge
    });

    this.persistState();
  }

  private restoreState(): void {
    const parsed = this.stateSyncService.restoreLocalState() as {
      transactions?: Array<Omit<Transaction, 'date'> & { date: string }>;
      incomeCategories?: CategoryItem[];
      expenseCategories?: CategoryItem[];
      currency?: Currency;
      sphereLayout?: SphereLayout;
      quickTransactionsLimit?: number;
      news?: NewsItem[];
      goalsPreferences?: GoalsPreferences;
      streakCurrent?: number;
      streakBest?: number;
      badges?: string[];
      weeklyChallenge?: WeeklyChallenge | null;
    } | null;

    if (!parsed) {
      return;
    }

    this.transactionsService.setTransactions((parsed.transactions ?? []).map((tx) => ({ ...tx, date: new Date(tx.date) })));
    this.categoriesService.setCategories('plus', parsed.incomeCategories ?? []);
    this.categoriesService.setCategories('minus', parsed.expenseCategories ?? []);
    this.preferencesService.hydrate({
      currency: parsed.currency,
      sphereLayout: parsed.sphereLayout ?? null,
      quickTransactionsLimit: parsed.quickTransactionsLimit,
      goalsPreferences: parsed.goalsPreferences
    });
    this.engagementService.hydrate({
      news: parsed.news,
      streakCurrent: parsed.streakCurrent,
      streakBest: parsed.streakBest,
      badges: parsed.badges,
      weeklyChallenge: parsed.weeklyChallenge
    });
  }

  private persistState(): void {
    if (this.isHydrating) {
      return;
    }

    const payload = {
      transactions: this.transactionsService.getTransactions(),
      incomeCategories: this.categoriesService.getCategories('plus'),
      expenseCategories: this.categoriesService.getCategories('minus'),
      currency: this.preferencesService.currency,
      sphereLayout: this.preferencesService.sphereLayout,
      quickTransactionsLimit: this.preferencesService.quickTransactionsLimit,
      goalsPreferences: this.preferencesService.goalsPreferences,
      news: this.engagementService.news,
      streakCurrent: this.engagementService.streakCurrent,
      streakBest: this.engagementService.streakBest,
      badges: this.engagementService.badges,
      weeklyChallenge: this.engagementService.weeklyChallenge
    };

    this.stateSyncService.persistLocalState(payload);
    this.stateSyncService.saveRemoteState({
      ...payload,
      transactions: this.transactionsService.getTransactions().map((item) => ({ ...item, date: item.date.toISOString() }))
    });
  }
}
