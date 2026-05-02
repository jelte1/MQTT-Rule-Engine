import {inject, Injectable} from '@angular/core';
import * as signalR from '@microsoft/signalr';
import {Subject} from 'rxjs';
import {BaseApiService} from './base-api.service';
import {SensorDataModel} from '../models/sensor-data.model';
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SignalrService extends BaseApiService{
  private hubConnection!: signalR.HubConnection;
  private sensorDataSubject = new Subject<SensorDataModel>();
  private snack = inject(MatSnackBar);
  sensorData$ = this.sensorDataSubject.asObservable();

  public startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.apiUrl}/hubs/sensordata`, {
        accessTokenFactory: () => localStorage.getItem('token') || ''
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .then()
      .catch(err =>
        this.snack.open('SignalR Connection Error:', err)
      );

    this.hubConnection.on('SensorDataUpdate', (data: SensorDataModel) => {
      this.sensorDataSubject.next(data);
    });
  }

  stopConnection(): Promise<void> {
    return this.hubConnection?.stop();
  }
}
