import { ElementRef, Injectable, QueryList } from '@angular/core';
import { SphereLayout, SphereTab } from '../history/models/finance.models';

export type SpherePosition = { left: number; top: number };
export type SphereSize = { width: number; height: number };

export type DragState = {
  tab: SphereTab;
  pointerId: number;
  pointerOffsetX: number;
  pointerOffsetY: number;
  sphereWidth: number;
  sphereHeight: number;
};

export const DEFAULT_SPHERE_POSITIONS: SphereLayout = {
  income: { top: 196, left: 148 },
  expense: { top: 88, left: 28 },
  saving: { top: 187, left: 252 },
  news: { top: 296, left: 18 },
  recent: { top: 298, left: 256 }
};

const SPHERE_TOP_GAP = 0;
const ROUTING_PANEL_BOTTOM_OFFSET = 0;
const MOBILE_SPHERE_TOP_OVERSHOOT = 500;
const MOBILE_LAYOUT_BREAKPOINT = 560;

@Injectable({ providedIn: 'root' })
export class SphereLayoutService {
  clonePositions(positions: Record<SphereTab, SpherePosition>): Record<SphereTab, SpherePosition> {
    return {
      income: { ...positions['income'] },
      expense: { ...positions['expense'] },
      saving: { ...positions['saving'] },
      news: { ...positions['news'] },
      recent: { ...positions['recent'] }
    };
  }

  createFallbackSphereSizes(): Record<SphereTab, SphereSize> {
    return {
      income: { width: 165, height: 165 },
      expense: { width: 135, height: 135 },
      saving: { width: 108, height: 108 },
      news: { width: 116, height: 116 },
      recent: { width: 114, height: 114 }
    };
  }

  measureSphereSizes(
    sphereRefs: QueryList<ElementRef<HTMLElement>> | undefined,
    sphereSizes: Record<SphereTab, SphereSize>
  ): Record<SphereTab, SphereSize> {
    const nextSizes = { ...sphereSizes };

    sphereRefs?.forEach((sphereRef) => {
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

      nextSizes[tab] = { width, height };
    });

    return nextSizes;
  }

  startDrag(event: PointerEvent, tab: SphereTab, layout: HTMLElement): DragState {
    const sphere = event.currentTarget as HTMLElement;
    const sphereRect = sphere.getBoundingClientRect();

    sphere.setPointerCapture(event.pointerId);

    return {
      tab,
      pointerId: event.pointerId,
      pointerOffsetX: event.clientX - sphereRect.left,
      pointerOffsetY: event.clientY - sphereRect.top,
      sphereWidth: sphereRect.width || layout.clientWidth,
      sphereHeight: sphereRect.height || layout.clientHeight
    };
  }

  calculateDragPosition(event: PointerEvent, dragState: DragState, layout: HTMLElement): SpherePosition {
    const layoutRect = layout.getBoundingClientRect();
    const nextLeft = event.clientX - layoutRect.left - dragState.pointerOffsetX;
    const nextTop = event.clientY - layoutRect.top - dragState.pointerOffsetY;

    const bounds = this.getSphereBounds(layout, {
      width: dragState.sphereWidth,
      height: dragState.sphereHeight
    });

    return {
      left: this.clamp(nextLeft, 0, bounds.maxLeft),
      top: this.clamp(nextTop, this.getSphereTopLimit(), bounds.maxTop)
    };
  }

  getSphereStyle(
    tab: SphereTab,
    positions: Record<SphereTab, SpherePosition>,
    layout: HTMLElement | undefined,
    sphereSizes: Record<SphereTab, SphereSize>
  ): Record<string, string> {
    const { top, left } = positions[tab];

    if (!layout) {
      return {
        top: `${Math.max(this.getSphereTopLimit(), top)}px`,
        left: `${Math.max(0, left)}px`
      };
    }

    const { maxLeft, maxTop } = this.getSphereBounds(layout, this.getSphereSize(tab, sphereSizes));

    return {
      top: `${this.clamp(top, this.getSphereTopLimit(), maxTop)}px`,
      left: `${this.clamp(left, 0, maxLeft)}px`
    };
  }

  clampAllSpherePositions(
    positions: Record<SphereTab, SpherePosition>,
    layout: HTMLElement | undefined,
    sphereSizes: Record<SphereTab, SphereSize>
  ): Record<SphereTab, SpherePosition> {
    if (!layout) {
      return this.clonePositions(positions);
    }

    return {
      income: this.clampSpherePosition('income', positions['income'], layout, sphereSizes),
      expense: this.clampSpherePosition('expense', positions['expense'], layout, sphereSizes),
      saving: this.clampSpherePosition('saving', positions['saving'], layout, sphereSizes),
      news: this.clampSpherePosition('news', positions['news'], layout, sphereSizes),
      recent: this.clampSpherePosition('recent', positions['recent'], layout, sphereSizes)
    };
  }

  getOrderedSphereCoordinates(
    positions: Record<SphereTab, SpherePosition>,
    dragState: DragState | null
  ): Array<{ tab: SphereTab; top: number; left: number; isDragging: boolean }> {
    const tabs: SphereTab[] = ['income', 'expense', 'saving', 'news', 'recent'];
    return tabs.map((tab) => ({
      tab,
      top: Math.round(positions[tab].top),
      left: Math.round(positions[tab].left),
      isDragging: dragState?.tab === tab
    }));
  }

  private clampSpherePosition(
    tab: SphereTab,
    position: SpherePosition,
    layout: HTMLElement,
    sphereSizes: Record<SphereTab, SphereSize>
  ): SpherePosition {
    const { maxLeft, maxTop } = this.getSphereBounds(layout, this.getSphereSize(tab, sphereSizes));

    return {
      left: this.clamp(position.left, 0, maxLeft),
      top: this.clamp(position.top, this.getSphereTopLimit(), maxTop)
    };
  }

  private getSphereSize(tab: SphereTab, sphereSizes: Record<SphereTab, SphereSize>): SphereSize {
    return sphereSizes[tab] ?? this.createFallbackSphereSizes()[tab];
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
      maxTop: Math.max(this.getSphereTopLimit(), layout.clientHeight - size.height - ROUTING_PANEL_BOTTOM_OFFSET)
    };
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}
