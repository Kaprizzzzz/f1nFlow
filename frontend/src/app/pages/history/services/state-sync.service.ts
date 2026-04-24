import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SessionService } from '../../user/service/user.service';
import { AppLanguage, GoalsPreferences, SphereLayout, Transaction, WeeklyChallenge } from '../models/finance.models';
import { CategoryItem, Currency, NewsItem } from '../models/history-shared.models';

export interface PersistedStatePayload {
  transactions?: Array<Omit<Transaction, 'date'> & { date: string }>;
  user?: {
    incomeCategories?: CategoryItem[];
    expenseCategories?: CategoryItem[];
    currency?: Currency;
    sphereLayout?: SphereLayout | null;
    quickTransactionsLimit?: number;
    news?: NewsItem[];
    goalsPreferences?: GoalsPreferences;
    streakCurrent?: number;
    streakBest?: number;
    badges?: string[];
    weeklyChallenge?: WeeklyChallenge | null;
    language?: AppLanguage;
  };
}

@Injectable({ providedIn: 'root' })
export class StateSyncService {
  private readonly storageKey = 'f1nflow-balance-state';
  readonly isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private readonly sessionService: SessionService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  restoreLocalState(): Record<string, unknown> | null {
    if (!this.isBrowser) {
      return null;
    }

    const rawState = localStorage.getItem(this.storageKey);
    if (!rawState) {
      return null;
    }

    try {
      return JSON.parse(rawState) as Record<string, unknown>;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }

  persistLocalState(payload: unknown): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(payload));
  }

  fetchRemoteState(onSuccess: (payload: PersistedStatePayload) => void, onDone: () => void): void {
    this.sessionService.user$.subscribe((user) => {
      if (!user) {
        return;
      }

      this.sessionService.fetchState().subscribe({
        next: (payload) => {
          onSuccess(payload as PersistedStatePayload);
          onDone();
        },
        error: () => onDone()
      });
    });
  }

  saveRemoteState(payload: unknown): void {
    const currentUser = this.sessionService.userSnapshot;
    if (!currentUser) {
      return;
    }
    this.sessionService.saveState(payload);
  }
}
