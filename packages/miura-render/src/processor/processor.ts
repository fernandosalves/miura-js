import { TemplateResult } from './template-result';
import { TemplateParser, ParsedTemplate } from './parser';
import { registerDefaultProcessor } from './types';
import { debugLog } from '../utils/debug';
import { BindingManager } from '../binding-manager/binding-manager';
import { Binding } from '../binding-manager/bindings/binding';
import { applyStaticUtilities } from '../utilities/apply-static-utilities';

/**
 * Performance metrics for template processing
 */
interface ProcessingMetrics {
    parseTime: number;
    createTime: number;
    updateTime: number;
    cacheHits: number;
    cacheMisses: number;
}

/**
 * The TemplateProcessor is responsible for:
 * 1. Processing template results into DOM structures
 * 2. Managing template instances and their lifecycles
 * 3. Creating and managing parts that handle dynamic content
 * 4. Caching parsed templates for better performance
 */
export class TemplateProcessor {
    private templateCache = new WeakMap<TemplateStringsArray, ParsedTemplate>();
    private parser = new TemplateParser();

    constructor() {
        registerDefaultProcessor(this);
    }
    
    /**
     * Performance tracking
     */
    private metrics: ProcessingMetrics = {
        parseTime: 0,
        createTime: 0,
        updateTime: 0,
        cacheHits: 0,
        cacheMisses: 0
    };

    /**
     * Get performance metrics
     */
    getPerformanceMetrics(): ProcessingMetrics {
        return { ...this.metrics };
    }

    /**
     * Reset performance metrics
     */
    resetMetrics(): void {
        this.metrics = {
            parseTime: 0,
            createTime: 0,
            updateTime: 0,
            cacheHits: 0,
            cacheMisses: 0
        };
    }

    /**
     * Clear template cache to free memory
     */
    clearCache(): void {
        this.templateCache = new WeakMap<TemplateStringsArray, ParsedTemplate>();
        debugLog('processor', 'Template cache cleared');
    }

    /**
     * Get cache statistics
     */
    getCacheStats(): { size: number; hits: number; misses: number } {
        // Note: WeakMap size is not directly accessible, but we can track hits/misses
        return {
            size: 0, // WeakMap size is not available
            hits: this.metrics.cacheHits,
            misses: this.metrics.cacheMisses
        };
    }

    async createInstance(result: TemplateResult, context?: unknown): Promise<TemplateInstance> {
        const startTime = performance.now();
        debugLog('processor', 'Creating template instance', { result });

        // Get or create parsed template
        const parsed = this.getOrCreateParsedTemplate(result);

        // For nested templates, we need a fresh sequence of indices
        const fragment = this.createDOMFragment(parsed.html);

        // Create and initialize parts using BindingManager
        const parts = await BindingManager.createAndInitializeParts(
            fragment,
            parsed.bindings,  // Don't offset the bindings for nested templates
            result.values,
            context,
            this  // Pass processor so NodeBinding can create nested instances
        );

        this.metrics.createTime = performance.now() - startTime;
        return new TemplateInstance(result, parts, fragment);
    }

    private getOrCreateParsedTemplate(result: TemplateResult): ParsedTemplate {
        const startTime = performance.now();
        let template = this.templateCache.get(result.strings);
        if (!template) {
            this.metrics.cacheMisses++;
            template = this.parser.parse(result.strings);
            this.templateCache.set(result.strings, template);
            debugLog('processor', 'Created new template', { template });
        } else {
            this.metrics.cacheHits++;
        }
        this.metrics.parseTime = performance.now() - startTime;
        return template;
    }

    private createDOMFragment(html: string): DocumentFragment {
        const template = document.createElement('template');
        template.innerHTML = html;
        const fragment = document.importNode(template.content, true);
        applyStaticUtilities(fragment);
        return fragment;
    }
}

class TemplateInstance {
    private updateMetrics = { updateTime: 0, updateCount: 0 };

    constructor(
        private result: TemplateResult,
        private parts: Binding[],
        private fragment: DocumentFragment
    ) {}

    getFragment(): DocumentFragment {
        return this.fragment;
    }

    connect(context?: unknown): void {
        // No-op for now since Bindings handle their own connections
    }

    async update(values: unknown[], context?: unknown): Promise<void> {
        const startTime = performance.now();
        await BindingManager.initializeBindings(this.parts, values, context);
        this.updateMetrics.updateTime = performance.now() - startTime;
        this.updateMetrics.updateCount++;
    }

    disconnect(): void {
        this.parts.forEach(part => {
            // Clean up any signal subscription attached by BindingManager
            const unsub = (part as any).__signalUnsub;
            if (typeof unsub === 'function') unsub();

            if ('disconnect' in part) {
                (part as any).disconnect();
            }
        });
        // Clear references to help GC
        this.parts = [];
    }

    getUpdateMetrics() {
        return { ...this.updateMetrics };
    }
}
