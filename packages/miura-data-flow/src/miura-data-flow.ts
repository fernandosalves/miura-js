// miuraDataFlow main entry point

// Core exports
export { Store, type StoreState, type StoreActions, type StoreMiddleware } from './store';
export { GlobalStateManager, globalState, type GlobalState } from './global-state';

// Middleware exports
export {
  createLoggerMiddleware,
  createPersistenceMiddleware,
  loadPersistedState,
  createApiMiddleware,
  createCacheMiddleware,
  createDevToolsMiddleware
} from './middleware';

// Provider exports
export * from './providers';

// Import for default export
import { Store } from './store';
import { GlobalStateManager, globalState } from './global-state';
import {
  createLoggerMiddleware,
  createPersistenceMiddleware,
  loadPersistedState,
  createApiMiddleware,
  createCacheMiddleware,
  createDevToolsMiddleware
} from './middleware';
import * as providers from './providers';

/**
 * miura Data Flow - Modern State Management
 * 
 * Features:
 * - Reactive state management with subscriptions
 * - Middleware system for logging, persistence, API calls
 * - Global state management
 * - Built-in caching and API integration
 * - Redux DevTools support
 * - TypeScript support
 * - Extensible provider system for connecting to any data source
 * 
 * Usage:
 * 
 * // Create a store
 * const store = new Store({ count: 0, user: null });
 * 
 * // Define actions
 * store.defineActions({
 *   increment: (state) => ({ count: state.count + 1 }),
 *   setUser: (state, user) => ({ user })
 * });
 * 
 * // Add middleware
 * store.use(createLoggerMiddleware());
 * store.use(createPersistenceMiddleware(['user']));
 * 
 * // Subscribe to changes
 * const unsubscribe = store.subscribe((state, prevState) => {
 *   console.log('State changed:', state);
 * });
 * 
 * // Dispatch actions
 * await store.dispatch('increment');
 * await store.dispatch('setUser', { id: '1', name: 'John' });
 * 
 * // Using Data Providers
 * // 1. Register a provider factory (e.g., in your app's entry point)
 * providers.registerProvider('restApi', new providers.RestProviderFactory());
 * 
 * // 2. Create an instance of the provider
 * const apiProvider = providers.createProvider('restApi', { baseUrl: 'https://my-api.com' });
 * 
 * // 3. Use the provider, for example in custom middleware
 * // const user = await apiProvider.get('123', { endpoint: 'users' });
 * 
 * // Global state
 * globalState.set('theme', 'dark');
 * globalState.subscribeTo('my-component', 'theme', (theme) => {
 *   console.log('Theme changed:', theme);
 * });
 */

// Default export for convenience
export default {
  Store,
  GlobalStateManager,
  globalState,
  middleware: {
    createLoggerMiddleware,
    createPersistenceMiddleware,
    loadPersistedState,
    createApiMiddleware,
    createCacheMiddleware,
    createDevToolsMiddleware
  },
  providers: {
    registerProvider: providers.registerProvider,
    createProvider: providers.createProvider,
    factories: {
      RestProviderFactory: providers.RestProviderFactory,
      LocalStorageProviderFactory: providers.LocalStorageProviderFactory,
      IndexedDBProviderFactory: providers.IndexedDBProviderFactory,
      WebSocketProviderFactory: providers.WebSocketProviderFactory,
      // Optional providers (require additional dependencies):
      // GraphQLProviderFactory: providers.GraphQLProviderFactory, // requires graphql-request
      // S3ProviderFactory: providers.S3ProviderFactory, // requires @aws-sdk/client-s3
      // FirebaseProviderFactory: providers.FirebaseProviderFactory, // requires firebase
      // SupabaseProviderFactory: providers.SupabaseProviderFactory, // requires @supabase/supabase-js
      // GrpcWebProviderFactory: providers.GrpcWebProviderFactory, // requires grpc-web
    }
  }
};
