import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {catchError, map, of} from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    router.navigate(['/login']);
    return false;
  }

  return authService.refreshToken(refreshToken).pipe(
    map(() => true),
    catchError(() => {
      authService.logout();
      router.navigate(['/login']);
      return of(false);
    })
  );
};
