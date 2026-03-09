import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BalanceService, Transaction } from '../history/balance.service';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './goals.component.html',
  styleUrl: './goals.component.scss'
})
export class GoalsComponent implements OnInit, OnDestroy {
  periodStart = this.getDateOffset(30);
  periodEnd = this.toInputDate(new Date());
  deadline = this.toInputDate(new Date());

  periodSpent = 0;
  spentPerDay = 0;
  spentPerWeek = 0;
  spentPerMonth = 0;
  safeSpendPerDay = 0;

  private transactions: Transaction[] = [];
  private currentBalance = 0;
  private subscription = new Subscription();

  constructor(private readonly balanceService: BalanceService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.balanceService.transactions$.subscribe((transactions) => {
        this.transactions = transactions;
        this.recalculate();
      })
    );

    this.subscription.add(
      this.balanceService.balance$.subscribe((balance) => {
        this.currentBalance = balance;
        this.recalculate();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  recalculate(): void {
    const start = new Date(this.periodStart);
    const end = new Date(this.periodEnd);
    const msPerDay = 1000 * 60 * 60 * 24;

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
      this.periodSpent = 0;
      this.spentPerDay = 0;
      this.spentPerWeek = 0;
      this.spentPerMonth = 0;
      this.safeSpendPerDay = 0;
      return;
    }

    const daysInRange = Math.max(1, Math.floor((end.getTime() - start.getTime()) / msPerDay) + 1);

    this.periodSpent = this.transactions
      .filter((item) => item.type === 'minus' && item.date >= start && item.date <= end)
      .reduce((sum, item) => sum + item.amount, 0);

    this.spentPerDay = this.periodSpent / daysInRange;
    this.spentPerWeek = this.spentPerDay * 7;
    this.spentPerMonth = this.spentPerDay * 30;

    const deadlineDate = new Date(this.deadline);
    const daysToDeadline = Math.max(1, Math.ceil((deadlineDate.getTime() - Date.now()) / msPerDay));
    this.safeSpendPerDay = this.currentBalance > 0 ? this.currentBalance / daysToDeadline : 0;
  }

  private toInputDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private getDateOffset(daysBack: number): string {
    const date = new Date();
    date.setDate(date.getDate() - daysBack);
    return this.toInputDate(date);
  }
}