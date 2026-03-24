import type { Meta, StoryObj } from '@storybook/web-components';
import { 
  Store, 
  globalState, 
  createLoggerMiddleware, 
  createPersistenceMiddleware, 
  createCacheMiddleware,
  createDevToolsMiddleware,
  StoreState
} from '@miurajs/miura-data-flow';
import { html } from '@miurajs/miura-element';
import { MiuraElement } from '@miurajs/miura-element';

// Define the store state interface
interface DemoStoreState extends StoreState {
  count: number;
  user: any;
  todos: Array<{ id: number; text: string; completed: boolean }>;
  loading: boolean;
  error: any;
}

const meta: Meta = {
  title: 'miura-data-flow/Data Flow Demo',
  parameters: {
    docs: {
      description: {
        component: `
# miura Data Flow Demo

This story demonstrates the comprehensive state management features of miura Data Flow:

## 🏪 Store Management
- Reactive state management with subscriptions
- Action-based state updates
- Immutable state updates
- Type-safe state access

## 🌍 Global State
- Application-wide state management
- Component-specific subscriptions
- Cross-component communication

## 🔌 Middleware System
- Logger middleware for debugging
- Persistence middleware for localStorage
- Cache middleware for API responses
- DevTools middleware for Redux DevTools

## 📡 Reactive Updates
- Automatic UI updates on state changes
- Selective subscriptions to specific properties
- Performance-optimized change detection

## Usage Examples

\`\`\`typescript
import { Store, globalState, createLoggerMiddleware } from '@miurajs/miura-data-flow';

// Create a store
const store = new Store({ count: 0, user: null });

// Define actions
store.defineActions({
  increment: (state) => ({ count: state.count + 1 }),
  setUser: (state, user) => ({ user })
});

// Add middleware
store.use(createLoggerMiddleware());

// Subscribe to changes
const unsubscribe = store.subscribe((state, prevState) => {
  console.log('State changed:', state);
});

// Global state
globalState.set('theme', 'dark');
globalState.subscribeTo('my-component', 'theme', (theme) => {
  console.log('Theme changed:', theme);
});
\`\`\`
        `
      }
    }
  }
};

export default meta;
type Story = StoryObj;

// Data Flow demo component
class DataFlowDemo extends MiuraElement {
  private store: Store<DemoStoreState>;
  private globalState = globalState;
  private storeEvents: any[] = [];
  private globalEvents: any[] = [];
  private unsubscribeStore: (() => void) | null = null;
  private unsubscribeGlobal: (() => void) | null = null;

  constructor() {
    super();
    this.initializeStore();
    this.setupGlobalState();
  }

  connectedCallback() {
    super.connectedCallback();
    this.setupEventListeners();
  }

  disconnectedCallback() {
    if (this.unsubscribeStore) {
      this.unsubscribeStore();
    }
    if (this.unsubscribeGlobal) {
      this.unsubscribeGlobal();
    }
  }

  private initializeStore() {
    // Create store with initial state
    this.store = new Store<DemoStoreState>({
      count: 0,
      user: null,
      todos: [],
      loading: false,
      error: null
    });

    // Define actions — each receives (state, ...args) and returns Partial<T>
    this.store.defineActions({
      increment: (state) => ({ count: state.count + 1 }),
      decrement: (state) => ({ count: state.count - 1 }),
      setUser: (_state, ...args: unknown[]) => ({ user: args[0] }),
      addTodo: (state, ...args: unknown[]) => ({
        todos: [...state.todos, { id: Date.now(), text: args[0] as string, completed: false }]
      }),
      toggleTodo: (state, ...args: unknown[]) => ({
        todos: state.todos.map(todo =>
          todo.id === (args[0] as number) ? { ...todo, completed: !todo.completed } : todo
        )
      }),
      removeTodo: (state, ...args: unknown[]) => ({
        todos: state.todos.filter(todo => todo.id !== (args[0] as number))
      }),
      setLoading: (_state, ...args: unknown[]) => ({ loading: args[0] as boolean }),
      setError: (_state, ...args: unknown[]) => ({ error: args[0] })
    });

    // Add middleware
    this.store.use(createLoggerMiddleware());
    this.store.use(createPersistenceMiddleware(['user', 'todos']));
    this.store.use(createCacheMiddleware(30000)); // 30 seconds
    this.store.use(createDevToolsMiddleware('DataFlowDemo'));

    // Subscribe to store changes
    this.unsubscribeStore = this.store.subscribe((state, prevState) => {
      this.addStoreEvent('State Updated', { state, prevState });
      this.requestUpdate();
    });
  }

