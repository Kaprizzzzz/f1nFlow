 import { Injectable } from '@angular/core';
 import { BehaviorSubject } from 'rxjs';
 
 export interface Transaction {
   id: number;
   amount: number;
   category: string;
   type: 'plus' | 'minus';
   date: Date;
   label?: string;
 }
 
 @Injectable({ providedIn: 'root' })
 export class BalanceService {
   private transactions: Transaction[] = [];
   private balanceSubject = new BehaviorSubject<number>(0);
  private nextTransactionId = 1;

  private incomeCategoriesSubject = new BehaviorSubject<string[]>(['Salary', 'Bonus']);
  private expenseCategoriesSubject = new BehaviorSubject<string[]>(['Home', 'Transport', 'Food']);
 
   balance$ = this.balanceSubject.asObservable();
   transactions$ = new BehaviorSubject<Transaction[]>([]);
  incomeCategories$ = this.incomeCategoriesSubject.asObservable();
  expenseCategories$ = this.expenseCategoriesSubject.asObservable();

  addTransaction(amount: number, category: string, type: 'plus' | 'minus'): void {
    const normalizedAmount = Number(amount);

    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      return;
    }

    const newTx: Transaction = {
      id: this.nextTransactionId++,
      amount: normalizedAmount,
      category,
      type,
      date: new Date(),
      label: category
    };
    this.syncBalanceAndTransactions();
  }

  removeTransaction(transactionId: number): void {
    const nextTransactions = this.transactions.filter((item) => item.id !== transactionId);
    if (nextTransactions.length === this.transactions.length) {
      return;
    }

    this.transactions = nextTransactions;
    this.syncBalanceAndTransactions();
  }

  addCategory(type: 'plus' | 'minus', categoryName: string): void {
    const normalized = categoryName.trim();
    if (!normalized) {
      return;
    }

    const list = this.getCategoriesByType(type);
    if (list.some((item) => item.toLowerCase() === normalized.toLowerCase())) {
      return;
    }

    this.setCategoriesByType(type, [...list, normalized]);
  }

  renameCategory(type: 'plus' | 'minus', oldName: string, newName: string): void {
    const normalized = newName.trim();
    if (!normalized || oldName === normalized) {
      return;
    }

    const list = this.getCategoriesByType(type);
    const oldLower = oldName.toLowerCase();

    if (!list.some((item) => item.toLowerCase() === oldLower)) {
      return;
    }

    if (list.some((item) => item.toLowerCase() === normalized.toLowerCase())) {
      return;
    }

    const nextList = list.map((item) => (item.toLowerCase() === oldLower ? normalized : item));
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
    const nextList = list.filter((item) => item.toLowerCase() !== targetLower);

    if (nextList.length === list.length) {
      return;
    }

    this.setCategoriesByType(type, nextList);
    this.transactions = this.transactions.filter(
      (tx) => !(tx.type === type && tx.category.toLowerCase() === targetLower)
    );
    this.syncBalanceAndTransactions();
  }

  private getCategoriesByType(type: 'plus' | 'minus'): string[] {
    return type === 'plus'
      ? this.incomeCategoriesSubject.value
      : this.expenseCategoriesSubject.value;
  }

  private setCategoriesByType(type: 'plus' | 'minus', categories: string[]): void {
    if (type === 'plus') {
      this.incomeCategoriesSubject.next(categories);
      return;
    }

    this.expenseCategoriesSubject.next(categories);
  }

  private syncBalanceAndTransactions(recalculateBalance = true): void {
    if (recalculateBalance) {
      const newBalance = this.transactions.reduce(
        (acc, tx) => (tx.type === 'plus' ? acc + tx.amount : acc - tx.amount),
        0
      );
      this.balanceSubject.next(newBalance);
    }

     this.transactions$.next([...this.transactions]);
   }
}
