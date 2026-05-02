import { RawData, WebSocket, WebSocketServer } from 'ws';
import type { DevToolsMessage } from './types.js';

const PORT = 3006;
const wss = new WebSocketServer({ port: PORT });
const uiClients = new Set<WebSocket>();
const targetClients = new Set<WebSocket>();

console.log(`[miura-architect] bridge server listening on ws://localhost:${PORT}`);

wss.on('connection', (socket: WebSocket, request) => {
  const isTarget = request.url?.includes('target=true') ?? false;

  if (isTarget) {
    targetClients.add(socket);
  } else {
    uiClients.add(socket);
  }

  socket.on('message', (raw: RawData) => {
    const message = parseMessage(raw);
    if (!message) return;

    if (isTarget) {
      broadcastToUi(message);
      return;
    }
    handleUiCommand(message);
  });

  socket.on('close', () => {
    if (isTarget) {
      targetClients.delete(socket);
      return;
    }
    uiClients.delete(socket);
  });

  socket.on('error', (error) => {
    console.warn('[miura-architect] socket error', error);
  });
});

function handleUiCommand(message: DevToolsMessage): void {
  switch (message.type) {
    case 'REQUEST_SNAPSHOT': {
      forwardCommandToTargets(message);
      break;
    }
    default:
      break;
  }
}

function forwardCommandToTargets(message: DevToolsMessage): void {
  const serialized = serialize(message);
  for (const target of targetClients) {
    if (target.readyState === WebSocket.OPEN) {
      target.send(serialized);
    }
  }
}

function broadcastToUi(message: DevToolsMessage): void {
  const encoded = serialize(message);
  for (const client of uiClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(encoded);
    }
  }
}

function parseMessage(raw: RawData): DevToolsMessage | null {
  try {
    const value = JSON.parse(raw.toString()) as DevToolsMessage;
    return {
      type: String(value.type ?? 'unknown'),
      payload: value.payload ?? {},
      timestamp: value.timestamp ?? Date.now(),
      sessionId: value.sessionId,
      sequenceId: value.sequenceId,
    };
  } catch (error) {
    console.warn('[miura-architect] invalid json payload ignored', error);
    return null;
  }
}

function serialize(message: DevToolsMessage): string {
  return JSON.stringify({ ...message, timestamp: message.timestamp ?? Date.now() });
}
