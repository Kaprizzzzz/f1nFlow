import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BalanceService, Transaction } from '../balance.service';

@Component({
  selector: 'app-saving',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './saving.component.html',
  styleUrl: './saving.component.scss'
})
export class SavingComponent implements OnInit {
  @Input() isFullView: boolean = false;
  @Output() onSelect = new EventEmitter<void>();

  totalBalance = 0;
  history: Transaction[] = [];
  isModalOpen = false;
  amount: number | null = null;

  constructor(private balanceService: BalanceService) {}

  ngOnInit() {
    this.balanceService.balance$.subscribe(val => this.totalBalance = val);
    this.balanceService.transactions$.subscribe(list => this.history = list);
  }

  handleCircleClick() { this.onSelect.emit(); }

  openAddModal(event: Event) {
    event.stopPropagation();
    this.isModalOpen = true;
  }

  saveManual(type: 'plus' | 'minus') {
    if (this.amount) {
      this.balanceService.addTransaction(this.amount, 'Manual Adj', type);
      this.isModalOpen = false;
      this.amount = null;
    }
  }
}