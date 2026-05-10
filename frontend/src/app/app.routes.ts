import {Routes} from '@angular/router';
import {MqttConnectionList} from './features/mqttConnections/components/mqtt-connection-list/mqtt-connection-list';
import {MqttConnectionForm} from './features/mqttConnections/components/mqtt-connection-form/mqtt-connection-form';
import {Dashboard} from './features/dashboard/components/dashboard/dashboard';
import {DeviceList} from './features/devices/components/device-list/device-list';
import {RuleList} from './features/rules/components/rule-list/rule-list';
import {TopicList} from './features/topics/components/topic-list/topic-list';
import {DeviceForm} from './features/devices/components/device-form/device-form';
import {TopicForm} from './features/topics/components/topic-form/topic-form';
import {RuleForm} from './features/rules/components/rule-form/rule-form';
import {Login} from './features/auth/components/login/login';
import {Register} from './features/auth/components/register/register';
import {authGuard} from './core/guards/auth.guard';
import {SensorDataList} from './features/sensorData/components/sensor-data-list/sensor-data-list';
import {SentDataList} from './features/sentData/components/sent-data-list/sent-data-list';
import {SensorDataShow} from './features/sensorData/components/sensor-data-show/sensor-data-show';
import {SentDataShow} from './features/sentData/components/sent-data-show/sent-data-show';
import {VariablesList} from './features/variables/variables-list/variables-list';
import {VariableForm} from './features/variables/variables-form/variable-form';

export const routes: Routes = [
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'mqttconnections', component: MqttConnectionList, canActivate: [authGuard] },
  { path: 'mqttconnections/new', component: MqttConnectionForm, canActivate: [authGuard] },
  { path: 'mqttconnections/edit/:id', component: MqttConnectionForm, canActivate: [authGuard] },
  { path: 'devices', component: DeviceList, canActivate: [authGuard] },
  { path: 'devices/new', component: DeviceForm, canActivate: [authGuard] },
  { path: 'devices/edit/:id', component: DeviceForm, canActivate: [authGuard] },
  { path: 'topics', component: TopicList, canActivate: [authGuard] },
  { path: 'topics/new', component: TopicForm, canActivate: [authGuard] },
  { path: 'topics/edit/:id', component: TopicForm, canActivate: [authGuard] },
  { path: 'rules', component: RuleList, canActivate: [authGuard] },
  { path: 'rules/new', component: RuleForm, canActivate: [authGuard] },
  { path: 'rules/edit/:id', component: RuleForm, canActivate: [authGuard] },
  { path: 'sensordata', component: SensorDataList, canActivate: [authGuard] },
  { path: 'sensordata/:id', component: SensorDataShow, canActivate: [authGuard] },
  { path: 'sentdata', component: SentDataList, canActivate: [authGuard] },
  { path: 'sentdata/:id', component: SentDataShow, canActivate: [authGuard] },
  { path: 'variables', component: VariablesList, canActivate: [authGuard] },
  { path: 'variables/new', component: VariableForm, canActivate: [authGuard] },
  { path: 'variables/edit/:id', component: VariableForm, canActivate: [authGuard] },
  { path: '', component: Login },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: '**', redirectTo: 'dashboard' },
];
