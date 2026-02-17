import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-expence',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './expence.component.html',
  styleUrls: ['./expence.component.scss']
})
export class ExpenceComponent {
  @Input() isFullView: boolean = false;
  @Output() onSelect = new EventEmitter<void>();

  isModalOpen: boolean = false;
  amount: number | null = null;
  totalSpent: number = 0; // Сума витрат для відображення

  handleCircleClick() {
    this.onSelect.emit();
  }

  openModal(event: Event) {
    event.stopPropagation();
    this.isModalOpen = true;
  }

  saveData() {
    if (this.amount) {
      this.totalSpent += this.amount;
      console.log('Expense saved:', this.amount);
      this.isModalOpen = false;
      this.amount = null;
    }
  }
}