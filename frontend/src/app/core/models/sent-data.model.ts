export enum SentDataType {
  action = 0,
  ElseAction = 1,
  Variable = 2
}

export enum SentDataStatus
{
  Sent = 0,
  Failed = 1,
}

export interface SentDataModel {
  id: number;
  payload: string;
  sentAt: string;
  type: SentDataType;
  status: SentDataStatus;
  errorMessage?: string;
  sentTopicId: number;
  sentTopicName: string;
  sentTopicPath: string;
  ruleId: number;
  ruleName: string;
  triggerSensorDataId: number;
  triggerSensorDataPayload: string;
  variableId: number;
  variableName: string;
}
