import { HttpHandlerFn, HttpRequest} from '@angular/common/http';
import { INTERCEPTOR_EXCLUDED_URLS } from '../constants/constants';

export function authInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn) {

  const isExcluded = INTERCEPTOR_EXCLUDED_URLS.some(url => request.url.includes(url));

  if (isExcluded) {
    return next(request);
  }

  const token = localStorage.getItem('token');

  if (token) {
    const reqWithHeader = request.clone({
      setHeaders: {
        Authorization: 'Bearer ' + token,
      },
    });

    return next(reqWithHeader);
  }

  return next(request);
}
