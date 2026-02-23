import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BalanceService, CategoryItem } from '../balance.service';
import { map } from 'rxjs/operators';

type EditMode = 'name' | null;
 
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
 
  readonly emojiOptions = ['💼', '🏦', '💸', '🎯', '📈', '✨'];

  totalIncome = 0;
   isModalOpen = false;
  amount: number | null = null;
  selectedCategory = '';
 
  categories: CategoryItem[] = [];
  newCategoryName = '';
  newCategoryIcon = this.emojiOptions[0];
 
  editModeCategory = '';
   editMode: EditMode = null;
  editedCategoryName = '';

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

        if (this.selectedCategory && !categories.some((item) => item.name === this.selectedCategory)) {
          this.selectedCategory = '';
          this.isModalOpen = false;
        }

        if (!this.selectedCategory && categories.length > 0 && this.isFullView) {
          this.selectedCategory = categories[0].name;
        }

         if (this.editModeCategory && !categories.some((item) => item.name === this.editModeCategory)) {
           this.resetEditState();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get selectedCategoryData(): CategoryItem | undefined {
    return this.categories.find((item) => item.name === this.selectedCategory);
  }

  get displayLabel(): string {
    return this.isFullView && this.selectedCategoryData ? this.selectedCategoryData.name : 'Income';
  }

  get displayValue(): number {
    return this.isFullView && this.selectedCategoryData ? this.selectedCategoryData.amount : this.totalIncome;
  }

  handleCircleClick(): void {
    this.onSelect.emit();
  }

   selectCategory(category: CategoryItem, event: Event): void {
    event.stopPropagation();
     this.selectedCategory = category.name;
   
    this.amount = null;
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
 
    this.balanceService.addCategory('plus', normalizedName, this.newCategoryIcon);
 
    
    this.selectedCategory = normalizedName;
    this.newCategoryName = '';
    this.newCategoryIcon = this.emojiOptions[0];
   }
 
   openEditName(category: CategoryItem, event: Event): void {
    event.stopPropagation();
     this.editModeCategory = category.name;
     this.editMode = 'name';
     this.editedCategoryName = category.name;
   }

  saveEdit(event: Event): void {
    event.stopPropagation();
     if (!this.editModeCategory || !this.editMode) {
      return;
    }

     if (this.editMode === 'name') {
       this.balanceService.renameCategory('plus', this.editModeCategory, this.editedCategoryName);
      if (this.selectedCategory === this.editModeCategory && this.editedCategoryName.trim()) {
        this.selectedCategory = this.editedCategoryName.trim();
      }
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
   }
}
