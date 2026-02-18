 import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
 import { CommonModule } from '@angular/common';
 import { BalanceService, Transaction } from '../balance.service';
 
 @Component({
   selector: 'app-saving',
   standalone: true,
   imports: [CommonModule],
   templateUrl: './saving.component.html',
   styleUrl: './saving.component.scss'
 })
 export class SavingComponent implements OnInit {
  @Input() isFullView = false;
   @Output() onSelect = new EventEmitter<void>();
 
  savings = 0;
   history: Transaction[] = [];
 
   constructor(private balanceService: BalanceService) {}
 
  ngOnInit(): void {
    this.balanceService.transactions$.subscribe((transactions) => {
      this.history = transactions;

      const income = transactions
        .filter((tx) => tx.type === 'plus')
        .reduce((acc, tx) => acc + tx.amount, 0);
 
      const expense = transactions
        .filter((tx) => tx.type === 'minus')
        .reduce((acc, tx) => acc + tx.amount, 0);
      this.savings = income - expense;
    });
   }
  handleCircleClick(): void {
    this.onSelect.emit();
   }
}
