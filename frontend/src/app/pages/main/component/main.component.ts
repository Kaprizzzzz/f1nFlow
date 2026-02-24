import { Component, ElementRef, ViewChild } from '@angular/core';
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

  activeTab: MainTab = null;
  isEditMode = false;

  spherePositions: Record<SphereTab, SpherePosition> = this.clonePositions(DEFAULT_SPHERE_POSITIONS);
  private savedSpherePositions: Record<SphereTab, SpherePosition> = this.clonePositions(DEFAULT_SPHERE_POSITIONS);

  private dragState: {
    tab: SphereTab;
    pointerOffsetX: number;
    pointerOffsetY: number;
    sphereWidth: number;
    sphereHeight: number;
  } | null = null;

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
    this.spherePositions = this.clonePositions(this.savedSpherePositions);
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

    const sphereRect = sphere.getBoundingClientRect();
    
    // Запам'ятовуємо, де саме всередині сфери ми схопилися (offset)
    this.dragState = {
      tab,
      pointerOffsetX: event.clientX - sphereRect.left,
      pointerOffsetY: event.clientY - sphereRect.top,
      sphereWidth: sphereRect.width,
      sphereHeight: sphereRect.height
    };

    // Захоплюємо вказівник, щоб рух відстежувався навіть поза межами елемента
    sphere.setPointerCapture(event.pointerId);
  }

  onDragMove(event: PointerEvent): void {
    if (!this.dragState || !this.isEditMode) {
      return;
    }

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
  private clonePositions(positions: Record<SphereTab, SpherePosition>): Record<SphereTab, SpherePosition> {
    return {
      income: { ...positions.income },
      expense: { ...positions.expense },
      saving: { ...positions.saving },
      news: { ...positions.news }
    };
  }
}