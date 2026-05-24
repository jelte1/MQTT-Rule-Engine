import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter, Router} from '@angular/router';
import {of, throwError} from 'rxjs';
import {Login} from './login';
import {AuthService} from '../../../../core/services/auth.service';
import {MatSnackBar} from '@angular/material/snack-bar';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authService: { login: ReturnType<typeof vi.fn> };
  let snackBar: { open: ReturnType<typeof vi.fn> };
  let navigateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    authService = { login: vi.fn() };
    snackBar = { open: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: MatSnackBar, useValue: snackBar },
      ],
    }).compileComponents();

    navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  // create component
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // logging in test
  it('login() should call authService.login with current model values', () => {
    // arrange
    authService.login.mockReturnValue(of({ token: 'jwt', userId: 'u1', refreshToken: 'rt' }));
    component['loginModel'].set({ username: 'admin', password: 'secret' });

    // act
    component.login();

    // Assert
    expect(authService.login).toHaveBeenCalledWith({ username: 'admin', password: 'secret' });
  });

  // after login; navigate to dashboard
  it('login() should navigate to /dashboard and show success snack on success', () => {
    // arrange
    authService.login.mockReturnValue(of({ token: 'jwt', userId: 'u1', refreshToken: 'rt' }));

    // act
    component.login();

    // Assert
    expect(snackBar.open).toHaveBeenCalledWith('Login successful', 'Dismiss', { duration: 3000 });
    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  // after login failure; show error
  it('login() should show error snack on failure', async () => {
    // arrange
    authService.login.mockReturnValue(throwError(() => new Error('Unauthorized')));

    // act
    component.login();
    await fixture.whenStable();

    // assert
    expect(snackBar.open).toHaveBeenCalledWith(
      'Login failed. Please check your credentials and try again.',
      'Dismiss',
      { duration: 3000 }
    );
  });

  // invalid submit shows validation error
  it('submit() should show validation snack when form fields are empty', () => {
    // arrange
    component['loginModel'].set({ username: '', password: '' });

    // act
    component.submit();

    // assert
    expect(snackBar.open).toHaveBeenCalledWith(
      'Make sure to fill in all the fields correctly.',
      'Dismiss',
      { duration: 3000 }
    );
    expect(authService.login).not.toHaveBeenCalled();
  });

  // valid submit proceeds with login
  it('submit() should proceed with login when form is valid', () => {
    // arrange
    authService.login.mockReturnValue(of({ token: 'jwt', userId: 'u1', refreshToken: 'rt' }));
    component['loginModel'].set({ username: 'admin', password: 'password123' });

    // act
    component.submit();

    // assert
    expect(authService.login).toHaveBeenCalled();
  });
});
