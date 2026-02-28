 import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, EMPTY, Observable, tap } from 'rxjs';

interface UserProfile {
  telegramId: string;
  userName: string;
}
 
type TelegramWebAppUser = {
  id?: number | string;
  username?: string;
  first_name?: string;
};

type TelegramWindow = Window & {
  Telegram?: {
    WebApp?: {
      initDataUnsafe?: {
        user?: TelegramWebAppUser;
      };
    };
  }
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly isBrowser: boolean;
  private readonly fallbackIdKey = 'f1nflow-fallback-telegram-id';

  private readonly userSubject = new BehaviorSubject<UserProfile | null>(null);
  user$ = this.userSubject.asObservable();

  get userSnapshot(): UserProfile | null {
    return this.userSubject.value;
  }

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      console.info(`[SessionService] API URL: ${this.resolveApiUrl()}`);
      this.login().subscribe();
    }
  }

  login(): Observable<any> {
    if (!this.isBrowser) {
      return EMPTY;
    }
    const profile = this.resolveProfile();
    this.userSubject.next(profile);

    return this.http.post(`${this.resolveApiUrl()}/users/login`, profile).pipe(
      tap(() => {
        this.sendPresence(true);
        if (this.isBrowser) {
          window.addEventListener('beforeunload', () => this.sendPresence(false));
        }
      }),
      catchError(() => EMPTY)
    );
  }

  fetchState(telegramId: string): Observable<any> {
    return this.http.get(`${this.resolveApiUrl()}/users/${telegramId}/state`);
  }

  saveState(telegramId: string, payload: unknown): void {
    this.http
      .put(`${this.resolveApiUrl()}/users/${telegramId}/state`, payload)
      .pipe(catchError(() => EMPTY))
      .subscribe();
   }

  sendPresence(isOnline: boolean): void {
    const user = this.userSnapshot;
    if (!user) {
      return;
    }

    this.http
      .patch(`${this.resolveApiUrl()}/users/${user.telegramId}/presence`, { isOnline })
      .pipe(catchError(() => EMPTY))
      .subscribe();
  }

  private resolveApiUrl(): string {

    const fromStorageRaw = localStorage.getItem('f1nflow-api-url');
    const fromStorage = fromStorageRaw?.trim();

    if (fromStorageRaw && fromStorageRaw !== fromStorage) {
      console.warn('[SessionService] Trimmed spaces from localStorage key "f1nflow-api-url"');
    }
    const resolved = fromStorage || '/api';
    const normalized = resolved.endsWith('/') ? resolved.slice(0, -1) : resolved;


    if (!fromStorage) {
      console.warn('[SessionService] localStorage key "f1nflow-api-url" is not set. Using default API URL /api'
      );
    }
    try {
      const parsed = new URL(normalized, window.location.origin);
      const path = parsed.pathname === '/' ? '' : parsed.pathname.replace(/\/$/, '');
      return `${parsed.origin}${path}`;
    } catch {
      console.error(`[SessionService] Invalid API URL in localStorage: "${fromStorageRaw}". Falling back to /api`);
      return `${window.location.origin}/api`;
    }
  }

  private resolveProfile(): UserProfile {

    const tgUser = (window as TelegramWindow).Telegram?.WebApp?.initDataUnsafe?.user;
    if (tgUser?.id) {
      const tgName = tgUser.username ? `@${tgUser.username}` : tgUser.first_name || `user-${tgUser.id}`;
      return {
        telegramId: String(tgUser.id),
        userName: tgName
      };
    }

    let localId = localStorage.getItem(this.fallbackIdKey);
    if (!localId) {
      localId = `guest-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(this.fallbackIdKey, localId);
    }
 
    return { telegramId: localId, userName: `Guest ${localId.slice(-4)}` };
   }
}
