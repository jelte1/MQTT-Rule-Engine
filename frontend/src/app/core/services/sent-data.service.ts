import {BaseApiService} from './base-api.service';
import {Injectable} from '@angular/core';
import {SentDataModel} from '../models/sent-data.model';
import {Observable} from 'rxjs';
import {PageModel, TablePageModel} from '../models/table-page.model';

@Injectable({ providedIn: 'root' })
export class SentDataService extends BaseApiService {
  getLatestSentData(count: number) : Observable<SentDataModel[]> {
    return this.http.get<SentDataModel[]>(`${this.apiUrl}/sentdata/latest/${count}`);
  }

  getSentData(id: number) : Observable<SentDataModel> {
    return this.http.get<SentDataModel>(`${this.apiUrl}/sentdata/${id}`);
  }

  getSentDataBySensorId(id: number) : Observable<SentDataModel[]> {
    return this.http.get<SentDataModel[]>(`${this.apiUrl}/sentdata/sensordata/${id}`);
  }

  getSentDataPage(tablePage: TablePageModel): Observable<PageModel<SentDataModel>> {
    return this.getPage<PageModel<SentDataModel>>('sentdata', tablePage);
  }
}
