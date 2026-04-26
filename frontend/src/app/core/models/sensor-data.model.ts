export interface SensorDataModel {
  id: number;
  rawPayload: string;
  receivedAt: string;
  topicId: number;
  topicName: string;
  topicPath: string;
}

export interface SensorDataPageModel {
  total: number;
  sensorData: SensorDataModel[];
}
