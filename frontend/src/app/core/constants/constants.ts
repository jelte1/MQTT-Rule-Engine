import {ConditionOperator} from '../models/rule.model';
import {DataFormat, TopicDirection} from '../models/topic.model';

export const INTERCEPTOR_EXCLUDED_URLS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refreshtoken'
];

export const RULE_OPERATORS = [
  { value: ConditionOperator.GreaterThan, label: '> (Greater than)' },
  { value: ConditionOperator.LessThan, label: '< (Less than)' },
  { value: ConditionOperator.GreaterThanOrEqual, label: '>= (Greater than or equal)' },
  { value: ConditionOperator.LessThanOrEqual, label: '<= (Less than or equal)' },
  { value: ConditionOperator.Equal, label: '== (Equal to)' },
  { value: ConditionOperator.NotEqual, label: '!= (Not equal to)' },
  { value: ConditionOperator.Contains, label: '⊃ (Contains)' }
]

export const TOPIC_DIRECTION_OPTIONS = [
  { value: TopicDirection.Incoming, label: 'Incoming (IOT Device -> Here)' },
  { value: TopicDirection.Outgoing, label: 'Outgoing (Here -> IOT Device)' },
  { value: TopicDirection.Both, label: 'Both (Two-way)' },
];

export const TOPIC_DATA_FORMAT_OPTIONS = [
  { value: DataFormat.Json, label: 'JSON' },
  { value: DataFormat.PlainText, label: 'Text' },
  { value: DataFormat.Numeric, label: 'Numeric' },
];