  private setupGlobalState() {
    // Subscribe to global state changes
    this.unsubscribeGlobal = this.globalState.subscribe(
      'data-flow-demo',
      ['theme', 'language', 'notifications'],
      (state, prevState) => {
        this.addGlobalEvent('Global State Updated', { state, prevState });
        this.requestUpdate();
      }
    );
  }

  private setupEventListeners() {
    this.shadowRoot!.addEventListener('click', (e) => {
      const target = (e.composedPath()[0] || e.target) as HTMLElement;
      
      if (target.matches('[data-action="increment"]')) {
        this.store.dispatch('increment');
      } else if (target.matches('[data-action="decrement"]')) {
        this.store.dispatch('decrement');
      } else if (target.matches('[data-action="set-user"]')) {
        this.store.dispatch('setUser', { id: '1', name: 'John Doe', email: 'john@example.com' });
      } else if (target.matches('[data-action="clear-user"]')) {
        this.store.dispatch('setUser', null);
      } else if (target.matches('[data-action="add-todo"]')) {
        const input = this.shadowRoot!.querySelector('[name="todo-input"]') as HTMLInputElement;
        if (input.value.trim()) {
          this.store.dispatch('addTodo', input.value.trim());
          input.value = '';
        }
      } else if (target.matches('[data-action="toggle-theme"]')) {
        const currentTheme = this.globalState.get('theme');
        this.globalState.set('theme', currentTheme === 'light' ? 'dark' : 'light');
      } else if (target.matches('[data-action="set-language"]')) {
        const select = this.shadowRoot!.querySelector('[name="language"]') as HTMLSelectElement;
        this.globalState.set('language', select.value);
      } else if (target.matches('[data-action="add-notification"]')) {
        const notifications = this.globalState.get('notifications') || [];
        const newNotification = {
          id: Date.now().toString(),
          message: `Notification ${notifications.length + 1}`,
          type: ['info', 'success', 'warning', 'error'][Math.floor(Math.random() * 4)] as any
        };
        this.globalState.set('notifications', [...notifications, newNotification]);
      } else if (target.matches('[data-action="clear-notifications"]')) {
        this.globalState.set('notifications', []);
      } else if (target.matches('[data-action="clear-store-events"]')) {
        this.storeEvents = [];
        this.requestUpdate();
      } else if (target.matches('[data-action="clear-global-events"]')) {
        this.globalEvents = [];
        this.requestUpdate();
      } else if (target.matches('[data-action="toggle-todo"]')) {
        const id = parseInt(target.getAttribute('data-id') || '0');
        this.store.dispatch('toggleTodo', id);
      } else if (target.matches('[data-action="remove-todo"]')) {
        const id = parseInt(target.getAttribute('data-id') || '0');
        this.store.dispatch('removeTodo', id);
      }
    });
  }

  private addStoreEvent(type: string, details: any) {
    this.storeEvents.unshift({
      type,
      details,
      timestamp: new Date().toLocaleTimeString()
    });
    
    // Keep only last 10 events
    if (this.storeEvents.length > 10) {
      this.storeEvents = this.storeEvents.slice(0, 10);
    }
  }

  private addGlobalEvent(type: string, details: any) {
    this.globalEvents.unshift({
      type,
      details,
      timestamp: new Date().toLocaleTimeString()
    });
    
    // Keep only last 10 events
    if (this.globalEvents.length > 10) {
      this.globalEvents = this.globalEvents.slice(0, 10);
    }
  }

