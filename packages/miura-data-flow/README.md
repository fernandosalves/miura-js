# miura Data Flow

Modern, reactive state management for miura applications. Combines the best of Redux, Zustand, and modern patterns with zero boilerplate and maximum performance.

## Features

- **🚀 Reactive State Management** - Automatic updates when state changes
- **🔧 Middleware System** - Extensible with logging, persistence, API integration
- **🌍 Global State** - Application-wide state management
- **💾 Built-in Caching** - Intelligent caching with TTL
- **🔌 API Integration** - Automatic API calls with state updates
- **🛠️ DevTools Support** - Redux DevTools integration
- **📝 TypeScript First** - Full type safety and IntelliSense
- **⚡ Performance Optimized** - Efficient subscriptions and updates

## Quick Start

```typescript
import { Store, globalState, createLoggerMiddleware } from '@miura/miura-data-flow';

// Create a store
const store = new Store({ count: 0, user: null });

// Add middleware
store.use(createLoggerMiddleware());

// Define actions
store.defineActions({
  increment: (state) => ({ count: state.count + 1 }),
  setUser: (state, user) => ({ user })
});

// Subscribe to changes
const unsubscribe = store.subscribe((state, prevState) => {
  console.log('State changed:', state);
});

// Dispatch actions
await store.dispatch('increment');
await store.dispatch('setUser', { id: '1', name: 'John' });
```

## Core Concepts

### Store

The main state container that manages your application state.

```typescript
import { Store } from '@miura/miura-data-flow';

interface AppState {
  count: number;
  user: User | null;
  todos: Todo[];
}

const store = new Store<AppState>({
  count: 0,
  user: null,
  todos: []
});
```

### Actions

Define how your state can be updated.

```typescript
store.defineActions({
  // Simple state update
  increment: (state) => ({ count: state.count + 1 }),
  
  // With parameters
  setUser: (state, user: User) => ({ user }),
  
  // Async actions
  async fetchUser: async (state, userId: string) => {
    const user = await fetch(`/api/users/${userId}`).then(r => r.json());
    return { user };
  },
  
  // Complex updates
  addTodo: (state, todo: Todo) => ({
    todos: [...state.todos, todo]
  })
});
```

### Subscriptions

React to state changes automatically.

```typescript
// Subscribe to all changes
const unsubscribe = store.subscribe((state, prevState) => {
  console.log('State changed:', state);
});

// Subscribe to specific property
const unsubscribeCount = store.subscribeTo('count', (count, prevCount) => {
  console.log(`Count changed from ${prevCount} to ${count}`);
});

// Subscribe with selector
const unsubscribeUser = store.subscribe(
  (state, prevState) => {
    console.log('User changed:', state.user);
  },
  (state) => state.user // Only trigger when user changes
);
```

## Middleware System

### Built-in Middleware

#### Logger Middleware

```typescript
import { createLoggerMiddleware } from '@miura/miura-data-flow';

store.use(createLoggerMiddleware());
// Logs all actions and state changes to console
```

#### Persistence Middleware

```typescript
import { createPersistenceMiddleware } from '@miura/miura-data-flow';

store.use(createPersistenceMiddleware(['user', 'settings']));
// Automatically saves/loads specified properties to localStorage
```

#### API Middleware

```typescript
import { createApiMiddleware } from '@miura/miura-data-flow';

store.use(createApiMiddleware({
  baseURL: 'https://api.example.com',
  headers: {
    'Authorization': 'Bearer token'
  },
  timeout: 5000
}));

// Now you can dispatch API actions
store.defineActions({
  api_fetchUsers: () => {}, // Will automatically fetch /fetchUsers
  api_createUser: () => {}  // Will automatically POST to /createUser
});

await store.dispatch('api_fetchUsers');
await store.dispatch('api_createUser', { method: 'POST', data: userData });
```

#### Cache Middleware

```typescript
import { createCacheMiddleware } from '@miura/miura-data-flow';

store.use(createCacheMiddleware(5 * 60 * 1000)); // 5 minutes TTL
// Caches API responses for 5 minutes
```

#### DevTools Middleware

```typescript
import { createDevToolsMiddleware } from '@miura/miura-data-flow';

store.use(createDevToolsMiddleware('MyApp'));
// Enables Redux DevTools integration
```

### Redux DevTools Integration

Redux DevTools is a powerful browser extension that provides real-time debugging for state management. Even though miura Data Flow isn't Redux, we integrate with it because it's the industry standard for state debugging.

