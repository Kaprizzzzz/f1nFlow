import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, EMPTY, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

interface UserProfile {
  telegramId: string;
  userName: string;
  initData?: string;
}

interface LoginResponse {
  accessToken: string;
}
 
type TelegramWebAppUser = {
  id?: number | string;
  username?: string;
  first_name?: string;
};

type TelegramWindow = Window & {
  Telegram?: {
    WebApp?: {
      initData?: string;
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
  private readonly sessionTokenKey = 'f1nflow-session-token';

  private lastApiUrl: string | null = null;
  private hasBeforeUnloadListener = false;
  private readonly userSubject = new BehaviorSubject<UserProfile | null>(null);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  user$ = this.userSubject.asObservable();
  error$ = this.errorSubject.asObservable();

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

    return this.http.post<LoginResponse>(`${this.getApiUrl()}/users/login`, {
      telegramId: profile.telegramId,
      userName: profile.userName,
      initData: profile.initData
    }).pipe(
      tap((response) => {
        localStorage.setItem(this.sessionTokenKey, response.accessToken);
        this.sendPresence(true);
        if (!this.hasBeforeUnloadListener) {
          window.addEventListener('beforeunload', () => this.sendPresence(false));
          this.hasBeforeUnloadListener = true;
        }
      }),
      catchError((error) => this.handleHttpError('login', error))
    );
  }

  fetchState(): Observable<unknown> {
    return this.http.get(`${this.getApiUrl()}/users/me/state`);
  }

  saveState(payload: unknown): void {
    this.http
      .put(`${this.getApiUrl()}/users/me/state`, payload)
      .pipe(catchError((error) => this.handleHttpError('saveState', error)))
      .subscribe();
   }

  sendPresence(isOnline: boolean): void {
    const user = this.userSnapshot;
    if (!user) {
      return;
    }

    this.http
      .patch(`${this.getApiUrl()}/users/me/presence`, { isOnline })
      .pipe(catchError((error) => this.handleHttpError('sendPresence', error)))
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

  private normalizeUrl(rawUrl: string): string | null {
    try {
      const parsed = new URL(rawUrl, window.location.origin);
      const path = parsed.pathname === '/' ? '' : parsed.pathname.replace(/\/$/, '');
      return `${parsed.origin}${path}`;
    } catch {
      return null;
    }
  }

  private isAllowedApiOrigin(urlValue: string): boolean {
    const allowedOrigins = (environment.allowedApiOrigins ?? []).map((item) => item.trim()).filter(Boolean);
    if (allowedOrigins.length === 0) {
      return true;
    }

    const normalized = this.normalizeUrl(urlValue);
    if (!normalized) {
      return false;
    }

    const candidateOrigin = new URL(normalized).origin;
    return allowedOrigins.includes(candidateOrigin);
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

  private resolveApiUrlFromQuery(): string | null {
    try {
      const url = new URL(window.location.href);
      const queryValue = url.searchParams.get('apiUrl')?.trim();
      if (!queryValue) {
        return null;
      }

      const normalized = this.normalizeUrl(queryValue);
      if (!normalized || !this.isAllowedApiOrigin(normalized)) {
        console.warn('[SessionService] Ignored apiUrl query param because origin is not allowed.');
        return null;
      }

      localStorage.setItem(this.apiUrlStorageKey, normalized);
      return normalized;
    } catch {
      return null;
    }
  }


  private resolveApiUrl(): string {
    const fromQuery = this.resolveApiUrlFromQuery();
    if (fromQuery) {
      return fromQuery;
    }
    
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

    const normalizedApiUrl = this.normalizeUrl(normalized);
    if (!normalizedApiUrl || !this.isAllowedApiOrigin(normalizedApiUrl)) {
      console.error(`[SessionService] Invalid or disallowed API URL in localStorage: "${fromStorageRaw}". Falling back to ${fallbackApiUrl}`);
      return this.normalizeUrl(fallbackApiUrl) ?? '/api';
    }

    return normalizedApiUrl;
  }

  private getTelegramInitData(): string | undefined {
    const initData = ((window as TelegramWindow).Telegram?.WebApp?.initData || '').trim();
    return initData || undefined;
  }

  private resolveProfile(): UserProfile {
    const tgUser = (window as TelegramWindow).Telegram?.WebApp?.initDataUnsafe?.user;
    if (tgUser?.id) {
      const tgName = tgUser.username ? `@${tgUser.username}` : tgUser.first_name || `user-${tgUser.id}`;
      return {
        telegramId: String(tgUser.id),
        userName: tgName,
        initData: this.getTelegramInitData()
      };
    }

    let localId = localStorage.getItem(this.fallbackIdKey);
    if (!localId) {
      localId = `guest-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(this.fallbackIdKey, localId);
    }
 
    return {
      telegramId: localId,
      userName: `Guest ${localId.slice(-4)}`,
      initData: this.getTelegramInitData()
    };
   }

  private handleHttpError(operation: string, error: unknown): Observable<never> {
    const message = `Request failed during ${operation}. Please retry.`;
    this.errorSubject.next(message);
    console.error(`[SessionService] ${message}`, error);
    return EMPTY;
  }

   getSessionToken(): string | null {
    if (!this.isBrowser) {
      return null;
    }
    return localStorage.getItem(this.sessionTokenKey);
  }
}
