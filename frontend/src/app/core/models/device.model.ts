export interface Device {
  id: number;
  name: string;
  description?: string;
  mqttConnectionId: number;
  connectionName: string;
  createdAt: string;
}
