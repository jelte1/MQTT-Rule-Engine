export interface MqttConnectionModel {
  id: number;
  name: string;
  host: string;
  port: number;
  username?: string;
  clientId?: string;
  useTls: boolean;
  isActive: boolean;
  createdAt: string;
  isConnected: boolean;
}

export interface CreateMqttConnectionModel {
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  clientId: string;
  useTls: boolean;
  isActive: boolean;
}

export interface UpdateMqttConnectionModel {
  name: string;
  host: string;
  port: number;
  username?: string;
  password?: string;
  clientId?: string;
  useTls: boolean;
  isActive: boolean;
}
