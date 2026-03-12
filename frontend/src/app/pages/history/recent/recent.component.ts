import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface FrequentExpense {
  category: string;
  totalAmount: number;
  repeatAmount: number;
  repeatCount: number;
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
  @Input() items: FrequentExpense[] = [];
  @Input() quickLimit = 5;
  @Output() onSelect = new EventEmitter<void>();
  @Output() onRepeat = new EventEmitter<FrequentExpense>();
  @Output() quickLimitChange = new EventEmitter<number>();

  handleCircleClick(): void {
    this.onSelect.emit();
  }

  repeat(item: FrequentExpense, event: Event): void {
    event.stopPropagation();
    this.onRepeat.emit(item);
  }
setQuickLimit(value: number, event: Event): void {
    event.stopPropagation();
    this.quickLimitChange.emit(value);
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