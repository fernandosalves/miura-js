import { MiuraElement, html } from '@miurajs/miura-element';
import { Store } from '@miurajs/miura-data-flow';
import { createRouter } from '@miurajs/miura-router';
import type {
    RouterInstance,
    RouteRenderContext,
    NavigationOptions,
} from '@miurajs/miura-router';
import { AppLifecycle } from './lifecycle.js';
import { ComponentRegistry } from './component-registry.js';
import { DataManager } from './data-manager.js';
import { EventBus } from './event-bus.js';
import type { FrameworkConfig, AppConfig, RouteConfig } from './types.js';
import { PerformanceMonitor } from './performance-monitor.js';
import { PluginManager } from './plugin-manager.js';

const DEFAULT_ROUTER_ZONE_SELECTORS = [
    '[data-router-zone="primary"]',
    '[data-router-zone="default"]',
    '[data-router-zone]'
];

// Type for the constructor with static properties
interface MiuraFrameworkConstructor {
    tagName: string;
    config: Partial<FrameworkConfig>;
    dataLake: Record<string, any>;
    components: Record<string, () => Promise<typeof MiuraElement>>;
    router: RouteConfig[];
    plugins: any[];
}

/**
 * MiuraFramework - Declarative Framework Base Class
 * 
 * Extend this class to create your application with static configurations
 */
export abstract class MiuraFramework extends MiuraElement {
    // Static configuration properties
    static tagName: string = 'miura-app';
    static config: Partial<FrameworkConfig> = {};
    static dataLake: Record<string, any> = {};
    static components: Record<string, () => Promise<typeof MiuraElement>> = {};
    static router: RouteConfig[] = [];
    static plugins: any[] = [];

    // Core services (instance properties)
    store!: Store;
    componentRegistry!: ComponentRegistry;
    data!: DataManager;
    pluginManager!: PluginManager;
    lifecycle!: AppLifecycle;
    performance!: PerformanceMonitor;
    eventBus!: EventBus;
    router?: RouterInstance;

    // Internal state
    private _isInitialized = false;
    private _errorCount = 0;
    private _maxErrors = 10;
    private _activeRouteElements = new Map<string, HTMLElement>();

    constructor() {
        super();
        this._initializeServices();
    }

    /**
     * Get the constructor with static properties
     */
    private getConstructor(): MiuraFrameworkConstructor {
        return this.constructor as unknown as MiuraFrameworkConstructor;
    }

    /**
     * Initialize core services
     */
    private _initializeServices(): void {
        const config = this.getConfig();

        this.store = new Store(config.globalState || {});
        this.componentRegistry = new ComponentRegistry();
        this.data = new DataManager(config.dataStore);
        const constructor = this.getConstructor();
        if (constructor.dataLake) {
            this.data.loadInitialData(constructor.dataLake);  // kept for backward compat
        }
        this.pluginManager = new PluginManager(this);
        this.lifecycle = new AppLifecycle();
        this.performance = new PerformanceMonitor();
        this.eventBus = new EventBus();
    }

