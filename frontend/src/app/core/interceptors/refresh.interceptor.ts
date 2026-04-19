import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { INTERCEPTOR_EXCLUDED_URLS } from '../constants/constants';

@Injectable()
export class RefreshInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isExcluded = INTERCEPTOR_EXCLUDED_URLS.some((url) => req.url.includes(url));

    if (isExcluded) {
      return next.handle(req);
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handleUnauthorized(req, next, error);
        }
        return throwError(() => error);
      }),
    );
  }

  private handleUnauthorized(
    request: HttpRequest<any>,
    next: HttpHandler,
    error: HttpErrorResponse,
  ) {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      return this.handleLogout(error);
    }

    return this.attemptTokenRefresh(request, next, refreshToken);
  }

  private attemptTokenRefresh(request: HttpRequest<any>, next: HttpHandler, refreshToken: string) {
    return this.authService.refreshToken(refreshToken).pipe(
      switchMap((response) => this.retryRequest(request, next, response.token)),
      catchError((refreshError) => this.handleLogout(refreshError)),
    );
  }

  private retryRequest(request: HttpRequest<any>, next: HttpHandler, token: string) {
    const retry = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    return next.handle(retry);
  }

  private handleLogout(error: unknown) {
    this.authService.logout();
    this.router.navigate(['/login']);
    return throwError(() => error);
  }
}
