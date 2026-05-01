import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BalanceService, GoalsPreferences, Transaction } from '../history/balance.service';
import { I18nService } from '../../core/i18n.service';
import { GOALS_TRANSLATIONS, GoalsTranslationKey } from './goals.translations';


type ViewMode = 'amount' | 'segments';
type GoalsTheme = 'default' | 'girly';
type CategorySummary = { name: string; amount: number; segments: number };

const FX_CURRENCIES = ['EUR','USD','UAH','RUB','PLN','TRY','CAD','GBP','HRK'] as const;
type FxCurrency = typeof FX_CURRENCIES[number];

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
  monthlyAverageDaily = 0;
  todaySpent = 0;
  yesterdaySpent = 0;
  todayVsYesterdayPercent = 0;
  todayVsMonthlyAvgPercent = 0;
  todayVsSelectedAvgPercent = 0;
  spendingTrendLabel = '';
  smartInsights: string[] = [];
  streakCurrent = 0;
  streakBest = 0;
  badges: string[] = [];
  weeklyChallenge: { category: string; limit: number; spent: number; completed: boolean } | null = null;


  incomeSummary: CategorySummary[] = [];
  expenseSummary: CategorySummary[] = [];
  visualizationMode: ViewMode = 'amount';
  theme: GoalsTheme = 'default';
  isUiPickerOpen = false;
  fxBase: FxCurrency = 'USD';
  fxTarget: FxCurrency = 'UAH';
  fxHistory: number[] = [];
  fxRate = 0;
  converterAmount = 1;
  converterResult = 0;

  private transactions: Transaction[] = [];
  private currentBalance = 0;
  private subscription = new Subscription();

  constructor(
    private readonly balanceService: BalanceService,
    private readonly i18nService: I18nService
  ) {}

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

    void this.refreshFx();
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

  async onFxPairChange(): Promise<void> {
    await this.refreshFx();
  }

  recalculateConverter(): void {
    this.converterResult = this.converterAmount * this.fxRate;
  }

  get fxCurrencies(): readonly FxCurrency[] {
    return FX_CURRENCIES;
  }

  get fxSparkline(): string {
    if (this.fxHistory.length < 2) return '';
    const min = Math.min(...this.fxHistory);
    const max = Math.max(...this.fxHistory);
    const spread = max - min || 1;
    const stepX = 280 / (this.fxHistory.length - 1);
    return this.fxHistory.map((v, i) => `${(i * stepX).toFixed(2)},${(70 - ((v - min) / spread) * 60).toFixed(2)}`).join(' ');
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
    this.recalculateComparisons();
    this.buildInsights(daysToDeadline);
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

  get todayVsYesterdayDirection(): string {
    return this.todayVsYesterdayPercent <= 0 ? this.gt('directionLess') : this.gt('directionMore');
  }

  get todayVsMonthlyDirection(): string {
    return this.todayVsMonthlyAvgPercent <= 0 ? this.gt('directionLess') : this.gt('directionMore');
  }

  get todayVsPeriodDirection(): string {
    return this.todayVsSelectedAvgPercent <= 0 ? this.gt('directionLess') : this.gt('directionMore');
  }


  gt(key: GoalsTranslationKey): string {
    const language = this.i18nService.language;
    return GOALS_TRANSLATIONS[language]?.[key] ?? GOALS_TRANSLATIONS.en[key] ?? key;
  }


  get weeklyChallengeFlames(): Array<{ index: number; active: boolean }> {
    const activeCount = Math.max(0, Math.min(7, this.streakCurrent));
    return Array.from({ length: 7 }, (_, index) => ({ index, active: index < activeCount }));
  }

  getFlameGlow(index: number): string {
    const palette = [
      'drop-shadow(0 0 8px rgba(255, 206, 84, 0.75))',
      'drop-shadow(0 0 8px rgba(255, 158, 66, 0.78))',
      'drop-shadow(0 0 8px rgba(255, 112, 66, 0.8))',
      'drop-shadow(0 0 8px rgba(255, 95, 109, 0.8))',
      'drop-shadow(0 0 8px rgba(203, 93, 255, 0.8))',
      'drop-shadow(0 0 8px rgba(110, 185, 255, 0.8))',
      'drop-shadow(0 0 8px rgba(102, 255, 191, 0.8))'
    ];
    return palette[Math.min(index, palette.length - 1)];
  }

  get streakFlames(): number[] {
    const count = Math.max(1, Math.min(30, this.streakCurrent || 1));
    return Array.from({ length: count }, (_, index) => index);
  }

  private persistGoalsPreferences(): void {
    this.balanceService.setGoalsPreferences({
      theme: this.theme,
      visualizationMode: this.visualizationMode,
      periodStart: this.periodStart,
      periodEnd: this.periodEnd,
      deadline: this.deadline,
      fxBase: this.fxBase,
      fxTarget: this.fxTarget
    });
  }

  private applyGoalsPreferences(preferences: GoalsPreferences): void {
    this.theme = preferences.theme;
    this.visualizationMode = preferences.visualizationMode;
    this.periodStart = preferences.periodStart ?? this.periodStart;
    this.periodEnd = preferences.periodEnd ?? this.periodEnd;
    this.deadline = preferences.deadline ?? this.deadline;
    if (typeof preferences.fxBase === 'string' && FX_CURRENCIES.includes(preferences.fxBase as FxCurrency)) {
      this.fxBase = preferences.fxBase as FxCurrency;
    }
    if (typeof preferences.fxTarget === 'string' && FX_CURRENCIES.includes(preferences.fxTarget as FxCurrency)) {
      this.fxTarget = preferences.fxTarget as FxCurrency;
    }
    this.recalculate();
    void this.refreshFx();
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

  private async refreshFx(): Promise<void> {
    if (this.fxBase === this.fxTarget) {
      this.fxRate = 1;
      this.fxHistory = this.buildFlatHistory(1);
      this.recalculateConverter();
      return;
    }

    try {
      const [frankfurterRate, fallbackRate] = await Promise.all([
        this.fetchFrankfurterRate(),
        this.fetchOpenExchangeRate()
      ]);
      this.fxRate = frankfurterRate > 0 ? frankfurterRate : fallbackRate;
      this.recalculateConverter();

      const history = await this.fetchFrankfurterHistory();
      this.fxHistory = history.length > 1 ? history : this.buildFlatHistory(this.fxRate);
    } catch {
      this.fxRate = 1;
      this.fxHistory = this.buildFlatHistory(1);
      this.recalculateConverter();
    }
  }

  private async fetchFrankfurterRate(): Promise<number> {
    try {
      const response = await fetch(`https://api.frankfurter.app/latest?from=${this.fxBase}&to=${this.fxTarget}`);
      if (!response.ok) {
        return 0;
      }
      const payload = await response.json() as { rates?: Record<string, number> };
      const rate = payload.rates?.[this.fxTarget] ?? 0;
      return Number.isFinite(rate) && rate > 0 ? rate : 0;
    } catch {
      return 0;
    }
  }

  private async fetchOpenExchangeRate(): Promise<number> {
    try {
      const response = await fetch(`https://open.er-api.com/v6/latest/${this.fxBase}`);
      if (!response.ok) {
        return 0;
      }
      const payload = await response.json() as { rates?: Record<string, number> };
      const rate = payload.rates?.[this.fxTarget] ?? 0;
      return Number.isFinite(rate) && rate > 0 ? rate : 0;
    } catch {
      return 0;
    }
  }

  private async fetchFrankfurterHistory(): Promise<number[]> {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 14);
    const format = (d: Date) => d.toISOString().slice(0, 10);
    const response = await fetch(`https://api.frankfurter.app/${format(start)}..${format(end)}?from=${this.fxBase}&to=${this.fxTarget}`);
    const payload = await response.json() as { rates?: Record<string, Record<string, number>> };

    return Object.keys(payload.rates ?? {})
      .sort()
      .map((key) => payload.rates?.[key]?.[this.fxTarget] ?? 0)
      .filter((value) => Number.isFinite(value) && value > 0);
  }

  private buildFlatHistory(rate: number): number[] {
    if (!(rate > 0)) {
      return [];
    }

    return Array.from({ length: 15 }, () => rate);
  }

  private recalculateComparisons(): void {
    const today = this.startOfDay(new Date());
    const yesterday = this.addDays(today, -1);
    this.todaySpent = this.sumExpenseByDate(today);
    this.yesterdaySpent = this.sumExpenseByDate(yesterday);
    this.todayVsYesterdayPercent = this.getPercentDiff(this.todaySpent, this.yesterdaySpent);

    const monthStart = this.startOfMonth(today);
    const monthEnd = this.addDays(monthStart, 32);
    monthEnd.setDate(0);
    const monthExpenses = this.transactions.filter(
      (item) => item.type === 'minus' && item.date >= monthStart && item.date <= this.endOfDay(monthEnd)
    );
    const daysInMonth = monthEnd.getDate();
    const monthSpent = monthExpenses.reduce((sum, item) => sum + item.amount, 0);
    this.monthlyAverageDaily = daysInMonth > 0 ? monthSpent / daysInMonth : 0;

    this.todayVsMonthlyAvgPercent = this.getPercentDiff(this.todaySpent, this.monthlyAverageDaily);
    this.todayVsSelectedAvgPercent = this.getPercentDiff(this.todaySpent, this.spentPerDay);

    if (this.todaySpent === 0 && this.yesterdaySpent === 0) {
      this.spendingTrendLabel = this.gt('trendNoSpend');
    } else if (this.todayVsYesterdayPercent <= -10) {
      this.spendingTrendLabel = this.gt('trendStrongImprovement');
    } else if (this.todayVsYesterdayPercent < 0) {
      this.spendingTrendLabel = this.gt('trendCareful');
    } else if (this.todayVsYesterdayPercent <= 10) {
      this.spendingTrendLabel = this.gt('trendStable');
    } else {
      this.spendingTrendLabel = this.gt('trendGrowing');
    }
  }

  private buildInsights(daysToDeadline: number): void {
    const insights: string[] = [];
    const t = (ua: string, en: string) => (this.i18nService.language === "uk" ? ua : en);
    if (this.safeSpendPerDay > 0) {
      insights.push(t(`Щоб вкластися до дедлайну, ціль ≈ ${this.safeSpendPerDay.toFixed(2)} / день.`, `To stay on track until the deadline, target ≈ ${this.safeSpendPerDay.toFixed(2)} / day.`));
    }
    insights.push(t(`Сьогодні: ${this.todaySpent.toFixed(2)} (${Math.abs(this.todayVsYesterdayPercent).toFixed(1)}% ${this.todayVsYesterdayDirection} проти вчора).`, `Today: ${this.todaySpent.toFixed(2)} (${Math.abs(this.todayVsYesterdayPercent).toFixed(1)}% ${this.todayVsYesterdayDirection} vs yesterday).`));
    insights.push(t(`Порівняно з середнім за місяць: ${Math.abs(this.todayVsMonthlyAvgPercent).toFixed(1)}% ${this.todayVsMonthlyDirection}.`, `Compared to monthly average: ${Math.abs(this.todayVsMonthlyAvgPercent).toFixed(1)}% ${this.todayVsMonthlyDirection}.`));
    if (this.spentPerDay > 0) {
      insights.push(t(`Порівняно з середнім за вибраний період: ${Math.abs(this.todayVsSelectedAvgPercent).toFixed(1)}% ${this.todayVsPeriodDirection}.`, `Compared to selected period average: ${Math.abs(this.todayVsSelectedAvgPercent).toFixed(1)}% ${this.todayVsPeriodDirection}.`));
    }
    if (this.safeSpendPerDay > 0 && this.todaySpent > this.safeSpendPerDay * 1.1) {
      insights.push(t(`Ризик перевитрат: сьогоднішні витрати вищі за безпечний ліміт на ${((this.todaySpent / this.safeSpendPerDay - 1) * 100).toFixed(1)}%.`, `Overspending risk: today's spending is above the safe limit by ${((this.todaySpent / this.safeSpendPerDay - 1) * 100).toFixed(1)}%.`));
    }
    if (this.safeSpendPerDay > 0 && this.todaySpent <= this.safeSpendPerDay * 0.9) {
      insights.push(t(`Клас! Ти економиш: витрати щонайменше на 10% нижчі за безпечний ліміт.`, `Great! You're saving: spending is at least 10% below the safe limit.`));
    }
    if (daysToDeadline <= 3) {
      insights.push(t('Дедлайн близько: залиш тільки найнеобхідніші витрати.', 'The deadline is close: keep only essential spending.'));
    }
    this.smartInsights = insights;
  }

  private sumExpenseByDate(date: Date): number {
    const start = this.startOfDay(date);
    const end = this.endOfDay(date);
    return this.transactions
      .filter((item) => item.type === 'minus' && item.date >= start && item.date <= end)
      .reduce((sum, item) => sum + item.amount, 0);
  }

  private getPercentDiff(current: number, baseline: number): number {
    if (baseline <= 0) {
      return current > 0 ? 100 : 0;
    }
    return ((current - baseline) / baseline) * 100;
  }

  private startOfDay(date: Date): Date {
    const next = new Date(date);
    next.setHours(0, 0, 0, 0);
    return next;
  }

  private endOfDay(date: Date): Date {
    const next = new Date(date);
    next.setHours(23, 59, 59, 999);
    return next;
  }

  private addDays(date: Date, days: number): Date {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
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
