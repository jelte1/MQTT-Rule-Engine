# MQTT-Rule-Engine

A full-stack IoT rule engine that allows users to connect MQTT brokers, receive live sensor data, and define rules that trigger actions based on incoming messages.

---

## Overview

The **MQTT Rule Engine** enables users to:

- Connect to one or more MQTT brokers
- Manage devices and their topics
- Receive and store real-time sensor data
- Create rules based on incoming data
- Trigger actions automatically when conditions are met
- View live updates through a modern web interface

---

### Rule Engine

Create rules with:

#### Condition:
- JSON Field (optional)
- Operator:
  - `>`, `<`, `>=`, `<=`, `==`, `!=`, `contains`
- Value
- Topic

#### Action:
- JSON Field (optional)
- Value
- Target topic

#### Else (Optional action on failed IF):
- JSON Field (optional)
- Value
- Target topic

---

## The Stack

### Backend
- ASP.NET Core Web API
- Entity Framework Core
- AutoMapper
- SignalR
- MQTTnet

### Frontend
- Angular
- Angular Material
- RxJS
- Angular Signals

### Database
- MySQL
