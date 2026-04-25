# MiuraFramework 🚀

**The Declarative Framework Base Class** - Extend `MiuraFramework` to create your application with static configurations, making framework setup as simple as class inheritance.

## 🌟 What Makes MiuraFramework Special?

`MiuraFramework` is a **declarative base class** that you extend to create your application. All configuration is done through static properties, making it incredibly clean and intuitive!

### ✨ Key Features

- **📝 Declarative Configuration** - All setup done through static properties
- **🏊‍♂️ Data Lake Architecture** - Centralized data reservoir with streaming
- **📦 Dynamic Component Loading** - Components loaded on-demand
- **🔌 Plugin System** - Extensible framework capabilities
- **📊 Performance Telemetry** - Built-in performance monitoring
- **🧭 Integrated Debug Runtime** - Optional overlay, diagnostics, and component layers in development
- **🔄 App Lifecycle Management** - Birth, growth, and cleanup phases
- **🚌 Event Bus with Priority Queues** - Advanced event management
- **🌐 Global Framework Instance** - Accessible via `window.miura[AppName]`

## 🚀 Quick Start

### Basic App Setup

```typescript
import { MiuraFramework } from '@miurajs/miura-framework';
import { MiuraElement, html } from '@miurajs/miura-element';

// Your components
class MyHeader extends MiuraElement {
  static tagName = 'my-header';
  template() {
    return html`<header>🚀 My App</header>`;
  }
}

class MyContent extends MiuraElement {
  static tagName = 'my-content';
  template() {
    return html`<main>Welcome to my app!</main>`;
  }
}

// Your main app class
class MyApp extends MiuraFramework {
  static tagName = 'my-app';
  
  // Framework configuration
  static config = {
    appName: 'MyAwesomeApp',
    version: '1.0.0',
    environment: 'development' as const,
    debug: true,
    performance: true,
    debugger: {
      overlay: true,
      layers: true,
      performance: true
    }
  };
  
  // Initial data lake data
  static dataLake = {
    'app:settings': { theme: 'light' },
    'user:preferences': { notifications: true }
  };
  
  // Component definitions
  static components = {
    'my-header': async () => MyHeader,
    'my-content': async () => MyContent
  };
  
  // Router configuration
  static router = [
    { path: '/', component: 'my-content' },
    { path: '/about', component: 'my-about' }
  ];
  
  // Plugin definitions
  static plugins = [
    {
      name: 'analytics',
      version: '1.0.0',
      install(framework) {
        framework.eventBus.on('component:registered', (event) => {
          console.log('Component registered:', event.data.name);
        });
      }
    }
  ];
  
  // App template
  template() {
    return html`
      <div class="app">
        <my-header></my-header>
        <my-content></my-content>
      </div>
    `;
  }
}

// Register your app
customElements.define(MyApp.tagName, MyApp);

// Use in HTML
// <my-app></my-app>
```

When `debug` is enabled and the environment is not production, `MiuraFramework` can enable the shared debugger runtime for the whole app. That gives you a draggable error overlay plus in-page component layers without adding separate bootstrap code.

That means a framework config like this is enough for most projects:

```typescript
static config = {
  environment: 'development' as const,
  debug: true,
  debugger: {
    overlay: true,
    layers: true,
    performance: true
  }
};
```

Production builds should keep `environment: 'production'`, which prevents the framework from auto-enabling the debugger runtime.

### Advanced Configuration

