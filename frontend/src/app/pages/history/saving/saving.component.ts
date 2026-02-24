import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BalanceService, CategoryItem, Transaction } from '../balance.service';
import { combineLatest, Subscription } from 'rxjs';
 
 interface SavingsHistoryRow {
   id: number;
   category: string;
   incomeTotal: number;
   expenseTotal: number;
   difference: number;
   amountLabel: string;
   isRemovable: boolean;
 }
 
 @Component({
   selector: 'app-saving',
   standalone: true,
   imports: [CommonModule],
   templateUrl: './saving.component.html',
   styleUrl: './saving.component.scss'
 })
 export class SavingComponent implements OnInit, OnDestroy {
  @Input() isFullView = false;
   @Output() onSelect = new EventEmitter<void>();
 
   savings = 0;
   historyRows: SavingsHistoryRow[] = [];
 
   private subscriptions = new Subscription();
 
   constructor(private balanceService: BalanceService) {}
 
    ngOnInit(): void {
     this.subscriptions.add(
      combineLatest([
        this.balanceService.transactions$,
        this.balanceService.incomeCategories$,
        this.balanceService.expenseCategories$
      ]).subscribe(([transactions, incomeCategories, expenseCategories]) => {
        this.historyRows = this.buildSavingsHistory(transactions, incomeCategories, expenseCategories);

        const income = incomeCategories.reduce((acc, item) => acc + item.amount, 0);
        const expense = expenseCategories.reduce((acc, item) => acc + item.amount, 0);
        this.savings = income - expense;
      })
    );
   }
 
   ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
 
  handleCircleClick(): void {
    this.onSelect.emit();
   }
 
   removeTransaction(transactionId: number, event: Event): void {
    event.stopPropagation();
    this.balanceService.removeTransaction(transactionId);
  }

  private buildSavingsHistory(
    transactions: Transaction[],
    incomeCategories: CategoryItem[],
    expenseCategories: CategoryItem[]
  ): SavingsHistoryRow[] {
    if (transactions.length === 0) {
      return this.buildFallbackHistory(incomeCategories, expenseCategories);
    }
 
     let incomeTotal = 0;
     let expenseTotal = 0;
 
     return transactions.map((item) => {
       if (item.type === 'plus') {
         incomeTotal += item.amount;
       } else {
         expenseTotal += item.amount;
       }
 
       const amountLabel = `${item.type === 'plus' ? '+' : '-'}${this.formatAmount(item.amount)}`;
 
       return {
         id: item.id,
         category: item.category,
         incomeTotal,
         expenseTotal,
         difference: incomeTotal - expenseTotal,
        amountLabel,
        isRemovable: true
       };
     });
   }

  private buildFallbackHistory(
    incomeCategories: CategoryItem[],
    expenseCategories: CategoryItem[]
  ): SavingsHistoryRow[] {
    const rows: SavingsHistoryRow[] = [];
    let incomeTotal = 0;
    let expenseTotal = 0;
    let fallbackId = 1;

    for (const item of incomeCategories) {
      if (item.amount <= 0) {
        continue;
      }

      incomeTotal += item.amount;
      rows.push({
        id: fallbackId++,
        category: item.name,
        incomeTotal,
        expenseTotal,
        difference: incomeTotal - expenseTotal,
        amountLabel: `+${this.formatAmount(item.amount)}`,
        isRemovable: false
      });
    }

    for (const item of expenseCategories) {
      if (item.amount <= 0) {
        continue;
      }

      expenseTotal += item.amount;
      rows.push({
        id: fallbackId++,
        category: item.name,
        incomeTotal,
        expenseTotal,
        difference: incomeTotal - expenseTotal,
        amountLabel: `-${this.formatAmount(item.amount)}`,
        isRemovable: false
      });
    }

    return rows;
  }
  private formatAmount(value: number): string {
    return value.toFixed(2);
  }
}
