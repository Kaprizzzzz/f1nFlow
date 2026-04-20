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
import { BehaviorSubject, Subscription, combineLatest, map } from 'rxjs';
import { ExpenceComponent } from '../../history/expence/expence.component';
import { IncomeComponent } from '../../history/income/income.component';
import { NewsComponent } from '../../history/news/news.component';
import { SavingComponent } from '../../history/saving/saving.component';
import { BalanceService, SphereTab } from '../../history/balance.service';
import { RecentCategoryGroup, RecentComponent } from '../../history/recent/recent.component';
import { SessionService } from '../../user/service/user.service';
import {
  DEFAULT_SPHERE_POSITIONS,
  DragState,
  SphereLayoutService,
  SpherePosition,
  SphereSize
} from '../sphere-layout.service';
import { RecentFacadeService } from '../recent-facade.service';
import { MainViewModel } from '../main-view-model';

type MainTab = SphereTab | null;

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule,
    IncomeComponent,
    ExpenceComponent,
    SavingComponent,
    NewsComponent,
    RecentComponent
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('layoutRef')
  private layoutRef?: ElementRef<HTMLElement>;

  @ViewChildren('sphereRef')
  private sphereRefs?: QueryList<ElementRef<HTMLElement>>;
  @ViewChild(IncomeComponent)
  private incomeComponent?: IncomeComponent;
  @ViewChild(ExpenceComponent)
  private expenceComponent?: ExpenceComponent;

  activeTab: MainTab = null;
  isEditMode = false;
  canEditLayout = false;
  recentCategoryGroups: RecentCategoryGroup[] = [];
  quickTransactionsLimit = 3;
  weeklyChallengeText = '';
  newsPanelAnchorBottom = 0;

  spherePositions!: Record<SphereTab, SpherePosition>;
  private savedSpherePositions!: Record<SphereTab, SpherePosition>;
  private sphereSizes!: Record<SphereTab, SphereSize>;
  private dragState: DragState | null = null;

  private readonly isEditMode$ = new BehaviorSubject<boolean>(this.isEditMode);
  private subscription = new Subscription();
  private previousBodyTouchAction = '';
  private readonly globalPointerMoveHandler = (event: PointerEvent): void => this.onDragMove(event);
  private readonly globalPointerUpHandler = (event: PointerEvent): void => this.onGlobalPointerStop(event);

  private readonly vm$;

  constructor(
    private balanceService: BalanceService,
    private sessionService: SessionService,
    private sphereLayoutService: SphereLayoutService,
    private recentFacade: RecentFacadeService
  ) {
    this.spherePositions = this.sphereLayoutService.clonePositions(DEFAULT_SPHERE_POSITIONS);
    this.savedSpherePositions = this.sphereLayoutService.clonePositions(DEFAULT_SPHERE_POSITIONS);
    this.sphereSizes = this.sphereLayoutService.createFallbackSphereSizes();

    this.vm$ = combineLatest([
      this.sessionService.user$,
      this.balanceService.quickTransactionsLimit$,
      this.balanceService.transactions$,
      this.balanceService.weeklyChallenge$,
      this.balanceService.sphereLayout$,
      this.isEditMode$
    ]).pipe(
      map(([_user, quickTransactionsLimit, transactions, weeklyChallenge, sphereLayout, _isEditMode]): MainViewModel => ({
        canEditLayout: true,
        quickTransactionsLimit,
        recentCategoryGroups: this.recentFacade.buildRecentCategoryGroups(transactions, quickTransactionsLimit),
        weeklyChallengeText: weeklyChallenge
          ? `Weekly challenge: тримай "${weeklyChallenge.category}" до ${weeklyChallenge.limit.toFixed(2)}`
          : '',
        sphereLayout
      }))
    );
  }

  ngOnInit(): void {
    const initialLayout = this.balanceService.getSphereLayout();
    if (initialLayout) {
      this.spherePositions = this.sphereLayoutService.clonePositions(initialLayout);
      this.savedSpherePositions = this.sphereLayoutService.clonePositions(initialLayout);
    }

    this.subscription.add(
      this.vm$.subscribe((vm) => {
        this.canEditLayout = vm.canEditLayout;
        this.quickTransactionsLimit = vm.quickTransactionsLimit;
        this.recentCategoryGroups = vm.recentCategoryGroups;
        this.weeklyChallengeText = vm.weeklyChallengeText;

        if (vm.sphereLayout) {
          this.spherePositions = this.sphereLayoutService.clonePositions(vm.sphereLayout);
          this.savedSpherePositions = this.sphereLayoutService.clonePositions(vm.sphereLayout);
        }

        if (!this.canEditLayout && this.isEditMode) {
          this.isEditMode = false;
          this.isEditMode$.next(false);
          this.stopDrag();
        }
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
      this.clampAllCurrentSpherePositions();
      this.updateNewsPanelAnchorBottom();
    });
  }

  ngOnDestroy(): void {
    this.syncFullscreenUiState(null);
    this.detachGlobalPointerListeners();
    this.subscription.unsubscribe();
  }

  setActiveTab(tab: SphereTab): void {
    if (this.isEditMode) {
      return;
    }
    const nextTab = this.activeTab === tab ? null : tab;
    this.activeTab = nextTab;
    this.syncFullscreenUiState(nextTab);
    this.updateNewsPanelAnchorBottom();
    if (nextTab === 'news') {
      this.balanceService.markAllNewsRead();
    }
  }

  closeActiveTab(): void {
    if (this.isEditMode || this.activeTab === null) {
      return;
    }

    if (this.stepBackInActiveCategoryTab()) {
      return;
    }

    this.activeTab = null;
    this.syncFullscreenUiState(null);
  }

  repeatTransaction(category: string, amount: number): void {
    this.recentFacade.repeatExpense(category, amount);
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
    this.clampAllCurrentSpherePositions();
    this.updateNewsPanelAnchorBottom();
  }

  toggleEditMode(): void {
    if (!this.canEditLayout) {
      return;
    }

    if (this.isEditMode) {
      this.isEditMode = false;
      this.isEditMode$.next(false);
      this.stopDrag();
      this.spherePositions = this.sphereLayoutService.clonePositions(this.savedSpherePositions);
      return;
    }

    this.isEditMode = true;
    this.isEditMode$.next(true);
    this.stopDrag();
    this.spherePositions = this.sphereLayoutService.clonePositions(this.savedSpherePositions);
  }

  saveLayout(): void {
    this.measureSphereSizes();
    this.clampAllCurrentSpherePositions();
    this.savedSpherePositions = this.sphereLayoutService.clonePositions(this.spherePositions);
    this.balanceService.setSphereLayout(this.savedSpherePositions);
    this.isEditMode = false;
    this.isEditMode$.next(false);
    this.stopDrag();
  }

  resetToDefaultLayout(): void {
    this.savedSpherePositions = this.sphereLayoutService.clonePositions(DEFAULT_SPHERE_POSITIONS);
    this.spherePositions = this.sphereLayoutService.clampAllSpherePositions(
      DEFAULT_SPHERE_POSITIONS,
      this.layoutRef?.nativeElement,
      this.sphereSizes
    );
    this.balanceService.setSphereLayout(this.spherePositions);
    this.isEditMode = false;
    this.isEditMode$.next(false);
    this.stopDrag();
  }

  onDragStart(event: PointerEvent, tab: SphereTab): void {
    if (!this.isEditMode || this.activeTab !== null || !this.canEditLayout || !this.layoutRef?.nativeElement) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.dragState = this.sphereLayoutService.startDrag(event, tab, this.layoutRef.nativeElement);
    this.attachGlobalPointerListeners();
    this.previousBodyTouchAction = document.body.style.touchAction;
    document.body.style.touchAction = 'none';
  }

  onDragMove(event: PointerEvent): void {
    if (!this.dragState || !this.isEditMode || event.pointerId !== this.dragState.pointerId || !this.layoutRef?.nativeElement) {
      return;
    }

    event.preventDefault();

    this.spherePositions[this.dragState.tab] = this.sphereLayoutService.calculateDragPosition(
      event,
      this.dragState,
      this.layoutRef.nativeElement
    );
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
    return this.sphereLayoutService.getSphereStyle(tab, this.spherePositions, this.layoutRef?.nativeElement, this.sphereSizes);
  }

  isFullscreenPanelTab(tab: MainTab = this.activeTab): boolean {
    return tab === 'news' || tab === 'saving' || tab === 'recent';
  }

  private syncFullscreenUiState(tab: MainTab): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.body.classList.toggle('panel-fullscreen-active', this.isFullscreenPanelTab(tab));
  }

  private measureSphereSizes(): void {
    this.sphereSizes = this.sphereLayoutService.measureSphereSizes(this.sphereRefs, this.sphereSizes);
  }

  private clampAllCurrentSpherePositions(): void {
    this.spherePositions = this.sphereLayoutService.clampAllSpherePositions(
      this.spherePositions,
      this.layoutRef?.nativeElement,
      this.sphereSizes
    );
    this.savedSpherePositions = this.sphereLayoutService.clampAllSpherePositions(
      this.savedSpherePositions,
      this.layoutRef?.nativeElement,
      this.sphereSizes
    );
  }

  private updateNewsPanelAnchorBottom(): void {
    if (this.activeTab !== 'news') {
      return;
    }

    const raf =
      globalThis.requestAnimationFrame ?? ((callback: FrameRequestCallback) => setTimeout(() => callback(0), 0));

    raf(() => {
      const layout = this.layoutRef?.nativeElement;
      const newsCircle = layout?.querySelector<HTMLElement>('.sphere-wrapper[data-tab="news"] .main-circle');
      if (!newsCircle) {
        return;
      }

      this.newsPanelAnchorBottom = Math.ceil(newsCircle.getBoundingClientRect().bottom);
    });
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

  private stepBackInActiveCategoryTab(): boolean {
    if (this.activeTab === 'income') {
      return this.incomeComponent?.stepBack() ?? false;
    }

    if (this.activeTab === 'expense') {
      return this.expenceComponent?.stepBack() ?? false;
    }

    return false;
  }
}
