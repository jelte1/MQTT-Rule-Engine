export interface Device {
  id: number;
  name: string;
  description?: string;
  mqttConnectionId: number;
  connectionName: string;
  createdAt: string;
}

export interface CreateDevice {
  name: string;
  description: string;
  mqttConnectionId: number | null;
}

export interface UpdateDevice {
  name: string;
  description: string;
  mqttConnectionId: number;
}
