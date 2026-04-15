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
  password?: string;   // optional here only
  clientId?: string;
  useTls: boolean;
  isActive: boolean;
}
