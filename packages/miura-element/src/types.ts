import { MiuraElement } from './miura-element';

/**
 * Interface for template instances
 */
export interface TemplateInstance {
    connect(element: MiuraElement): void;
    update(values: unknown[], element: MiuraElement): Promise<void>;
    disconnect(): void;
    getFragment(): DocumentFragment;
}

/**
 * Performance metrics for debugging
 */
export interface PerformanceMetrics {
    renderTime: number;
    updateCount: number;
    memoryUsage?: number;
}

/**
 * Error context for better debugging
 */
export interface ErrorContext {
    elementName: string;
    method: string;
    propertyName?: string;
    template?: string;
} 