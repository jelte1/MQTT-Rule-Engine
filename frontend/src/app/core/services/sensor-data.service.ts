import { BaseApiService } from './base-api.service';
import { Injectable } from '@angular/core';
import {SensorDataModel, SensorDataPageModel} from '../models/sensor-data.model';
import { Observable } from 'rxjs';
import {TablePageModel} from '../models/table-page.model';
import {HttpParams} from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class SensorDataService extends BaseApiService {
  getLatestSensorData(count: number) : Observable<SensorDataModel[]> {
    return this.http.get<SensorDataModel[]>(`${this.apiUrl}/sensordata/latest/${count}`);
  }

  getSensorData(id: number) : Observable<SensorDataModel> {
    return this.http.get<SensorDataModel>(`${this.apiUrl}/sensordata/${id}`);
  }

  deleteSensorData(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/sensordata/${id}`);
  }

  getSensorDataPage(tablePage: TablePageModel): Observable<SensorDataPageModel> {
    let params = new HttpParams()
      .set('pageSize', tablePage.pageSize)
      .set('pageNumber', tablePage.pageNumber)
      .set('sortingField', tablePage.sortingField)
      .set('sortingOrder', tablePage.sortingOrder)

      if (tablePage.filterQuery) {
        params = params.set('filterQuery', tablePage.filterQuery);
        console.log(params);
      }

    return this.http.get<SensorDataPageModel>(`${this.apiUrl}/sensordata`, { params });
  }
}
