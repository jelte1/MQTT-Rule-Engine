import {BaseApiService} from './base-api.service';
import {Injectable} from '@angular/core';
import {
  CreateMqttConnectionModel,
  MqttConnectionModel,
  UpdateMqttConnectionModel
} from '../models/mqtt-connection.model';
import {Observable} from 'rxjs';
import {PageModel, TablePageModel} from '../models/table-page.model';

@Injectable({ providedIn: 'root' })
export class MqttConnectionService extends BaseApiService {
  getMqttConnections() : Observable<MqttConnectionModel[]> {
    return this.http.get<MqttConnectionModel[]>(`${this.apiUrl}/mqttconnections`);
  }

  getMqttConnection(id: number) : Observable<MqttConnectionModel> {
    return this.http.get<MqttConnectionModel>(`${this.apiUrl}/mqttconnections/${id}`);
  }

  createMqttConnection(dto: CreateMqttConnectionModel): Observable<MqttConnectionModel> {
    return this.http.post<MqttConnectionModel>(`${this.apiUrl}/mqttconnections`, dto);
  }

  updateMqttConnection(id: number, dto: UpdateMqttConnectionModel): Observable<MqttConnectionModel> {
    return this.http.put<MqttConnectionModel>(`${this.apiUrl}/mqttconnections/${id}`, dto);
  }

  reconnectMqttConnection(id: number) : Observable<MqttConnectionModel> {
    return this.http.post<MqttConnectionModel>(`${this.apiUrl}/mqttconnections/${id}/reconnect`, {});
  }

  deleteMqttConnection(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/mqttconnections/${id}`);
  }

  getMqttConnectionPage(tablePage: TablePageModel): Observable<PageModel<MqttConnectionModel>> {
    return this.getPage<PageModel<MqttConnectionModel>>('mqttconnections', tablePage);
  }
}
