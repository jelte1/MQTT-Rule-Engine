import { Routes } from '@angular/router';
import {MqttConnectionList} from './features/mqttConnections/components/mqtt-connection-list/mqtt-connection-list';
import {MqttConnectionForm} from './features/mqttConnections/components/mqtt-connection-form/mqtt-connection-form';
import {Dashboard} from './features/dashboard/components/dashboard/dashboard';
import {DeviceList} from './features/devices/components/device-list/device-list';
import {RuleList} from './features/rules/components/rule-list/rule-list';
import {TopicList} from './features/topics/components/topic-list/topic-list';

export const routes: Routes = [
  { path: 'home', component: Dashboard },
  { path: 'mqttconnections', component: MqttConnectionList },
  { path: 'mqttconnections/new', component: MqttConnectionForm },
  { path: 'mqttconnections/edit/:id', component: MqttConnectionForm },
  { path: 'devices', component: DeviceList },
  { path: 'rules', component: RuleList },
  { path: 'topics', component: TopicList },
];
