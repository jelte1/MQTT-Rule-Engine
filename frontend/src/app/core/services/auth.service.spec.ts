import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient} from '@angular/common/http';
import {AuthService} from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('login', () => {
    it('should POST to /auth/login', () => {
      // arrange
      const credentials = { username: 'user1', password: 'pass123' };
      const mockResponse = { token: 'jwt-token', userId: 'uid-1', refreshToken: 'rt-token' };

      // act
      service.login(credentials).subscribe();

      // Assert
      const req = httpMock.expectOne(`${service['apiUrl']}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(mockResponse);
    });

    it('should store token, userId and refreshToken in localStorage on success', () => {
      // arrange
      const credentials = { username: 'user1', password: 'pass123' };
      const mockResponse = { token: 'jwt-token', userId: 'uid-1', refreshToken: 'rt-token' };

      // act
      service.login(credentials).subscribe();
      httpMock.expectOne(`${service['apiUrl']}/auth/login`).flush(mockResponse);

      // Assert
      expect(localStorage.getItem('token')).toBe('jwt-token');
      expect(localStorage.getItem('userId')).toBe('uid-1');
      expect(localStorage.getItem('refreshToken')).toBe('rt-token');
    });
  });

  describe('logout', () => {
    it('should remove token, userId and refreshToken from localStorage', () => {
      // arrange
      localStorage.setItem('token', 'some-token');
      localStorage.setItem('userId', 'some-id');
      localStorage.setItem('refreshToken', 'some-refresh');

      // act
      service.logout();

      // Assert
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('userId')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });
  });

  describe('isLoggedIn', () => {
    it('should return false when no token exists', () => {
      // arrange
      localStorage.removeItem('token');

      // act & Assert
      expect(service.isLoggedIn()).toBe(false);
    });

    it('should return false when token is malformed', () => {
      // arrange
      localStorage.setItem('token', 'not.a.valid.jwt');

      // act & Assert
      expect(service.isLoggedIn()).toBe(false);
    });

    it('should return true when token has a future expiration', () => {
      // arrange
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const payload = btoa(JSON.stringify({ exp: futureExp, sub: 'user-1' }));
      localStorage.setItem('token', `header.${payload}.signature`);

      // act & Assert
      expect(service.isLoggedIn()).toBe(true);
    });

    it('should return false when token is expired', () => {
      // arrange
      const pastExp = Math.floor(Date.now() / 1000) - 3600;
      const payload = btoa(JSON.stringify({ exp: pastExp, sub: 'user-1' }));
      localStorage.setItem('token', `header.${payload}.signature`);

      // act & Assert
      expect(service.isLoggedIn()).toBe(false);
    });
  });

  describe('getUserId', () => {
    it('should return userId from localStorage', () => {
      // arrange
      localStorage.setItem('userId', 'abc-123');

      // act & Assert
      expect(service.getUserId()).toBe('abc-123');
    });

    it('should return null when no userId in localStorage', () => {
      // arrange
      localStorage.removeItem('userId');

      // act & Assert
      expect(service.getUserId()).toBeNull();
    });
  });

  describe('refreshToken', () => {
    it('should POST to /auth/refreshtoken with current credentials', () => {
      // arrange
      localStorage.setItem('userId', 'user-1');
      localStorage.setItem('token', 'old-token');
      const mockResponse = { token: 'new-token', userId: 'user-1', refreshToken: 'new-refresh' };

      // act
      service.refreshToken('old-refresh').subscribe();

      // Assert
      const req = httpMock.expectOne(`${service['apiUrl']}/auth/refreshtoken`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        userId: 'user-1',
        token: 'old-token',
        refreshToken: 'old-refresh',
      });
      req.flush(mockResponse);
    });

    it('should update localStorage with new tokens on success', () => {
      // arrange
      localStorage.setItem('userId', 'user-1');
      localStorage.setItem('token', 'old-token');
      const mockResponse = { token: 'new-token', userId: 'user-1', refreshToken: 'new-refresh' };

      // act
      service.refreshToken('old-refresh').subscribe();
      httpMock.expectOne(`${service['apiUrl']}/auth/refreshtoken`).flush(mockResponse);

      // Assert
      expect(localStorage.getItem('token')).toBe('new-token');
      expect(localStorage.getItem('refreshToken')).toBe('new-refresh');
    });
  });
});
