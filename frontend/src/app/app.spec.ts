import {TestBed} from '@angular/core/testing';
import {provideRouter, Router} from '@angular/router';
import {signal} from '@angular/core';

import {App} from './app';
import {AuthService} from './core/services/auth.service';

describe('App', () => {
  let navigateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isLoggedInVar: signal(false), logout: vi.fn() } },
      ],
    }).compileComponents();

    navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should initialise sidenavOpened to true', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance.sidenavOpened()).toBe(true);
  });

  it('toggleSidenav() should flip sidenavOpened', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.toggleSidenav();
    expect(app.sidenavOpened()).toBe(false);
    app.toggleSidenav();
    expect(app.sidenavOpened()).toBe(true);
  });

  it('logout() should call authService.logout and navigate to /login', () => {
    const fixture = TestBed.createComponent(App);
    const authService = TestBed.inject(AuthService);
    const logoutSpy = vi.spyOn(authService, 'logout');

    fixture.componentInstance.logout();

    expect(logoutSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
