 import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
 import { isPlatformBrowser } from '@angular/common';
 import { BehaviorSubject } from 'rxjs';
 import { SessionService } from '../user/service/user.service';
 
 export interface Transaction {
   id: string;
   amount: number;
   category: string;
   type: 'plus' | 'minus';
   date: Date;
   label?: string;
 }
 
 export interface CategoryItem {
   name: string;
   amount: number;
   icon?: string;
 }
 
export type SphereTab = 'income' | 'expense' | 'saving' | 'news' | 'recent';
export type SphereLayout = Record<SphereTab, { left: number; top: number }>;

interface PersistedStatePayload {
  transactions?: Array<Omit<Transaction, 'date'> & { date: string }>;
  user?: {
    incomeCategories?: CategoryItem[];
    expenseCategories?: CategoryItem[];
    currency?: 'EUR' | 'USD' | 'UAH';
    sphereLayout?: SphereLayout | null;
  };
}

 @Injectable({ providedIn: 'root' })
 export class BalanceService {
   private readonly storageKey = 'f1nflow-balance-state';
   private readonly isBrowser: boolean;
 
   private transactions: Transaction[] = [];
   private balanceSubject = new BehaviorSubject<number>(0);
   private incomeCategoriesSubject = new BehaviorSubject<CategoryItem[]>([]);
   private expenseCategoriesSubject = new BehaviorSubject<CategoryItem[]>([]);
   private currencySubject = new BehaviorSubject<'EUR' | 'USD' | 'UAH'>('EUR');
   private sphereLayoutSubject = new BehaviorSubject<SphereLayout | null>(null);
 
   private isHydrating = false;
   private isCurrencyConverting = false;
 
   balance$ = this.balanceSubject.asObservable();
   transactions$ = new BehaviorSubject<Transaction[]>([]);
   incomeCategories$ = this.incomeCategoriesSubject.asObservable();
   expenseCategories$ = this.expenseCategoriesSubject.asObservable();
   currency$ = this.currencySubject.asObservable();
   sphereLayout$ = this.sphereLayoutSubject.asObservable();
 
   constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private sessionService: SessionService
  ) {
     this.isBrowser = isPlatformBrowser(platformId);
     this.restoreState();
    this.syncBalanceAndTransactions(false);

    this.sessionService.user$.subscribe((user) => {
      if (!user) {
        return;
      }

      this.sessionService.fetchState(user.telegramId).subscribe({
        next: (payload) => {
          const state = payload as PersistedStatePayload;

          this.isHydrating = true;
          this.transactions = (state.transactions ?? []).map(
            (tx: Omit<Transaction, 'date'> & { date: string }) => ({
              ...tx,
              date: new Date(tx.date)
            })
          );
          this.incomeCategoriesSubject.next(this.normalizeCategories(state.user?.incomeCategories ?? []));
          this.expenseCategoriesSubject.next(this.normalizeCategories(state.user?.expenseCategories ?? []));
          this.currencySubject.next(state.user?.currency ?? 'EUR');
          this.sphereLayoutSubject.next(this.normalizeSphereLayout(state.user?.sphereLayout ?? null));
          this.syncBalanceAndTransactions(false);
          this.isHydrating = false;
        },
        error: () => {
          this.isHydrating = false;
        }
      });
    });
   }
 
   addTransaction(amount: number, category: string, type: 'plus' | 'minus'): void {
     const normalizedAmount = this.roundToCents(Number(amount));
 
     if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
       return;
     }
 
     const newTx: Transaction = {
      id: crypto.randomUUID(),
       amount: normalizedAmount,
       category,
       type,
       date: new Date(),
       label: category
     };
 
     this.transactions = [...this.transactions, newTx];
     this.adjustCategoryAmount(type, category, normalizedAmount);
     this.syncBalanceAndTransactions();
   }
 
  removeTransaction(transactionId: string): void {
     const removedTransaction = this.transactions.find((item) => item.id === transactionId);
     if (!removedTransaction) {
       return;
    }

     this.transactions = this.transactions.filter((item) => item.id !== transactionId);
     this.adjustCategoryAmount(removedTransaction.type, removedTransaction.category, -removedTransaction.amount);
     this.syncBalanceAndTransactions();
   }
 
  async setCurrency(currency: 'EUR' | 'USD' | 'UAH'): Promise<void> {
    const currentCurrency = this.currencySubject.value;
    if (currency === currentCurrency || this.isCurrencyConverting) {
      return;
    }

    this.isCurrencyConverting = true;

    try {
      const conversionRate = await this.fetchConversionRate(currentCurrency, currency);
      const safeRate = conversionRate ?? 1;

      this.transactions = this.transactions.map((transaction) => ({
        ...transaction,
        amount: this.roundToCents(transaction.amount * safeRate)
      }));

      this.incomeCategoriesSubject.next(this.scaleCategories(this.incomeCategoriesSubject.value, safeRate));
      this.expenseCategoriesSubject.next(this.scaleCategories(this.expenseCategoriesSubject.value, safeRate));
      this.balanceSubject.next(this.roundToCents(this.balanceSubject.value * safeRate));
      this.currencySubject.next(currency);
      this.syncBalanceAndTransactions(false);
    } finally {
      this.isCurrencyConverting = false;
    }
  }

  setSphereLayout(layout: SphereLayout): void {
    this.sphereLayoutSubject.next(this.normalizeSphereLayout(layout));
    this.persistState();
  }

  getSphereLayout(): SphereLayout | null {
    return this.normalizeSphereLayout(this.sphereLayoutSubject.value);
  }

  private normalizeSphereLayout(layout: SphereLayout | null): SphereLayout | null {
    if (!layout) {
      return null;
    }

    return {
      income: layout.income,
      expense: layout.expense,
      saving: layout.saving,
      news: layout.news,
      recent: layout.recent ?? { top: 330, left: 250 }
    };
  }

   addCategory(type: 'plus' | 'minus', categoryName: string, icon = '📁'): void {
     const normalized = categoryName.trim();
     if (!normalized) {
       return;
     }
 
     const list = this.getCategoriesByType(type);
    if (list.some((item) => item.name.toLowerCase() === normalized.toLowerCase())) {
       return;
     }
 
    this.setCategoriesByType(type, [...list, { name: normalized, amount: 0, icon }]);
   }
 
   renameCategory(type: 'plus' | 'minus', oldName: string, newName: string): void {
     const normalized = newName.trim();
     if (!normalized || oldName === normalized) {
       return;
     }
 
     const list = this.getCategoriesByType(type);
     const oldLower = oldName.toLowerCase();
 
    if (!list.some((item) => item.name.toLowerCase() === oldLower)) {
       return;
     }
 
    if (list.some((item) => item.name.toLowerCase() === normalized.toLowerCase())) {
       return;
     }
 
    const nextList = list.map((item) =>
      item.name.toLowerCase() === oldLower ? { ...item, name: normalized } : item
    );
     this.setCategoriesByType(type, nextList);
 
     this.transactions = this.transactions.map((tx) => {
       if (tx.type === type && tx.category.toLowerCase() === oldLower) {
         return { ...tx, category: normalized, label: normalized };
       }
       return tx;
     });
     this.syncBalanceAndTransactions(false);
   }
 
   deleteCategory(type: 'plus' | 'minus', categoryName: string): void {
     const targetLower = categoryName.toLowerCase();
     const list = this.getCategoriesByType(type);
    const nextList = list.filter((item) => item.name.toLowerCase() !== targetLower);
     if (nextList.length === list.length) {
       return;
     }
 
     this.setCategoriesByType(type, nextList);
     this.transactions = this.transactions.filter(
       (tx) => !(tx.type === type && tx.category.toLowerCase() === targetLower)
     );
     this.syncBalanceAndTransactions();
   }
 
   swapCategories(type: 'plus' | 'minus', firstIndex: number, secondIndex: number): void {
     if (firstIndex === secondIndex) {
       return;
     }
 
     const list = this.getCategoriesByType(type);
     const isOutOfBounds =
       firstIndex < 0 ||
       secondIndex < 0 ||
       firstIndex >= list.length ||
       secondIndex >= list.length;
 
     if (isOutOfBounds) {
       return;
     }
 
     const nextList = [...list];
     [nextList[firstIndex], nextList[secondIndex]] = [nextList[secondIndex], nextList[firstIndex]];
     this.setCategoriesByType(type, nextList);
   }
 
  private getCategoriesByType(type: 'plus' | 'minus'): CategoryItem[] {
    return type === 'plus' ? this.incomeCategoriesSubject.value : this.expenseCategoriesSubject.value;
   }
 
  private setCategoriesByType(type: 'plus' | 'minus', categories: CategoryItem[]): void {
     if (type === 'plus') {
       this.incomeCategoriesSubject.next(categories);
       this.persistState();
       return;
     }
 
     this.expenseCategoriesSubject.next(categories);
     this.persistState();
   }
 
   private adjustCategoryAmount(type: 'plus' | 'minus', categoryName: string, delta: number): void {
     const targetLower = categoryName.toLowerCase();
     const list = this.getCategoriesByType(type);
 
     const nextList = list.map((item) => {
       if (item.name.toLowerCase() !== targetLower) {
         return item;
       }
 
       const nextAmount = Math.max(0, item.amount + delta);
       return { ...item, amount: Number(nextAmount.toFixed(2)) };
     });
 
     this.setCategoriesByType(type, nextList);
   }
 
   private restoreState(): void {
     if (!this.isBrowser) {
       return;
     }
 
     const rawState = localStorage.getItem(this.storageKey);
     if (!rawState) {
       return;
     }
 
     try {
       const parsed = JSON.parse(rawState) as {
         transactions?: Array<Omit<Transaction, 'date'> & { date: string }>;
         incomeCategories?: CategoryItem[];
         expenseCategories?: CategoryItem[];
        currency?: 'EUR' | 'USD' | 'UAH';
        sphereLayout?: SphereLayout;
       };
 
       this.transactions = (parsed.transactions ?? []).map((tx) => ({
         ...tx,
         date: new Date(tx.date)
       }));
 
       this.incomeCategoriesSubject.next(this.normalizeCategories(parsed.incomeCategories ?? []));
       this.expenseCategoriesSubject.next(this.normalizeCategories(parsed.expenseCategories ?? []));
       this.currencySubject.next(parsed.currency ?? 'EUR');
       this.sphereLayoutSubject.next(this.normalizeSphereLayout(parsed.sphereLayout ?? null));
     } catch {
       localStorage.removeItem(this.storageKey);
     }
   }
 
   private persistState(): void {
    if (!this.isBrowser || this.isHydrating) {
       return;
     }
 
     const payload = {
       transactions: this.transactions,
       incomeCategories: this.incomeCategoriesSubject.value,
      expenseCategories: this.expenseCategoriesSubject.value,
      currency: this.currencySubject.value,
      sphereLayout: this.sphereLayoutSubject.value
     };
 
     localStorage.setItem(this.storageKey, JSON.stringify(payload));

    const currentUser = this.sessionService.userSnapshot;
    if (!currentUser) {
      return;
    }

    this.sessionService.saveState(currentUser.telegramId, {
      ...payload,
      transactions: this.transactions.map((item) => ({
        ...item,
        date: item.date.toISOString()
      }))
    });
   }
 
   private syncBalanceAndTransactions(recalculateBalance = true): void {
     if (recalculateBalance) {
       const newBalance = this.transactions.reduce(
         (acc, tx) => (tx.type === 'plus' ? acc + tx.amount : acc - tx.amount),
         0
       );
       this.balanceSubject.next(this.roundToCents(newBalance));
     }
 
    this.transactions$.next([...this.transactions]);
     this.persistState();
  }

  private roundToCents(value: number): number {
     return Number(value.toFixed(2));
   }

  private normalizeCategories(categories: CategoryItem[]): CategoryItem[] {
     return categories.map((item) => ({
       name: item.name,
       amount: Number.isFinite(item.amount) ? this.roundToCents(item.amount) : 0,
       icon: item.icon || '📁'
     }));
   }
   private scaleCategories(categories: CategoryItem[], rate: number): CategoryItem[] {
    return categories.map((item) => ({
      ...item,
      amount: this.roundToCents(item.amount * rate)
    }));
  }

  private getFallbackRate(
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

  private async fetchConversionRate(
    fromCurrency: 'EUR' | 'USD' | 'UAH',
    toCurrency: 'EUR' | 'USD' | 'UAH'
  ): Promise<number | null> {
    if (!this.isBrowser) {
      return null;
    }

    const endpoint = new URL('https://api.exchangerate.host/convert');
    endpoint.searchParams.set('from', fromCurrency);
    endpoint.searchParams.set('to', toCurrency);
    endpoint.searchParams.set('amount', '1');

    try {
      const response = await fetch(endpoint.toString());
      if (!response.ok) {
        return this.getFallbackRate(fromCurrency, toCurrency);
      }

      const payload = (await response.json()) as { result?: number };
      if (!Number.isFinite(payload.result) || !payload.result || payload.result <= 0) {
        return this.getFallbackRate(fromCurrency, toCurrency);
      }

      return payload.result;
    } catch {
      return this.getFallbackRate(fromCurrency, toCurrency);
    }
  }
 }