```typescript
class MyApp extends MiuraFramework {
  static tagName = 'my-app';
  
  static config = {
    appName: 'MyApp',
    version: '1.0.0',
    environment: 'production' as const,
    debug: false,
    performance: true,
    dataLake: {
      enabled: true,
      persistence: true,
      streaming: true,
      maxSize: 5000,
      ttl: 7200000 // 2 hours
    },
    router: {
      enabled: true,
      mode: 'history' as const,
      base: '/app',
      fallback: '/404'
    },
    ui: {
      theme: 'dark',
      locale: 'en-US',
      components: ['@miurajs/miura-ui']
    },
    telemetry: {
      enabled: true,
      endpoint: 'https://analytics.myapp.com',
      sampleRate: 0.1
    },
    globalState: {
      user: null,
      theme: 'dark',
      notifications: []
    }
  };
  
  static dataLake = {
    'app:settings': { theme: 'dark', locale: 'en-US' },
    'user:preferences': { notifications: true, sound: false },
    'cache:api': { ttl: 300000 } // 5 minutes
  };
  
  static components = {
    'my-header': async () => import('./components/my-header.js'),
    'my-content': async () => import('./components/my-content.js'),
    'my-footer': async () => import('./components/my-footer.js'),
    'my-sidebar': async () => import('./components/my-sidebar.js')
  };
  
  static router = [
    {
      path: '/',
      component: 'my-content',
      renderZone: '#main-content'
    },
    {
      path: '/dashboard',
      component: 'my-dashboard',
      renderZone: '#main-content',
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      component: 'my-profile',
      renderZone: '#main-content',
      meta: { requiresAuth: true }
    }
  ];
  
  static plugins = [
    {
      name: 'analytics',
      version: '1.0.0',
      install(framework) {
        framework.eventBus.on('component:registered', (event) => {
          analytics.track('component_registered', event.data);
        });
      }
    },
    {
      name: 'error-tracking',
      version: '1.0.0',
      install(framework) {
        framework.eventBus.on('framework:error', (event) => {
          errorTracker.captureException(event.data.error);
        });
      }
    }
  ];
  
  template() {
    return html`
      <div class="app-container">
        <my-header></my-header>
        <div class="main-layout">
          <my-sidebar></my-sidebar>
          <div id="main-content">
            <my-content></my-content>
          </div>
        </div>
        <my-footer></my-footer>
      </div>
    `;
  }
  
  async connectedCallback() {
    await super.connectedCallback();
    
    // Listen to framework events
    this.eventBus.on('framework:ready', (event) => {
      console.log('🎉 App is ready!', event);
      
      // Access data lake
      const settings = this.data.get('app:settings');
      console.log('📊 App settings:', settings);
      
      // Get framework statistics
      const stats = this.getStats();
      console.log('📊 Framework stats:', stats);
    });
  }
}
```

### Plugin Lifecycle Events

During startup and teardown the framework emits lifecycle events you can listen to with `eventBus`:

| Event | When it fires |
|-------|----------------|
| `plugin:installing` | Right before a plugin's `install` hook runs |
| `plugin:installed` | After a plugin has finished installing |
| `plugin:install-failed` | When a plugin throws during install (includes `error` payload) |
| `plugin:uninstalling` | Right before `uninstall` is invoked |
| `plugin:uninstalled` | After successful teardown |
| `plugin:uninstall-failed` | When teardown throws |

Both `install` and `uninstall` hooks can return promises; the framework awaits them so async setup/cleanup is supported.

### Router Lifecycle & Navigation Helpers

- `this.navigate('/path', options)` – push navigation (hash/history/memory aware)
- `this.replaceRoute('/path')` – replace current entry
- `this.goBack()` / `this.goForward()` – history traversal
- Router events emitted on the framework `eventBus`: `router:setup`, `router:navigating`, `router:navigated`, `router:blocked`, `router:not-found`, `router:error`, and `router:rendered` (includes DOM element reference).

### Route Context Injection

Mounted components receive route context automatically:

```ts
class UserProfile extends MiuraElement {
  routeContext?: {
    params: Record<string, string>;
    query: URLSearchParams;
    hash: string;
    data: Record<string, unknown>;
    loaders: {
      status: 'idle' | 'pending' | 'resolved' | 'rejected';
      entries: Record<string, { status: string; data?: unknown; error?: unknown }>;
      error?: unknown;
    };
  };

  template() {
    const { params, data, loaders, query } = this.routeContext ?? {
      params: {},
      data: {},
      loaders: { status: 'idle', entries: {} },
      query: new URLSearchParams(),
    };
    return html`
      <h1>User ${params.id}</h1>
      <p>Loader status: ${loaders.status}</p>
      <pre>${JSON.stringify(data)}</pre>
    `;
  }
}
```

Route components can also implement lifecycle hooks. These are especially useful
now that Miura reuses matching route component instances across param/query
changes:

