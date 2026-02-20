import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
 import { CommonModule } from '@angular/common';
 import { FormsModule } from '@angular/forms';
 import { Subscription } from 'rxjs';
import { BalanceService, CategoryItem } from '../balance.service';
 import { map } from 'rxjs/operators';
 
type EditMode = 'name' | 'amount' | null;

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
 
   categories: CategoryItem[] = [];
   newCategoryName = '';

  isCreateAmountModalOpen = false;
  pendingCreatedCategory = '';
  pendingCreatedAmount: number | null = null;

   editModeCategory = '';
  editMode: EditMode = null;
   editedCategoryName = '';
  editedCategoryAmount: number | null = null;
 
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
 
        if (this.editModeCategory && !categories.some((item) => item.name === this.editModeCategory)) {
          this.resetEditState();
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
 
  selectCategory(category: CategoryItem, event: Event): void {
    event.stopPropagation();
    this.selectedCategory = category.name;
    this.amount = category.amount;
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
    const normalizedName = this.newCategoryName.trim();
    if (!normalizedName) {
      return;
    }

    this.balanceService.addCategory('minus', normalizedName);
     this.newCategoryName = '';
    this.pendingCreatedCategory = normalizedName;
    this.pendingCreatedAmount = null;
    this.isCreateAmountModalOpen = true;
  }

  saveCreatedCategoryAmount(): void {
    if (!this.pendingCreatedCategory || this.pendingCreatedAmount === null || this.pendingCreatedAmount < 0) {
      return;
    }

    this.balanceService.updateCategoryAmount('minus', this.pendingCreatedCategory, this.pendingCreatedAmount);
    this.closeCreateAmountModal();
   }
 
  closeCreateAmountModal(): void {
    this.isCreateAmountModalOpen = false;
    this.pendingCreatedCategory = '';
    this.pendingCreatedAmount = null;
  }

  openEditName(category: CategoryItem, event: Event): void {
     event.stopPropagation();
    this.editModeCategory = category.name;
    this.editMode = 'name';
    this.editedCategoryName = category.name;
    this.editedCategoryAmount = null;
  }

  openEditAmount(category: CategoryItem, event: Event): void {
    event.stopPropagation();
    this.editModeCategory = category.name;
    this.editMode = 'amount';
    this.editedCategoryAmount = category.amount;
    this.editedCategoryName = '';
   }
 
   saveEdit(event: Event): void {
     event.stopPropagation();
    if (!this.editModeCategory || !this.editMode) {
       return;
     }
 
    if (this.editMode === 'name') {
      this.balanceService.renameCategory('minus', this.editModeCategory, this.editedCategoryName);
    }

    if (this.editMode === 'amount' && this.editedCategoryAmount !== null && this.editedCategoryAmount >= 0) {
      this.balanceService.updateCategoryAmount('minus', this.editModeCategory, this.editedCategoryAmount);
    }

    this.resetEditState();
   }
 
   cancelEdit(event: Event): void {
     event.stopPropagation();
    this.resetEditState();
   }
 
   deleteCategory(category: string, event: Event): void {
     event.stopPropagation();
     this.balanceService.deleteCategory('minus', category);
   }

  private resetEditState(): void {
    this.editModeCategory = '';
    this.editMode = null;
    this.editedCategoryName = '';
    this.editedCategoryAmount = null;
  }
 }
