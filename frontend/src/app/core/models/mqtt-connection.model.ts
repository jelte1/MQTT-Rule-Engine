export interface MqttConnection {
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

export interface CreateMqttConnection {
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  clientId: string;
  useTls: boolean;
  isActive: boolean;
}

export interface UpdateMqttConnection {
  name: string;
  host: string;
  port: number;
  username?: string;
  password?: string;
  clientId?: string;
  useTls: boolean;
  isActive: boolean;
}
