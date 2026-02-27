 import { Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
 import { CommonModule } from '@angular/common';
 import { Subscription } from 'rxjs';
 import { ExpenceComponent } from '../../history/expence/expence.component';
 import { IncomeComponent } from '../../history/income/income.component';
 import { NewsComponent } from '../../history/news/news.component';
 import { SavingComponent } from '../../history/saving/saving.component';
 import { BalanceService, SphereLayout, SphereTab } from '../../history/balance.service';
 
 type MainTab = SphereTab | null;
 type SpherePosition = { left: number; top: number };
 
 const DEFAULT_SPHERE_POSITIONS: SphereLayout = {
   income: { top: 336, left: 170 },
   expense: { top: 185, left: 36 },
   saving: { top: 245, left: 230 },
   news: { top: 456, left: 0 }
 };
 
// income: { top: 336, left: 170 },
//  expense: { top: 185, left: 36 },
//  saving: { top: 245, left: 230 },
//  news: { top: 456, left: 0 }

 @Component({
   selector: 'app-main',
   standalone: true,
   imports: [CommonModule, IncomeComponent, ExpenceComponent, SavingComponent, NewsComponent],
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
 
   spherePositions: Record<SphereTab, SpherePosition> = this.clonePositions(DEFAULT_SPHERE_POSITIONS);
   private savedSpherePositions: Record<SphereTab, SpherePosition> = this.clonePositions(DEFAULT_SPHERE_POSITIONS);
  private subscription = new Subscription();
 
   private dragState: {
     tab: SphereTab;
     pointerId: number;
     pointerOffsetX: number;
     pointerOffsetY: number;
     sphereWidth: number;
     sphereHeight: number;
   } | null = null;
 
   private previousBodyTouchAction = '';
 
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
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

   setActiveTab(tab: SphereTab): void {
     if (this.isEditMode) {
       return;
     }
     this.activeTab = this.activeTab === tab ? null : tab;
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
     const maxTop = Math.max(0, layout.clientHeight - this.dragState.sphereHeight);
 
     this.spherePositions[this.dragState.tab] = {
       left: this.clamp(nextLeft, 0, maxLeft),
       top: this.clamp(nextTop, 0, maxTop)
     };
   }
 
   stopDrag(): void {
     this.dragState = null;
     document.body.style.touchAction = this.previousBodyTouchAction;
   }
 
   isHidden(tab: SphereTab): boolean {
     return this.activeTab !== null && this.activeTab !== tab;
  }

   getSphereStyle(tab: SphereTab): Record<string, string> {
    const { top, left } = this.spherePositions[tab];
    return {
      top: `${top}px`,
      left: `${left}px`
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
      const sphereElements = this.sphereRefs?.toArray().map((item) => item.nativeElement) ?? [];

      if (!layout || sphereElements.length === 0) {
        return;
      }

       const tabsOrder: SphereTab[] = ['income', 'expense', 'news', 'saving'];
       const overlapStep = 26;
      const maxWidth = layout.clientWidth;
      const maxHeight = layout.clientHeight;
       const centerX = maxWidth / 2;
       const centerShift = (tabsOrder.length - 1) / 2;

       for (const [index, tab] of tabsOrder.entries()) {
        const element = sphereElements.find((item) => item.dataset['tab'] === tab);
        if (!element) {
          continue;
        }

        const sphereWidth = element.offsetWidth;
        const sphereHeight = element.offsetHeight;

         const top = this.clamp(maxHeight - sphereHeight, 0, Math.max(0, maxHeight - sphereHeight));
         const overlapOffset = (index - centerShift) * overlapStep;
         const left = this.clamp(centerX - sphereWidth / 2 + overlapOffset, 0, Math.max(0, maxWidth - sphereWidth));

        this.spherePositions[tab] = { top, left };
      }
    });
  }

  private clonePositions(positions: Record<SphereTab, SpherePosition>): Record<SphereTab, SpherePosition> {
    return {
      income: { ...positions.income },
      expense: { ...positions.expense },
      saving: { ...positions.saving },
      news: { ...positions.news }
    };
  }
}
