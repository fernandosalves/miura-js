import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraFramework } from '../src/miura-framework.js';
import { MiuraElement, html } from '@miurajsjs/miura-element';

// Example components for the story
class DemoHeader extends MiuraElement {
    static tagName = 'demo-header';

    template() {
        return html`
      <header style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 2rem;">🚀 miuraFramework Demo</h1>
        <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Declarative Framework Base Class</p>
      </header>
    `;
    }
}

class DemoContent extends MiuraElement {
    static tagName = 'demo-content';

    static properties = {
        count: { type: Number, default: 0 },
        theme: { type: String, default: 'light' }
    };

    declare count: number;
    declare theme: string;

    increment() {
        console.log('click')
        this.count++;
    }

    toggleTheme() {
        console.log('click')
        this.theme = this.theme === 'light' ? 'dark' : 'light';
    }

    template() {
        const isDark = this.theme === 'dark';
        const bgColor = isDark ? '#2d3748' : '#f7fafc';
        const textColor = isDark ? '#e2e8f0' : '#2d3748';
        const featureBg = isDark ? '#4a5568' : '#edf2f7';

        return html`
      <main style="padding: 2rem; background: ${bgColor}; color: ${textColor}; min-height: 300px; transition: all 0.3s ease;">
        <div style="max-width: 600px; margin: 0 auto;">
          <h2 style="margin-top: 0;">Welcome to miuraFramework!</h2>
          <p>This is a <strong>declarative framework base class</strong> that makes application development incredibly clean and intuitive.</p>
          
          <div style="background: ${featureBg}; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0;">
            <h3 style="margin-top: 0;">Framework Features</h3>
            <ul style="margin: 0.5rem 0;">
              <li>📝 Declarative Configuration</li>
              <li>🏊‍♂️ Data Lake Architecture</li>
              <li>📦 Dynamic Component Loading</li>
              <li>🔌 Plugin System</li>
              <li>📊 Performance Monitoring</li>
              <li>🔄 App Lifecycle Management</li>
            </ul>
          </div>
          
          <div style="display: flex; gap: 1rem; margin-top: 2rem;">
            <button 
              @click="${this.increment}"
              style="background: #4299e1; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-size: 1rem;">
              Count: ${this.count}
            </button>
            
            <button 
              @click="${this.toggleTheme}"
              style="background: #48bb78; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-size: 1rem;">
              Toggle Theme (${this.theme})
            </button>
          </div>
        </div>
      </main>
    `;
    }
}

class DemoFooter extends MiuraElement {
    static tagName = 'demo-footer';

    template() {
        return html`
      <footer style="background: #2d3748; color: white; padding: 1rem; text-align: center; border-radius: 0 0 8px 8px;">
        <p style="margin: 0;">Built with ❤️ using <strong>miuraFramework</strong> - The Declarative Framework Base Class</p>
      </footer>
    `;
    }
}

// Main demo app class
class DemoApp extends miuraFramework {
    static tagName = 'demo-app';

    // Framework configuration
    static config = {
        appName: 'DemoApp',
        version: '1.0.0',
        environment: 'development' as const,
        debug: true,
        performance: true,
        dataLake: {
            enabled: true,
            persistence: true,
            streaming: false,
            maxSize: 1000,
            ttl: 3600000
        },
        router: {
            enabled: false,
            mode: 'hash' as const,
            base: '/',
            fallback: '/'
        },
        ui: {
            theme: 'light',
            locale: 'en',
            components: []
        },
        telemetry: {
            enabled: false,
            sampleRate: 0.1
        },
        globalState: {
            user: null,
            theme: 'light'
        }
    };

    // Initial data lake data
    static dataLake = {
        'app:settings': { theme: 'light', locale: 'en' },
        'user:preferences': { notifications: true, sound: false },
        'demo:counter': { value: 0 }
    };

    // Component definitions
    static components = {
        'demo-header': async () => DemoHeader,
        'demo-content': async () => DemoContent,
        'demo-footer': async () => DemoFooter
    };

    // Plugin definitions
    static plugins = [
        {
            name: 'demo-analytics',
            version: '1.0.0',
            install(framework: any) {
                framework.eventBus.on('component:registered', (event: any) => {
                    console.log('🎯 Demo Analytics: Component registered', event.data.name);
                });

                framework.eventBus.on('framework:ready', () => {
                    console.log('🎯 Demo Analytics: Framework is ready');
                });
            }
        },
        {
            name: 'demo-logging',
            version: '1.0.0',
            install(framework: any) {
                framework.eventBus.on('framework:ready', () => {
                    console.log('📝 Demo Logging: Framework initialized successfully');
                });
            }
        }
    ];

    // App template
    template() {
        return html`
      <div class="demo-app" style="max-width: 800px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
        <demo-header></demo-header>
        <demo-content></demo-content>
        <demo-footer></demo-footer>
      </div>
    `;
    }

    // Lifecycle hooks
    async connectedCallback() {
        await super.connectedCallback();

        // Listen to framework events
        this.eventBus.on('framework:ready', (event) => {
            console.log('🎉 Demo App is ready!', event);

            // Access data lake via data manager
            const settings = this.data.get('app:settings');
            console.log('📊 App settings:', settings);

            // Get framework statistics
            const stats = this.getStats();
            console.log('📈 Framework stats:', stats);
        });

        this.eventBus.on('component:registered', (event) => {
            console.log('📦 Component registered:', event.data.name);
        });
    }
}

// Register the demo app
customElements.define(DemoApp.tagName, DemoApp);

