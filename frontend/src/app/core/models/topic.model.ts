export enum TopicDirection {
  Incoming = 0,
  Outgoing = 1,
  Both = 2
}

export enum DataFormat {
  Json = 0,
  PlainText = 1,
  Numeric = 2
}

export interface Topic {
  id: number;
  name: string;
  topicPath: string;
  description?: string;
  direction: TopicDirection;
  dataFormat: DataFormat;
  createdAt: string;
  deviceId: number;
  deviceName: string;
}

export interface CreateTopic {
  name: string;
  topicPath: string;
  description: string;
  direction: TopicDirection;
  dataFormat: DataFormat;
  deviceId: number | null;
}
