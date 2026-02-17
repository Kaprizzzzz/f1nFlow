import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Додано для ngModel
import { BalanceService } from '../balance.service';

@Component({
  selector: 'app-income',
  standalone: true,
  imports: [CommonModule, FormsModule], // Обов'язково додаємо FormsModule сюди
  templateUrl: './income.component.html',
  styleUrl: './income.component.scss'
})
export class IncomeComponent {
  @Input() isFullView: boolean = false;
  @Output() onSelect = new EventEmitter<void>();

  // Властивості для шаблону
  isModalOpen = false;
  amount: number | null = null;

  constructor(private balanceService: BalanceService) {}

  addIncome(amount: number, category: string) {
    this.balanceService.addTransaction(amount, category, 'plus');
  }

  openCustomModal() {
    this.isModalOpen = true;
  }

  saveData() {
    if (this.amount && this.amount > 0) {
      this.balanceService.addTransaction(this.amount, 'Custom Income', 'plus');
      this.isModalOpen = false;
      this.amount = null;
    }
  }

  handleCircleClick() {
    this.onSelect.emit();
  }
}