```ts
class UserProfile extends MiuraElement {
  onRouteEnter(context: RouteRenderContext) {
    // Mounted for the route.
  }

  onRouteUpdate(context: RouteRenderContext, previous: RouteContext | null) {
    // Same instance reused for another matching route context.
  }

  onRouteLeave(context: RouteContext) {
    // About to be removed from its route zone or outlet.
  }
}
```

Use these hooks for transitions, focus, scroll restoration, analytics, or
route-scoped cleanup. `routeContext` is assigned on every routed component, even
when the class only declares it at the TypeScript level.

## 🏊‍♂️ Data Lake Architecture

The Data Lake is configured declaratively and automatically loaded on startup.

```typescript
class MyApp extends MiuraFramework {
  // Initial data lake data
  static dataLake = {
    'app:settings': { theme: 'light', locale: 'en' },
    'user:preferences': { notifications: true, sound: false },
    'cache:api': { ttl: 300000 }, // 5 minutes
    'session:data': { ttl: 3600000 } // 1 hour
  };
  
  async connectedCallback() {
    await super.connectedCallback();
    
    // Data is automatically loaded from static dataLake
    const settings = this.data.get('app:settings');
    
    // Subscribe to changes
    this.data.subscribe('user:preferences', (prefs) => {
      console.log('Preferences updated:', prefs);
    });
  }
}
```

## 📦 Dynamic Component Loading

Components are loaded on-demand using dynamic imports.

```typescript
class MyApp extends MiuraFramework {
  // Component definitions with dynamic imports
  static components = {
    'my-header': async () => import('./components/my-header.js'),
    'my-content': async () => import('./components/my-content.js'),
    'my-dashboard': async () => import('./components/my-dashboard.js'),
    'my-profile': async () => import('./components/my-profile.js')
  };
  
  // Components are automatically registered when the framework initializes
  // They're loaded only when needed (lazy loading)
}
```

## 🔌 Plugin System

Plugins are defined declaratively and automatically installed with full lifecycle events.

```typescript
class MyApp extends MiuraFramework {
  static plugins = [
    {
      name: 'analytics',
      version: '1.0.0',
      install(framework) {
        const offRegistered = framework.eventBus.on('component:registered', (event) => {
          analytics.track('component_registered', event.data);
        });
        
        const offReady = framework.eventBus.on('framework:ready', () => {
          analytics.track('app_ready');
        });
        
        // Set up analytics tracking
        framework.data.set('plugin:analytics:cleanup', () => {
          offRegistered();
          offReady();
        });
      },
      uninstall(framework) {
        framework.data.get('plugin:analytics:cleanup')?.();
      }
    },
    {
      name: 'error-tracking',
      version: '1.0.0',
      dependencies: ['analytics'],
      install(framework) {
        const offError = framework.eventBus.on('framework:error', (event) => {
          errorTracker.captureException(event.data.error);
        });
        framework.data.set('plugin:error-tracking:cleanup', offError);
      },
      uninstall(framework) {
        framework.data.get('plugin:error-tracking:cleanup')?.();
      }
    }
  ];
}
```

## 🛣️ Router Configuration

Router configuration is declarative and now powered by the built-in MiuraRouter. Define paths, zones, guards, and loaders directly on the static `router` property and the framework will lazy-load components, invoke guards, hydrate data, and mount elements into DOM zones for you.

```typescript
class MyApp extends MiuraFramework {
  static router = [
    {
      path: '/',
      component: 'my-home',
      renderZone: '#main-content'
    },
    {
      path: '/dashboard',
      component: 'my-dashboard',
      renderZone: '#main-content',
      meta: { 
        requiresAuth: true,
        title: ({ data }) => `Dashboard (${data.stats?.total ?? 0})`
      },
      guards: [async ({ data }) => data.user?.isAdmin || '/login'],
      loaders: [
        async () => ({ stats: await fetchStats() }),
        {
          key: 'announcements',
          optional: true,
          load: async () => fetchAnnouncements()
        }
      ]
    },
    {
      path: '/profile/:id',
      component: 'my-profile',
      renderZone: '#main-content',
      meta: { 
        requiresAuth: true,
        title: 'User Profile'
      }
    },
    {
      path: '/settings',
      component: 'my-settings',
      renderZone: '#main-content',
      meta: { 
        requiresAuth: true,
        requiresAdmin: true
      }
    }
  ];
}
```

