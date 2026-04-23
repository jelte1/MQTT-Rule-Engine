import {inject, Injectable} from '@angular/core';
import {
  HTTP_INTERCEPTORS,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor, HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { INTERCEPTOR_EXCLUDED_URLS } from '../constants/constants';

export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isExcluded = INTERCEPTOR_EXCLUDED_URLS.some(url => req.url.includes(url));
  if (isExcluded) return next(req);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) return throwError(() => error);

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        authService.logout();
        router.navigate(['/login']);
        return throwError(() => error);
      }

      return authService.refreshToken(refreshToken).pipe(
        switchMap(response => {
          const retryReq = req.clone({
            setHeaders: { Authorization: `Bearer ${response.token}` }
          });
          return next(retryReq);
        }),
        catchError(refreshError => {
          authService.logout();
          router.navigate(['/login']);
          return throwError(() => refreshError);
        })
      );
    })
  );
};
