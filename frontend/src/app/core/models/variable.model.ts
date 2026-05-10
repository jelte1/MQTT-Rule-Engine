export interface VariableModel {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  topicId: number;
  topicName: string;
  topicPath: string;
  field?: string;
  value: string;
}

export interface CreateVariableModel {
  name: string;
  description: string;
  topicId:  number | null;
  field: string;
  value: string;
}
