import { AppLifecycle as IAppLifecycle, LifecyclePhase, LifecycleEvent } from './types.js';

export class AppLifecycle implements IAppLifecycle {
  phase: LifecyclePhase = 'initializing';
  private listeners = new Map<LifecyclePhase, Set<(event: LifecycleEvent) => void>>();

  async start(): Promise<void> {
    await this._transition('starting');
    await this._transition('running');
  }

  async stop(): Promise<void> {
    await this._transition('stopping');
    await this._transition('destroyed');
  }

  async pause(): Promise<void> {
    await this._transition('pausing');
  }

  async resume(): Promise<void> {
    await this._transition('running');
  }

  async destroy(): Promise<void> {
    await this._transition('destroyed');
  }

  on(event: LifecyclePhase, callback: (event: LifecycleEvent) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)!.add(callback);
    
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  private async _transition(newPhase: LifecyclePhase): Promise<void> {
    const event: LifecycleEvent = {
      phase: newPhase,
      timestamp: Date.now()
    };

    this.phase = newPhase;
    this._notifyListeners(newPhase, event);
    
    // Small delay to allow listeners to process
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  private _notifyListeners(phase: LifecyclePhase, event: LifecycleEvent): void {
    const callbacks = this.listeners.get(phase);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Lifecycle listener error:', error);
        }
      });
    }
  }
} 