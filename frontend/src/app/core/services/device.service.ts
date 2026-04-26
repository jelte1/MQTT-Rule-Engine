import { BaseApiService } from './base-api.service';
import { Injectable } from '@angular/core';
import { DeviceModel } from '../models/device.model';
import { Observable } from 'rxjs';
import {CreateDeviceModel} from '../models/device.model';

@Injectable({ providedIn: 'root' })
export class DeviceService extends BaseApiService {
  getDevices() : Observable<DeviceModel[]> {
    return this.http.get<DeviceModel[]>(`${this.apiUrl}/devices`);
  }

  getDevice(id: number) : Observable<DeviceModel> {
    return this.http.get<DeviceModel>(`${this.apiUrl}/devices/${id}`);
  }

  createDevice(dto: CreateDeviceModel): Observable<DeviceModel> {
    return this.http.post<DeviceModel>(`${this.apiUrl}/devices`, dto);
  }

  updateDevice(id: number, dto: CreateDeviceModel): Observable<DeviceModel> {
    return this.http.put<DeviceModel>(`${this.apiUrl}/devices/${id}`, dto);
  }

  deleteDevice(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/devices/${id}`);
  }
}
