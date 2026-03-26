import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BalanceService, CategoryItem } from '../balance.service';
import { map } from 'rxjs/operators';

type PanelMode = 'amount' | 'name' | null;

@Component({
  selector: 'app-income',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './income.component.html',
  styleUrl: './income.component.scss'
})
export class IncomeComponent implements OnInit, OnDestroy {
  @Input() isFullView = false;
  @Input() showCategoryPanel = false;
  @Output() onSelect = new EventEmitter<void>();

  readonly emojiOptions = ['💼', '🏦', '💸', '🎯', '📈', '✨'];

  totalIncome = 0;
  totalExpense = 0;
  amountInput = '';
  selectedCategory = '';

  categories: CategoryItem[] = [];
  newCategoryName = '';
  newCategoryIcon = this.emojiOptions[0];

  editModeCategory = '';
  panelMode: PanelMode = null;
  editedCategoryName = '';
  isCreateCategoryOpen = false;
  dragCategoryIndex: number | null = null;
  pointerDragIndex: number | null = null;
  pointerHoverIndex: number | null = null;

  private subscriptions = new Subscription();

  constructor(private balanceService: BalanceService) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.balanceService.incomeCategories$
        .pipe(map((categories) => categories.reduce((acc, item) => acc + item.amount, 0)))
        .subscribe((sum) => (this.totalIncome = sum))
    );

    this.subscriptions.add(
      this.balanceService.expenseCategories$
        .pipe(map((categories) => categories.reduce((acc, item) => acc + item.amount, 0)))
        .subscribe((sum) => (this.totalExpense = sum))
    );

    this.subscriptions.add(
      this.balanceService.incomeCategories$.subscribe((categories) => {
        this.categories = categories;

        if (this.selectedCategory && !categories.some((item) => item.name === this.selectedCategory)) {
          this.selectedCategory = '';
          this.panelMode = null;
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

  get categoriesRingGradient(): string {
    return this.buildCategoryRingGradient(this.categories, 'rgba(137, 211, 255, 0.95)', 'rgba(73, 99, 146, 0.28)');
  }

  handleCircleClick(): void {
    if (this.isFullView && this.selectedCategory) {
      this.selectedCategory = '';
      this.resetEditState();
      return;
    }
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
    this.amountInput = '';
  }

  getMiniCircleStyle(index: number, total: number): Record<string, string> {
    const singleItemArcAngle = 270;
    const startAngle = 205;
    const endAngle = 335;
    const angle = total <= 1 ? singleItemArcAngle : startAngle + ((endAngle - startAngle) * index) / (total - 1);
    const radians = (angle * Math.PI) / 180;
    const radius = 148;

    return {
      left: `${Math.cos(radians) * radius}px`,
      top: `${Math.sin(radians) * radius}px`
    };
  }

  toggleAmountPanel(category: CategoryItem, event: Event): void {
    event.stopPropagation();
    const isSameCategory = this.selectedCategory === category.name;
    this.selectedCategory = category.name;
    this.amountInput = '';
    this.panelMode = isSameCategory && this.panelMode === 'amount' ? null : 'amount';
  }

  saveData(): void {
     const amount = this.parseAmountInput(this.amountInput);

    if (amount !== null && amount > 0 && this.selectedCategory) {
      this.balanceService.addTransaction(amount, this.selectedCategory, 'plus');
      this.amountInput = '';
      this.panelMode = null;
    }
  }

  closeAmountPanel(event?: Event): void {
    event?.stopPropagation();
    this.amountInput = '';
    if (this.panelMode === 'amount') {
      this.panelMode = null;
    }
  }

  private parseAmountInput(rawValue: string): number | null {
    const normalized = rawValue.replace(/,/g, '.').trim();

    if (!normalized) {
      return null;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  addCategory(event: Event): void {
    event.stopPropagation();
    const normalizedName = this.newCategoryName.trim();
    if (!normalizedName) return;

    this.balanceService.addCategory('plus', normalizedName, this.newCategoryIcon);
    this.newCategoryName = '';
    this.newCategoryIcon = this.emojiOptions[0];
    this.isCreateCategoryOpen = false;
  }

  openCreateCategory(event: Event): void {
    event.stopPropagation();
    this.isCreateCategoryOpen = true;
    this.panelMode = null;
  }

  closeCreateCategory(event?: Event): void {
    event?.stopPropagation();
    this.isCreateCategoryOpen = false;
  }

  onMiniPointerDown(index: number, event: PointerEvent): void {
    this.pointerDragIndex = index;
    this.pointerHoverIndex = index;

    const circle = event.currentTarget as HTMLElement | null;
    circle?.setPointerCapture(event.pointerId);

    event.preventDefault();
    event.stopPropagation();
  }

  onMiniPointerMove(event: PointerEvent): void {
    if (this.pointerDragIndex === null) {
      return;
    }

    event.preventDefault();

    const hovered = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
    const target = hovered?.closest('[data-category-index]') as HTMLElement | null;
    const targetIndexRaw = target?.dataset['categoryIndex'];

    if (targetIndexRaw !== undefined) {
      this.pointerHoverIndex = Number(targetIndexRaw);
    }
  }

  onMiniPointerUp(event: PointerEvent): void {
    if (this.pointerDragIndex === null) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (this.pointerHoverIndex !== null && this.pointerHoverIndex !== this.pointerDragIndex) {
      this.balanceService.swapCategories('plus', this.pointerDragIndex, this.pointerHoverIndex);
    }

    this.pointerDragIndex = null;
    this.pointerHoverIndex = null;
  }

  startDrag(index: number, event: DragEvent): void {
    this.dragCategoryIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(index));
    }
  }

  allowDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  dropOn(index: number, event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const sourceIndexRaw = event.dataTransfer?.getData('text/plain');
    const sourceIndex = sourceIndexRaw ? Number(sourceIndexRaw) : this.dragCategoryIndex;

    if (sourceIndex === null || !Number.isInteger(sourceIndex)) {
      this.dragCategoryIndex = null;
      return;
    }

    this.balanceService.swapCategories('plus', sourceIndex, index);
    this.dragCategoryIndex = null;
    this.pointerDragIndex = null;
    this.pointerHoverIndex = null;
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

    this.balanceService.renameCategory('plus', this.editModeCategory, this.editedCategoryName);
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
    this.balanceService.deleteCategory('plus', category);
    this.selectedCategory = '';
    this.resetEditState();
  }

  private buildCategoryRingGradient(categories: CategoryItem[], activeColor: string, emptyColor: string): string {
    const total = categories.reduce((sum, item) => sum + Math.max(0, item.amount), 0);
    if (total <= 0) {
      return `conic-gradient(${emptyColor} 0deg, ${emptyColor} 360deg)`;
    }

    const gap = 1.5;
    let cursor = 0;
    const parts: string[] = [];

    for (const category of categories) {
      const share = (Math.max(0, category.amount) / total) * 360;
      const start = cursor;
      const end = Math.min(360, cursor + share);
      const visibleEnd = Math.max(start, end - gap);

      parts.push(`${activeColor} ${start}deg ${visibleEnd}deg`);
      if (visibleEnd < end) {
        parts.push(`${emptyColor} ${visibleEnd}deg ${end}deg`);
      }
      cursor = end;
    }

    if (cursor < 360) {
      parts.push(`${emptyColor} ${cursor}deg 360deg`);
    }

    return `conic-gradient(${parts.join(', ')})`;
  }

  private resetEditState(): void {
    this.editModeCategory = '';
    this.panelMode = null;
    this.editedCategoryName = '';
    this.amountInput = '';
  }
}