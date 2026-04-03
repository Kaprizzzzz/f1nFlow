import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BalanceService, GoalsPreferences, Transaction } from '../history/balance.service';


type ViewMode = 'amount' | 'segments';
type GoalsTheme = 'default' | 'girly';
type CategorySummary = { name: string; amount: number; segments: number };

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './goals.component.html',
  styleUrl: './goals.component.scss'
})
export class GoalsComponent implements OnInit, OnDestroy {
  periodStart = this.toInputDate(this.startOfMonth(new Date()));
  periodEnd = this.toInputDate(new Date());
  deadline = this.toInputDate(new Date());

  periodSpent = 0;
  spentPerDay = 0;
  spentPerWeek = 0;
  spentPerMonth = 0;
  safeSpendPerDay = 0;
  streakCurrent = 0;
  streakBest = 0;
  badges: string[] = [];
  weeklyChallenge: { category: string; limit: number; spent: number; completed: boolean } | null = null;


  incomeSummary: CategorySummary[] = [];
  expenseSummary: CategorySummary[] = [];
  visualizationMode: ViewMode = 'amount';
  theme: GoalsTheme = 'default';
  isUiPickerOpen = false;

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

    this.subscription.add(
      this.balanceService.goalsPreferences$.subscribe((preferences) => {
        this.applyGoalsPreferences(preferences);
      })
    );

    this.subscription.add(
      this.balanceService.streakCurrent$.subscribe((streak) => {
        this.streakCurrent = streak;
      })
    );

    this.subscription.add(
      this.balanceService.streakBest$.subscribe((streak) => {
        this.streakBest = streak;
      })
    );

    this.subscription.add(
      this.balanceService.badges$.subscribe((badges) => {
        this.badges = badges;
      })
    );

    this.subscription.add(
      this.balanceService.weeklyChallenge$.subscribe((challenge) => {
        this.weeklyChallenge = challenge;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onPeriodChange(): void {
    this.recalculate();
    this.persistGoalsPreferences();
  }

  onDeadlineChange(): void {
    this.recalculate();
    this.persistGoalsPreferences();
  }

  setVisualizationMode(mode: ViewMode): void {
    this.visualizationMode = mode;
    this.persistGoalsPreferences();
  }

  setTheme(theme: GoalsTheme): void {
    this.theme = theme;
    this.persistGoalsPreferences();
  }

  toggleUiPicker(event: Event): void {
    event.stopPropagation();
    this.isUiPickerOpen = !this.isUiPickerOpen;
  }

  closeUiPicker(): void {
    this.isUiPickerOpen = false;
  }

  recalculate(): void {
    const start = this.parseInputDate(this.periodStart);
    const end = this.parseInputDate(this.periodEnd);
    const msPerDay = 1000 * 60 * 60 * 24;

    if (!start || !end || end < start) {
      this.periodSpent = 0;
      this.spentPerDay = 0;
      this.spentPerWeek = 0;
      this.spentPerMonth = 0;
      this.safeSpendPerDay = 0;
      this.incomeSummary = [];
      this.expenseSummary = [];
      return;
    }

    const endInclusive = new Date(end);
    endInclusive.setHours(23, 59, 59, 999);

    const daysInRange = Math.max(1, Math.floor((endInclusive.getTime() - start.getTime()) / msPerDay) + 1);

    const periodTransactions = this.transactions.filter((item) => item.date >= start && item.date <= endInclusive);

    this.periodSpent = periodTransactions
      .filter((item) => item.type === 'minus')
      .reduce((sum, item) => sum + item.amount, 0);

    this.spentPerDay = this.periodSpent / daysInRange;
    this.spentPerWeek = this.spentPerDay * 7;
    this.spentPerMonth = this.spentPerDay * 30;

    this.incomeSummary = this.buildSummary(periodTransactions, 'plus');
    this.expenseSummary = this.buildSummary(periodTransactions, 'minus');

    const deadlineDate = this.parseInputDate(this.deadline);
    const daysToDeadline = deadlineDate
      ? Math.max(1, Math.ceil((deadlineDate.getTime() - Date.now()) / msPerDay))
      : 1;
    this.safeSpendPerDay = this.currentBalance > 0 ? this.currentBalance / daysToDeadline : 0;
  }

   trackByCategory(_: number, item: CategorySummary): string {
    return item.name;
  }

  getSegmentsArray(count: number): number[] {
    return Array.from({ length: Math.max(0, count) }, (_, index) => index);
  }

  get todayDate(): string {
    return this.toInputDate(new Date());
  }

  private persistGoalsPreferences(): void {
    this.balanceService.setGoalsPreferences({
      theme: this.theme,
      visualizationMode: this.visualizationMode,
      periodStart: this.periodStart,
      periodEnd: this.periodEnd,
      deadline: this.deadline
    });
  }

  private applyGoalsPreferences(preferences: GoalsPreferences): void {
    this.theme = preferences.theme;
    this.visualizationMode = preferences.visualizationMode;
     this.periodStart = preferences.periodStart ?? this.periodStart;
    this.periodEnd = preferences.periodEnd ?? this.periodEnd;
    this.deadline = preferences.deadline ?? this.deadline;
    this.recalculate();
  }

  private buildSummary(periodTransactions: Transaction[], type: 'plus' | 'minus'): CategorySummary[] {
    const grouped = new Map<string, number>();

    for (const tx of periodTransactions) {
      if (tx.type !== type) {
        continue;
      }
      grouped.set(tx.category, (grouped.get(tx.category) ?? 0) + tx.amount);
    }

    const summary = Array.from(grouped.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);

    const total = summary.reduce((acc, item) => acc + item.amount, 0);
    if (total <= 0 || summary.length === 0) {
      return [];
    }

    const withSegments = summary.map((item) => ({
      ...item,
      segments: Math.round((item.amount / total) * 10)
    }));

    const used = withSegments.reduce((acc, item) => acc + item.segments, 0);
    const diff = 10 - used;

    if (diff !== 0) {
      withSegments[0].segments = Math.max(1, withSegments[0].segments + diff);
    }

    return withSegments;
  }

  private parseInputDate(value: string): Date | null {
    const [year, month, day] = value.split('-').map((part) => Number(part));
    if (!year || !month || !day) {
      return null;
    }

    return new Date(year, month - 1, day);
  }

  private toInputDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }
}