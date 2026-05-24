import {TestBed} from '@angular/core/testing';
import {provideRouter, Router} from '@angular/router';

import {of, throwError} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Register} from './register';
import {AuthService} from '../../../../core/services/auth.service';

describe('Register', () => {
  let navigateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { register: vi.fn() } },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
      ],
    }).compileComponents();

    navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Register);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('submit() with invalid form should show validation snack', () => {
    const authService = TestBed.inject(AuthService) as any;
    const snack = TestBed.inject(MatSnackBar);
    const snackSpy = vi.spyOn(snack, 'open');

    const fixture = TestBed.createComponent(Register);
    fixture.componentInstance.submit();

    expect(snackSpy).toHaveBeenCalledWith(
      expect.stringContaining('fill in all the fields'),
      'Dismiss',
      expect.any(Object)
    );
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('submit() on success should navigate to /login', () => {
    const authService = TestBed.inject(AuthService) as any;
    const snack = TestBed.inject(MatSnackBar);
    const snackSpy = vi.spyOn(snack, 'open');
    authService.register.mockReturnValue(of({}));

    const fixture = TestBed.createComponent(Register);
    const comp = fixture.componentInstance;
    comp['registerModel'].set({ username: 'user1', password: 'Pass1!' });
    comp.submit();

    expect(snackSpy).toHaveBeenCalledWith(
      expect.stringContaining('successfully created'),
      'Dismiss',
      expect.any(Object)
    );
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('submit() on error should show error snack', () => {
    const authService = TestBed.inject(AuthService) as any;
    const snack = TestBed.inject(MatSnackBar);
    const snackSpy = vi.spyOn(snack, 'open');
    authService.register.mockReturnValue(throwError(() => new Error('fail')));

    const fixture = TestBed.createComponent(Register);
    const comp = fixture.componentInstance;
    comp['registerModel'].set({ username: 'user1', password: 'Pass1!' });
    comp.submit();

    expect(snackSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed'),
      'Dismiss',
      expect.any(Object)
    );
  });
});
