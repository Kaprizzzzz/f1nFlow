import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CategoryItem, Currency } from '../models/history-shared.models';
import { Transaction } from '../models/finance.models';
import { getFallbackRate, roundToCents } from '../utils/normalization.utils';

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  private transactions: Transaction[] = [];
  private readonly balanceSubject = new BehaviorSubject<number>(0);
  private readonly transactionsSubject = new BehaviorSubject<Transaction[]>([]);

  balance$ = this.balanceSubject.asObservable();
  transactions$ = this.transactionsSubject.asObservable();

  setTransactions(transactions: Transaction[], recalcBalance = true): void {
    this.transactions = [...transactions];
    this.emitState(recalcBalance);
  }

  getTransactions(): Transaction[] {
    return [...this.transactions];
  }

  addTransaction(
    amount: number,
    category: string,
    type: 'plus' | 'minus',
    dateInput?: string | Date,
  ): Transaction | null {
    const normalizedAmount = roundToCents(Number(amount));
    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      return null;
    }

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      amount: normalizedAmount,
      category,
      type,
      date: this.resolveTransactionDate(dateInput),
      label: category
    };

    this.transactions = [...this.transactions, newTransaction];
    this.emitState();
    return newTransaction;
  }

  private resolveTransactionDate(dateInput?: string | Date): Date {
    if (dateInput instanceof Date && Number.isFinite(dateInput.getTime())) {
      return new Date(dateInput);
    }

    if (typeof dateInput === 'string' && dateInput.trim()) {
      const parsed = new Date(`${dateInput}T12:00:00`);
      if (Number.isFinite(parsed.getTime())) {
        return parsed;
      }
    }

    return new Date();
  }

  removeTransaction(transactionId: string): Transaction | null {
    const removed = this.transactions.find((item) => item.id === transactionId);
    if (!removed) {
      return null;
    }

    this.transactions = this.transactions.filter((item) => item.id !== transactionId);
    this.emitState();
    return removed;
  }

  renameCategoryTransactions(type: 'plus' | 'minus', oldName: string, newName: string): void {
    const oldLower = oldName.toLowerCase();
    this.transactions = this.transactions.map((tx) => {
      if (tx.type === type && tx.category.toLowerCase() === oldLower) {
        return { ...tx, category: newName, label: newName };
      }
      return tx;
    });
    this.emitState(false);
  }

  deleteCategoryTransactions(type: 'plus' | 'minus', categoryName: string): void {
    const targetLower = categoryName.toLowerCase();
    this.transactions = this.transactions.filter(
      (tx) => !(tx.type === type && tx.category.toLowerCase() === targetLower)
    );
    this.emitState();
  }

  async convertCurrency(
    fromCurrency: Currency,
    toCurrency: Currency,
    isBrowser: boolean
  ): Promise<number> {
    const conversionRate = await this.fetchConversionRate(fromCurrency, toCurrency, isBrowser);
    const safeRate = conversionRate ?? 1;

    this.transactions = this.transactions.map((transaction) => ({
      ...transaction,
      amount: roundToCents(transaction.amount * safeRate)
    }));
    this.balanceSubject.next(roundToCents(this.balanceSubject.value * safeRate));
    this.emitState(false);

    return safeRate;
  }

  scaleCategories(categories: CategoryItem[], rate: number): CategoryItem[] {
    return categories.map((item) => ({ ...item, amount: roundToCents(item.amount * rate) }));
  }

  private emitState(recalcBalance = true): void {
    if (recalcBalance) {
      const balance = this.transactions.reduce((acc, tx) => (tx.type === 'plus' ? acc + tx.amount : acc - tx.amount), 0);
      this.balanceSubject.next(roundToCents(balance));
    }

    this.transactionsSubject.next([...this.transactions]);
  }

  private async fetchConversionRate(
    fromCurrency: Currency,
    toCurrency: Currency,
    isBrowser: boolean
  ): Promise<number | null> {
    if (!isBrowser) {
      return null;
    }

    const endpoint = new URL(`https://api.frankfurter.dev/v1/latest?base=${fromCurrency}&symbols=${toCurrency}`);

    try {
      const response = await fetch(endpoint.toString());
      if (!response.ok) {
        return getFallbackRate(fromCurrency, toCurrency);
      }

      const payload = (await response.json()) as { rates?: Partial<Record<Currency, number>> };
      const rate = payload.rates?.[toCurrency];
      if (!Number.isFinite(rate) || !rate || rate <= 0) {
        return getFallbackRate(fromCurrency, toCurrency);
      }

      return rate;
    } catch {
      return getFallbackRate(fromCurrency, toCurrency);
    }
  }
}
