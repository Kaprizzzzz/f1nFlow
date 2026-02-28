import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export const httpDebugInterceptor: HttpInterceptorFn = (req, next) => {
  const startedAt = performance.now();
  console.info(`[HTTP] ${req.method} ${req.urlWithParams}`, req.body ?? null);

  return next(req).pipe(
    tap({
      next: (event) => {
        if ('status' in event) {
          const duration = Math.round(performance.now() - startedAt);
          console.info(`[HTTP] ${req.method} ${req.urlWithParams} -> ${event.status} (${duration}ms)`);
        }
      },
      error: (error: unknown) => {
        const duration = Math.round(performance.now() - startedAt);
        if (error instanceof HttpErrorResponse) {
          console.error(
            `[HTTP] ${req.method} ${req.urlWithParams} -> ${error.status || 'NETWORK ERROR'} (${duration}ms)`,
            error.message,
            error.error ?? null
          );
          return;
        }

        console.error(`[HTTP] ${req.method} ${req.urlWithParams} -> UNKNOWN ERROR (${duration}ms)`, error);
      }
    })
  );
};