  template() {
    const storeState = this.store.getState();
    const globalStateData = {
      theme: this.globalState.get('theme'),
      language: this.globalState.get('language'),
      notifications: this.globalState.get('notifications') || []
    };
    
    return html`
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        .section {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          border: 1px solid #e9ecef;
        }
        
        .section h2 {
          margin-top: 0;
          color: #495057;
          border-bottom: 2px solid #007bff;
          padding-bottom: 10px;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #495057;
        }
        
        input, select, textarea {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 14px;
          box-sizing: border-box;
        }
        
        button {
          background: #007bff;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          margin-right: 8px;
          margin-bottom: 8px;
        }
        
        button:hover {
          background: #0056b3;
        }
        
        button.secondary {
          background: #6c757d;
        }
        
        button.secondary:hover {
          background: #545b62;
        }
        
        button.success {
          background: #28a745;
        }
        
        button.success:hover {
          background: #1e7e34;
        }
        
        button.danger {
          background: #dc3545;
        }
        
        button.danger:hover {
          background: #c82333;
        }
        
        .state-display {
          background: #fff;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          padding: 15px;
          margin-bottom: 15px;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          max-height: 200px;
          overflow-y: auto;
        }
        
        .events {
          max-height: 300px;
          overflow-y: auto;
          background: #fff;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          padding: 10px;
        }
        
        .event {
          background: #f8f9fa;
          border-left: 4px solid #007bff;
          padding: 8px;
          margin-bottom: 8px;
          font-size: 12px;
        }
        
        .event.store {
          border-left-color: #28a745;
        }
        
        .event.global {
          border-left-color: #ffc107;
        }
        
        .event-time {
          color: #6c757d;
          font-size: 11px;
        }
        
        .todo-item {
          display: flex;
          align-items: center;
          padding: 8px;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          margin-bottom: 8px;
          background: #fff;
        }
        
        .todo-item.completed {
          opacity: 0.6;
          text-decoration: line-through;
        }
        
        .todo-text {
          flex: 1;
          margin: 0 10px;
        }
        
        .notification {
          padding: 8px 12px;
          border-radius: 4px;
          margin-bottom: 8px;
          font-size: 12px;
        }
        
        .notification.info {
          background: #d1ecf1;
          color: #0c5460;
          border: 1px solid #bee5eb;
        }
        
        .notification.success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        
        .notification.warning {
          background: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
        }
        
        .notification.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
        
        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 10px;
          margin-bottom: 15px;
        }
        
        .stat {
          background: #fff;
          padding: 10px;
          border-radius: 4px;
          text-align: center;
          border: 1px solid #dee2e6;
        }
        
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #007bff;
        }
        
        .stat-label {
          font-size: 12px;
          color: #6c757d;
          margin-top: 5px;
        }
      </style>
      
      <div class="container">
        <div class="section">
          <h2>🏪 Store Management</h2>
          
          <div class="stats">
            <div class="stat">
              <div class="stat-value">${storeState.count}</div>
              <div class="stat-label">Count</div>
            </div>
            <div class="stat">
              <div class="stat-value">${storeState.todos.length}</div>
              <div class="stat-label">Todos</div>
            </div>
            <div class="stat">
              <div class="stat-value">${storeState.todos.filter(t => t.completed).length}</div>
              <div class="stat-label">Completed</div>
            </div>
            <div class="stat">
              <div class="stat-value">${storeState.user ? 'Yes' : 'No'}</div>
              <div class="stat-label">User</div>
            </div>
          </div>
          
          <div class="form-group">
            <button data-action="increment">Increment</button>
            <button data-action="decrement">Decrement</button>
          </div>
          
          <div class="form-group">
            <button data-action="set-user" class="success">Set User</button>
            <button data-action="clear-user" class="danger">Clear User</button>
          </div>
          
          <div class="form-group">
            <label>Add Todo:</label>
            <div style="display: flex; gap: 8px;">
              <input type="text" name="todo-input" placeholder="Enter todo...">
              <button data-action="add-todo">Add</button>
            </div>
          </div>
          
          <div class="state-display">
            <strong>Store State:</strong><br>
            <pre>${JSON.stringify(storeState, null, 2)}</pre>
          </div>
        </div>
        
        <div class="section">
          <h2>🌍 Global State</h2>
          
          <div class="form-group">
            <label>Theme:</label>
            <button data-action="toggle-theme">
              Toggle Theme (${globalStateData.theme})
            </button>
          </div>
          
          <div class="form-group">
            <label>Language:</label>
            <select name="language">
              <option value="en" ${globalStateData.language === 'en' ? 'selected' : ''}>English</option>
              <option value="es" ${globalStateData.language === 'es' ? 'selected' : ''}>Spanish</option>
              <option value="fr" ${globalStateData.language === 'fr' ? 'selected' : ''}>French</option>
              <option value="de" ${globalStateData.language === 'de' ? 'selected' : ''}>German</option>
            </select>
            <button data-action="set-language">Set Language</button>
          </div>
          
          <div class="form-group">
            <button data-action="add-notification" class="success">Add Notification</button>
            <button data-action="clear-notifications" class="secondary">Clear All</button>
          </div>
          
          <div class="state-display">
            <strong>Global State:</strong><br>
            <pre>${JSON.stringify(globalStateData, null, 2)}</pre>
          </div>
        </div>
        
        <div class="section">
          <h2>📝 Todo List</h2>
          ${storeState.todos.length === 0 ? 
            html`<p style="color: #6c757d; text-align: center;">No todos yet. Add one above!</p>` :
            storeState.todos.map(todo => html`
              <div class="todo-item ${todo.completed ? 'completed' : ''}">
                <button data-action="toggle-todo" data-id="${todo.id}" class="secondary">
                  ${todo.completed ? '✓' : '○'}
                </button>
                <span class="todo-text">${todo.text}</span>
                <button data-action="remove-todo" data-id="${todo.id}" class="danger">×</button>
              </div>
            `)
          }
        </div>
        
        <div class="section">
          <h2>🔔 Notifications</h2>
          ${globalStateData.notifications.length === 0 ? 
            html`<p style="color: #6c757d; text-align: center;">No notifications</p>` :
            globalStateData.notifications.map(notification => html`
              <div class="notification ${notification.type}">
                ${notification.message}
              </div>
            `)
          }
        </div>
        
        <div class="section" style="grid-column: 1 / -1;">
          <h2>📊 Store Events</h2>
          <button data-action="clear-store-events" class="secondary">Clear Events</button>
          <div class="events">
            ${this.storeEvents.length === 0 ? 
              html`<div style="color: #6c757d; text-align: center; padding: 20px;">No store events yet</div>` :
              this.storeEvents.map(event => html`
                <div class="event store">
                  <div class="event-time">${event.timestamp}</div>
                  <strong>${event.type}</strong><br>
                  <pre style="font-size: 11px; margin: 5px 0 0 0; white-space: pre-wrap;">${JSON.stringify(event.details, null, 2)}</pre>
                </div>
              `)
            }
          </div>
        </div>
        
        <div class="section" style="grid-column: 1 / -1;">
          <h2>🌍 Global Events</h2>
          <button data-action="clear-global-events" class="secondary">Clear Events</button>
          <div class="events">
            ${this.globalEvents.length === 0 ? 
              html`<div style="color: #6c757d; text-align: center; padding: 20px;">No global events yet</div>` :
              this.globalEvents.map(event => html`
                <div class="event global">
                  <div class="event-time">${event.timestamp}</div>
                  <strong>${event.type}</strong><br>
                  <pre style="font-size: 11px; margin: 5px 0 0 0; white-space: pre-wrap;">${JSON.stringify(event.details, null, 2)}</pre>
                </div>
              `)
            }
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('data-flow-demo', DataFlowDemo);

export const Default: Story = {
  render: () => `
    <data-flow-demo></data-flow-demo>
  `
};

export const WithInitialData: Story = {
  render: () => `
    <data-flow-demo></data-flow-demo>
  `,
  play: async () => {
    // Initialize with some data
    const { globalState } = await import('@miurajs/miura-data-flow');
    
    // Set initial global state
    globalState.set('theme', 'dark');
    globalState.set('language', 'es');
    globalState.set('notifications', [
      { id: '1', message: 'Welcome to miura Data Flow!', type: 'success' },
      { id: '2', message: 'This is a demo notification', type: 'info' }
    ]);
  }
}; 