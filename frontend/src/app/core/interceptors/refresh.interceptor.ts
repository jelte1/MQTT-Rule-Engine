import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { INTERCEPTOR_EXCLUDED_URLS } from '../constants/constants';

export const refreshInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isExcluded = INTERCEPTOR_EXCLUDED_URLS.some(url => req.url.includes(url));

  if (isExcluded) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return handleUnauthorized(req, next, error);
      }
      return throwError(() => error);
    }),
  );

  function handleUnauthorized(
    request: HttpRequest<unknown>,
    next: HttpHandlerFn,
    error: HttpErrorResponse,
  ) {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      return handleLogout(error);
    }

    return attemptTokenRefresh(request, next, refreshToken);
  }

  function attemptTokenRefresh(request: HttpRequest<unknown>, next: HttpHandlerFn, refreshToken: string) {
    return authService.refreshToken(refreshToken).pipe(
      switchMap((response) => retryRequest(request, next, response.token)),
      catchError((refreshError) => handleLogout(refreshError)),
    );
  }

  function retryRequest(request: HttpRequest<unknown>, next: HttpHandlerFn, token: string) {
    const retry = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    return next(retry);
  }

  function handleLogout(error: unknown) {
    authService.logout();
    router.navigate(['/login']);
    return throwError(() => error);
  }
};
