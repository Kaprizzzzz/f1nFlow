import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BalanceService } from '../balance.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-expence',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './expence.component.html',
  styleUrl: './expence.component.scss'
})
export class ExpenceComponent implements OnInit {
  @Input() isFullView: boolean = false;
  @Output() onSelect = new EventEmitter<void>();

  isModalOpen = false;
  amount: number | null = null;
  
  // Додаємо цю змінну, яку шукає твій HTML
  totalSpent = 0;

  constructor(private balanceService: BalanceService) {}

  ngOnInit() {
    // Підписуємося на історію, щоб рахувати загальну суму витрат
    this.balanceService.transactions$.pipe(
      map(txs => txs.filter(t => t.type === 'minus')
                    .reduce((acc, t) => acc + t.amount, 0))
    ).subscribe(sum => {
      this.totalSpent = sum;
    });
  }

  addExpense(amount: number, category: string) {
    this.balanceService.addTransaction(amount, category, 'minus');
  }

  openModal(event: Event) {
    event.stopPropagation();
    this.isModalOpen = true;
  }

  saveData() {
    if (this.amount && this.amount > 0) {
      this.addExpense(this.amount, 'General Expense');
      this.isModalOpen = false;
      this.amount = null;
    }
  }

  handleCircleClick() {
    this.onSelect.emit();
  }
}