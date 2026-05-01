import { Injectable } from '@nestjs/common';
import { User, WeeklyChallenge } from '../entities/user.entity';

export type IncomingTransaction = {
  amount: number;
  category: string;
  type: 'plus' | 'minus';
  date: string | Date;
  label?: string;
};

@Injectable()
export class UserEngagementService {
  applyEngagementState(
    user: User,
    transactions: IncomingTransaction[],
    previousLastSeenAt: Date | null,
    now: Date
  ): void {
    const normalized = transactions
      .map((tx) => ({
        ...tx,
        amount: Number(tx.amount),
        date: new Date(tx.date)
      }))
      .filter((tx) => Number.isFinite(tx.amount) && !Number.isNaN(tx.date.getTime()))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const nextStreak = this.calculatePresenceStreak(previousLastSeenAt, now, user.streakCurrent ?? 0);
    user.streakCurrent = nextStreak;
    user.streakBest = Math.max(user.streakBest ?? 0, nextStreak);

    user.weeklyChallenge = this.buildWeeklyChallenge(normalized, user.weeklyChallenge ?? null);
    user.news = this.buildPersonalizedNews(user.news ?? [], normalized);
    user.badges = this.buildBadges(user, normalized);
  }

  private calculatePresenceStreak(previousLastSeenAt: Date | null, now: Date, currentStreak: number): number {
    if (!previousLastSeenAt) {
      return Math.max(1, currentStreak || 0);
    }

    const previousDay = this.toDayKey(previousLastSeenAt);
    const currentDay = this.toDayKey(now);
    const diff = this.dayDiff(previousDay, currentDay);

    if (diff <= 0) {
      return Math.max(1, currentStreak || 0);
    }

    if (diff === 1) {
      return Math.max(1, currentStreak || 0) + 1;
    }

    return 1;
  }

  private buildWeeklyChallenge(
    transactions: Array<IncomingTransaction & { date: Date }>,
    current: WeeklyChallenge | null
  ): WeeklyChallenge | null {
    const weekStart = this.getWeekStart(new Date());
    const weekStartKey = this.toDayKey(weekStart);

    if (current?.weekStart === weekStartKey) {
      const spent = transactions
        .filter((tx) => tx.type === 'minus' && tx.category === current.category && tx.date >= weekStart)
        .reduce((sum, tx) => sum + tx.amount, 0);

      return {
        ...current,
        spent: Number(spent.toFixed(2)),
        completed: spent <= current.limit
      };
    }

    const previousWeekStart = new Date(weekStart);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);

    const previousWeekEnd = new Date(weekStart);
    previousWeekEnd.setMilliseconds(-1);

    const grouped = new Map<string, number>();
    for (const tx of transactions) {
      if (tx.type !== 'minus' || tx.date < previousWeekStart || tx.date > previousWeekEnd) {
        continue;
      }
      grouped.set(tx.category, (grouped.get(tx.category) ?? 0) + tx.amount);
    }

    const top = Array.from(grouped.entries()).sort((a, b) => b[1] - a[1])[0];
    if (!top) {
      return null;
    }

    const [category, prevWeekSpent] = top;
    const limit = Number((prevWeekSpent * 0.9).toFixed(2));
    const currentSpent = transactions
      .filter((tx) => tx.type === 'minus' && tx.category === category && tx.date >= weekStart)
      .reduce((sum, tx) => sum + tx.amount, 0);

    return {
      category,
      limit,
      spent: Number(currentSpent.toFixed(2)),
      weekStart: weekStartKey,
      completed: currentSpent <= limit
    };
  }

  private buildPersonalizedNews(
    currentNews: Array<{ id: string; title: string; isRead: boolean }>,
    transactions: Array<IncomingTransaction & { date: Date }>
  ): Array<{ id: string; title: string; isRead: boolean }> {
    const weekStart = this.getWeekStart(new Date());
    const previousWeekStart = new Date(weekStart);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);
    const previousWeekEnd = new Date(weekStart);
    previousWeekEnd.setMilliseconds(-1);

    const currentWeekExpense = transactions
      .filter((tx) => tx.type === 'minus' && tx.date >= weekStart)
      .reduce((sum, tx) => sum + tx.amount, 0);

    const previousWeekExpense = transactions
      .filter((tx) => tx.type === 'minus' && tx.date >= previousWeekStart && tx.date <= previousWeekEnd)
      .reduce((sum, tx) => sum + tx.amount, 0);

    if (previousWeekExpense <= 0) {
      return currentNews;
    }

    const deltaPercent = ((currentWeekExpense - previousWeekExpense) / previousWeekExpense) * 100;
    const absDelta = Math.round(Math.abs(deltaPercent));
    const trend = deltaPercent <= 0 ? 'менше' : 'більше';
    const insightId = `weekly-insight-${this.toDayKey(weekStart)}`;

    const withoutOldInsight = currentNews.filter((item) => item.id !== insightId);
    const insight = {
      id: insightId,
      title: `Персональний інсайт: ти витратив на ${absDelta}% ${trend}, ніж минулого тижня.`,
      isRead: false
    };

    return [insight, ...withoutOldInsight].slice(0, 20);
  }

  private buildBadges(user: User, transactions: IncomingTransaction[]): string[] {
    const badges = new Set<string>(user.badges ?? []);

    if (transactions.length > 0) {
      badges.add('first-goal');
    }
    if ((user.streakBest ?? 0) >= 5) {
      badges.add('streak-bronze');
    }
    if ((user.streakBest ?? 0) >= 14) {
      badges.add('streak-silver');
    }
    if ((user.streakBest ?? 0) >= 30) {
      badges.add('streak-gold');
    }
    if (user.weeklyChallenge?.completed) {
      badges.add('challenge-winner');
    }

    return Array.from(badges);
  }

  private getWeekStart(date: Date): Date {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    const day = copy.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    copy.setDate(copy.getDate() + diff);
    return copy;
  }

  private toDayKey(date: Date): string {
    const shifted = new Date(date.getTime() - 2 * 60 * 60 * 1000);
    const yyyy = shifted.getUTCFullYear();
    const mm = String(shifted.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(shifted.getUTCDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  private dayDiff(fromKey: string, toKey: string): number {
    const from = new Date(fromKey);
    const to = new Date(toKey);
    return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  }
}
