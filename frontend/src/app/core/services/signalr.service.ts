import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import {Subject} from 'rxjs';
import {BaseApiService} from './base-api.service';
import {SensorData} from '../models/sensor-data.model';

@Injectable({
  providedIn: 'root'
})
export class SignalrService extends BaseApiService{
  private hubConnection!: signalR.HubConnection;
  private sensorDataSubject = new Subject<SensorData>();
  sensorData$ = this.sensorDataSubject.asObservable();

  public startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.apiUrl}/hubs/sensordata`, {
        accessTokenFactory: () => localStorage.getItem('token') || ''
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .then(() => console.log('SignalR Connected'))
      .catch(err => console.error('SignalR Connection Error:', err));

    this.hubConnection.on('SensorDataUpdate', (data: SensorData) => {
      this.sensorDataSubject.next(data);
    });
  }

  stopConnection(): Promise<void> {
    return this.hubConnection?.stop();
  }
}
