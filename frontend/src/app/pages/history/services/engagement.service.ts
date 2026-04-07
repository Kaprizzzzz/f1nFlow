import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WeeklyChallenge } from '../models/finance.models';
import { NewsItem } from '../models/history-shared.models';
import { roundToCents } from '../utils/normalization.utils';

@Injectable({ providedIn: 'root' })
export class EngagementService {
  private readonly newsSubject = new BehaviorSubject<NewsItem[]>([
    { id: '1', title: 'Market update', isRead: false },
    { id: '2', title: 'Budget tip of the week', isRead: false },
    { id: '3', title: 'Saving challenge', isRead: true }
  ]);
  private readonly streakCurrentSubject = new BehaviorSubject<number>(0);
  private readonly streakBestSubject = new BehaviorSubject<number>(0);
  private readonly badgesSubject = new BehaviorSubject<string[]>([]);
  private readonly weeklyChallengeSubject = new BehaviorSubject<WeeklyChallenge | null>(null);

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

    markAllNewsRead(): void {
    this.newsSubject.next(this.newsSubject.value.map((item) => ({ ...item, isRead: true })));
  }

  hydrate(payload: {
    news?: NewsItem[];
    streakCurrent?: number;
    streakBest?: number;
    badges?: string[];
    weeklyChallenge?: WeeklyChallenge | null;
  }): void {
    this.newsSubject.next(this.normalizeNews(payload.news));
    this.streakCurrentSubject.next(this.normalizeStreakValue(payload.streakCurrent));
    this.streakBestSubject.next(this.normalizeStreakValue(payload.streakBest));
    this.badgesSubject.next(this.normalizeBadges(payload.badges));
    this.weeklyChallengeSubject.next(this.normalizeWeeklyChallenge(payload.weeklyChallenge));
  }

  private normalizeNews(news?: NewsItem[]): NewsItem[] {
    if (!news || news.length === 0) {
      return [
        { id: '1', title: 'Market update', isRead: false },
        { id: '2', title: 'Budget tip of the week', isRead: false },
        { id: '3', title: 'Saving challenge', isRead: true }
      ];
    }

    return news.map((item, index) => ({
      id: item.id || String(index + 1),
      title: item.title || 'News',
      isRead: !!item.isRead
    }));
  }

  private normalizeStreakValue(value?: number | null): number {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric < 0) {
      return 0;
    }
    return Math.round(numeric);
  }

  private normalizeBadges(badges?: string[] | null): string[] {
    if (!badges || badges.length === 0) {
      return [];
    }
    return Array.from(new Set(badges.filter((item) => !!item)));
  }

  private normalizeWeeklyChallenge(challenge?: WeeklyChallenge | null): WeeklyChallenge | null {
    if (!challenge || !challenge.category || !challenge.weekStart) {
      return null;
    }

    return {
      category: challenge.category,
      limit: roundToCents(Number(challenge.limit) || 0),
      spent: roundToCents(Number(challenge.spent) || 0),
      weekStart: challenge.weekStart,
      completed: !!challenge.completed
    };
  }
}
