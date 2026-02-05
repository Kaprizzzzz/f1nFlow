import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Обов'язково для ngModel

@Component({
  selector: 'app-income',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './income.component.html', // Переконайся, що назва збігається
  styleUrls: ['./income.component.scss']
})
export class IncomeComponent {
  @Input() isFullView: boolean = false;
  @Output() onSelect = new EventEmitter<void>();

  // Змінні, яких не вистачало для HTML
  isModalOpen: boolean = false;
  amount: number | null = null; 

  // Метод для кліку по великій сфері
  handleCircleClick() {
    this.onSelect.emit();
  }

  // Метод для відкриття модалки (💰)
  openAddMoney() {
    this.isModalOpen = true;
  }

  // Метод для закриття
  closeModal() {
    this.isModalOpen = false;
    this.amount = null;
  }

  // Метод для кнопки Save
  saveData() {
    console.log('Saving amount:', this.amount);
    // Тут пізніше додамо запит до бекенду
    this.closeModal();
  }
}