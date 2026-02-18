 import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
 import { CommonModule } from '@angular/common';
 import { FormsModule } from '@angular/forms';
 import { BalanceService } from '../balance.service';
 import { map } from 'rxjs/operators';
 
 @Component({
   selector: 'app-income',
   standalone: true,
   imports: [CommonModule, FormsModule],
   templateUrl: './income.component.html',
   styleUrl: './income.component.scss'
 })
export class IncomeComponent implements OnInit {
  @Input() isFullView = false;
   @Output() onSelect = new EventEmitter<void>();
 
  totalIncome = 0;
   isModalOpen = false;
   amount: number | null = null;
 
   constructor(private balanceService: BalanceService) {}
 
  ngOnInit(): void {
    this.balanceService.transactions$.pipe(
      map((txs) => txs.filter((tx) => tx.type === 'plus').reduce((acc, tx) => acc + tx.amount, 0))
    ).subscribe((sum) => this.totalIncome = sum);
  }

  handleCircleClick(): void {
    this.onSelect.emit();
  }

  addIncome(amount: number, category: string, event: Event): void {
    event.stopPropagation();
     this.balanceService.addTransaction(amount, category, 'plus');
   }
 
  openCustomModal(event: Event): void {
    event.stopPropagation();
     this.isModalOpen = true;
   }
 
  saveData(): void {
     if (this.amount && this.amount > 0) {
      this.balanceService.addTransaction(this.amount, 'Custom income', 'plus');
       this.amount = null;
      this.isModalOpen = false;
     }
   }
}
