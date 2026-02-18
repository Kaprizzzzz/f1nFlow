 import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
 import { CommonModule } from '@angular/common';
 import { FormsModule } from '@angular/forms';
 import { BalanceService } from '../balance.service';
 import { map } from 'rxjs/operators';
 
 @Component({
   selector: 'app-expence',
   standalone: true,
   imports: [CommonModule, FormsModule],
   templateUrl: './expence.component.html',
   styleUrl: './expence.component.scss'
 })
 export class ExpenceComponent implements OnInit {
  @Input() isFullView = false;
   @Output() onSelect = new EventEmitter<void>();
 
  totalExpense = 0;
   isModalOpen = false;
   amount: number | null = null;
   selectedCategory = '';
 
   constructor(private balanceService: BalanceService) {}
 
  ngOnInit(): void {
     this.balanceService.transactions$.pipe(
      map((txs) => txs.filter((tx) => tx.type === 'minus').reduce((acc, tx) => acc + tx.amount, 0))
    ).subscribe((sum) => this.totalExpense = sum);
   }
 
  handleCircleClick(): void {
    this.onSelect.emit();
  }

  selectCategory(category: string, event: Event): void {
     event.stopPropagation();
     this.selectedCategory = category;
     this.isModalOpen = true;
   }
 
  saveData(): void {
     if (this.amount && this.amount > 0) {
       this.balanceService.addTransaction(this.amount, this.selectedCategory, 'minus');
       this.amount = null;
      this.isModalOpen = false;
     }
   }
}