#### What Redux DevTools Provides:

- **🔍 State Inspector** - Real-time visualization of your entire state tree
- **📜 Action Monitor** - Complete log of all dispatched actions with timing
- **⏰ Time-travel Debugging** - Jump back to any previous state
- **📊 Diff View** - Before/after comparison with highlighted changes
- **⚡ Performance Metrics** - Action timing and state size monitoring

#### Setup Instructions:

1. **Install the Browser Extension:**
   - **Chrome**: [Redux DevTools Extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)
   - **Firefox**: [Redux DevTools Extension](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)

2. **Enable in Your Code:**
   ```typescript
   import { createDevToolsMiddleware } from '@miura/miura-data-flow';
   
   store.use(createDevToolsMiddleware('MyApp'));
   ```

3. **Open DevTools:**
   - Press `F12` → Click the **Redux** tab
   - Or right-click → **Inspect** → **Redux** tab

#### What You'll See:

When you dispatch actions, they appear in DevTools like this:

```
Action: increment
Payload: []
State Before: { count: 0, user: null }
State After:  { count: 1, user: null }

Action: setUser  
Payload: [{ id: '1', name: 'John' }]
State Before: { count: 1, user: null }
State After:  { count: 1, user: { id: '1', name: 'John' } }
```

#### Complete Example:

```typescript
import { Store, createDevToolsMiddleware } from '@miura/miura-data-flow';

// Create store
const store = new Store({
  user: null,
  todos: [],
  theme: 'light'
});

// Enable DevTools integration
store.use(createDevToolsMiddleware('TodoApp'));

// Define actions
store.defineActions({
  login: (state, user) => ({ user }),
  addTodo: (state, todo) => ({ todos: [...state.todos, todo] }),
  toggleTheme: (state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })
});

// These actions will now be visible in Redux DevTools:
await store.dispatch('login', { id: '1', name: 'John' });
await store.dispatch('addTodo', { id: '1', text: 'Buy milk' });
await store.dispatch('toggleTheme');
```

#### DevTools Features:

**State Inspector:**
- View your entire state tree in real-time
- Expand/collapse nested objects
- Search through state properties

**Action Monitor:**
- See all dispatched actions with timestamps
- Inspect action payloads and arguments
- Monitor action execution time

**Time-travel Debugging:**
- Jump to any previous state
- Replay actions step by step
- Compare states at different points in time

**Performance Monitoring:**
- Track action execution time
- Monitor state size changes
- Identify performance bottlenecks

#### Why Use Redux DevTools?

Even though we're not using Redux, Redux DevTools has become the **de facto standard** for state debugging because:

- **Universal Adoption** - Most developers are familiar with it
- **Rich Features** - Time-travel, diff view, performance metrics
- **Browser Integration** - No additional setup required
- **Community Support** - Well-maintained and documented

It's like having a **super-powered console.log** that shows you exactly what's happening with your state in real-time! 🚀

### Debug Information

```typescript
// Get debug info about your store
console.log(store.getDebugInfo());
console.log(globalState.getDebugInfo());
```

## API Reference

### Store

- `new Store<T>(initialState: T)` - Create a new store
- `store.getState(): T` - Get current state
- `store.get<K>(key: K): T[K]` - Get specific property
- `store.setState(updater)` - Update state
- `store.defineActions(actions)` - Define actions
- `store.dispatch(action, ...args)` - Execute action
- `store.subscribe(callback, selector?)` - Subscribe to changes
- `store.subscribeTo(key, callback)` - Subscribe to specific property
- `store.use(middleware)` - Add middleware

### Global State

- `globalState.get(key)` - Get global property
- `globalState.set(key, value)` - Set global property
- `globalState.subscribe(componentId, properties, callback)` - Subscribe
- `globalState.subscribeTo(componentId, key, callback)` - Subscribe to property
- `globalState.dispatch(action, ...args)` - Dispatch global action

### Middleware

- `createLoggerMiddleware()` - Console logging
- `createPersistenceMiddleware(keys, storageKey)` - localStorage persistence
- `createApiMiddleware(config)` - API integration
- `createCacheMiddleware(ttl)` - Response caching
- `createDevToolsMiddleware(name)` - Redux DevTools

## Best Practices

1. **Use TypeScript** - Define interfaces for your state
2. **Subscribe Selectively** - Only subscribe to what you need
3. **Unsubscribe Always** - Prevent memory leaks
4. **Use Actions** - Don't mutate state directly
5. **Middleware for Side Effects** - Keep actions pure
6. **Global State Sparingly** - Use for truly global data
7. **Batch Updates** - Group related state changes

