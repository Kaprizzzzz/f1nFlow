import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface RecentTransactionBubble {
  category: string;
  amount: number;
}

export interface RecentCategoryGroup {
  category: string;
  totalAmount: number;
  repeatCount: number;
  latestTransactions: number[];
}

@Component({
  selector: 'app-recent',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recent.component.html',
  styleUrl: './recent.component.scss'
})
export class RecentComponent {
  @Input() isFullView = false;
  @Input() items: RecentCategoryGroup[] = [];
  @Input() quickLimit = 3;
  @Output() onSelect = new EventEmitter<void>();
  @Output() onClose = new EventEmitter<void>();
  @Output() onRepeat = new EventEmitter<RecentTransactionBubble>();
  @Output() quickLimitChange = new EventEmitter<number>();

  readonly quickLimitOptions = [3, 4, 5, 6, 7, 8, 9, 10];
  isQuickLimitMenuOpen = false;

  handleCircleClick(): void {
    this.onSelect.emit();
  }

  handleClose(event: Event): void {
    event.stopPropagation();
    this.onClose.emit();
  }

   repeat(category: string, amount: number, event: Event): void {
    event.stopPropagation();
    this.onRepeat.emit({ category, amount });
  }
   toggleQuickLimitMenu(event: Event): void {
    event.stopPropagation();
    this.isQuickLimitMenuOpen = !this.isQuickLimitMenuOpen;
  }

  setQuickLimit(value: number, event: Event): void {
    event.stopPropagation();
    this.quickLimitChange.emit(value);
    this.isQuickLimitMenuOpen = false;
  }

  @HostListener('document:click')
  closeQuickLimitMenu(): void {
    this.isQuickLimitMenuOpen = false;
  }

  get quickRingGradient(): string {
    const limit = Math.min(10, Math.max(3, this.quickLimit));
    const segment = 360 / limit;
    const gap = Math.min(2, segment * 0.2);
    const parts: string[] = [];

    for (let i = 0; i < limit; i += 1) {
      const start = i * segment;
      const end = (i + 1) * segment;
      parts.push(`rgba(255, 167, 223, 0.95) ${start}deg ${Math.max(start, end - gap)}deg`);
      parts.push(`rgba(112, 34, 76, 0.44) ${Math.max(start, end - gap)}deg ${end}deg`);
    }

    return `conic-gradient(${parts.join(', ')})`;
  }
}
