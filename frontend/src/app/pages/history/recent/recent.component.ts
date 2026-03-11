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
  @Output() onSelect = new EventEmitter<void>();
  @Output() onRepeat = new EventEmitter<FrequentExpense>();

  handleCircleClick(): void {
    this.onSelect.emit();
  }

  repeat(item: FrequentExpense, event: Event): void {
    event.stopPropagation();
    this.onRepeat.emit(item);
  }
}