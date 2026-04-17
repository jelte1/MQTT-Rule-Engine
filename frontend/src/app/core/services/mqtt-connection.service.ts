import { BaseApiService } from './base-api.service';
import { Injectable } from '@angular/core';
import { MqttConnection } from '../models/mqtt-connection.model';
import { Observable } from 'rxjs';
import {CreateMqttConnection, UpdateMqttConnection} from '../models/mqtt-connection.model';

@Injectable({ providedIn: 'root' })
export class MqttConnectionService extends BaseApiService {
  getMqttConnections() : Observable<MqttConnection[]> {
    return this.http.get<MqttConnection[]>(`${this.apiUrl}/mqttconnections`);
  }

  getMqttConnection(id: number) : Observable<MqttConnection> {
    return this.http.get<MqttConnection>(`${this.apiUrl}/mqttconnections/${id}`);
  }

  createMqttConnection(dto: CreateMqttConnection): Observable<MqttConnection> {
    return this.http.post<MqttConnection>(`${this.apiUrl}/mqttconnections`, dto);
  }

  updateMqttConnection(id: number, dto: UpdateMqttConnection): Observable<MqttConnection> {
    return this.http.put<MqttConnection>(`${this.apiUrl}/mqttconnections/${id}`, dto);
  }

  deleteMqttConnection(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/mqttconnections/${id}`);
  }
}
