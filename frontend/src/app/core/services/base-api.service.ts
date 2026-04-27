import {inject} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {TablePageModel} from '../models/table-page.model';
import {Observable} from 'rxjs';

export abstract class BaseApiService {
  protected http = inject(HttpClient);
  protected apiUrl = environment.apiUrl;

  protected getPage<T>(endpoint: string, tablePage: TablePageModel): Observable<T> {
    let params = new HttpParams()
      .set('pageSize', tablePage.pageSize.toString())
      .set('pageNumber', tablePage.pageNumber.toString())
      .set('sortingField', tablePage.sortingField)
      .set('sortingOrder', tablePage.sortingOrder);

    if (tablePage.filterQuery) {
      params = params.set('filterQuery', tablePage.filterQuery);
    }

    return this.http.get<T>(`${this.apiUrl}/${endpoint}/page`, { params });
  }
}
