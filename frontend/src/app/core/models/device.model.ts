export interface DeviceModel {
  id: number;
  name: string;
  description?: string;
  mqttConnectionId: number;
  connectionName: string;
  createdAt: string;
}

export interface CreateDeviceModel {
  name: string;
  description: string;
  mqttConnectionId: number | null;
}

export interface UpdateDeviceModel {
  name: string;
  description: string;
  mqttConnectionId: number;
}
