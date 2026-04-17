export enum ConditionOperator {
  GreaterThan = 0,
  LessThan = 1,
  GreaterThanOrEqual = 2,
  LessThanOrEqual = 3,
  Equal = 4,
  NotEqual = 5,
  Contains = 6
}

export interface Rule {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  // condition
  conditionTopicId: number;
  conditionTopicName: string;
  conditionTopicPath: string;
  conditionField?: string;
  operator: ConditionOperator;
  conditionValue: string;
  //action
  actionTopicId: number;
  actionTopicName: string;
  actionTopicPath: string;
  actionField: string;
  actionValue: string;
}

export interface CreateRule {
  name: string;
  description: string;
  isActive: boolean;
  // condition
  conditionField: string;
  operator: ConditionOperator;
  conditionValue: string;
  conditionTopicId: number;
  // action
  actionField: string;
  actionValue: string;
  actionTopicId: number;
}
