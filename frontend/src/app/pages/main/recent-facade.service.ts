import { Injectable } from '@angular/core';
import { Transaction } from '../history/balance.service';
import { RecentCategoryGroup } from '../history/recent/recent.component';
import { BalanceService } from '../history/balance.service';

@Injectable({ providedIn: 'root' })
export class RecentFacadeService {
  constructor(private balanceService: BalanceService) {}

  buildRecentCategoryGroups(transactions: Transaction[], quickTransactionsLimit: number): RecentCategoryGroup[] {
    const expenseTransactions = transactions
      .filter((item) => item.type === 'minus')
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    const grouped = new Map<string, RecentCategoryGroup>();

    for (const transaction of expenseTransactions) {
      const existing = grouped.get(transaction.category);
      if (!existing) {
        grouped.set(transaction.category, {
          category: transaction.category,
          totalAmount: transaction.amount,
          repeatCount: 1,
          latestTransactions: [transaction.amount]
        });
        continue;
      }

      existing.totalAmount += transaction.amount;
      existing.repeatCount += 1;
      if (existing.latestTransactions.length < quickTransactionsLimit) {
        existing.latestTransactions.push(transaction.amount);
      }
    }

    return [...grouped.values()].sort((a, b) => b.repeatCount - a.repeatCount || b.totalAmount - a.totalAmount);
  }

  repeatExpense(category: string, amount: number): void {
    this.balanceService.addTransaction(amount, category, 'minus');
  }
}
