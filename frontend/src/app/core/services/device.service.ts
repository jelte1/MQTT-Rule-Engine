import { BaseApiService } from './base-api.service';
import { Injectable } from '@angular/core';
import { Device } from '../models/device.model';
import { Observable } from 'rxjs';
import {CreateDevice} from '../models/device.model';

@Injectable({ providedIn: 'root' })
export class DeviceService extends BaseApiService {
  getDevices() : Observable<Device[]> {
    return this.http.get<Device[]>(`${this.apiUrl}/devices`);
  }

  getDevice(id: number) : Observable<Device> {
    return this.http.get<Device>(`${this.apiUrl}/devices/${id}`);
  }

  createDevice(dto: CreateDevice): Observable<Device> {
    return this.http.post<Device>(`${this.apiUrl}/devices`, dto);
  }

  updateDevice(id: number, dto: CreateDevice): Observable<Device> {
    return this.http.put<Device>(`${this.apiUrl}/devices/${id}`, dto);
  }

  deleteDevice(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/devices/${id}`);
  }
}
