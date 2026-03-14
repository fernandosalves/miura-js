import { debugLog } from '@miura/miura-debugger';

/**
 * Store state interface
 */
export interface StoreState {
  [key: string]: unknown;
}

/**
 * Store actions interface
 */
export type StoreAction<T extends StoreState> = (
  state: T,
  ...args: any[]
) => Partial<T> | Promise<Partial<T>>;

export interface StoreActions<T extends StoreState> {
  [key: string]: StoreAction<T>;
}

/**
 * Store middleware interface
 */
export interface StoreMiddleware {
  name: string;
  before?: (action: string, args: unknown[], state: StoreState) => void | Promise<void>;
  after?: (action: string, args: unknown[], state: StoreState, result: unknown) => void | Promise<void>;
  error?: (action: string, args: unknown[], error: Error) => void | Promise<void>;
}

/**
 * Store subscriber
 */
export interface StoreSubscriber {
  id: string;
  selector?: (state: StoreState) => unknown;
  callback: (state: StoreState, prevState: StoreState) => void;
}

/**
 * Modern Store Implementation
 * Combines the best of Redux, Zustand, and modern patterns
 */
export class Store<T extends StoreState = StoreState> {
  private state: T;
  private actions: StoreActions<T> = {};
  private subscribers = new Map<string, StoreSubscriber>();
  private middlewares: StoreMiddleware[] = [];
  private isUpdating = false;
  private updateQueue: Array<() => void> = [];
  private subscriberIdCounter = 0;

  constructor(initialState: T) {
    this.state = { ...initialState };
  }

  /**
   * Get current state
   */
  getState(): T {
    return { ...this.state };
  }

  /**
   * Get a specific property from state
   */
  get<K extends keyof T>(key: K): T[K] {
    return this.state[key];
  }

  /**
   * Set state (immutable update)
   */
  setState(updater: Partial<T> | ((state: T) => Partial<T>)): void {
    const newState = typeof updater === 'function' ? updater(this.state) : updater;
    
    this.updateState(newState as Partial<T>);
  }

  /**
   * Define actions (like Redux actions but simpler)
   */
  defineActions(actions: StoreActions<T>): void {
    this.actions = { ...this.actions, ...actions };
  }

  /**
   * Execute an action
   */
  async dispatch(action: string, ...args: unknown[]): Promise<void> {
    if (!this.actions[action]) {
      throw new Error(`Action '${action}' not found`);
    }

    try {
      // Run before middlewares
      for (const middleware of this.middlewares) {
        if (middleware.before) {
          await middleware.before(action, args, this.state);
        }
      }

      // Execute action and update state
      const result = await this.actions[action](this.state, ...args);
      this.updateState(result as Partial<T>);

      // Run after middlewares
      for (const middleware of this.middlewares) {
        if (middleware.after) {
          await middleware.after(action, args, this.state, result);
        }
      }
    } catch (error) {
      // Run error middlewares
      for (const middleware of this.middlewares) {
        if (middleware.error) {
          await middleware.error(action, args, error as Error);
        }
      }
      throw error;
    }
  }

  /**
   * Subscribe to state changes
   */
  subscribe(
    callback: (state: T, prevState: T) => void,
    selector?: (state: T) => unknown
  ): () => void {
    const id = `subscriber_${++this.subscriberIdCounter}`;
    const subscriber: StoreSubscriber = {
      id,
      selector: selector as (state: StoreState) => unknown,
      callback: callback as (state: StoreState, prevState: StoreState) => void
    };

    this.subscribers.set(id, subscriber);
    debugLog('element', 'Subscribed to store', { id, hasSelector: !!selector });

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(id);
      debugLog('element', 'Unsubscribed from store', { id });
    };
  }

  /**
   * Subscribe to specific property changes
   */
  subscribeTo<K extends keyof T>(
    key: K,
    callback: (value: T[K], prevValue: T[K]) => void
  ): () => void {
    return this.subscribe(
      (state, prevState) => {
        if (state[key] !== prevState[key]) {
          callback(state[key], prevState[key]);
        }
      },
      (state) => state[key]
    );
  }

  /**
   * Add middleware
   */
  use(middleware: StoreMiddleware): void {
    this.middlewares.push(middleware);
    debugLog('element', 'Added middleware', { name: middleware.name });
  }

  /**
   * Update state and notify subscribers
   */
  private updateState(updater: Partial<T>): void {
    if (this.isUpdating) {
      // Queue update if already updating
      this.updateQueue.push(() => this.updateState(updater));
      return;
    }

    this.isUpdating = true;
    const prevState = { ...this.state };
    
    // Apply updates
    this.state = { ...this.state, ...updater };

    // Notify subscribers
    this.notifySubscribers(prevState);

    this.isUpdating = false;

    // Process queued updates
    while (this.updateQueue.length > 0) {
      const queuedUpdate = this.updateQueue.shift();
      if (queuedUpdate) {
        queuedUpdate();
      }
    }
  }

  /**
   * Notify all subscribers
   */
  private notifySubscribers(prevState: T): void {
    for (const subscriber of this.subscribers.values()) {
      try {
        if (subscriber.selector) {
          const currentValue = subscriber.selector(this.state);
          const prevValue = subscriber.selector(prevState);
          
          if (currentValue !== prevValue) {
            subscriber.callback(this.state, prevState);
          }
        } else {
          subscriber.callback(this.state, prevState);
        }
      } catch (error) {
        console.error(`Error in store subscriber ${subscriber.id}:`, error);
      }
    }
  }

  /**
   * Get debug information
   */
  getDebugInfo() {
    return {
      state: this.getState(),
      actions: Object.keys(this.actions),
      subscribers: this.subscribers.size,
      middlewares: this.middlewares.map(m => m.name)
    };
  }
} 