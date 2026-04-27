import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BalanceService, CategoryItem, NewsItem, Transaction } from '../balance.service';
import { combineLatest, Subscription } from 'rxjs';
import { I18nService } from '../../../core/i18n.service';
 
 interface SavingsHistoryRow {
   id: string | number;
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
  @Output() onClose = new EventEmitter<void>();
 
   savings = 0;
   incomeTotal = 0;
   expenseTotal = 0;
   historyRows: SavingsHistoryRow[] = [];
   newsItems: NewsItem[] = [];
 
   private subscriptions = new Subscription();
 
   constructor(
    private balanceService: BalanceService,
    private readonly i18nService: I18nService
  ) {}
 
    ngOnInit(): void {
     this.subscriptions.add(
      combineLatest([
        this.balanceService.transactions$,
        this.balanceService.incomeCategories$,
        this.balanceService.expenseCategories$,
        this.balanceService.news$
      ]).subscribe(([transactions, incomeCategories, expenseCategories, news]) => {
        this.historyRows = this.buildSavingsHistory(transactions, incomeCategories, expenseCategories);
        this.newsItems = news;

        const income = incomeCategories.reduce((acc, item) => acc + item.amount, 0);
        const expense = expenseCategories.reduce((acc, item) => acc + item.amount, 0);
        this.incomeTotal = income;
        this.expenseTotal = expense;
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

  handleClose(event: Event): void {
    event.stopPropagation();
    this.onClose.emit();
  }
 
  removeTransaction(transactionId: string | number, event: Event): void {
    event.stopPropagation();
    this.balanceService.removeTransaction(String(transactionId));
  }

  get incomeShare(): number {
    const total = this.incomeTotal + this.expenseTotal;
    if (total <= 0) {
      return 0;
    }
    return this.incomeTotal / total;
  }

  get hasUnreadNews(): boolean {
    return this.newsItems.some((item) => !item.isRead);
  }

  get newsRingGradient(): string {
    if (this.newsItems.length === 0) {
      return 'conic-gradient(rgba(120, 255, 209, 0.26) 0deg, rgba(120, 255, 209, 0.26) 360deg)';
    }

    const segment = 360 / this.newsItems.length;
    const gap = Math.min(2.4, segment * 0.2);
    const parts: string[] = [];

    this.newsItems.forEach((item, index) => {
      const start = index * segment;
      const end = (index + 1) * segment;
      const fill = item.isRead ? 'rgba(104, 184, 157, 0.48)' : 'rgba(166, 255, 223, 0.98)';
      parts.push(`${fill} ${start}deg ${Math.max(start, end - gap)}deg`);
      parts.push(`rgba(120, 255, 209, 0.26) ${Math.max(start, end - gap)}deg ${end}deg`);
    });

    return `conic-gradient(${parts.join(', ')})`;
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

  t(key: string): string {
    return this.i18nService.t(key);
  }
}
