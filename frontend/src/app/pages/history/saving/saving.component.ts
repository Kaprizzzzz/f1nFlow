 import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BalanceService, Transaction } from '../balance.service';
import { combineLatest, Subscription } from 'rxjs';
 
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
   history: Transaction[] = [];
   private subscriptions = new Subscription();
   constructor(private balanceService: BalanceService) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.balanceService.transactions$.subscribe((transactions) => {
        this.history = transactions;
      })
    );
      this.subscriptions.add(
      combineLatest([this.balanceService.incomeCategories$, this.balanceService.expenseCategories$]).subscribe(
        ([incomeCategories, expenseCategories]) => {
          const income = incomeCategories.reduce((acc, item) => acc + item.amount, 0);
          const expense = expenseCategories.reduce((acc, item) => acc + item.amount, 0);
          this.savings = income - expense;
        }
      )
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
}
