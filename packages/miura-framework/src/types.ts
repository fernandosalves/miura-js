import { MiuraElement } from '@miura/miura-element';
import { Store } from '@miura/miura-data-flow';
import type { RouteRecord, Router } from '@miura/miura-router';

// Forward declaration for miuraFramework
declare class miuraFramework { }

// Framework Configuration
export interface FrameworkConfig {
    appName: string;
    version: string;
    environment: 'development' | 'production' | 'test';
    debug: boolean;
    performance: boolean;
    plugins: string[];
    dataStore: DataStoreConfig;
    router: RouterConfig;
    ui: UIConfig;
    telemetry: TelemetryConfig;
    globalState?: Record<string, any>;
}

export interface DataStoreConfig {
    enabled: boolean;
    persistence: boolean;
    streaming: boolean;
    maxSize: number;
    ttl: number;
}

export interface RouterConfig {
    enabled: boolean;
    mode: 'hash' | 'history';
    base: string;
    fallback: string;
}

export interface UIConfig {
    theme: string;
    locale: string;
    components: string[];
}

export interface TelemetryConfig {
    enabled: boolean;
    endpoint?: string;
    sampleRate: number;
}

// App Configuration
export interface AppConfig {
    name: string;
    description?: string;
    author?: string;
    version: string;
    entryPoint?: string;
    components?: string[];
    routes?: RouteConfig[];
    globalState?: Record<string, any>;
}

export type RouteConfig = RouteRecord;

// Component Registry Types
export interface ComponentDefinition {
    name: string;
    element: typeof MiuraElement;
    version: string;
    dependencies?: string[];
    metadata?: Record<string, any>;
}

export interface ComponentRegistry {
    register(definition: ComponentDefinition): void;
    get(name: string): typeof MiuraElement | undefined;
    getAll(): ComponentDefinition[];
    unregister(name: string): void;
    has(name: string): boolean;
}

// Data Lake Types
export interface DataStream {
    id: string;
    data: any;
    timestamp: number;
    source: string;
    metadata?: Record<string, any>;
}

export interface DataStore {
    set(key: string, value: any, ttl?: number): void;
    get(key: string): any;
    delete(key: string): void;
    clear(): void;
    subscribe(key: string, callback: (value: any) => void): () => void;
    stream(key: string): AsyncIterable<DataStream>;
}

// Plugin System Types
export interface Plugin {
    name: string;
    version: string;
    install(framework: miuraFramework): void | Promise<void>;
    uninstall?(framework: miuraFramework): void | Promise<void>;
    dependencies?: string[];
}

export interface PluginManager {
    register(plugin: Plugin): Promise<void>;
    get(name: string): Plugin | undefined;
    getAll(): Plugin[];
    unregister(name: string): Promise<void>;
    unregisterAll(): Promise<void>;
    has(name: string): boolean;
}

// App Lifecycle Types
export type LifecyclePhase =
    | 'initializing'
    | 'configuring'
    | 'starting'
    | 'running'
    | 'pausing'
    | 'stopping'
    | 'error'
    | 'destroyed';

export interface LifecycleEvent {
    phase: LifecyclePhase;
    timestamp: number;
    data?: any;
    error?: Error;
}

export interface AppLifecycle {
    phase: LifecyclePhase;
    start(): Promise<void>;
    stop(): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    destroy(): Promise<void>;
    on(event: LifecyclePhase, callback: (event: LifecycleEvent) => void): () => void;
}

// Performance Monitoring Types
export interface PerformanceMetric {
    name: string;
    value: number;
    unit: string;
    timestamp: number;
    metadata?: Record<string, any>;
}

export interface PerformanceMonitor {
    startTimer(name: string): () => void;
    measure(name: string, fn: () => any): any;
    record(metric: PerformanceMetric): void;
    getMetrics(): PerformanceMetric[];
    clear(): void;
}

// Event Bus Types
export interface EventBusEvent {
    type: string;
    data?: any;
    timestamp: number;
    source: string;
    priority: number;
}

export interface EventBus {
    emit(type: string, data?: any, priority?: number): void;
    on(type: string, callback: (event: EventBusEvent) => void, priority?: number): () => void;
    once(type: string, callback: (event: EventBusEvent) => void, priority?: number): () => void;
    off(type: string, callback: (event: EventBusEvent) => void): void;
    clear(): void;
}

// Framework Instance Types
export interface FrameworkInstance {
    config: FrameworkConfig;
    store: Store;
    componentRegistry: ComponentRegistry;
    dataStore: DataStore;
    pluginManager: PluginManager;
    lifecycle: AppLifecycle;
    performance: PerformanceMonitor;
    eventBus: EventBus;
    router?: Router;
} 