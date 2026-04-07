import { Store, StoreState, StoreActions } from './store';
import { debugLog } from '@miurajs/miura-debugger';

/**
 * Global state interface
 */
export interface GlobalState extends StoreState {
  // Add common global properties
  user?: {
    id: string;
    name: string;
    email: string;
  };
  theme?: 'light' | 'dark';
  language?: string;
  notifications?: Array<{
    id: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }>;
}

/**
 * Global State Manager
 * Manages application-wide state using the Store system
 */
export class GlobalStateManager {
  private static instance: GlobalStateManager;
  private store: Store<GlobalState>;
  private componentSubscriptions = new Map<string, Set<string>>();
  private componentUnsubscribers = new Map<string, Set<() => void>>();

  private constructor() {
    this.store = new Store<GlobalState>({
      theme: 'light',
      language: 'en',
      notifications: []
    });
  }

  static getInstance(): GlobalStateManager {
    if (!GlobalStateManager.instance) {
      GlobalStateManager.instance = new GlobalStateManager();
    }
    return GlobalStateManager.instance;
  }

  /**
   * Get the global store
   */
  getStore(): Store<GlobalState> {
    return this.store;
  }

  /**
   * Get a global property
   */
  get<K extends keyof GlobalState>(key: K): GlobalState[K] {
    return this.store.get(key);
  }

  /**
   * Set a global property
   */
  set<K extends keyof GlobalState>(key: K, value: GlobalState[K]): void {
    this.store.setState({ [key]: value } as Partial<GlobalState>);
  }

  /**
   * Subscribe to global state changes
   */
  subscribe(
    componentId: string,
    properties: (keyof GlobalState)[],
    callback: (state: GlobalState, prevState: GlobalState) => void
  ): () => void {
    // Track component subscriptions
    if (!this.componentSubscriptions.has(componentId)) {
      this.componentSubscriptions.set(componentId, new Set());
    }
    this.componentSubscriptions.get(componentId)!.add(properties.join(','));

    debugLog('element', 'Subscribed to global state', { componentId, properties });

    // Handle property change detection here so multi-property subscriptions
    // do not retrigger just because a selector produced a new object/array.
    const unsubscribe = this.store.subscribe(
      (state, prevState) => {
        const hasRelevantChange = properties.some((prop) => state[prop] !== prevState[prop]);

        if (hasRelevantChange) {
          callback(state, prevState);
        }
      }
    );

    if (!this.componentUnsubscribers.has(componentId)) {
      this.componentUnsubscribers.set(componentId, new Set());
    }

    const unsubscribers = this.componentUnsubscribers.get(componentId)!;
    const trackedUnsubscribe = () => {
      unsubscribe();

      const tracked = this.componentUnsubscribers.get(componentId);
      tracked?.delete(trackedUnsubscribe);

      if (tracked?.size === 0) {
        this.componentUnsubscribers.delete(componentId);
      }
    };

    unsubscribers.add(trackedUnsubscribe);

    return trackedUnsubscribe;
  }

  /**
   * Subscribe to a specific global property
   */
  subscribeTo<K extends keyof GlobalState>(
    componentId: string,
    key: K,
    callback: (value: GlobalState[K], prevValue: GlobalState[K]) => void
  ): () => void {
    return this.subscribe(componentId, [key], (state, prevState) => {
      if (state[key] !== prevState[key]) {
        callback(state[key], prevState[key]);
      }
    });
  }

  /**
   * Unsubscribe component from all global state
   */
  unsubscribe(componentId: string): void {
    const unsubscribers = this.componentUnsubscribers.get(componentId);
    if (unsubscribers) {
      [...unsubscribers].forEach((unsubscribe) => unsubscribe());
      this.componentUnsubscribers.delete(componentId);
    }

    this.componentSubscriptions.delete(componentId);
    debugLog('element', 'Unsubscribed from global state', { componentId });
  }

  /**
   * Define global actions
   */
  defineActions(actions: StoreActions<GlobalState>): void {
    this.store.defineActions(actions);
  }

  /**
   * Dispatch a global action
   */
  async dispatch(action: string, ...args: unknown[]): Promise<void> {
    await this.store.dispatch(action, ...args);
  }

  /**
   * Add middleware to global store
   */
  use(middleware: any): void {
    this.store.use(middleware);
  }

  /**
   * Get debug information
   */
  getDebugInfo() {
    return {
      ...this.store.getDebugInfo(),
      componentSubscriptions: Object.fromEntries(
        Array.from(this.componentSubscriptions.entries()).map(([id, props]) => [
          id, 
          Array.from(props)
        ])
      ),
      activeUnsubscribers: Object.fromEntries(
        Array.from(this.componentUnsubscribers.entries()).map(([id, unsubscribers]) => [
          id,
          unsubscribers.size
        ])
      )
    };
  }
}

// Export singleton instance
export const globalState = GlobalStateManager.getInstance(); 
