import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BalanceService, CategoryItem } from '../balance.service';
import { I18nService } from '../../../core/i18n.service';
import { map } from 'rxjs/operators';

type PanelMode = 'amount' | 'name' | null;

@Component({
  selector: 'app-expence',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './expence.component.html',
  styleUrl: './expence.component.scss',
})
export class ExpenceComponent implements OnInit, OnChanges, OnDestroy {
  @Input() isFullView = false;
  @Input() showCategoryPanel = false;
  @Output() onSelect = new EventEmitter<void>();

  readonly emojiOptions = ['🍔', '🛍️', '🚗', '🏠', '🎁', '🧾'];

  totalExpense = 0;
  totalIncome = 0;
  amountInput = '';
  selectedDate = '';
  isAmountHidden = false;
  private holdTimer: ReturnType<typeof setTimeout> | null = null;
  isAmountInvalid = false;
  isAmountShakeActive = false;
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
  private pointerStart: {
    x: number;
    y: number;
    left: number;
    top: number;
  } | null = null;
  private draggedCategoryName = '';
  private didDragCategory = false;

  private subscriptions = new Subscription();
  private readonly todayDate = new Date().toISOString().split('T')[0];

  constructor(
    private balanceService: BalanceService,
    private i18nService: I18nService,
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.balanceService.expenseCategories$
        .pipe(
          map((categories) =>
            categories.reduce((acc, item) => acc + item.amount, 0),
          ),
        )
        .subscribe((sum) => (this.totalExpense = sum)),
    );

    this.subscriptions.add(
      this.balanceService.incomeCategories$
        .pipe(
          map((categories) =>
            categories.reduce((acc, item) => acc + item.amount, 0),
          ),
        )
        .subscribe((sum) => (this.totalIncome = sum)),
    );

    this.subscriptions.add(
      this.balanceService.expenseCategories$.subscribe((categories) => {
        this.categories = categories;

        if (
          this.selectedCategory &&
          !categories.some((item) => item.name === this.selectedCategory)
        ) {
          this.selectedCategory = '';
          this.panelMode = null;
        }

        if (
          this.editModeCategory &&
          !categories.some((item) => item.name === this.editModeCategory)
        ) {
          this.resetEditState();
        }
      }),
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('isFullView' in changes && !this.isFullView) {
      this.closeTransientUi();
    }
  }

  ngOnDestroy(): void {
    this.syncModalUiState();
    this.subscriptions.unsubscribe();
  }

  get selectedCategoryData(): CategoryItem | undefined {
    return this.categories.find((item) => item.name === this.selectedCategory);
  }

  get displayLabel(): string {
    return this.isFullView && this.selectedCategoryData
      ? this.selectedCategoryData.name
      : this.t('main.expense');
  }

  get displayValue(): number {
    return this.isFullView && this.selectedCategoryData
      ? this.selectedCategoryData.amount
      : this.totalExpense;
  }

  t(key: string): string {
    return this.i18nService.t(key);
  }

  get categoriesRingGradient(): string {
    return this.buildCategoryRingGradient(
      this.categories,
      'rgba(255, 166, 166, 0.94)',
      'rgba(127, 70, 85, 0.35)',
    );
  }

  handleCircleClick(): void {
    if (this.isFullView && this.stepBack()) {
      return;
    }
    this.onSelect.emit();
  }

  stepBack(): boolean {
    if (this.isCreateCategoryOpen) {
      this.closeCreateCategory();
      return true;
    }

    if (this.panelMode === 'amount') {
      this.closeAmountPanel();
      return true;
    }

    if (this.panelMode === 'name' || this.editModeCategory) {
      this.resetEditState();
      return true;
    }

    if (this.selectedCategory) {
      this.selectedCategory = '';
      this.amountInput = '';
      this.selectedDate = '';
      this.isAmountInvalid = false;
      this.isAmountShakeActive = false;
      return true;
    }

    return false;
  }

