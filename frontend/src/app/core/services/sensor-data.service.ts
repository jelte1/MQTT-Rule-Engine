import { BaseApiService } from './base-api.service';
import { Injectable } from '@angular/core';
import { SensorData } from '../models/sensor-data.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SensorDataService extends BaseApiService {
  getLatestSensorData(count: number) : Observable<SensorData[]> {
    return this.http.get<SensorData[]>(`${this.apiUrl}/sensordata/latest/${count}`);
  }

  getSensorData(id: number) : Observable<SensorData> {
    return this.http.get<SensorData>(`${this.apiUrl}/sensordata/${id}`);
  }

  deleteSensorData(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/sensordata/${id}`);
  }
}
