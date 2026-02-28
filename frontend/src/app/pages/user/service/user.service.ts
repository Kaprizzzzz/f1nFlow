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
  private readonly apiUrl: string;
  private readonly isBrowser: boolean;
  private readonly fallbackIdKey = 'f1nflow-fallback-telegram-id';

  private readonly userSubject = new BehaviorSubject<UserProfile | null>(null);
  user$ = this.userSubject.asObservable();

  get userSnapshot(): UserProfile | null {
    return this.userSubject.value;
  }

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.apiUrl = this.resolveApiUrl();
    console.info(`[SessionService] API URL: ${this.apiUrl}`);
    this.login().subscribe();
  }

  login(): Observable<any> {
    const profile = this.resolveProfile();
    this.userSubject.next(profile);

    return this.http.post(`${this.apiUrl}/users/login`, profile).pipe(
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
    return this.http.get(`${this.apiUrl}/users/${telegramId}/state`);
  }

  saveState(telegramId: string, payload: unknown): void {
    this.http.put(`${this.apiUrl}/users/${telegramId}/state`, payload).pipe(catchError(() => EMPTY)).subscribe();
  }

  sendPresence(isOnline: boolean): void {
    const user = this.userSnapshot;
    if (!user) {
      return;
    }

    this.http
      .patch(`${this.apiUrl}/users/${user.telegramId}/presence`, { isOnline })
      .pipe(catchError(() => EMPTY))
      .subscribe();
  }

  private resolveApiUrl(): string {
    if (!this.isBrowser) {
      return 'http://localhost:3000';
    }

    const fromStorageRaw = localStorage.getItem('f1nflow-api-url');
    const fromStorage = fromStorageRaw?.trim();

    if (fromStorageRaw && fromStorageRaw !== fromStorage) {
      console.warn('[SessionService] Trimmed spaces from localStorage key "f1nflow-api-url"');
    }
    const resolved = fromStorage || 'http://localhost:3000';
    const normalized = resolved.endsWith('/') ? resolved.slice(0, -1) : resolved;


    if (!fromStorage) {
      console.warn(
        '[SessionService] localStorage key "f1nflow-api-url" is not set. Using default API URL http://localhost:3000'
      );
    }
    try {
      const parsed = new URL(normalized);
      return parsed.origin;
    } catch {
      console.error(`[SessionService] Invalid API URL in localStorage: "${fromStorageRaw}". Falling back to http://localhost:3000`);
      return 'http://localhost:3000';
    }
  }

  private resolveProfile(): UserProfile {
    if (!this.isBrowser) {
      return { telegramId: 'server-render', userName: 'Guest' };
    }

    const tgUser = (window as TelegramWindow).Telegram?.WebApp?.initDataUnsafe?.user;

    if (tgUser?.id) {
      return {
        telegramId: String(tgUser.id),
        userName: tgUser.username || tgUser.first_name || `user-${tgUser.id}`
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
