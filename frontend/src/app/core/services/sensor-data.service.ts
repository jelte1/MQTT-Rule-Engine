import {BaseApiService} from './base-api.service';
import {Injectable} from '@angular/core';
import {SensorDataModel} from '../models/sensor-data.model';
import {Observable} from 'rxjs';
import {PageModel, TablePageModel} from '../models/table-page.model';

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

  getSensorDataPage(tablePage: TablePageModel): Observable<PageModel<SensorDataModel>> {
    return this.getPage<PageModel<SensorDataModel>>('sensordata', tablePage);
  }
}