`meta.title` is applied automatically by `MiuraFramework`, and named loaders are exposed under `routeContext.data.<key>` with per-loader state in `routeContext.loaders`.

## 📊 Performance Monitoring

Built-in performance tracking with declarative configuration.

```typescript
class MyApp extends MiuraFramework {
  static config = {
    // ... other config
    performance: true // Enable performance monitoring
  };
  
  async connectedCallback() {
    await super.connectedCallback();
    
    // Performance metrics are automatically collected
    const metrics = this.performance.getMetrics();
    const slowest = this.performance.getSlowestMetrics(5);
    
    // Start custom timers
    const timer = this.performance.startTimer('custom-operation');
    // ... do work ...
    timer(); // Records the duration
  }
}
```

## 🔄 App Lifecycle

Lifecycle management is automatic with event-driven hooks.

```typescript
class MyApp extends MiuraFramework {
  async connectedCallback() {
    await super.connectedCallback();
    
    // Listen to lifecycle events
    this.lifecycle.on('running', (event) => {
      console.log('App is running!', event);
    });
    
    this.lifecycle.on('stopping', (event) => {
      console.log('App is stopping...', event);
    });
    
    // Control lifecycle
    // await this.lifecycle.pause();
    // await this.lifecycle.resume();
    // await this.lifecycle.stop();
  }
}
```

## 🚌 Event Bus

Advanced event management with priority queues.

```typescript
class MyApp extends MiuraFramework {
  async connectedCallback() {
    await super.connectedCallback();
    
    // Listen to framework events
    this.eventBus.on('framework:ready', (event) => {
      console.log('Framework ready!', event);
    });
    
    this.eventBus.on('component:registered', (event) => {
      console.log('Component registered:', event.data.name);
    });
    
    this.eventBus.on('router:setup', (event) => {
      console.log('Router setup:', event.data.routes);
    });
    
    // Emit custom events
    this.eventBus.emit('app:custom-event', { data: 'value' }, 10); // High priority
  }
}
```

## 🌐 Global Framework Instance

Your framework is automatically available globally.

```typescript
// If your app is named "MyApp", it's available as:
const framework = window.miuraMyApp;

// Access framework services
const dataLake = framework.dataLake;
const stats = framework.getStats();
const components = framework.componentRegistry.getAll();
```

## 📈 Framework Statistics

Get comprehensive framework statistics.

```typescript
const stats = framework.getStats();
console.log(stats);
// {
//   components: 15,
//   plugins: 3,
//   lifecycle: 'running',
//   performance: [...],
//   errors: 0,
//   routes: 8,
//   dataLakeSize: 25
// }
```

## 🎯 Why This Approach?

1. **📝 Declarative** - All configuration in one place
2. **🧬 Class-based** - Familiar OOP patterns
3. **⚡ Lazy Loading** - Components loaded on-demand
4. **🔌 Extensible** - Plugin system for custom capabilities
5. **📊 Observable** - Built-in monitoring and debugging
6. **🌐 Global Access** - Framework available everywhere
7. **🎯 Developer Experience** - Intuitive and clean API

## 🔧 Configuration Options

### Static Properties

| Property | Type | Description |
|----------|------|-------------|
| `tagName` | string | Custom element tag name |
| `config` | FrameworkConfig | Framework configuration |
| `dataLake` | Record<string, any> | Initial data lake entries loaded via `data` manager |
| `components` | Record<string, () => Promise<typeof MiuraElement>> | Component definitions |
| `router` | RouteConfig[] | Router configuration |
| `plugins` | Plugin[] | Plugin definitions |

### FrameworkConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `appName` | string | - | Application name |
| `version` | string | '1.0.0' | Framework version |
| `environment` | string | 'development' | Environment mode |
| `debug` | boolean | true | Enable debug mode |
| `performance` | boolean | true | Enable performance monitoring |
| `dataLake` | DataLakeConfig | - | Data lake configuration |
| `router` | RouterConfig | - | Router configuration |
| `ui` | UIConfig | - | UI configuration |
| `telemetry` | TelemetryConfig | - | Telemetry configuration |

MiuraFramework makes application development **declarative, clean, and powerful**! 🌱