// Storybook meta
const meta: Meta<DemoApp> = {
    title: 'miura-framework/Demo',
    component: 'demo-app',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: `
# miuraFramework Demo

This story demonstrates the **declarative framework base class** approach of miuraFramework.

## Key Features Shown:

- **📝 Declarative Configuration** - All setup through static properties
- **🏊‍♂️ Data Lake** - Centralized data management
- **📦 Dynamic Component Loading** - Components loaded on-demand
- **🔌 Plugin System** - Extensible framework capabilities
- **📊 Performance Monitoring** - Built-in telemetry
- **🔄 App Lifecycle** - Automatic lifecycle management

## How It Works:

1. **Extend miuraFramework** - Create your app class
2. **Configure statically** - Set up config, dataLake, components, plugins
3. **Define template** - Implement the abstract template() method
4. **Register and use** - The framework handles everything else!

## Console Output:

Check the browser console to see:
- Framework initialization logs
- Component registration events
- Plugin installation messages
- Performance metrics
- Data lake operations
        `
            }
        }
    }
};

export default meta;

interface DemoAppArgs {
    // No props needed - everything is configured statically
}

type Story = StoryObj<DemoApp & DemoAppArgs>;

// Basic story
export const Default: Story = {
    args: {
        // No args needed - everything is configured statically
    },
    parameters: {
        docs: {
            description: {
                story: `
## Basic Demo App

This demonstrates a complete miuraFramework application with:

- **Header component** with gradient styling
- **Content component** with interactive counter and theme toggle
- **Footer component** with branding
- **Data lake** with initial settings
- **Plugin system** with analytics and logging
- **Performance monitoring** enabled
- **Event bus** for communication

The app automatically initializes when connected to the DOM and provides comprehensive logging in the console.
        `
            }
        }
    }
};

// Story showing framework features
export const FrameworkFeatures: Story = {
    args: {
        // No args needed - everything is configured statically
    },
    render: () => {
        const container = document.createElement('div');
        container.style.cssText = 'padding: 2rem; background: #f7fafc; min-height: 100vh;';

        container.innerHTML = `
      <h1 style="text-align: center; margin-bottom: 2rem;">miuraFramework Features</h1>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; max-width: 1200px; margin: 0 auto;">
        
        <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h3>📝 Declarative Configuration</h3>
          <p>All framework setup is done through static properties, making it incredibly clean and intuitive.</p>
          <pre style="background: #f1f5f9; padding: 1rem; border-radius: 4px; font-size: 0.9rem; overflow-x: auto;">
static config = {
  appName: 'DemoApp',
  debug: true,
  performance: true
};</pre>
        </div>
        
        <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h3>🏊‍♂️ Data Lake</h3>
          <p>Centralized data reservoir with streaming capabilities and automatic persistence.</p>
          <pre style="background: #f1f5f9; padding: 1rem; border-radius: 4px; font-size: 0.9rem; overflow-x: auto;">
static dataLake = {
  'app:settings': { theme: 'light' },
  'user:preferences': { notifications: true }
};</pre>
        </div>
        
        <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h3>📦 Dynamic Components</h3>
          <p>Components are loaded on-demand using dynamic imports for optimal performance.</p>
          <pre style="background: #f1f5f9; padding: 1rem; border-radius: 4px; font-size: 0.9rem; overflow-x: auto;">
static components = {
  'my-header': async () => import('./header.js'),
  'my-content': async () => import('./content.js')
};</pre>
        </div>
        
        <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h3>🔌 Plugin System</h3>
          <p>Extensible framework capabilities through a simple plugin system.</p>
          <pre style="background: #f1f5f9; padding: 1rem; border-radius: 4px; font-size: 0.9rem; overflow-x: auto;">
static plugins = [{
  name: 'analytics',
  install(framework) {
    // Setup analytics
  }
}];</pre>
        </div>
        
        <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h3>📊 Performance Monitoring</h3>
          <p>Built-in performance tracking and metrics collection.</p>
          <pre style="background: #f1f5f9; padding: 1rem; border-radius: 4px; font-size: 0.9rem; overflow-x: auto;">
// Automatic performance monitoring
const stats = this.getStats();
const metrics = this.performance.getMetrics();</pre>
        </div>
        
        <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h3>🔄 App Lifecycle</h3>
          <p>Automatic lifecycle management with event-driven hooks.</p>
          <pre style="background: #f1f5f9; padding: 1rem; border-radius: 4px; font-size: 0.9rem; overflow-x: auto;">
this.lifecycle.on('running', (event) => {
  console.log('App is running!');
});</pre>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 3rem;">
      </div>
    `;

        // Add the demo app
        const demoApp = document.createElement('demo-app');
        const demoContainer = container.querySelector('div[style*="text-align: center"]');
        demoContainer?.appendChild(demoApp);

        return container;
    },
    parameters: {
        docs: {
            description: {
                story: `
## Framework Features Overview

This story showcases all the key features of miuraFramework in an interactive format.

### What You'll See:

1. **Feature Cards** - Each major feature explained with code examples
2. **Live Demo** - The actual framework in action at the bottom
3. **Console Logs** - Check the browser console for detailed framework activity

### Key Benefits:

- **Clean Architecture** - Everything configured in one place
- **Type Safety** - Full TypeScript support
- **Performance** - Lazy loading and built-in monitoring
- **Extensibility** - Plugin system for custom capabilities
- **Developer Experience** - Intuitive API and comprehensive tooling

The framework makes application development **declarative, clean, and powerful**!
        `
            }
        }
    }
};
