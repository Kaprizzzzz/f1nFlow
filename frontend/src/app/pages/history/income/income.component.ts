 import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
 import { CommonModule } from '@angular/common';
 import { FormsModule } from '@angular/forms';
 import { Subscription } from 'rxjs';
 import { BalanceService, CategoryItem } from '../balance.service';
 import { map } from 'rxjs/operators';
 
type EditMode = 'name' | 'amount' | null;

 @Component({
   selector: 'app-income',
   standalone: true,
   imports: [CommonModule, FormsModule],
   templateUrl: './income.component.html',
   styleUrl: './income.component.scss'
 })
 export class IncomeComponent implements OnInit, OnDestroy {
  @Input() isFullView = false;
  @Output() onSelect = new EventEmitter<void>();

   totalIncome = 0;
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
      this.balanceService.incomeCategories$
        .pipe(map((categories) => categories.reduce((acc, item) => acc + item.amount, 0)))
        .subscribe((sum) => (this.totalIncome = sum))
    );
 
     this.subscriptions.add(
       this.balanceService.incomeCategories$.subscribe((categories) => {
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
    if (this.amount && this.amount > 0 && this.selectedCategory) {
       this.balanceService.addTransaction(this.amount, this.selectedCategory, 'plus');
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

    this.balanceService.addCategory('plus', normalizedName);
     this.newCategoryName = '';
    this.pendingCreatedCategory = normalizedName;
    this.pendingCreatedAmount = null;
    this.isCreateAmountModalOpen = true;
  }

  saveCreatedCategoryAmount(): void {
    if (!this.pendingCreatedCategory || this.pendingCreatedAmount === null || this.pendingCreatedAmount < 0) {
      return;
    }

    this.balanceService.updateCategoryAmount('plus', this.pendingCreatedCategory, this.pendingCreatedAmount);
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
      this.balanceService.renameCategory('plus', this.editModeCategory, this.editedCategoryName);
    }

    if (this.editMode === 'amount' && this.editedCategoryAmount !== null && this.editedCategoryAmount >= 0) {
      this.balanceService.updateCategoryAmount('plus', this.editModeCategory, this.editedCategoryAmount);
    }

    this.resetEditState();
   }
 
   cancelEdit(event: Event): void {
     event.stopPropagation();
    this.resetEditState();
   }
 
   deleteCategory(category: string, event: Event): void {
     event.stopPropagation();
     this.balanceService.deleteCategory('plus', category);
   }

  private resetEditState(): void {
    this.editModeCategory = '';
    this.editMode = null;
    this.editedCategoryName = '';
    this.editedCategoryAmount = null;
  }
 }
