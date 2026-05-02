# API Specification

## Overview

This document defines the message contract for the Miura Architect WebSocket protocol and the HTTP session control API.

## Message Envelope

All messages use the same envelope structure:

```typescript
interface DevToolsMessage {
  type: string;
  payload: any;
  timestamp?: number;
  sessionId?: string;
  sequenceId?: number;
}
```

## WebSocket Event Types

### `APP_STATE_SNAPSHOT`

Sent by bridge on initial connection and periodic full sync.

```json
{
  "type": "APP_STATE_SNAPSHOT",
  "timestamp": 1680000000000,
  "payload": {
    "components": [ ... ],
    "signals": [ ... ],
    "stores": [ ... ],
    "contexts": [ ... ],
    "timestamp": 1680000000000
  }
}
```

### `component:discovered`

```json
{
  "type": "component:discovered",
  "timestamp": 1680000000000,
  "payload": {
    "id": "comp_1",
    "tag": "my-component",
    "parentId": null,
    "metadata": {
      "renderTime": 0,
      "updateCount": 0,
      "isConnected": true
    }
  }
}
```

### `component:updated`

```json
{
  "type": "component:updated",
  "timestamp": 1680000000000,
  "payload": {
    "id": "comp_1",
    "changedProperties": ["count"],
    "renderTime": 4
  }
}
```

### `signal:written`

```json
{
  "type": "signal:written",
  "timestamp": 1680000000000,
  "payload": {
    "id": "sig_1",
    "label": "count",
    "oldValue": 1,
    "newValue": 2,
    "writerId": "comp_1"
  }
}
```

### `signal:read`

```json
{
  "type": "signal:read",
  "timestamp": 1680000000000,
  "payload": {
    "id": "sig_1",
    "label": "count",
    "readerId": "comp_2"
  }
}
```

### `store:dispatched`

```json
{
  "type": "store:dispatched",
  "timestamp": 1680000000000,
  "payload": {
    "storeKey": "appStore",
    "action": "increment",
    "args": [1],
    "beforeState": {"count": 1},
    "afterState": {"count": 2},
    "duration": 2
  }
}
```

### `consume:resolved`

```json
{
  "type": "consume:resolved",
  "timestamp": 1680000000000,
  "payload": {
    "consumerComponentId": "comp_2",
    "contextKey": "theme",
    "providerId": "comp_1",
    "value": "dark"
  }
}
```

### `binding:created`

```json
{
  "type": "binding:created",
  "timestamp": 1680000000000,
  "payload": {
    "componentId": "comp_1",
    "bindingType": "property",
    "targetElement": "button",
    "targetProperty": "disabled"
  }
}
```

### `FULL_SYNC`

Sent by the bridge as a background reconciliation.

```json
{
  "type": "FULL_SYNC",
  "timestamp": 1680000000000,
  "payload": {
    "graph": [ ... ],
    "signals": [ ... ],
    "reason": "background-sync"
  }
}
```

## Implied Client Commands

### `RECORD_START`

```json
{
  "type": "RECORD_START",
  "payload": {
    "sessionId": "session_1680000000_abcd"
  }
}
```

### `RECORD_STOP`

```json
{
  "type": "RECORD_STOP",
  "payload": {
    "sessionId": "session_1680000000_abcd"
  }
}
```

### `QUERY_SESSIONS`

```json
{
  "type": "QUERY_SESSIONS",
  "payload": {}
}
```

### `FETCH_SESSION_EVENTS`

```json
{
  "type": "FETCH_SESSION_EVENTS",
  "payload": {
    "sessionId": "session_1680000000_abcd"
  }
}
```

## Server Response Types

### `SESSIONS_LIST`

```json
{
  "type": "SESSIONS_LIST",
  "payload": {
    "sessions": [
      { "id": "session_1", "startTime": 1680000000000, "isRecording": false, "eventCount": 120 }
    ]
  }
}
```

### `SESSION_EVENTS`

```json
{
  "type": "SESSION_EVENTS",
  "payload": {
    "sessionId": "session_1",
    "events": [ ... ],
    "count": 120
  }
}
```

### `RECORD_STARTED`

```json
{
  "type": "RECORD_STARTED",
  "payload": {
    "sessionId": "session_1"
  }
}
```

### `RECORD_STOPPED`

```json
{
  "type": "RECORD_STOPPED",
  "payload": {
    "sessionId": "session_1",
    "eventCount": 120
  }
}
```

## HTTP API (Optional)

If the server is extended with an HTTP endpoint, it should follow these contracts:

### GET `/api/sessions`

**Response**:
```json
{
  "sessions": [ { "id": "session_1", "startTime": 1680000000000, "isRecording": false, "eventCount": 120 } ]
}
```

### POST `/api/sessions/{id}/record`

**Request**:
```json
{ "enabled": true }
```

**Response**:
```json
{ "status": "recording", "sessionId": "session_1" }
```

### GET `/api/sessions/{id}`

**Response**:
```json
{ "id": "session_1", "startTime": 1680000000000, "eventCount": 120, "isRecording": false }
```

## Serialization Notes

- All messages should be JSON-serializable.
- Use `serializeUnknown()` from `miuraDebugger` when sending app objects.
- Cap arrays and object entries to prevent deeply nested payloads.
- Attach `timestamp` to every message.
- Include `sessionId` for long-lived recording sessions.
