import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BalanceService, CategoryItem } from '../balance.service';
import { map } from 'rxjs/operators';

type PanelMode = 'amount' | 'name' | null;

@Component({
  selector: 'app-expence',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './expence.component.html',
  styleUrl: './expence.component.scss'
})
export class ExpenceComponent implements OnInit, OnDestroy {
  @Input() isFullView = false;
  @Input() showCategoryPanel = false;
  @Output() onSelect = new EventEmitter<void>();

  readonly emojiOptions = ['🍔', '🛍️', '🚗', '🏠', '🎁', '🧾'];

  totalExpense = 0;
  amount: number | null = null;
  selectedCategory = '';

  categories: CategoryItem[] = [];
  newCategoryName = '';
  newCategoryIcon = this.emojiOptions[0];

  editModeCategory = '';
  panelMode: PanelMode = null;
  editedCategoryName = '';

  private subscriptions = new Subscription();

  constructor(private balanceService: BalanceService) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.balanceService.expenseCategories$
        .pipe(map((categories) => categories.reduce((acc, item) => acc + item.amount, 0)))
        .subscribe((sum) => (this.totalExpense = sum))
    );

    this.subscriptions.add(
      this.balanceService.expenseCategories$.subscribe((categories) => {
        this.categories = categories;

        if (this.selectedCategory && !categories.some((item) => item.name === this.selectedCategory)) {
          this.selectedCategory = '';
          this.panelMode = null;
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
    return this.isFullView && this.selectedCategoryData ? this.selectedCategoryData.name : 'Expense';
  }

  get displayValue(): number {
    return this.isFullView && this.selectedCategoryData ? this.selectedCategoryData.amount : this.totalExpense;
  }

  handleCircleClick(): void {
    this.onSelect.emit();
  }

  selectCategory(category: CategoryItem, event: Event): void {
    event.stopPropagation();
    if (this.selectedCategory === category.name) {
      this.resetEditState();
      this.selectedCategory = '';
      return;
    }
    this.selectedCategory = category.name;
    this.panelMode = null;
    this.amount = null;
  }

  /**
   * Обчислює позицію іконки на дузі навколо основного кола
   */
  getMiniCircleStyle(index: number, total: number): Record<string, string> {
    const singleItemArcAngle = 270; // Кут для одиночного елемента (зверху)
    const startAngle = 205; // Початок дуги
    const endAngle = 335;   // Кінець дуги
    
    const angle = total <= 1 
      ? singleItemArcAngle 
      : startAngle + ((endAngle - startAngle) * index) / (total - 1);
    
    const radians = (angle * Math.PI) / 180;
    const radius = 172; // Відстань від центру основного кола

    return {
      left: `${Math.cos(radians) * radius}px`,
      top: `${Math.sin(radians) * radius}px`
    };
  }

  toggleAmountPanel(category: CategoryItem, event: Event): void {
    event.stopPropagation();
    const isSameCategory = this.selectedCategory === category.name;
    this.selectedCategory = category.name;
    this.amount = null;
    this.panelMode = isSameCategory && this.panelMode === 'amount' ? null : 'amount';
  }

  saveData(): void {
    if (this.amount && this.amount > 0 && this.selectedCategory) {
      this.balanceService.addTransaction(this.amount, this.selectedCategory, 'minus');
      this.amount = null;
      this.panelMode = null;
    }
  }

  addCategory(event: Event): void {
    event.stopPropagation();
    const normalizedName = this.newCategoryName.trim();
    if (!normalizedName) return;

    this.balanceService.addCategory('minus', normalizedName, this.newCategoryIcon);
    this.selectedCategory = normalizedName;
    this.newCategoryName = '';
    this.newCategoryIcon = this.emojiOptions[0];
  }

  openEditName(category: CategoryItem, event: Event): void {
    event.stopPropagation();
    const isSameCategory = this.editModeCategory === category.name;
    this.editModeCategory = category.name;
    this.panelMode = isSameCategory && this.panelMode === 'name' ? null : 'name';
    this.editedCategoryName = category.name;
  }

  saveEdit(event: Event): void {
    event.stopPropagation();
    if (!this.editModeCategory || this.panelMode !== 'name') return;

    this.balanceService.renameCategory('minus', this.editModeCategory, this.editedCategoryName);
    if (this.selectedCategory === this.editModeCategory && this.editedCategoryName.trim()) {
      this.selectedCategory = this.editedCategoryName.trim();
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
    this.panelMode = null;
    this.editedCategoryName = '';
    this.amount = null;
  }
}