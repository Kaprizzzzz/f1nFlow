import { HttpInterceptorFn } from '@angular/common/http';

type TelegramWindow = Window & {
  Telegram?: {
    WebApp?: {
      initData?: string;
    };
  };
};

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  if (typeof window === 'undefined') {
    return next(req);
  }

  const initData = ((window as TelegramWindow).Telegram?.WebApp?.initData || '').trim();
  if (!initData) {
    return next(req);
  }

  const headers = req.headers
    .set('Authorization', `tma ${initData}`)
    .set('X-Telegram-Init-Data', initData);

  return next(req.clone({ headers }));
};