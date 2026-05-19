import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WeeklyChallenge } from '../models/finance.models';
import { NewsItem } from '../models/history-shared.models';
import { roundToCents } from '../utils/normalization.utils';

@Injectable({ providedIn: 'root' })
export class EngagementService {

  private readonly streakVisitKey = 'f1nflow.streak.lastVisitDate';
  private readonly newsSubject = new BehaviorSubject<NewsItem[]>(
    this.defaultNews(),
  );
  private readonly streakCurrentSubject = new BehaviorSubject<number>(0);
  private readonly streakBestSubject = new BehaviorSubject<number>(0);
  private readonly badgesSubject = new BehaviorSubject<string[]>(
    this.defaultBadges(0),
  );
  private readonly weeklyChallengeSubject =
    new BehaviorSubject<WeeklyChallenge | null>(this.defaultWeeklyChallenge());

  news$ = this.newsSubject.asObservable();
  streakCurrent$ = this.streakCurrentSubject.asObservable();
  streakBest$ = this.streakBestSubject.asObservable();
  badges$ = this.badgesSubject.asObservable();
  weeklyChallenge$ = this.weeklyChallengeSubject.asObservable();

  get news(): NewsItem[] {
    return this.newsSubject.value;
  }

  get streakCurrent(): number {
    return this.streakCurrentSubject.value;
  }

  get streakBest(): number {
    return this.streakBestSubject.value;
  }

  get badges(): string[] {
    return this.badgesSubject.value;
  }

  get weeklyChallenge(): WeeklyChallenge | null {
    return this.weeklyChallengeSubject.value;
  }

  convertWeeklyChallenge(rate: number, currency: string): void {
    if (!Number.isFinite(rate) || rate <= 0) {
      return;
    }

    const current = this.weeklyChallengeSubject.value;
    if (!current) {
      return;
    }

    this.weeklyChallengeSubject.next({
      ...current,
      limit: roundToCents(current.limit * rate),
      spent: roundToCents(current.spent * rate),
      currency,
    });
  }

  markAllNewsRead(): void {
    this.newsSubject.next(
      this.newsSubject.value.map((item) => ({ ...item, isRead: true })),
    );
  }

  hydrate(payload: {
    news?: NewsItem[];
    streakCurrent?: number;
    streakBest?: number;
    badges?: string[];
    weeklyChallenge?: WeeklyChallenge | null;
    currency?: string;
  }): void {
    this.newsSubject.next(this.normalizeNews(payload.news));
    const streakState = this.resolveStreakOnVisit(
      this.normalizeStreakValue(payload.streakCurrent),
      this.normalizeStreakValue(payload.streakBest),
    );
    this.streakCurrentSubject.next(streakState.current);
    this.streakBestSubject.next(streakState.best);
    const streak = streakState.current;
    this.badgesSubject.next(this.normalizeBadges(payload.badges, streak));
    this.weeklyChallengeSubject.next(
      this.normalizeWeeklyChallenge(payload.weeklyChallenge, payload.currency),
    );
  }


  private resolveStreakOnVisit(current: number, best: number): { current: number; best: number } {
    if (typeof localStorage === 'undefined') {
      return { current, best };
    }

    const today = new Date().toISOString().slice(0, 10);
    const lastVisit = localStorage.getItem(this.streakVisitKey);

    if (!lastVisit) {
      const initialized = Math.max(1, current);
      localStorage.setItem(this.streakVisitKey, today);
      return { current: initialized, best: Math.max(best, initialized) };
    }

    if (lastVisit === today) {
      return { current: Math.max(1, current), best: Math.max(best, current) };
    }

    const last = new Date(`${lastVisit}T00:00:00`);
    const now = new Date(`${today}T00:00:00`);
    const diffDays = Math.round((now.getTime() - last.getTime()) / 86400000);
    const nextCurrent = diffDays === 1 ? Math.max(1, current + 1) : 1;
    const nextBest = Math.max(best, nextCurrent);

    localStorage.setItem(this.streakVisitKey, today);
    return { current: nextCurrent, best: nextBest };
  }

  private normalizeNews(news?: NewsItem[]): NewsItem[] {
    if (!news || news.length === 0) {
      return this.defaultNews();
    }

    return news.map((item, index) => ({
      id: item.id || String(index + 1),
      title: item.title || 'News',
      isRead: !!item.isRead,
    }));
  }

  private normalizeStreakValue(value?: number | null): number {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric < 0) {
      return 0;
    }
    return Math.round(numeric);
  }

  private normalizeBadges(badges?: string[] | null, streakDays = 0): string[] {
    if (!badges || badges.length === 0) {
      return this.defaultBadges(streakDays);
    }
    return Array.from(new Set(badges.filter((item) => !!item)));
  }

  private defaultNews(): NewsItem[] {
    return [
      {
        id: '1',
        title: 'PR: Ввімкнено режим цілей та стабільні підказки для Goals.',
        isRead: false,
      },
      {
        id: '2',
        title: 'PR: Додано валютний тренд з автооновленням для конвертера.',
        isRead: false,
      },
      {
        id: '3',
        title: 'PR: Оновлено блок Recent, щоб швидше повторювати витрати.',
        isRead: false,
      },
      {
        id: '4',
        title: 'PR: Покращено тижневий challenge з лімітом за категоріями.',
        isRead: false,
      },
      {
        id: '5',
        title: 'PR: Додано стрік-вогники для щоденної мотивації.',
        isRead: false,
      },
      {
        id: '6',
        title: 'PR: Посилили стабільність синхронізації Telegram-профілю.',
        isRead: false,
      },
      {
        id: '7',
        title: 'PR: Підсвітили ключові метрики дня/тижня/місяця у Goals.',
        isRead: false,
      },
      {
        id: '8',
        title: 'PR: Оновлено візуал бейджів та прогресу.',
        isRead: false,
      },
      {
        id: '9',
        title: 'PR: Додано кращі порівняння з учора та середнім по періоду.',
        isRead: false,
      },
      {
        id: '10',
        title: 'PR: Поліпшено UX першого входу та мовні підказки.',
        isRead: false,
      },
    ];
  }

  private defaultBadges(streakDays: number): string[] {
    const badges: string[] = [];
    if (streakDays >= 7) badges.push('🔥 7 days • yellow');
    if (streakDays >= 21) badges.push('🔥 21 days • red');
    if (streakDays >= 61) badges.push('🔥 61 days • green');
    if (streakDays >= 101) badges.push('🔥 101 days • blue');
    if (streakDays >= 151) badges.push('🔥 151 days • violet');
    return badges;
  }

  private defaultWeeklyChallenge(): WeeklyChallenge {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    return {
      category: 'Food',
      limit: 120,
      spent: 0,
      weekStart: weekStart.toISOString().slice(0, 10),
      completed: true,
      currency: 'EUR',
    };
  }

  private normalizeWeeklyChallenge(
    challenge?: WeeklyChallenge | null,
    currency = 'EUR',
  ): WeeklyChallenge | null {
    if (!challenge || !challenge.category || !challenge.weekStart) {
      return null;
    }

    return {
      category: challenge.category,
      limit: roundToCents(Number(challenge.limit) || 0),
      spent: roundToCents(Number(challenge.spent) || 0),
      weekStart: challenge.weekStart,
      completed: !!challenge.completed,
      currency: challenge.currency || currency,
    };
  }
}
