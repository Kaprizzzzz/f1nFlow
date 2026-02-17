import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Transaction {
  amount: number;
  category: string;
  type: 'plus' | 'minus';
  date: Date;
  label?: string; // Додаємо це, щоб не було помилок
}

@Injectable({ providedIn: 'root' })
export class BalanceService {
  private transactions: Transaction[] = [];
  private balanceSubject = new BehaviorSubject<number>(0);

  balance$ = this.balanceSubject.asObservable();
  transactions$ = new BehaviorSubject<Transaction[]>([]);

  addTransaction(amount: number, category: string, type: 'plus' | 'minus') {
    const newTx: Transaction = { amount, category, type, date: new Date(), label: category };
    this.transactions.unshift(newTx);
    
    const currentBalance = this.balanceSubject.value;
    const newBalance = type === 'plus' ? currentBalance + amount : currentBalance - amount;
    
    this.balanceSubject.next(newBalance);
    this.transactions$.next([...this.transactions]);
  }
}