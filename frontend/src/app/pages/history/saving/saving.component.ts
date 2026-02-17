import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Transaction {
  amount: number;
  type: 'plus' | 'minus';
  date: Date;
}

@Component({
  selector: 'app-saving',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './saving.component.html',
  styleUrl: './saving.component.scss'
})
export class SavingComponent {
  @Input() isFullView: boolean = false;
  @Output() onSelect = new EventEmitter<void>();

  isModalOpen = false;
  amount: number | null = null;
  
  // Історія операцій
  history: Transaction[] = [
    { amount: 1000, type: 'plus', date: new Date() },
    { amount: 500, type: 'minus', date: new Date() }
  ];

  handleCircleClick() { this.onSelect.emit(); }

  // Рахуємо різницю (може бути < 0)
  get totalBalance(): number {
    return this.history.reduce((acc, item) => 
      item.type === 'plus' ? acc + item.amount : acc - item.amount, 0
    );
  }

  addTransaction(type: 'plus' | 'minus') {
    if (this.amount && this.amount > 0) {
      this.history.unshift({
        amount: this.amount,
        type: type,
        date: new Date()
      });
      this.amount = null;
      this.isModalOpen = false;
    }
  }
}