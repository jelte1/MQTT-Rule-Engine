import { Routes } from '@angular/router';
import {MqttConnectionList} from './features/mqttConnections/components/mqtt-connection-list/mqtt-connection-list';
import {MqttConnectionForm} from './features/mqttConnections/components/mqtt-connection-form/mqtt-connection-form';
import {Dashboard} from './features/dashboard/components/dashboard/dashboard';
import {DeviceList} from './features/devices/components/device-list/device-list';
import {RuleList} from './features/rules/components/rule-list/rule-list';
import {TopicList} from './features/topics/components/topic-list/topic-list';
import {DeviceForm} from './features/devices/components/device-form/device-form';
import {TopicForm} from './features/topics/components/topic-form/topic-form';
import {RuleForm} from './features/rules/components/rule-form/rule-form';

export const routes: Routes = [
  { path: 'home', component: Dashboard },
  { path: 'mqttconnections', component: MqttConnectionList },
  { path: 'mqttconnections/new', component: MqttConnectionForm },
  { path: 'mqttconnections/edit/:id', component: MqttConnectionForm },
  { path: 'devices', component: DeviceList },
  { path: 'devices/new', component: DeviceForm },
  { path: 'devices/edit/:id', component: DeviceForm },
  { path: 'topics', component: TopicList },
  { path: 'topics/new', component: TopicForm },
  { path: 'topics/edit/:id', component: TopicForm },
  { path: 'rules', component: RuleList },
  { path: 'rules/new', component: RuleForm },
  { path: 'rules/edit/:id', component: RuleForm },
];
