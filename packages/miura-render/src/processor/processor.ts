import { TemplateResult } from './template-result';
import { TemplateParser, ParsedTemplate } from './parser';
import { registerDefaultProcessor } from './types';
import { debugLog } from '../utils/debug';
import { BindingManager } from '../binding-manager/binding-manager';
import { Binding } from '../binding-manager/bindings/binding';
import { applyStaticUtilities } from '../utilities/apply-static-utilities';
import { ElementNamespace } from '../html';

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
        return new TemplateInstance(result, parsed, parts, fragment);
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
        this._fixNamespaces(fragment);
        return fragment;
    }

    /**
     * Fix namespace for foreign-content elements (SVG, MathML).
     *
     * When HTML is parsed via `template.innerHTML`, the browser's HTML parser
     * creates elements in the HTML namespace (http://www.w3.org/1999/xhtml).
     * SVG and MathML elements need their own namespace for attributes like
     * `viewBox`, `x1`, `cy`, etc. to work correctly — the HTML parser may
     * reject or mangle numeric SVG attribute values that contain binding markers.
     *
     * This method walks the fragment and re-creates any SVG/MathML subtrees
     * using `createElementNS` with the correct namespace, preserving all
     * attributes, children, and binding markers.
     */
    private _fixNamespaces(root: DocumentFragment): void {
        const HTML_NS = 'http://www.w3.org/1999/xhtml';

        // Map of tag names that signal a foreign namespace root
        const namespaceRoots: Record<string, string> = {
            svg: ElementNamespace.SVG,
            math: ElementNamespace.MathML,
        };

        for (const [tag, ns] of Object.entries(namespaceRoots)) {
            const elements = root.querySelectorAll(tag);
            for (const el of elements) {
                // Only fix elements that are NOT already in the correct namespace
                if (el.namespaceURI === ns) continue;

                // Skip if this element is inside another same-namespace root
                // (e.g. nested <svg> inside <svg> — the outer fix will handle it)
                const parentNs = el.parentElement?.namespaceURI;
                if (parentNs === ns) continue;

                const fixed = this._recreateInNamespace(el, ns);
                el.parentNode?.replaceChild(fixed, el);
            }
        }

        // Also fix standalone SVG/MathML child elements from sub-templates.
        // Sub-templates like <rect x=${v} ...> don't contain an <svg> wrapper,
        // so the loop above doesn't catch them. They get inserted into a parent
        // <svg> later via NodeBinding, but by then they're in the wrong namespace.
        const svgChildTags = new Set([
            'g', 'path', 'circle', 'rect', 'line', 'text', 'ellipse',
            'polygon', 'polyline', 'defs', 'clippath', 'use', 'symbol',
            'image', 'tspan', 'foreignobject', 'lineargradient',
            'radialgradient', 'stop', 'filter', 'fegaussianblur',
            'desc', 'title', 'metadata', 'marker', 'pattern', 'mask',
            'a', 'animate', 'animatetransform', 'animatemotion', 'set',
        ]);

        // Walk all elements; fix any HTML-namespace element whose tag is a known SVG child
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
        const toFix: [Element, string][] = [];
        let node: Element | null;
        while ((node = walker.nextNode() as Element | null)) {
            if (node.namespaceURI === HTML_NS && svgChildTags.has(node.tagName.toLowerCase())) {
                toFix.push([node, ElementNamespace.SVG]);
            }
        }
        // Replace in reverse to avoid invalidating tree positions
        for (let i = toFix.length - 1; i >= 0; i--) {
            const [el, ns] = toFix[i];
            const fixed = this._recreateInNamespace(el, ns);
            el.parentNode?.replaceChild(fixed, el);
        }
    }

    /**
     * Deep-recreates an element (and its subtree) in the given namespace.
     * Preserves attributes, text nodes, and comment nodes (including binding markers).
     */
    private _recreateInNamespace(source: Element, namespace: string): Element {
        const recreated = document.createElementNS(namespace, source.tagName.toLowerCase());

        // Copy attributes, converting binding:N markers to data-bN for SVG/MathML
        // (SVG rejects "binding:N" as invalid for numeric attrs like viewBox, x, y, etc.)
        const BINDING_RE = /^binding:(\d+)$/;
        for (const attr of Array.from(source.attributes)) {
            const match = BINDING_RE.exec(attr.value);
            if (match) {
                // Skip the original attribute (SVG would reject it) and emit data-bN marker
                recreated.setAttribute(`data-b${match[1]}`, '');
            } else {
                recreated.setAttributeNS(attr.namespaceURI, attr.name, attr.value);
            }
        }

        // Deep-copy children
        for (const child of Array.from(source.childNodes)) {
            if (child.nodeType === Node.ELEMENT_NODE) {
                const childEl = child as Element;
                // Children of SVG/MathML inherit the parent namespace
                const childNs = namespace;
                const fixed = this._recreateInNamespace(childEl, childNs);
                recreated.appendChild(fixed);
            } else {
                // Text nodes, comment nodes (including binding markers)
                recreated.appendChild(child.cloneNode(true));
            }
        }

        return recreated;
    }
}

class TemplateInstance {
    private updateMetrics = { updateTime: 0, updateCount: 0 };

    constructor(
        private result: TemplateResult,
        private parsed: ParsedTemplate,
        private parts: Binding[],
        private fragment: DocumentFragment
    ) { }

    getFragment(): DocumentFragment {
        return this.fragment;
    }

    connect(context?: unknown): void {
        // No-op for now since Bindings handle their own connections
    }

    async update(values: unknown[], context?: unknown): Promise<void> {
        const startTime = performance.now();
        await BindingManager.initializeBindings(this.parts, this.parsed.bindings, values, context);
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
