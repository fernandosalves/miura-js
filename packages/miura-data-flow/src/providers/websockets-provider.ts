import { DataProvider, ProviderFactory } from './provider';

export interface WebSocketProviderOptions {
  url: string;
  protocols?: string | string[];
}

class WebSocketProvider<T> implements DataProvider<T> {
  private ws: WebSocket;

  constructor(options: WebSocketProviderOptions) {
    this.ws = new WebSocket(options.url, options.protocols);
  }

  subscribe(options: { event: string }, callback: (data: T) => void): () => void {
    const handler = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        // Assuming a message format of { event: 'name', payload: ... }
        if (message.event === options.event) {
          callback(message.payload);
        }
      } catch (e) {
        console.error('Error parsing WebSocket message', e);
      }
    };

    this.ws.addEventListener('message', handler);

    // Return an unsubscribe function
    return () => {
      this.ws.removeEventListener('message', handler);
    };
  }

  // A method to send data back to the server
  send(event: string, payload: any) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, payload }));
    } else {
      console.warn('WebSocket is not open. Cannot send message.');
    }
  }

  close() {
    this.ws.close();
  }
}

export class WebSocketProviderFactory implements ProviderFactory {
  create<T>(options: WebSocketProviderOptions): DataProvider<T> {
    return new WebSocketProvider<T>(options);
  }
} 