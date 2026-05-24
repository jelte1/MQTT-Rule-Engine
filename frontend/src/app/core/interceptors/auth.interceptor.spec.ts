import {TestBed} from '@angular/core/testing';
import {HttpClient, provideHttpClient, withInterceptors} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {authInterceptor} from './auth.Interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // check if token is present
  it('should attach Authorization header when token is in localStorage', () => {
    // arrange
    localStorage.setItem('token', 'my-jwt-token');

    // act
    http.get('/api/devices').subscribe();

    // Assert
    const req = httpMock.expectOne('/api/devices');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-jwt-token');
    req.flush(null);
  });

  // if no token
  it('should not attach Authorization header when no token in localStorage', () => {
    // arrange
    localStorage.removeItem('token');

    // act
    http.get('/api/devices').subscribe();

    // Assert
    const req = httpMock.expectOne('/api/devices');
    expect(req.request.headers.get('Authorization')).toBeNull();
    req.flush(null);
  });

  it('should not attach Authorization header for /api/auth/login', () => {
    // arrange
    localStorage.setItem('token', 'my-jwt-token');

    // act
    http.post('/api/auth/login', {}).subscribe();

    // Assert
    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.headers.get('Authorization')).toBeNull();
    req.flush(null);
  });

  it('should not attach Authorization header for /api/auth/register', () => {
    // arrange
    localStorage.setItem('token', 'my-jwt-token');

    // act
    http.post('/api/auth/register', {}).subscribe();

    // Assert
    const req = httpMock.expectOne('/api/auth/register');
    expect(req.request.headers.get('Authorization')).toBeNull();
    req.flush(null);
  });

  it('should not attach Authorization header for /api/auth/refreshtoken', () => {
    // arrange
    localStorage.setItem('token', 'my-jwt-token');

    // act
    http.post('/api/auth/refreshtoken', {}).subscribe();

    // Assert
    const req = httpMock.expectOne('/api/auth/refreshtoken');
    expect(req.request.headers.get('Authorization')).toBeNull();
    req.flush(null);
  });
});