## Examples

See the [examples directory](./examples) for complete working examples.

---

**miura Data Flow** - Modern state management that just works! 🚀

### Custom Middleware

```typescript
import { StoreMiddleware } from '@miura/miura-data-flow';

const analyticsMiddleware: StoreMiddleware = {
  name: 'analytics',
  before: (action, args, state) => {
    // Track action before execution
    analytics.track('action_started', { action, args });
  },
  after: (action, args, state, result) => {
    // Track action completion
    analytics.track('action_completed', { action, result });
  },
  error: (action, args, error) => {
    // Track errors
    analytics.track('action_error', { action, error });
  }
};

store.use(analyticsMiddleware);
```

## Global State Management

### Using Global State

```typescript
import { globalState } from '@miura/miura-data-flow';

// Set global properties
globalState.set('theme', 'dark');
globalState.set('user', { id: '1', name: 'John' });

// Get global properties
const theme = globalState.get('theme');
const user = globalState.get('user');

// Subscribe to global state changes
const unsubscribe = globalState.subscribeTo('my-component', 'theme', (theme) => {
  console.log('Theme changed:', theme);
});
```

### Global State in Components

```typescript
import { MiuraElement, html } from '@miura/miura-element';
import { globalState } from '@miura/miura-data-flow';

class ThemeToggle extends MiuraElement {
  static properties = {
    theme: { type: String, default: 'light' }
  };

  connectedCallback() {
    super.connectedCallback();
    
    // Subscribe to global theme changes
    this.unsubscribeTheme = globalState.subscribeTo(
      this.tagName,
      'theme',
      (theme) => {
        this.theme = theme;
        this.requestUpdate();
      }
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribeTheme?.();
  }

  toggleTheme() {
    const newTheme = this.theme === 'light' ? 'dark' : 'light';
    globalState.set('theme', newTheme);
  }

  render() {
    return html`
      <button @click=${this.toggleTheme}>
        Current theme: ${this.theme}
      </button>
    `;
  }
}
```

## Integration with miura Framework

### Framework Setup

```typescript
import { Store, createApiMiddleware, createCacheMiddleware } from '@miura/miura-data-flow';

class miuraFramework {
  private store: Store;

  constructor() {
    // Initialize store with app state
    this.store = new Store({
      user: null,
      settings: {},
      notifications: []
    });

    // Add middleware for API and caching
    this.store.use(createApiMiddleware({
      baseURL: process.env.API_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    }));
    
    this.store.use(createCacheMiddleware());
    
    // Define global actions
    this.store.defineActions({
      setUser: (state, user) => ({ user }),
      addNotification: (state, notification) => ({
        notifications: [...state.notifications, notification]
      })
    });
  }

  // Expose store to components
  getStore() {
    return this.store;
  }
}
```

### Component Integration

```typescript
class MyComponent extends MiuraElement {
  // Define global properties this component uses
  global() {
    return {
      user: null,
      theme: 'light'
    };
  }

  connected() {
    // Subscribe to global state
    this.unsubscribeUser = globalState.subscribeTo(
      this.tagName,
      'user',
      (user) => this.handleUserChange(user)
    );
  }

  disconnected() {
    this.unsubscribeUser?.();
  }

  handleUserChange(user) {
    // React to global user changes
    this.requestUpdate();
  }
}
```

## Performance Optimization

### Selective Subscriptions

```typescript
// Only subscribe to what you need
const unsubscribe = store.subscribe(
  (state, prevState) => {
    // Only trigger when user.todos changes
  },
  (state) => state.user?.todos
);
```

### Batch Updates

```typescript
// Multiple updates in one action
store.defineActions({
  updateUserProfile: (state, updates) => ({
    user: { ...state.user, ...updates },
    lastUpdated: Date.now()
  })
});
```

### Memory Management

```typescript
// Always unsubscribe to prevent memory leaks
class MyComponent {
  connectedCallback() {
    this.unsubscribe = store.subscribe(this.handleStateChange);
  }

  disconnectedCallback() {
    this.unsubscribe(); // Important!
  }
}
```

## Debugging

### Enable Debug Logging

```typescript
import { enableDebug } from '@miura/miura-render';

enableDebug({
  element: true, // Shows data flow logs
});
```

### DevTools Integration

```typescript
// Install Redux DevTools browser extension
store.use(createDevToolsMiddleware('MyApp'));
```

### Debug Information
