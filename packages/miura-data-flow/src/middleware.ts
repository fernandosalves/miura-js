import { StoreMiddleware, StoreState } from './store';

/**
 * Logger middleware for debugging
 */
export function createLoggerMiddleware(): StoreMiddleware {
  return {
    name: 'logger',
    before: (action, args, state) => {
      console.group(`🔄 Action: ${action}`);
      console.log('Arguments:', args);
      console.log('Current State:', state);
    },
    after: (action, args, state, result) => {
      console.log('New State:', state);
      console.log('Result:', result);
      console.groupEnd();
    },
    error: (action, args, error) => {
      console.error(`❌ Action Error: ${action}`, error);
      console.groupEnd();
    }
  };
}

/**
 * Persistence middleware for Web Storage.
 */
export interface PersistenceMiddlewareOptions {
  storageKey?: string;
  storage?: Storage;
}

function resolvePersistenceOptions(storageKeyOrOptions?: string | PersistenceMiddlewareOptions): Required<PersistenceMiddlewareOptions> {
  if (typeof storageKeyOrOptions === 'string') {
    return {
      storageKey: storageKeyOrOptions,
      storage: localStorage
    };
  }

  return {
    storageKey: storageKeyOrOptions?.storageKey ?? 'miura-store',
    storage: storageKeyOrOptions?.storage ?? localStorage
  };
}

export function createPersistenceMiddleware(
  keys: string[],
  storageKeyOrOptions: string | PersistenceMiddlewareOptions = 'miura-store'
): StoreMiddleware {
  const options = resolvePersistenceOptions(storageKeyOrOptions);

  return {
    name: 'persistence',
    after: (action, args, state) => {
      // Persist relevant keys after every action
      try {
        const toPersist: Partial<StoreState> = {};
        keys.forEach(key => {
          if (key in state) {
            toPersist[key] = state[key];
          }
        });
        options.storage.setItem(options.storageKey, JSON.stringify(toPersist));
      } catch (error) {
        console.warn('Failed to persist state:', error);
      }
    }
  };
}

/**
 * Loads persisted state from localStorage.
 * Call this to get initial state when creating a store:
 *   const persisted = loadPersistedState(['user', 'theme']);
 *   const store = new Store({ ...defaults, ...persisted });
 */
export function loadPersistedState(
  keys: string[],
  storageKeyOrOptions: string | PersistenceMiddlewareOptions = 'miura-store'
): Partial<StoreState> {
  const options = resolvePersistenceOptions(storageKeyOrOptions);

  try {
    const persisted = options.storage.getItem(options.storageKey);
    if (persisted) {
      const parsed = JSON.parse(persisted);
      const result: Partial<StoreState> = {};
      keys.forEach(key => {
        if (key in parsed) {
          result[key] = parsed[key];
        }
      });
      return result;
    }
  } catch (error) {
    console.warn('Failed to load persisted state:', error);
  }
  return {};
}

/**
 * API middleware for automatic API calls
 */
export function createApiMiddleware(apiConfig: {
  baseURL: string;
  headers?: Record<string, string>;
  timeout?: number;
}): StoreMiddleware & { fetch: (endpoint: string, options?: { method?: string; data?: unknown }) => Promise<unknown> } {
  const apiFetch = async (endpoint: string, options?: { method?: string; data?: unknown }): Promise<unknown> => {
    const method = options?.method || 'GET';
    const data = options?.data;

    const response = await fetch(`${apiConfig.baseURL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...apiConfig.headers
      },
      body: data ? JSON.stringify(data) : undefined,
      signal: apiConfig.timeout ? AbortSignal.timeout(apiConfig.timeout) : undefined
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  };

  return {
    name: 'api',
    fetch: apiFetch
  };
}

/**
 * Cache middleware for API responses
 */
export function createCacheMiddleware(ttl = 5 * 60 * 1000): StoreMiddleware {
  const cache = new Map<string, { data: unknown; timestamp: number }>();
  
  return {
    name: 'cache',
    before: async (action, args, state) => {
      if (action.startsWith('api_')) {
        const cacheKey = `${action}_${JSON.stringify(args)}`;
        const cached = cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < ttl) {
          // Return cached data
          const endpoint = action.replace('api_', '');
          (state as any)[`${endpoint}_data`] = cached.data;
          (state as any)[`${endpoint}_loading`] = false;
          (state as any)[`${endpoint}_error`] = null;
          return;
        }
      }
    },
    after: (action, args, state) => {
      if (action.startsWith('api_')) {
        const cacheKey = `${action}_${JSON.stringify(args)}`;
        const endpoint = action.replace('api_', '');
        const data = (state as any)[`${endpoint}_data`];
        
        if (data) {
          cache.set(cacheKey, { data, timestamp: Date.now() });
        }
      }
    }
  };
}

/**
 * DevTools middleware for Redux DevTools integration
 */
export function createDevToolsMiddleware(storeName = 'miuraStore'): StoreMiddleware {
  return {
    name: 'devtools',
    after: (action, args, state) => {
      if (typeof window !== 'undefined' && (window as any).__REDUX_DEVTOOLS_EXTENSION__) {
        (window as any).__REDUX_DEVTOOLS_EXTENSION__.send(
          { type: action, payload: args },
          state,
          storeName
        );
      }
    }
  };
} 
