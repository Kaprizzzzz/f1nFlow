import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ОБОВ'ЯЗКОВО ДЛЯ ngModel
import { BalanceService, Transaction } from '../balance.service';

@Component({
  selector: 'app-saving',
  standalone: true,
  imports: [CommonModule, FormsModule], // Додали FormsModule
  templateUrl: './saving.component.html',
  styleUrl: './saving.component.scss'
})
export class SavingComponent implements OnInit {
  @Input() isFullView: boolean = false;
  @Output() onSelect = new EventEmitter<void>();

  totalBalance = 0;
  history: Transaction[] = [];
  
  // Додаємо відсутні змінні для шаблону
  isModalOpen = false;
  amount: number | null = null;
  note: string = '';

  constructor(private balanceService: BalanceService) {}

  ngOnInit() {
    this.balanceService.balance$.subscribe(val => this.totalBalance = val);
    this.balanceService.transactions$.subscribe(list => this.history = list);
  }

  // Геттер для шаблону, який ти використовуєш
  get totalDiff(): number {
    return this.totalBalance;
  }

  handleCircleClick() {
    this.onSelect.emit();
  }

  addRecord(type: 'plus' | 'minus') {
    if (this.amount) {
      this.balanceService.addTransaction(this.amount, this.note || 'Saving', type);
      this.closeModal();
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.amount = null;
    this.note = '';
  }
}