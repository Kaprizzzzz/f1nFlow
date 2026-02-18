 import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BalanceService } from '../balance.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-expence',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './expence.component.html',
  styleUrl: './expence.component.scss'
})
export class ExpenceComponent implements OnInit, OnDestroy {
   @Input() isFullView = false;
   @Output() onSelect = new EventEmitter<void>();
 
  totalExpense = 0;
   isModalOpen = false;
  amount: number | null = null;
  selectedCategory = '';

  categories: string[] = [];
  newCategoryName = '';
  editModeCategory = '';
  editedCategoryName = '';

  private subscriptions = new Subscription();

  constructor(private balanceService: BalanceService) {}

  ngOnInit(): void {
     this.subscriptions.add(
      this.balanceService.transactions$
        .pipe(map((txs) => txs.filter((tx) => tx.type === 'minus').reduce((acc, tx) => acc + tx.amount, 0)))
        .subscribe((sum) => (this.totalExpense = sum))
    );

    this.subscriptions.add(
      this.balanceService.expenseCategories$.subscribe((categories) => {
        this.categories = categories;

        if (this.editModeCategory && !categories.includes(this.editModeCategory)) {
          this.editModeCategory = '';
          this.editedCategoryName = '';
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

 
  handleCircleClick(): void {
    this.onSelect.emit();
  }

  selectCategory(category: string, event: Event): void {
      event.stopPropagation();
    this.selectedCategory = category;
    this.amount = null;
    this.isModalOpen = true;
  }
 
  saveData(): void {
     if (this.amount && this.amount > 0) {
      this.balanceService.addTransaction(this.amount, this.selectedCategory, 'minus');
      this.amount = null;
      this.isModalOpen = false;
     }
   }
   addCategory(event: Event): void {
    event.stopPropagation();
    this.balanceService.addCategory('minus', this.newCategoryName);
    this.newCategoryName = '';
  }

  startEdit(category: string, event: Event): void {
    event.stopPropagation();
    this.editModeCategory = category;
    this.editedCategoryName = category;
  }

  saveEdit(event: Event): void {
    event.stopPropagation();
    if (!this.editModeCategory) {
      return;
    }

    this.balanceService.renameCategory('minus', this.editModeCategory, this.editedCategoryName);
    this.editModeCategory = '';
    this.editedCategoryName = '';
  }

  cancelEdit(event: Event): void {
    event.stopPropagation();
    this.editModeCategory = '';
    this.editedCategoryName = '';
  }

  deleteCategory(category: string, event: Event): void {
    event.stopPropagation();
    this.balanceService.deleteCategory('minus', category);
  }
}