    /**
     * Get merged configuration
     */
    private getConfig(): FrameworkConfig {
        const constructor = this.getConstructor();
        const defaultConfig: FrameworkConfig = {
            appName: this.constructor.name,
            version: '1.0.0',
            environment: 'development',
            debug: true,
            performance: true,
            plugins: [],
            dataStore: {
                enabled: true,
                persistence: true,
                streaming: false,
                maxSize: 1000,
                ttl: 3600000
            },
            router: {
                enabled: true,
                mode: 'history',
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
            globalState: {}
        };

        return {
            ...defaultConfig,
            ...constructor.config
        };
    }

    /**
     * Initialize the framework (called automatically)
     */
    async connectedCallback(): Promise<void> {
        super.connectedCallback();

        if (this._isInitialized) return;

        try {
            const config = this.getConfig();

            // Start performance monitoring
            const initTimer = this.performance.startTimer('framework-initialization');

            // Emit initialization event
            this.eventBus.emit('framework:initializing', { config }, 10);

            // Initialize lifecycle
            await this.lifecycle.start();

            // Register components
            await this._registerComponents();

            // Install plugins
            await this._installPlugins();

            // Set up router if configured
            const constructor = this.getConstructor();
            if (constructor.router.length > 0) {
                // Auto-enable router when routes are provided
                const config = this.getConfig();
                if (!config.router.enabled) {
                    config.router.enabled = true;
                }
                await this._setupRouter();
            }

            // Mark as initialized
            this._isInitialized = true;

            // Stop timer and record metric
            initTimer();

            // Emit ready event
            this.eventBus.emit('framework:ready', { config }, 10);

            // Set up global instance
            this._setupGlobalInstance();

            if (config.debug) {
                console.log('🚀 MiuraFramework initialized successfully', {
                    app: config.appName,
                    components: this.componentRegistry.getAll().length,
                    plugins: this.pluginManager.getAll().length,
                    routes: constructor.router.length
                });
            }

        } catch (error) {
            this._handleError('Initialization failed', error);
            throw error;
        }
    }

    /**
     * Register components dynamically
     */
    private async _registerComponents(): Promise<void> {
        const constructor = this.getConstructor();
        const componentConfigs = constructor.components;

        for (const [name, importFn] of Object.entries(componentConfigs)) {
            try {
                const componentModule = await importFn();
                const component = (componentModule as any).default || componentModule;

                this.componentRegistry.register({
                    name,
                    element: component,
                    version: '1.0.0'
                });

                this.eventBus.emit('component:registered', { name }, 5);

            } catch (error) {
                this._handleError(`Failed to register component: ${name}`, error);
            }
        }
    }

    /**
     * Install plugins
     */
    private async _installPlugins(): Promise<void> {
        const constructor = this.getConstructor();
        const plugins = constructor.plugins;

        for (const plugin of plugins) {
            try {
                this.eventBus.emit('plugin:installing', { name: plugin.name }, 5);
                await this.pluginManager.register(plugin);
                this.eventBus.emit('plugin:installed', { name: plugin.name }, 5);
            } catch (error) {
                this.eventBus.emit('plugin:install-failed', { name: plugin.name, error }, 1);
                this._handleError(`Failed to install plugin: ${plugin.name}`, error);
            }
        }
    }

    private async _teardownPlugins(): Promise<void> {
        const plugins = [...this.pluginManager.getAll()];
        for (const plugin of plugins) {
            try {
                this.eventBus.emit('plugin:uninstalling', { name: plugin.name }, 5);
                await this.pluginManager.unregister(plugin.name);
                this.eventBus.emit('plugin:uninstalled', { name: plugin.name }, 5);
            } catch (error) {
                this.eventBus.emit('plugin:uninstall-failed', { name: plugin.name, error }, 1);
                this._handleError(`Failed to uninstall plugin: ${plugin.name}`, error);
            }
        }
    }

    private async _handleDisconnection(): Promise<void> {
        try {
            await this._teardownPlugins();
        } catch (error) {
            this._handleError('Plugin teardown failed', error);
        }

        this.lifecycle.destroy();
        this.router?.stop();
        this._activeRouteElements.clear();
        this.data.clear();
        this.eventBus.emit('framework:destroyed', {}, 10);
        this.eventBus.clear();
    }

    /**
     * Set up router
     */
    private async _setupRouter(): Promise<void> {
        const constructor = this.getConstructor();
        const config = this.getConfig();
        const routes = constructor.router;

        const render = async (context: RouteRenderContext) => {
            await this._renderRoute(context);
        };

        this.router = createRouter({
            routes,
            mode: config.router.mode,
            base: config.router.base,
            fallback: config.router.fallback,
            eventBus: this.eventBus,
            performance: this.performance,
            render,
        });

        await this.router.start();
        this.eventBus.emit('router:setup', { routes }, 5);
    }

    protected navigate(to: string, options?: NavigationOptions) {
        if (!this.router) {
            console.warn('Router not initialized. Navigation request ignored.');
            return Promise.resolve();
        }
        return this.router.navigate(to, options);
    }

    protected replaceRoute(to: string, options?: NavigationOptions) {
        if (!this.router) {
            console.warn('Router not initialized. Replace request ignored.');
            return Promise.resolve();
        }
        return this.router.replace(to, options);
    }

    protected goBack() {
        this.router?.back();
    }

    protected goForward() {
        this.router?.forward();
    }

    private async _renderRoute(context: RouteRenderContext): Promise<void> {
        const matched = context.matched ?? [context.route];

        // ── Flat route (single record) — original fast path ──────────────────
        if (matched.length <= 1) {
            await this._renderFlatRoute(context);
            return;
        }

        // ── Nested route — walk the ancestry chain ────────────────────────────
        // 1. Render root layout record into the primary zone
        const rootRecord = matched[0];
        const renderZone = rootRecord.renderZone || '[data-router-zone="primary"]';
        const zoneElement = this._resolveRouteZone(renderZone);
        if (!zoneElement) {
            console.warn(`Router zone "${renderZone}" not found.`);
            return;
        }

        const routeKey = zoneElement.dataset.routerZone || zoneElement.id || 'default';
        const previous = this._activeRouteElements.get(routeKey);

        // Reuse the layout element if it's already the same component (avoid
        // tearing down the shell on every child navigation)
        let layoutEl = previous?.tagName.toLowerCase() === rootRecord.component.toLowerCase()
            ? previous
            : null;

        if (!layoutEl) {
            previous?.remove();
            this._activeRouteElements.delete(routeKey);
            const component = this.componentRegistry.get(rootRecord.component);
            if (!component) {
                console.warn(`Component ${rootRecord.component} not registered for route ${rootRecord.path}`);
                return;
            }
            layoutEl = new component();
            this._injectRouteData(layoutEl, context);
            zoneElement.appendChild(layoutEl);
            this._activeRouteElements.set(routeKey, layoutEl);
        }

        // 2. Walk remaining records, finding each nested outlet in the previous element
        let parentEl: Element = layoutEl;
        for (let i = 1; i < matched.length; i++) {
            const record = matched[i];

            // Allow one render tick for the parent to initialise its shadow DOM
            await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

            const outlet = this._findOutlet(parentEl, record.renderZone);
            if (!outlet) {
                console.warn(
                    `[miura-router] No <miura-router-outlet> found inside <${parentEl.tagName.toLowerCase()}> ` +
                    `for child route "${record.path}". Add <miura-router-outlet> to the layout template.`
                );
                return;
            }

            outlet.renderRoute(record, context);
            parentEl = outlet;
        }

        this.eventBus.emit('router:rendered', { route: context.route, matched }, 5);
    }

    private async _renderFlatRoute(context: RouteRenderContext): Promise<void> {
        const renderZone = context.route.renderZone || '[data-router-zone="primary"]';
        const zoneElement = this._resolveRouteZone(renderZone);
        if (!zoneElement) {
            console.warn(`Router zone "${renderZone}" not found. Skipping route render.`);
            return;
        }

        const routeKey = zoneElement.dataset.routerZone || zoneElement.id || 'default';
        const previousElement = this._activeRouteElements.get(routeKey);
        if (previousElement) {
            previousElement.remove();
            this._activeRouteElements.delete(routeKey);
        }

        const component = this.componentRegistry.get(context.route.component);
        if (!component) {
            console.warn(`Component ${context.route.component} not registered for route ${context.route.path}`);
            return;
        }

        const element = new component();
        this._injectRouteData(element, context);
        zoneElement.appendChild(element);
        this._activeRouteElements.set(routeKey, element as HTMLElement);

        // Allow one render tick for the component to initialise its shadow DOM
        // This fixes the timing issue where components try to render before framework is ready
        await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

        this.eventBus.emit('router:rendered', { route: context.route, element }, 5);
    }

    private _findOutlet(parent: Element, targetName?: string): any | null {
        const name = targetName || 'default';
        const shadowOutlet = parent.shadowRoot?.querySelector(
            `miura-router-outlet[name="${name}"], miura-router-outlet:not([name])`
        );
        if (shadowOutlet) return shadowOutlet;
        return parent.querySelector(
            `miura-router-outlet[name="${name}"], miura-router-outlet:not([name])`
        );
    }

    private _resolveRouteZone(selector: string): HTMLElement | null {
        if (!selector) {
            return this._findDefaultRouteZone();
        }
        if (selector.startsWith('#') || selector.startsWith('.')) {
            return this.shadowRoot?.querySelector(selector) as HTMLElement | null
                || document.querySelector(selector);
        }

        if (selector.startsWith('[')) {
            return this.shadowRoot?.querySelector(selector) as HTMLElement | null
                || document.querySelector(selector);
        }

        return this.shadowRoot?.querySelector(selector) as HTMLElement | null
            || document.querySelector(selector);
    }

    private _findDefaultRouteZone(): HTMLElement | null {
        for (const selector of DEFAULT_ROUTER_ZONE_SELECTORS) {
            const match = this.shadowRoot?.querySelector(selector) as HTMLElement | null
                || document.querySelector(selector);
            if (match) {
                return match;
            }
        }
        return null;
    }

    private _injectRouteData(element: Element, context: RouteRenderContext): void {
        if ('routeContext' in element) {
            (element as any).routeContext = context;
            return;
        }

        element.setAttribute('data-route', JSON.stringify({
            params: context.params,
            query: Object.fromEntries(context.query.entries()),
            hash: context.hash,
        }));
    }

    /**
     * Set up global framework instance
     */
    private _setupGlobalInstance(): void {
        const config = this.getConfig();
        const globalName = config.appName.replace(/[^a-zA-Z0-9]/g, '');
        (window as any)[`miura${globalName}`] = this;

        if (config.debug) {
            console.log(`🌐 Global framework instance available as: window.miura${globalName}`);
        }
    }

    /**
     * Handle framework errors
     */
    private _handleError(message: string, error: any): void {
        this._errorCount++;

        this.eventBus.emit('framework:error', { message, error, count: this._errorCount }, 1);

        const config = this.getConfig();
        if (config.debug) {
            console.error(`❌ MiuraFramework Error (${this._errorCount}/${this._maxErrors}):`, message, error);
        }

        if (this._errorCount >= this._maxErrors) {
            this.eventBus.emit('framework:max-errors-reached', { count: this._errorCount }, 1);
            throw new Error(`Framework reached maximum error count: ${this._maxErrors}`);
        }
    }

    /**
     * Get framework statistics
     */
    getStats() {
        const constructor = this.getConstructor();
        return {
            uptime: performance.now(),
            isInitialized: this._isInitialized,
            components: this.componentRegistry.getAll().length,
            plugins: this.pluginManager.getAll().length,
            errors: this._errorCount,
            routes: constructor.router.length,
            storeCount: this.data.getStats().storeCount,
        };
    }

    /**
     * Render the framework element
     */
    render() {
        const config = this.getConfig();
        const constructor = this.getConstructor();

        return html`
      <div class="miura-framework" data-phase="${this.lifecycle.phase}">
        ${this.template()}
        ${config.debug ? html`
          <div class="framework-debug" style="position: fixed; bottom: 10px; right: 10px; background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 5px; font-size: 12px; z-index: 9999;">
            <div>🚀 ${config.appName}</div>
            <div>Phase: ${this.lifecycle.phase}</div>
            <div>Components: ${this.componentRegistry.getAll().length}</div>
            <div>Routes: ${constructor.router.length}</div>
          </div>
        ` : ''}
      </div>
    `;
    }

    /**
     * Abstract method for app template
     */
    abstract template(): any;

    /**
     * Cleanup on disconnect
     */
    disconnectedCallback(): void {
        super.disconnectedCallback();
        void this._handleDisconnection();
    }
}

// Note: We can't register an abstract class directly
// Concrete implementations will register themselves 