  selectCategory(category: CategoryItem, event: Event): void {
    event.stopPropagation();
    if (this.didDragCategory) {
      this.didDragCategory = false;
      return;
    }
    if (this.selectedCategory === category.name) {
      this.resetEditState();
      this.selectedCategory = '';
      return;
    }
    this.selectedCategory = category.name;
    this.panelMode = null;
    this.amountInput = '';
    this.syncModalUiState();
  }

  getMiniCircleStyle(index: number, total: number): Record<string, string> {
    const category = this.categories[index];
    if (category?.position) {
      return {
        left: `${category.position.left}px`,
        top: `${category.position.top}px`,
      };
    }

    const singleItemArcAngle = 270;
    const startAngle = 205;
    const endAngle = 335;

    const angle =
      total <= 1
        ? singleItemArcAngle
        : startAngle + ((endAngle - startAngle) * index) / (total - 1);

    const radians = (angle * Math.PI) / 180;
    const radius = 176;

    return {
      left: `${Math.cos(radians) * radius}px`,
      top: `${Math.sin(radians) * radius}px`,
    };
  }

  toggleAmountPanel(category: CategoryItem, event: Event): void {
    event.stopPropagation();
    const isSameCategory = this.selectedCategory === category.name;
    this.selectedCategory = category.name;
    this.amountInput = '';
    this.selectedDate = this.todayDate;
    this.panelMode =
      isSameCategory && this.panelMode === 'amount' ? null : 'amount';
    this.syncModalUiState();
  }

  saveData(): void {
    const amount = this.parseAmountInput(this.amountInput);

    if (amount !== null && amount > 0 && this.selectedCategory) {
      this.balanceService.addTransaction(
        amount,
        this.selectedCategory,
        'minus',
        this.selectedDate,
      );
      this.amountInput = '';
      this.selectedDate = '';
      this.isAmountInvalid = false;
      this.panelMode = null;
      this.selectedCategory = '';
      this.syncModalUiState();
      return;
    }

    this.triggerInvalidAmountUi();
  }

  closeAmountPanel(event?: Event): void {
    event?.stopPropagation();
    this.amountInput = '';
    this.selectedDate = '';
    this.isAmountInvalid = false;
    this.isAmountShakeActive = false;
    if (this.panelMode === 'amount') {
      this.panelMode = null;
      this.syncModalUiState();
    }
  }

  onAmountInputChange(): void {
    if (this.isAmountInvalid) {
      this.isAmountInvalid = false;
    }
  }

  private triggerInvalidAmountUi(): void {
    this.isAmountInvalid = true;
    this.isAmountShakeActive = false;

    requestAnimationFrame(() => {
      this.isAmountShakeActive = true;
      setTimeout(() => {
        this.isAmountShakeActive = false;
      }, 260);
    });
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

    this.balanceService.addCategory(
      'minus',
      normalizedName,
      this.newCategoryIcon,
    );
    this.newCategoryName = '';
    this.newCategoryIcon = this.emojiOptions[0];
    this.isCreateCategoryOpen = false;
    this.syncModalUiState();
  }

  openCreateCategory(event: Event): void {
    event.stopPropagation();
    this.isCreateCategoryOpen = true;
    this.panelMode = null;
    this.syncModalUiState();
  }

  closeCreateCategory(event?: Event): void {
    event?.stopPropagation();
    this.isCreateCategoryOpen = false;
    this.syncModalUiState();
  }

  onMiniPointerDown(index: number, event: PointerEvent): void {
    this.pointerDragIndex = index;
    this.pointerHoverIndex = index;
    const category = this.categories[index];
    const currentStyle = this.getMiniCircleStyle(index, this.categories.length);
    this.pointerStart = {
      x: event.clientX,
      y: event.clientY,
      left: Number.parseFloat(currentStyle['left'] ?? '0') || 0,
      top: Number.parseFloat(currentStyle['top'] ?? '0') || 0,
    };
    this.draggedCategoryName = category?.name ?? '';
    this.didDragCategory = false;

    const circle = event.currentTarget as HTMLElement | null;
    circle?.setPointerCapture(event.pointerId);

    event.preventDefault();
    event.stopPropagation();
  }

