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

  totalSpent = 0;
  isModalOpen = false;
  amount: number | null = null;
  selectedCategory: string = '';

  constructor(private balanceService: BalanceService) {}

  ngOnInit() {
    this.balanceService.transactions$.pipe(
      map(txs => txs.filter(t => t.type === 'minus').reduce((acc, t) => acc + t.amount, 0))
    ).subscribe(sum => this.totalSpent = sum);
  }

  selectCategory(cat: string, event: Event) {
    event.stopPropagation();
    this.selectedCategory = cat;
    this.isModalOpen = true;
  }

  saveData() {
    if (this.amount && this.amount > 0) {
      this.balanceService.addTransaction(this.amount, this.selectedCategory, 'minus');
      this.isModalOpen = false;
      this.amount = null;
    }
  }

  handleCircleClick() { this.onSelect.emit(); }
}