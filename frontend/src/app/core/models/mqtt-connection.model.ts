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
}
