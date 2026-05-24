import {BaseApiService} from './base-api.service';
import {Injectable, signal} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {AuthModel, LoginModel, RegisterModel} from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService extends BaseApiService {
  isLoggedInVar = signal(this.isLoggedIn());

  login(auth: LoginModel): Observable<AuthModel> {
    return this.http
      .post<AuthModel>(`${this.apiUrl}/auth/login`, auth)
      .pipe(
        tap((response) => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('userId', response.userId);
          localStorage.setItem('refreshToken', response.refreshToken);
          this.isLoggedInVar.set(true);
        }),
      );
  }

  register(dto: RegisterModel): Observable<AuthModel> {
    return this.http.post<AuthModel>(`${this.apiUrl}/auth/register`, dto);
  }

  refreshToken(refreshToken: string): Observable<AuthModel> {
    return this.http
      .post<AuthModel>(`${this.apiUrl}/auth/refreshtoken`, {
        userId: localStorage.getItem('userId'),
        token: localStorage.getItem('token'),
        refreshToken: refreshToken,
      })
      .pipe(
        tap((response) => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('userId', response.userId);
          localStorage.setItem('refreshToken', response.refreshToken);
        }),
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('refreshToken');
    this.isLoggedInVar.set(false);
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');

    if (!token) {
      return false;
    }

    try {
      // Decode the JWT token to check its expiration date
      const payload = JSON.parse(atob(token.split('.')[1]));

      if (payload.exp * 1000 > Date.now()) {
        return true;
      } else {
        // this.logout();
        return false;
      }
    } catch {
      return false;
    }
  }

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }
}
