import {TestBed} from '@angular/core/testing';
import {provideRouter, Router} from '@angular/router';
import {firstValueFrom, of, throwError} from 'rxjs';
import {authGuard} from './auth.guard';
import {AuthService} from '../services/auth.service';

describe('authGuard', () => {
  let authService: { isLoggedIn: ReturnType<typeof vi.fn>; refreshToken: ReturnType<typeof vi.fn>; logout: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(() => {
    authService = {
      isLoggedIn: vi.fn(),
      refreshToken: vi.fn(),
      logout: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
      ],
    });

    router = TestBed.inject(Router);
  });

  afterEach(() => localStorage.clear());

  function runGuard() {
    return TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
  }

  it('should return true synchronously when user is already logged in', () => {
    // arrange
    authService.isLoggedIn.mockReturnValue(true);

    // act
    const result = runGuard();

    // Assert
    expect(result).toBe(true);
  });

  it('should navigate to /login and return false when not logged in and no refresh token', () => {
    // arrange
    authService.isLoggedIn.mockReturnValue(false);
    localStorage.removeItem('refreshToken');
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    // act
    const result = runGuard();

    // Assert
    expect(result).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should return true (as observable) when refresh token succeeds', async () => {
    // arrange
    authService.isLoggedIn.mockReturnValue(false);
    localStorage.setItem('refreshToken', 'valid-refresh-token');
    authService.refreshToken.mockReturnValue(
      of({ token: 'new-token', userId: 'u1', refreshToken: 'new-refresh' })
    );

    // act
    const result = await firstValueFrom(runGuard() as any);

    // Assert
    expect(result).toBe(true);
    expect(authService.refreshToken).toHaveBeenCalledWith('valid-refresh-token');
  });

  it('should navigate to /login and return false when refresh token fails', async () => {
    // arrange
    authService.isLoggedIn.mockReturnValue(false);
    localStorage.setItem('refreshToken', 'expired-refresh-token');
    authService.refreshToken.mockReturnValue(throwError(() => new Error('Unauthorized')));
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    // act
    const result = await firstValueFrom(runGuard() as any);

    // Assert
    expect(result).toBe(false);
    expect(authService.logout).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
