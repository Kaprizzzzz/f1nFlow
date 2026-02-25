import { Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenceComponent } from '../../history/expence/expence.component';
import { IncomeComponent } from '../../history/income/income.component';
import { NewsComponent } from '../../history/news/news.component';
import { SavingComponent } from '../../history/saving/saving.component';

type MainTab = 'income' | 'expense' | 'saving' | 'news' | null;
type SphereTab = Exclude<MainTab, null>;

type SpherePosition = {
  left: number;
  top: number;
};

const DEFAULT_SPHERE_POSITIONS: Record<SphereTab, SpherePosition> = {
  income: { top: 20, left: 85 },
  expense: { top: 266, left: -5 },
  saving: { top: 266, left: 215 },
  news: { top: 452, left: 118 }
};

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, IncomeComponent, ExpenceComponent, SavingComponent, NewsComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  @ViewChild('layoutRef')
  private layoutRef?: ElementRef<HTMLElement>;

   @ViewChildren('sphereRef')
  private sphereRefs?: QueryList<ElementRef<HTMLElement>>;

  activeTab: MainTab = null;
  isEditMode = false;

  spherePositions: Record<SphereTab, SpherePosition> = this.clonePositions(DEFAULT_SPHERE_POSITIONS);
  private savedSpherePositions: Record<SphereTab, SpherePosition> = this.clonePositions(DEFAULT_SPHERE_POSITIONS);

  private dragState: {
    tab: SphereTab;
    pointerId: number;
    pointerOffsetX: number;
    pointerOffsetY: number;
    sphereWidth: number;
    sphereHeight: number;
  } | null = null;

  private previousBodyTouchAction = '';

  setActiveTab(tab: SphereTab): void {
    // Не відкриваємо вкладку, якщо ми в режимі перетягування
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
    this.isEditMode = false;
    this.stopDrag();
  }

  resetToDefaultLayout(): void {
    this.savedSpherePositions = this.clonePositions(DEFAULT_SPHERE_POSITIONS);
    this.spherePositions = this.clonePositions(DEFAULT_SPHERE_POSITIONS);
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
    
    // Запам'ятовуємо, де саме всередині сфери ми схопилися (offset)
    this.dragState = {
      tab,
      pointerId: event.pointerId,
      pointerOffsetX: event.clientX - sphereRect.left,
      pointerOffsetY: event.clientY - sphereRect.top,
      sphereWidth: sphereRect.width,
      sphereHeight: sphereRect.height
    };

    // Захоплюємо вказівник, щоб рух відстежувався навіть поза межами елемента
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

    // Обчислюємо нові координати відносно контейнера
    const nextLeft = event.clientX - layoutRect.left - this.dragState.pointerOffsetX;
    const nextTop = event.clientY - layoutRect.top - this.dragState.pointerOffsetY;

    // Максимально допустимі координати (щоб сфера не виходила за межі)
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
    const raf = globalThis.requestAnimationFrame ?? ((callback: FrameRequestCallback) => setTimeout(() => callback(0), 0));

    raf(() => {
      const layout = this.layoutRef?.nativeElement;
      const sphereElements = this.sphereRefs?.toArray().map((item) => item.nativeElement) ?? [];

      if (!layout || sphereElements.length === 0) {
        return;
      }

      const tabsOrder: SphereTab[] = ['income', 'expense', 'saving', 'news'];
      const sidePadding = 12;
      const gap = 12;
      const maxWidth = layout.clientWidth;
      const maxHeight = layout.clientHeight;

      let currentLeft = sidePadding;
      let currentBottom = maxHeight - sidePadding;
      let rowHeight = 0;

      for (const tab of tabsOrder) {
        const element = sphereElements.find((item) => item.dataset['tab'] === tab);
        if (!element) {
          continue;
        }

        const sphereWidth = element.offsetWidth;
        const sphereHeight = element.offsetHeight;

        if (currentLeft + sphereWidth > maxWidth - sidePadding && currentLeft > sidePadding) {
          currentLeft = sidePadding;
          currentBottom -= rowHeight + gap;
          rowHeight = 0;
        }

        const top = this.clamp(currentBottom - sphereHeight, 0, Math.max(0, maxHeight - sphereHeight));
        const left = this.clamp(currentLeft, 0, Math.max(0, maxWidth - sphereWidth));

        this.spherePositions[tab] = { top, left };

        currentLeft += sphereWidth + gap;
        rowHeight = Math.max(rowHeight, sphereHeight);
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