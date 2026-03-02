import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, EMPTY, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

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
  private readonly apiUrlStorageKey = 'f1nflow-api-url';

  private lastApiUrl: string | null = null;
  private hasBeforeUnloadListener = false;
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
    if (!this.isBrowser) {
      return;
    }
    this.lastApiUrl = this.resolveApiUrl();
    console.info(`[SessionService] API URL: ${this.lastApiUrl}`);

    window.addEventListener('storage', this.handleStorageChange);
    window.addEventListener('focus', this.handleAppFocus);

    this.login().subscribe();
  }

  login(): Observable<unknown> {
    if (!this.isBrowser) {
      return EMPTY;
    }
    const profile = this.resolveProfile();
    this.userSubject.next(profile);

    return this.http.post(`${this.getApiUrl()}/users/login`, profile).pipe(
      tap(() => {
        this.sendPresence(true);
        if (!this.hasBeforeUnloadListener) {
          window.addEventListener('beforeunload', () => this.sendPresence(false));
          this.hasBeforeUnloadListener = true;
        }
      }),
      catchError(() => EMPTY)
    );
  }

  fetchState(telegramId: string): Observable<unknown> {
    return this.http.get(`${this.getApiUrl()}/users/${telegramId}/state`);
  }

  saveState(telegramId: string, payload: unknown): void {
    this.http
      .put(`${this.getApiUrl()}/users/${telegramId}/state`, payload)
      .pipe(catchError(() => EMPTY))
      .subscribe();
   }

  sendPresence(isOnline: boolean): void {
    const user = this.userSnapshot;
    if (!user) {
      return;
    }

    this.http
      .patch(`${this.getApiUrl()}/users/${user.telegramId}/presence`, { isOnline })
      .pipe(catchError(() => EMPTY))
      .subscribe();
  }

  private readonly handleStorageChange = (event: StorageEvent): void => {
    if (event.key !== this.apiUrlStorageKey) {
      return;
    }

    this.refreshApiUrlIfChanged();
  };

    private readonly handleAppFocus = (): void => {
    this.refreshApiUrlIfChanged();
  };

  private getApiUrl(): string {
    const nextUrl = this.resolveApiUrl();
    this.lastApiUrl = nextUrl;
    return nextUrl;
  }

  private refreshApiUrlIfChanged(): void {
    const nextUrl = this.resolveApiUrl();
    if (nextUrl === this.lastApiUrl) {
      return;
    }

    this.lastApiUrl = nextUrl;
    console.info(`[SessionService] API URL changed to: ${nextUrl}. Re-login started.`);
    this.login().subscribe();
  }

  private resolveApiUrl(): string {
    const fromStorageRaw = localStorage.getItem(this.apiUrlStorageKey);
    const fromStorage = fromStorageRaw?.trim();

    if (fromStorageRaw && fromStorageRaw !== fromStorage) {
      console.warn(`[SessionService] Trimmed spaces from localStorage key "${this.apiUrlStorageKey}"`);
    }
   
    const fallbackApiUrl = environment.apiUrl;
    const resolved = fromStorage || fallbackApiUrl;
    const normalized = resolved.endsWith('/') ? resolved.slice(0, -1) : resolved;

    if (!fromStorage) {
      console.warn(`[SessionService] localStorage key "${this.apiUrlStorageKey}" is not set. Using default API URL ${fallbackApiUrl}`
      );
    }

    try {
      const parsed = new URL(normalized, window.location.origin);
      const path = parsed.pathname === '/' ? '' : parsed.pathname.replace(/\/$/, '');
      return `${parsed.origin}${path}`;
    } catch {
      console.error(`[SessionService] Invalid API URL in localStorage: "${fromStorageRaw}". Falling back to ${fallbackApiUrl}`);
      return new URL(fallbackApiUrl, window.location.origin).toString().replace(/\/$/, '');
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
