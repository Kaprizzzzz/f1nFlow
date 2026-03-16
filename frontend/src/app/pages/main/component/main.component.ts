import { Component, ElementRef, HostListener, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
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

const DEFAULT_SPHERE_POSITIONS: SphereLayout = {
  income: { top: 214, left: 156 },
  expense: { top: 78, left: 24 },
  saving: { top: 166, left: 244 },
  news: { top: 336, left: 8 },
  recent: { top: 336, left: 246 }
};

const SPHERE_TOP_GAP = 0;
// Визначає базовий відступ куль від нижньої панелі роутингу.
const ROUTING_PANEL_BOTTOM_OFFSET_DESKTOP = 4;
const ROUTING_PANEL_BOTTOM_OFFSET_MOBILE = 8;

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, IncomeComponent, ExpenceComponent, SavingComponent, NewsComponent, RecentComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit, OnDestroy {
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
    this.savedSpherePositions = this.clonePositions(this.spherePositions);
    this.balanceService.setSphereLayout(this.savedSpherePositions);
    this.isEditMode = false;
    this.stopDrag();
  }

  resetToDefaultLayout(): void {
    this.savedSpherePositions = this.clonePositions(DEFAULT_SPHERE_POSITIONS);
    this.spherePositions = this.clonePositions(DEFAULT_SPHERE_POSITIONS);
    this.balanceService.setSphereLayout(this.savedSpherePositions);
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

    const maxLeft = Math.max(0, layout.clientWidth - this.dragState.sphereWidth);
    const bottomOffset = this.getRoutingPanelBottomOffset();
    const maxTop = Math.max(0, layout.clientHeight - this.dragState.sphereHeight - bottomOffset);
    const minTop = SPHERE_TOP_GAP;

    this.spherePositions[this.dragState.tab] = {
      left: this.clamp(nextLeft, 0, maxLeft),
      top: this.clamp(nextTop, minTop, maxTop)
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
    // Використовуємо динамічний перерахунок лімітів для відображення
    const clampedTop = this.clampTopWithinViewport(tab, top);
    return {
      top: `${clampedTop}px`,
      left: `${left}px`
    };
  }

  private clampTopWithinViewport(tab: SphereTab, top: number): number {
    const layout = this.layoutRef?.nativeElement;
    if (!layout) {
      return Math.max(SPHERE_TOP_GAP, top);
    }

    const sphereElement = this.sphereRefs
      ?.toArray()
      .map((item) => item.nativeElement)
      .find((item) => this.getSphereTab(item) === tab);

    const sphereHeight = sphereElement?.offsetHeight ?? 190;
    const bottomOffset = this.getRoutingPanelBottomOffset();
    const maxTop = Math.max(SPHERE_TOP_GAP, layout.clientHeight - sphereHeight - bottomOffset);
    return this.clamp(top, SPHERE_TOP_GAP, maxTop);
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  private spawnSpheresAtBottom(): void {
    const raf =
      globalThis.requestAnimationFrame ?? ((callback: FrameRequestCallback) => setTimeout(() => callback(0), 0));

    raf(() => {
      const layout = this.layoutRef?.nativeElement;
      const sphereElements = this.sphereRefs?.toArray().map((item) => item.nativeElement) ?? [];

      if (!layout || sphereElements.length === 0) {
        return;
      }

      const tabsOrder: SphereTab[] = ['income', 'expense', 'news', 'saving', 'recent'];
      const overlapStep = 26;
      const maxWidth = layout.clientWidth;
      const maxHeight = layout.clientHeight;
      const bottomOffset = this.getRoutingPanelBottomOffset();
      const centerX = maxWidth / 2;
      const centerShift = (tabsOrder.length - 1) / 2;

      for (const [index, tab] of tabsOrder.entries()) {
        const element = sphereElements.find((item) => this.getSphereTab(item) === tab);
        if (!element) {
          continue;
        }

        const sphereWidth = element.offsetWidth;
        const sphereHeight = element.offsetHeight;
        
        const maxTopAboveTaskbar = Math.max(
          SPHERE_TOP_GAP,
          maxHeight - sphereHeight - bottomOffset
        );

        const top = this.clamp(maxTopAboveTaskbar, SPHERE_TOP_GAP, maxTopAboveTaskbar);
        const overlapOffset = (index - centerShift) * overlapStep;
        const left = this.clamp(centerX - sphereWidth / 2 + overlapOffset, 0, Math.max(0, maxWidth - sphereWidth));
        
        this.spherePositions[tab] = { top, left };
      }
    });
  }

   private getRoutingPanelBottomOffset(): number {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return ROUTING_PANEL_BOTTOM_OFFSET_DESKTOP;
    }
    
    return window.matchMedia('(max-width: 560px)').matches
      ? ROUTING_PANEL_BOTTOM_OFFSET_MOBILE
      : ROUTING_PANEL_BOTTOM_OFFSET_DESKTOP;
  }

  private getSphereTab(element: HTMLElement): SphereTab | null {
    const dataTab = element.dataset?.['tab'] ?? element.getAttribute('data-tab');
    if (dataTab === 'income' || dataTab === 'expense' || dataTab === 'saving' || dataTab === 'news' || dataTab === 'recent') {
      return dataTab;
    }
    return null;
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