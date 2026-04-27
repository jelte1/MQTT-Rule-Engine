export enum ConditionOperator {
  GreaterThan = 0,
  LessThan = 1,
  GreaterThanOrEqual = 2,
  LessThanOrEqual = 3,
  Equal = 4,
  NotEqual = 5,
  Contains = 6
}

export interface RuleModel {
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
  // else
  elseActionTopicId?: number;
  elseActionField?: string;
  elseActionValue?: string;
}

export interface CreateRuleModel {
  name: string;
  description: string;
  isActive: boolean;
  // condition
  conditionField: string;
  operator: ConditionOperator;
  conditionValue: string;
  conditionTopicId: number | null;
  // action
  actionField: string;
  actionValue: string;
  actionTopicId: number | null;
  // else
  elseActionTopicId: number | null;
  elseActionField: string;
  elseActionValue: string;
}

export interface RulePageModel {
  total: number;
  sensorData: RuleModel[];
}