  onMiniPointerMove(event: PointerEvent): void {
    if (
      this.pointerDragIndex === null ||
      !this.pointerStart ||
      !this.draggedCategoryName
    ) {
      return;
    }

    event.preventDefault();
    const distance = Math.hypot(
      event.clientX - this.pointerStart.x,
      event.clientY - this.pointerStart.y,
    );
    const nextLeft = this.clampCategoryPosition(
      this.pointerStart.left + event.clientX - this.pointerStart.x,
      -180,
      180,
    );
    const nextTop = this.clampCategoryPosition(
      this.pointerStart.top + event.clientY - this.pointerStart.y,
      -250,
      160,
    );

    if (distance > 4) {
      this.didDragCategory = true;
      this.balanceService.updateCategoryPosition(
        'minus',
        this.draggedCategoryName,
        {
          left: nextLeft,
          top: nextTop,
        },
      );
    }
  }

  onMiniPointerUp(event: PointerEvent): void {
    if (this.pointerDragIndex === null) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.pointerDragIndex = null;
    this.pointerHoverIndex = null;
    this.pointerStart = null;
    this.draggedCategoryName = '';
  }

  private clampCategoryPosition(
    value: number,
    min: number,
    max: number,
  ): number {
    return Math.max(min, Math.min(max, value));
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
    const sourceIndex = sourceIndexRaw
      ? Number(sourceIndexRaw)
      : this.dragCategoryIndex;

    if (sourceIndex === null || !Number.isInteger(sourceIndex)) {
      this.dragCategoryIndex = null;
      return;
    }

    this.balanceService.swapCategories('minus', sourceIndex, index);
    this.dragCategoryIndex = null;
    this.pointerDragIndex = null;
    this.pointerHoverIndex = null;
  }

  openEditName(category: CategoryItem, event: Event): void {
    event.stopPropagation();
    const isSameCategory = this.editModeCategory === category.name;
    this.editModeCategory = category.name;
    this.panelMode =
      isSameCategory && this.panelMode === 'name' ? null : 'name';
    this.editedCategoryName = category.name;
    this.syncModalUiState();
  }

  saveEdit(event: Event): void {
    event.stopPropagation();
    if (!this.editModeCategory || this.panelMode !== 'name') return;

    this.balanceService.renameCategory(
      'minus',
      this.editModeCategory,
      this.editedCategoryName,
    );
    if (
      this.selectedCategory === this.editModeCategory &&
      this.editedCategoryName.trim()
    ) {
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
    this.selectedCategory = '';
    this.resetEditState();
  }

  private buildCategoryRingGradient(
    categories: CategoryItem[],
    activeColor: string,
    emptyColor: string,
  ): string {
    const total = categories.reduce(
      (sum, item) => sum + Math.max(0, item.amount),
      0,
    );
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
    this.syncModalUiState();
  }

  private syncModalUiState(): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.body.classList.toggle(
      'category-modal-open',
      this.panelMode !== null || this.isCreateCategoryOpen,
    );
  }



  onMainPointerDown(): void {
    this.clearHoldTimer();
    this.holdTimer = setTimeout(() => {
      this.isAmountHidden = !this.isAmountHidden;
      this.holdTimer = null;
    }, 350);
  }

  onMainPointerUp(): void {
    this.clearHoldTimer();
  }

  private clearHoldTimer(): void {
    if (this.holdTimer) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }
  }

  private closeTransientUi(): void {
    this.isCreateCategoryOpen = false;
    this.panelMode = null;
    this.amountInput = '';
    this.syncModalUiState();
    this.selectedDate = '';
    this.isAmountInvalid = false;
    this.isAmountShakeActive = false;
    this.editModeCategory = '';
    this.editedCategoryName = '';
    this.selectedCategory = '';
    this.syncModalUiState();
  }
}