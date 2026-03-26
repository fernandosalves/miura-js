import type { EventBus as IEventBus, EventBusEvent } from './types.js';

export class EventBus implements IEventBus {
  private listeners = new Map<string, Array<{
    callback: (event: EventBusEvent) => void;
    priority: number;
    once: boolean;
  }>>();

  emit(type: string, data?: any, priority: number = 5): void {
    const event: EventBusEvent = {
      type,
      data,
      timestamp: Date.now(),
      source: 'event-bus',
      priority
    };

    const callbacks = this.listeners.get(type);
    if (callbacks) {
      // Sort by priority (higher priority first)
      const sortedCallbacks = [...callbacks].sort((a, b) => b.priority - a.priority);
      
      // Execute callbacks
      sortedCallbacks.forEach(({ callback, once }) => {
        try {
          callback(event);
        } catch (error) {
          console.error('EventBus callback error:', error);
        }
      });

      // Remove once listeners
      const remainingCallbacks = callbacks.filter(cb => !cb.once);
      if (remainingCallbacks.length !== callbacks.length) {
        this.listeners.set(type, remainingCallbacks);
      }
    }
  }

  on(type: string, callback: (event: EventBusEvent) => void, priority: number = 5): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    
    const listener = { callback, priority, once: false };
    this.listeners.get(type)!.push(listener);
    
    return () => this.off(type, callback);
  }

  once(type: string, callback: (event: EventBusEvent) => void, priority: number = 5): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    
    const listener = { callback, priority, once: true };
    this.listeners.get(type)!.push(listener);
    
    return () => this.off(type, callback);
  }

  off(type: string, callback: (event: EventBusEvent) => void): void {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      const index = callbacks.findIndex(cb => cb.callback === callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
        if (callbacks.length === 0) {
          this.listeners.delete(type);
        }
      }
    }
  }

  clear(): void {
    this.listeners.clear();
  }

  // Additional EventBus utilities

  /**
   * Get all registered event types
   */
  getEventTypes(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * Get listener count for an event type
   */
  getListenerCount(type: string): number {
    return this.listeners.get(type)?.length || 0;
  }

  /**
   * Emit event with high priority
   */
  emitHighPriority(type: string, data?: any): void {
    this.emit(type, data, 10);
  }

  /**
   * Emit event with low priority
   */
  emitLowPriority(type: string, data?: any): void {
    this.emit(type, data, 1);
  }

  /**
   * Wait for an event to occur
   */
  waitFor(type: string, timeout?: number): Promise<EventBusEvent> {
    return new Promise((resolve, reject) => {
      const timeoutId = timeout ? setTimeout(() => {
        reject(new Error(`Event ${type} timeout after ${timeout}ms`));
      }, timeout) : null;

      this.once(type, (event) => {
        if (timeoutId) clearTimeout(timeoutId);
        resolve(event);
      });
    });
  }
} 
