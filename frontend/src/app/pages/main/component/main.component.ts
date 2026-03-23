import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ExpenceComponent } from '../../history/expence/expence.component';
import { IncomeComponent } from '../../history/income/income.component';
import { NewsComponent } from '../../history/news/news.component';
import { SavingComponent } from '../../history/saving/saving.component';
import { BalanceService, SphereLayout, SphereTab, Transaction } from '../../history/balance.service';
import { FrequentExpense, RecentComponent } from '../../history/recent/recent.component';

type MainTab = SphereTab | null;
type SpherePosition = { left: number; top: number };
type SphereSize = { width: number; height: number };

const DEFAULT_SPHERE_POSITIONS: SphereLayout = {
  income: { top: 214, left: 156 },
  expense: { top: 78, left: 24 },
  saving: { top: 166, left: 244 },
  news: { top: 336, left: 8 },
  recent: { top: 336, left: 246 }
};

const SPHERE_TOP_GAP = 0;
// Визначає базовий відступ куль від нижньої панелі роутингу.
const MOBILE_SPHERE_TOP_OVERSHOOT = 36;
const MOBILE_LAYOUT_BREAKPOINT = 560;

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, IncomeComponent, ExpenceComponent, SavingComponent, NewsComponent, RecentComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('layoutRef')
  private layoutRef?: ElementRef<HTMLElement>;

  @ViewChildren('sphereRef')
  private sphereRefs?: QueryList<ElementRef<HTMLElement>>;

  activeTab: MainTab = null;
  isEditMode = false;
  frequentExpenses: FrequentExpense[] = [];
  quickTransactionsLimit = 3;

  spherePositions: Record<SphereTab, SpherePosition> = this.clonePositions(DEFAULT_SPHERE_POSITIONS);
  private savedSpherePositions: Record<SphereTab, SpherePosition> = this.clonePositions(DEFAULT_SPHERE_POSITIONS);
  private subscription = new Subscription();
  private transactionsCache: Transaction[] = [];
  private sphereSizes: Record<SphereTab, SphereSize> = this.createFallbackSphereSizes();

  private dragState: {
    tab: SphereTab;
    pointerId: number;
    pointerOffsetX: number;
    pointerOffsetY: number;
    sphereWidth: number;
    sphereHeight: number;
  } | null = null;

  private previousBodyTouchAction = '';
  private readonly globalPointerMoveHandler = (event: PointerEvent): void => this.onDragMove(event);
  private readonly globalPointerUpHandler = (event: PointerEvent): void => this.onGlobalPointerStop(event);

  constructor(private balanceService: BalanceService) {}

  ngOnInit(): void {
    const initialLayout = this.balanceService.getSphereLayout();
    if (initialLayout) {
      this.spherePositions = this.clonePositions(initialLayout);
      this.savedSpherePositions = this.clonePositions(initialLayout);
    }

    this.subscription.add(
      this.balanceService.sphereLayout$.subscribe((layout) => {
        if (!layout) {
          return;
        }
        this.spherePositions = this.clonePositions(layout);
        this.savedSpherePositions = this.clonePositions(layout);
      })
    );
    this.subscription.add(
      this.balanceService.transactions$.subscribe((transactions) => {
        this.transactionsCache = transactions;
        this.frequentExpenses = this.buildFrequentExpenses(transactions);
      })
    );
    this.subscription.add(
      this.balanceService.quickTransactionsLimit$.subscribe((limit) => {
        this.quickTransactionsLimit = limit;
        this.frequentExpenses = this.buildFrequentExpenses(this.transactionsCache);
      })
    );
  }

  ngAfterViewInit(): void {
    this.measureSphereSizes();
    if (this.sphereRefs) {
      this.subscription.add(this.sphereRefs.changes.subscribe(() => this.measureSphereSizes()));
    }

    const raf =
      globalThis.requestAnimationFrame ?? ((callback: FrameRequestCallback) => setTimeout(() => callback(0), 0));

    raf(() => {
      this.measureSphereSizes();
      this.spherePositions = this.clampAllSpherePositions(this.spherePositions);
      this.savedSpherePositions = this.clampAllSpherePositions(this.savedSpherePositions);
    });
  }

  ngOnDestroy(): void {
    this.detachGlobalPointerListeners();
    this.subscription.unsubscribe();
  }

  setActiveTab(tab: SphereTab): void {
    if (this.isEditMode) {
      return;
    }
    const nextTab = this.activeTab === tab ? null : tab;
    this.activeTab = nextTab;
    if (nextTab === 'news') {
      this.balanceService.markAllNewsRead();
    }
  }

  closeActiveTab(): void {
    if (this.isEditMode || this.activeTab === null) {
      return;
    }
    this.activeTab = null;
  }

  repeatFrequentExpense(item: FrequentExpense): void {
    this.balanceService.addTransaction(item.repeatAmount, item.category, 'minus');
  }

  setQuickTransactionsLimit(limit: number): void {
    this.balanceService.setQuickTransactionsLimit(limit);
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    this.closeActiveTab();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.measureSphereSizes();

    if (this.isEditMode) {
      this.spawnSpheresAtBottom();
      return;
    }

    this.spherePositions = this.clampAllSpherePositions(this.spherePositions);
    this.savedSpherePositions = this.clampAllSpherePositions(this.savedSpherePositions);
  }

  toggleEditMode(): void {
    if (this.isEditMode) {
      this.isEditMode = false;
      this.stopDrag();
      this.spherePositions = this.clonePositions(this.savedSpherePositions);
      return;
    }
    this.activeTab = null;
    this.isEditMode = true;
    this.stopDrag();
    this.spawnSpheresAtBottom();
  }

  saveLayout(): void {
    this.measureSphereSizes();
    this.spherePositions = this.clampAllSpherePositions(this.spherePositions);
    this.savedSpherePositions = this.clonePositions(this.spherePositions);
    this.balanceService.setSphereLayout(this.savedSpherePositions);
    this.isEditMode = false;
    this.stopDrag();
  }

  resetToDefaultLayout(): void {
    this.savedSpherePositions = this.clonePositions(DEFAULT_SPHERE_POSITIONS);
    this.spherePositions = this.clampAllSpherePositions(DEFAULT_SPHERE_POSITIONS);
    this.balanceService.setSphereLayout(this.spherePositions);
    this.isEditMode = false;
    this.stopDrag();
  }

  onDragStart(event: PointerEvent, tab: SphereTab): void {
    if (!this.isEditMode || this.activeTab !== null) {
      return;
    }

    const layout = this.layoutRef?.nativeElement;
    const sphere = event.currentTarget as HTMLElement | null;

    if (!layout || !sphere) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const sphereRect = sphere.getBoundingClientRect();

    this.dragState = {
      tab,
      pointerId: event.pointerId,
      pointerOffsetX: event.clientX - sphereRect.left,
      pointerOffsetY: event.clientY - sphereRect.top,
      sphereWidth: sphereRect.width,
      sphereHeight: sphereRect.height
    };

    sphere.setPointerCapture(event.pointerId);
    this.attachGlobalPointerListeners();
    this.previousBodyTouchAction = document.body.style.touchAction;
    document.body.style.touchAction = 'none';
  }

  onDragMove(event: PointerEvent): void {
    if (!this.dragState || !this.isEditMode) {
      return;
    }

    if (event.pointerId !== this.dragState.pointerId) {
      return;
    }

    event.preventDefault();

    const layout = this.layoutRef?.nativeElement;
    if (!layout) {
      return;
    }

    const layoutRect = layout.getBoundingClientRect();
    const nextLeft = event.clientX - layoutRect.left - this.dragState.pointerOffsetX;
    const nextTop = event.clientY - layoutRect.top - this.dragState.pointerOffsetY;

    const bounds = this.getSphereBounds(layout, {
      width: this.dragState.sphereWidth,
      height: this.dragState.sphereHeight
    });

    this.spherePositions[this.dragState.tab] = {
      left: this.clamp(nextLeft, 0, bounds.maxLeft),
      top: this.clamp(nextTop, this.getSphereTopLimit(), bounds.maxTop)
    };
  }

  stopDrag(): void {
    this.dragState = null;
    this.detachGlobalPointerListeners();
    document.body.style.touchAction = this.previousBodyTouchAction;
  }

  isHidden(tab: SphereTab): boolean {
    return this.activeTab !== null && this.activeTab !== tab;
  }

  getSphereStyle(tab: SphereTab): Record<string, string> {
    const { top, left } = this.spherePositions[tab];

    const layout = this.layoutRef?.nativeElement;
    if (!layout) {
      return {
        top: `${Math.max(this.getSphereTopLimit(), top)}px`,
        left: `${Math.max(0, left)}px`
      };
    }

  const { maxLeft, maxTop } = this.getSphereBounds(layout, this.getSphereSize(tab));

    return {
      top: `${this.clamp(top, this.getSphereTopLimit(), maxTop)}px`,
      left: `${this.clamp(left, 0, maxLeft)}px`
    };
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  private spawnSpheresAtBottom(): void {
    const raf =
      globalThis.requestAnimationFrame ?? ((callback: FrameRequestCallback) => setTimeout(() => callback(0), 0));

    raf(() => {
      const layout = this.layoutRef?.nativeElement;
      if (!layout) {
        return;
      }

      this.measureSphereSizes();

      const tabsOrder: SphereTab[] = ['income', 'expense', 'news', 'saving', 'recent'];
      const overlapStep = 26;
      const centerX = layout.clientWidth / 2;
      const centerShift = (tabsOrder.length - 1) / 2;

      for (const [index, tab] of tabsOrder.entries()) {
        const size = this.getSphereSize(tab);
        const { maxLeft, maxTop } = this.getSphereBounds(layout, size);
        const overlapOffset = (index - centerShift) * overlapStep;
        const left = this.clamp(centerX - size.width / 2 + overlapOffset, 0, maxLeft);

        this.spherePositions[tab] = { top: maxTop, left };
      }
    });
  }

  private clonePositions(positions: Record<SphereTab, SpherePosition>): Record<SphereTab, SpherePosition> {
    return {
      income: { ...positions.income },
      expense: { ...positions.expense },
      saving: { ...positions.saving },
      news: { ...positions.news },
      recent: { ...positions.recent }
    };
  }

  private createFallbackSphereSizes(): Record<SphereTab, SphereSize> {
    return {
      income: { width: 220, height: 220 },
      expense: { width: 180, height: 180 },
      saving: { width: 143, height: 143 },
      news: { width: 154, height: 154 },
      recent: { width: 152, height: 152 }
    };
  }

  private measureSphereSizes(): void {
    this.sphereRefs?.forEach((sphereRef) => {
      const element = sphereRef.nativeElement;
      const tab = element.dataset['tab'] as SphereTab | undefined;

      if (!tab) {
        return;
      }

      const rect = element.getBoundingClientRect();
      const width = rect.width || element.offsetWidth;
      const height = rect.height || element.offsetHeight;

      if (!width || !height) {
        return;
      }

      this.sphereSizes[tab] = { width, height };
    });
  }

  private getSphereSize(tab: SphereTab): SphereSize {
    return this.sphereSizes[tab] ?? this.createFallbackSphereSizes()[tab];
  }

    private getSphereTopLimit(): number {
    if (typeof window !== 'undefined' && window.innerWidth <= MOBILE_LAYOUT_BREAKPOINT) {
      return -MOBILE_SPHERE_TOP_OVERSHOOT;
    }

    return SPHERE_TOP_GAP;
  }

  private getSphereBounds(layout: HTMLElement, size: SphereSize): { maxLeft: number; maxTop: number } {
    return {
      maxLeft: Math.max(0, layout.clientWidth - size.width),
      maxTop: Math.max(this.getSphereTopLimit(), layout.clientHeight - size.height)
    };
  }

  private clampAllSpherePositions(
    positions: Record<SphereTab, SpherePosition>
  ): Record<SphereTab, SpherePosition> {
    const layout = this.layoutRef?.nativeElement;
    if (!layout) {
      return this.clonePositions(positions);
    }

    return {
      income: this.clampSpherePosition('income', positions.income, layout),
      expense: this.clampSpherePosition('expense', positions.expense, layout),
      saving: this.clampSpherePosition('saving', positions.saving, layout),
      news: this.clampSpherePosition('news', positions.news, layout),
      recent: this.clampSpherePosition('recent', positions.recent, layout)
    };
  }

  private clampSpherePosition(tab: SphereTab, position: SpherePosition, layout: HTMLElement): SpherePosition {
    const { maxLeft, maxTop } = this.getSphereBounds(layout, this.getSphereSize(tab));

    return {
      left: this.clamp(position.left, 0, maxLeft),
      top: this.clamp(position.top, this.getSphereTopLimit(), maxTop)
    };
  }

  private onGlobalPointerStop(event: PointerEvent): void {
    if (!this.dragState || event.pointerId !== this.dragState.pointerId) {
      return;
    }

    this.stopDrag();
  }

  private attachGlobalPointerListeners(): void {
    window.addEventListener('pointermove', this.globalPointerMoveHandler, { passive: false });
    window.addEventListener('pointerup', this.globalPointerUpHandler, { passive: true });
    window.addEventListener('pointercancel', this.globalPointerUpHandler, { passive: true });
  }

  private detachGlobalPointerListeners(): void {
    window.removeEventListener('pointermove', this.globalPointerMoveHandler);
    window.removeEventListener('pointerup', this.globalPointerUpHandler);
    window.removeEventListener('pointercancel', this.globalPointerUpHandler);
  }

  private buildFrequentExpenses(transactions: Transaction[]): FrequentExpense[] {
    const expenseTransactions = transactions
      .filter((item) => item.type === 'minus')
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    const grouped = new Map<string, FrequentExpense>();

    for (const transaction of expenseTransactions) {
      const existing = grouped.get(transaction.category);
      if (existing) {
        existing.totalAmount += transaction.amount;
        existing.repeatCount += 1;
        continue;
      }

      grouped.set(transaction.category, {
        category: transaction.category,
        totalAmount: transaction.amount,
        repeatAmount: transaction.amount,
        repeatCount: 1
      });
    }

    return [...grouped.values()]
      .sort((a, b) => b.repeatCount - a.repeatCount || b.totalAmount - a.totalAmount)
      .slice(0, this.quickTransactionsLimit);
  }
}