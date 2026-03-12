import { HttpInterceptorFn } from '@angular/common/http';

type TelegramWindow = Window & {
  Telegram?: {
    WebApp?: {
      initData?: string;
    };
  };
};

const SESSION_TOKEN_KEY = 'f1nflow-session-token';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  if (typeof window === 'undefined') {
    return next(req);
  }

  const initData = ((window as TelegramWindow).Telegram?.WebApp?.initData || '').trim();
  const sessionToken = localStorage.getItem(SESSION_TOKEN_KEY)?.trim();

  let headers = req.headers;

  if (initData) {
    headers = headers.set('X-Telegram-Init-Data', initData);
  }

  if (sessionToken) {
    headers = headers.set('Authorization', `Bearer ${sessionToken}`);
  }

  return next(req.clone({ headers }));
};