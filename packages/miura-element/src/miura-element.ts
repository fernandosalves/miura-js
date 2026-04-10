import { PropertyValues } from './property-values';
import { consumeContext, provideContext, type ContextKey } from './context.js';
import { findIslandHost, readIslandProps, type MiuraIsland } from './miura-island.js';
import { PropertyDeclarations, createLocalSignalProperties, createProperties, createStateProperties, LOCAL_SIGNAL_KEY_PREFIX, SIGNAL_KEY_PREFIX } from './properties';
import type { RouteSignalLike, RouterBridgeLike } from './router-bridge.js';
import { getComponentDebugOptions, registerDebugLayer, reportDiagnostic, reportTimelineEvent, unregisterDebugLayer } from '@miurajs/miura-debugger';
import { signal, computed, Signal, ReadonlySignal } from './signals.js';
import { createFieldRef, type FieldRef } from './field-ref.js';
import { shared, createGlobalProperties, GLOBAL_SIGNAL_KEY_PREFIX, type SharedKey } from './shared.js';
import { createForm, Form, FormOptions } from './form.js';
import { createResource, resourceKey, Resource, ResourceKey, ResourceOptions } from './resource.js';
import { useBeacon, usePulse, type Beacon, type Pulse } from './channels.js';

import { TemplateResult, CSSResult, debugLog } from '@miurajs/miura-render';
import { TemplateProcessor, TemplateCompiler, NodeBinding, DirectiveBinding, ensureUtilityStylesInRoot } from '@miurajs/miura-render';
import type { CompiledTemplate } from '@miurajs/miura-render';

/** Shared AOT compiler singleton — one instance for the whole application */
let _aotCompiler: TemplateCompiler | null = null;
function _getAotCompiler(): TemplateCompiler {
    if (!_aotCompiler) _aotCompiler = new TemplateCompiler();
    return _aotCompiler;
}

/** Read a property's current value, unwrapping Signal objects transparently. */
function _readPropValue(instance: any, prop: string): unknown {
    const raw = instance[prop];
    return (raw && typeof raw === 'function' && raw.__isSignal) ? raw.peek() : raw;
}

type DebugResourceRegistration = {
    kind: 'resource' | 'route-resource' | 'island-resource';
    label: string;
    resource: Resource<unknown>;
};

type DebugFormRegistration = {
    label: string;
    form: Form<Record<string, any>>;
};

type DebugRouteRegistration = {
    label: string;
    signal: RouteSignalLike<unknown>;
};

type MiuraSourceError = Error & {
    miuraSourceElement?: HTMLElement | null;
    miuraComponentTag?: string;
    miuraComponentClass?: string;
};

/**
 * Base class for miura custom elements.
 * Provides reactive properties, template rendering, and lifecycle management.
 *
 * @template {PropertyKey} [K=PropertyKey]
 */
export class MiuraElement extends HTMLElement {
    /**
     * The tag name for this element.
     * Used for automatic component registration.
     * Subclasses should override this to define their custom element tag name.
     * @type {string}
     */
    static tagName?: string;

    /**
     * Selects the rendering strategy for this component class.
     *
     * - `'JIT'` (default) — uses the full `TemplateProcessor` pipeline with
     *   `BindingManager`-managed `Binding` objects. Supports all binding types
     *   including directives, signals, and async bindings.
     *
     * - `'AOT'` — uses the `TemplateCompiler` pipeline that generates optimised
     *   `render()` / `update()` functions compiled from the parsed template.
     *   Element refs are cached after the first render so subsequent updates
     *   perform **zero DOM queries**. Best suited for high-frequency, simple
     *   bindings (counters, lists, data tables).
     *
     * @example
     * class PerfCounter extends MiuraElement {
     *   static compiler = 'AOT' as const;
     *   ...
     * }
     */
    static compiler?: 'JIT' | 'AOT';

    /**
     * Property declarations for the element.
     * Subclasses should override this to define their properties.
     * @type {PropertyDeclarations}
     */
    static properties: PropertyDeclarations = {};
    static signals?: PropertyDeclarations;
    static globals?: Record<string, { key?: SharedKey; initial?: unknown }>;
    static beacons?: Record<string, Beacon<unknown>>;
    static pulses?: Record<string, Pulse>;

    /**
     * Optional component-specific debugger configuration.
     * Used by the dev overlay and component layer visualizations.
     */
    static debug?: {
        disabled?: boolean;
        report?: boolean;
        overlay?: boolean;
        layers?: boolean;
        performance?: boolean;
        label?: string;
        color?: string;
        showName?: boolean;
        showRenderTime?: boolean;
    };

    /**
     * Defines computed properties for the element.
     * These are reactive properties derived from other properties.
     *
     * @example
     * static computed() {
     *   return {
     *     fullName: {
     *       dependencies: ['firstName', 'lastName'],
     *       get() {
     *         return `${this.firstName} ${this.lastName}`;
     *       }
     *     }
     *   }
     * }
     */
    static computed?: () => { [key: string]: { dependencies: string[], get: () => any; set?: (v: any) => void; } };

    /**
     * Define the styles for the component.
     * Subclasses can override this getter to provide styles.
     * @returns {CSSResult | CSSResult[]}
     */
    static styles: CSSResult | CSSResult[]

    /**
     * Promise that resolves when the element has completed an update.
     * @type {Promise<boolean>}
     */
    updateComplete!: Promise<boolean>;
    /** @private */
    private updateResolver?: (value: boolean) => void;

    /**
     * Shadow root where the template is rendered.
     * @type {ShadowRoot}
     */
    declare readonly shadowRoot: ShadowRoot;

    /**
     * Template processor instance for this element.
     * @type {TemplateProcessor}
     * @private
     */
    private processor!: TemplateProcessor;
    
    /**
     * Lazy initialization of template processor
     * @private
     */
    private get _processor(): TemplateProcessor {
        if (!this.processor) {
            this.processor = new TemplateProcessor();
        }
        return this.processor;
    }

    /**
     * The current template instance, or null if not yet rendered.
     * @type {*}
     * @private
     */
    private templateInstance: any = null;
    /** Cached element refs for the AOT render path @private */
    private _aotRefs: unknown[] | null = null;
    /** Compiled template (shared, not per-instance) stored for update calls @private */
    private _aotCompiled: CompiledTemplate | null = null;
    /** NodeBinding instances for Node-type refs in the AOT path @private */
    private _aotNodeBindings: NodeBinding[] | null = null;
    /** DirectiveBinding instances for Directive-type refs in the AOT path @private */
    private _aotDirectiveBindings: DirectiveBinding[] | null = null;

    /** @private */
    private _initialized = false;
    /** @private */
    private _pendingUpdate = false;
    /** @private */
    private _hasRendered = false;
    /** @private */
    private _hasError = false;
    /** @private */
    private _slotListeners: Map<string, (e: Event) => void> = new Map();
    /** @private */
    private _shadowRoot: ShadowRoot;
    /** Root render region markers so we can replace the component template safely. */
    private _renderStart!: Comment;
    /** @private */
    private _renderEnd!: Comment;
    /** @private */
    private _updatePromise: Promise<void> | null = null;
    /** @private */
    private _changedProperties: Map<PropertyKey, unknown> = new Map();

    /**
     * Cache for computed property values
     * @private
     */
    private _computedCache: Map<string, { value: any; dependencySnapshots: Map<string, any> }> = new Map();

    /**
     * Update batching for better performance
     * @private
     */
    private _updateScheduled = false;

    /**
     * Unsubscribe functions for property signal → requestUpdate wiring
     * @private
     */
    private _propSignalUnsubs: (() => void)[] = [];
    /** Reconnect-safe subscription factories for bridge helpers and other external signals */
    private _connectionSetups: Array<() => (() => void) | void> = [];
    /** Debug registrations for framework-aware inspector panels. */
    private _debugResources: DebugResourceRegistration[] = [];
    /** @private */
    private _debugForms: DebugFormRegistration[] = [];
    /** @private */
    private _debugRouteSignals: DebugRouteRegistration[] = [];
    /** Latest resolved island props for this component when hydrated inside a <miura-island>. */
    private _islandPropsValue: Record<string, unknown> = {};
    /** Lazy proxy so field initializers can keep a stable object reference before connection. */
    private _islandPropsProxy: Record<string, unknown> | null = null;
    /** Lazy proxy for signal-backed field refs (`this.$.fieldName`). */
    private _signalRefsProxy: Record<string, FieldRef<unknown>> | null = null;
    /** Stable cache of per-field ref wrappers. */
    private _fieldRefCache = new Map<string, FieldRef<unknown>>();

    /**
     * Memory optimization: WeakMap for property storage
     * @private
     */
    private static __propertyStorage = new WeakMap<MiuraElement, Map<string, unknown>>();

    /**
     * Map of attribute names to property names for sync.
     * Built once per class.
     */
    private static __attributeToPropertyMap: Map<string, string>;
    private static __propertyToAttributeMap: Map<string, string>;

    /**
     * Internal state field names (for future use in lifecycle hooks, etc.)
     */
    private static __stateFieldNames: Set<string>;

    /**
     * Computed property definitions cache
     * @private
     */
    private static __computedDefinitions: Map<string, { dependencies: string[], get: () => any; set?: (v: any) => void }>;

    /**
     * Performance tracking
     * @private
     */
    private _performanceMetrics = {
        renderTime: 0,
        updateCount: 0,
        lastRenderTime: 0
    };
    /** Track the current root template identity so we can recreate when shape changes. */
    private _templateStrings: TemplateStringsArray | null = null;
    /** Tracks whether firstUpdated has been invoked. */
    private _hasCalledFirstUpdated = false;

    /**
     * Gets the computed value for a property, using cache if available.
     * @private
     * @param {string} propertyName - The name of the computed property
     * @returns {any} The computed value
     */
    private _getComputedValue(propertyName: string): any {
        const ctor = this.constructor as typeof MiuraElement;
        const def = ctor.__computedDefinitions?.get(propertyName);
        
        if (!def) {
            return undefined;
        }

        // Check if we have a cached value
        const cached = this._computedCache.get(propertyName);
        if (cached) {
            // Check if any dependency values have changed since last computation
            let dependenciesChanged = false;
            for (const [dep, snapshotValue] of cached.dependencySnapshots) {
                const current = _readPropValue(this, dep);
                if (current !== snapshotValue) {
                    dependenciesChanged = true;
                    break;
                }
            }
            
            if (!dependenciesChanged) {
                return cached.value;
            }
        }

        // Calculate new value
        const newValue = def.get.call(this);
        
        // Snapshot current dependency values for future staleness checks
        const dependencySnapshots = new Map<string, any>();
        for (const dep of def.dependencies) {
            dependencySnapshots.set(dep, _readPropValue(this, dep));
        }

        this._computedCache.set(propertyName, {
            value: newValue,
            dependencySnapshots
        });

        return newValue;
    }

    /**
     * Invalidates the cache for a computed property and its dependents.
     * @private
     * @param {string} propertyName - The name of the property that changed
     */
    private _invalidateComputedCache(propertyName: string): void {
        const ctor = this.constructor as typeof MiuraElement;
        
        // Invalidate this property's cache
        this._computedCache.delete(propertyName);
        
        // Find and invalidate dependent computed properties
        if (ctor.__computedDefinitions) {
            for (const [computedName, def] of Array.from(ctor.__computedDefinitions.entries())) {
                if (def.dependencies.includes(propertyName)) {
                    this._computedCache.delete(computedName);
                    // Request update for the computed property
                    this.requestUpdate(computedName, undefined);
                }
            }
        }
    }

    /**
     * Build property <-> attribute maps for this class.
     */
    private static __ensurePropertyAttributeMaps() {
        if (!this.__attributeToPropertyMap || !this.__propertyToAttributeMap) {
            this.__attributeToPropertyMap = new Map();
            this.__propertyToAttributeMap = new Map();
            const props = this.properties || {};
            for (const [prop, opts] of Object.entries(props)) {
                const attr = (opts.attribute || prop.toLowerCase());
                this.__attributeToPropertyMap.set(attr, prop);
                this.__propertyToAttributeMap.set(prop, attr);
            }
        }
    }

    /**
     * List of attributes to observe for changes.
     */
    static get observedAttributes(): string[] {
        this.__ensurePropertyAttributeMaps();
        return Array.from(this.__attributeToPropertyMap.keys());
    }

    /**
     * Called when an observed attribute changes.
     * Syncs attribute changes to the corresponding property.
     */
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
        const ctor = this.constructor as typeof MiuraElement;
        ctor.__ensurePropertyAttributeMaps();
        const prop = ctor.__attributeToPropertyMap.get(name);
        if (!prop) return;
        const propOpts = ctor.properties?.[prop];
        if (!propOpts) return;
        // Convert attribute value to property type
        let value: any = newValue;
        switch (propOpts.type) {
            case Boolean:
                value = newValue !== null;
                break;
            case Number:
                value = newValue !== null ? Number(newValue) : null;
                break;
            case Array:
            case Object:
                try {
                    value = newValue !== null ? JSON.parse(newValue) : null;
                } catch {
                    value = newValue;
                }
                break;
            case String:
            default:
                // For String and fallback, use as-is
                break;
        }
        // Only update if the current value actually differs (prevents attribute ↔ property loop)
        if (_readPropValue(this, prop) !== value) {
            (this as any)[prop] = value;
        }
    }

    /**
     * Constructs a new MiuraElement, initializes properties and shadow root.
     */
    constructor() {
        super();
        // Initialize update promise
        this.resetUpdateCompletePromise();
        // Initialize reactive signal-backed properties (static properties)
        const ctor = this.constructor as typeof MiuraElement;
        if (ctor.properties) {
            createProperties(this, ctor.properties);
        }

        if (ctor.signals) {
            createLocalSignalProperties(this, ctor.signals);
        }

        if (ctor.globals) {
            createGlobalProperties(this, ctor.globals);
        }

        this._initializeChannelFields();

        // Initialize plain non-reactive state fields (static state())
        if (typeof ctor.state === 'function') {
            const stateDecls = ctor.state() || {};
            createStateProperties(this, stateDecls);
        }

        // Initialize computed properties
        if (typeof ctor.computed === 'function') {
            const computedDefinitions = ctor.computed();
            
            // Cache computed definitions for later use
            if (!ctor.__computedDefinitions) {
                ctor.__computedDefinitions = new Map();
                for (const [propertyName, def] of Array.from(Object.entries(computedDefinitions))) {
                    ctor.__computedDefinitions.set(propertyName, def);
                }
            }
            
            for (const propertyName in computedDefinitions) {
                const def = computedDefinitions[propertyName];
                const descriptor: PropertyDescriptor = {
                    enumerable: true,
                    configurable: true,
                    get: () => this._getComputedValue(propertyName),
                    set: (value: any) => {
                        if (def.set) {
                            def.set.call(this, value);
                            // Invalidate cache after setter
                            this._invalidateComputedCache(propertyName);
                        }
                    }
                };

                Object.defineProperty(this, propertyName, descriptor);
            }
        }
        
        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this.applyStyles();
        this._renderStart = document.createComment('miura-root-start');
        this._renderEnd = document.createComment('miura-root-end');
        this._shadowRoot.append(this._renderStart, this._renderEnd);
        this._initialized = true;
        this._pendingUpdate = true;  // Mark for update
    }

    /**
     * Called when the element is inserted into the DOM.
     * Initializes observers and performs initial render.
     * @returns {void}
     */
    connectedCallback(): void {
        debugLog('element', 'Connected callback', {
            constructor: this.constructor.name,
            initialized: this._initialized,
            hasShadowRoot: !!this.shadowRoot
        });
        this.initializeObservers();
        this._subscribePropertySignals();
        this._resolveIslandProps();
        this._setupConnectionSubscriptions();
        if (this._pendingUpdate) {
            this.requestUpdate();  // Single render on connect
        }
        this._reportDebugLayer('idle');
    }

    /**
     * Called when the element is moved to a new document.
     * Delegates to the overridable onAdopt() hook.
     */
    adoptedCallback(): void {
        this.onAdopt();
    }

    /**
     * Called when the element is removed from the DOM.
     * Cleans up observers and resources.
     * @returns {void}
     */
    disconnectedCallback(): void {
        // Call user hook
        this.onUnmount();

        // Clear pending update flag
        this._updateScheduled = false;
        
        // Clear caches to free memory
        this._computedCache.clear();
        this._changedProperties.clear();
        this._debugResources = [];
        this._debugForms = [];
        this._debugRouteSignals = [];

        // Remove slot listeners
        this._slotListeners.forEach((listener, name) => {
            const slot = this._shadowRoot.querySelector(
                name === '' ? 'slot:not([name])' : `slot[name="${name}"]`
            );
            slot?.removeEventListener('slotchange', listener);
        });
        this._slotListeners.clear();
        
        // Tear down property signal subscriptions
        this._propSignalUnsubs.forEach(u => u());
        this._propSignalUnsubs = [];

        // Clean up template instance (JIT path)
        if (this.templateInstance) {
            this.templateInstance.disconnect();
            this.templateInstance = null;
        }

        // Clean up AOT path
        if (this._aotNodeBindings) {
            for (const nb of this._aotNodeBindings) nb.disconnect();
            this._aotNodeBindings = null;
        }
        if (this._aotDirectiveBindings) {
            for (const db of this._aotDirectiveBindings) db.disconnect();
            this._aotDirectiveBindings = null;
        }
        this._aotRefs = null;
        this._aotCompiled = null;
        this._templateStrings = null;

        this.cleanupObservers();
        unregisterDebugLayer(this);
    }

    /**
     * Requests an asynchronous update to the element.
     * @param {PropertyKey} [propertyName] - Name of the property that changed
     * @param {unknown} [oldValue] - Previous value of the property
     * @protected
     * @returns {void}
     */
    protected requestUpdate(propertyName?: PropertyKey, oldValue?: unknown): void {
        debugLog('propertyBinding', 'Request update', {
            constructor: this.constructor.name,
            propertyName,
            oldValue,
            newValue: propertyName ? (this as any)[propertyName] : undefined,
            initialized: this._initialized
        });

        // Track changed properties
        if (propertyName) {
            this._changedProperties.set(propertyName, oldValue);
        }

        // Batch updates using microtask for faster coalescing
        if (!this._updateScheduled) {
            this._updateScheduled = true;
            this.resetUpdateCompletePromise();
            const resolveUpdate = this.updateResolver;
            queueMicrotask(() => {
                this._updateScheduled = false;
                void this.performUpdate(resolveUpdate);
            });
        }
    }

    /**
     * Performs the element update, including template rendering.
     * Handles update coalescing to ensure all updates are processed.
     * @protected
     * @returns {Promise<void>}
     */
    protected async performUpdate(resolveUpdate?: (value: boolean) => void): Promise<void> {
        const previousUpdate = this._updatePromise;
        let updateSucceeded = false;
        const currentUpdate = (async () => {
            if (previousUpdate) {
                await previousUpdate;
            }

            if (!this._initialized) {
                this._pendingUpdate = true;
                return;
            }

            const startTime = performance.now();
            let changedProperties = new Map<PropertyKey, unknown>();
            this._performanceMetrics.updateCount++;
            reportTimelineEvent({
                subsystem: 'element',
                stage: 'update',
                message: `Update started for ${this.localName || this.constructor.name}`,
                componentTag: this.localName || undefined,
                componentClass: this.constructor.name,
                element: this,
                values: {
                    updateCount: this._performanceMetrics.updateCount,
                },
            });

            try {
                // Get all changed properties and clear the map
                changedProperties = new Map(this._changedProperties);
                this._changedProperties.clear();

                // Allow subclass to skip update
                if (!this.shouldUpdate(changedProperties)) {
                    return;
                }

                // Pre-render hook
                this.willUpdate(changedProperties);

                // Clear error state on successful re-render attempt
                this._hasError = false;

                const template = this.template();
                // Duck-typing check for TemplateResult to handle multiple module instances
                const isTemplate = template && 
                                typeof template === 'object' && 
                                'strings' in template && 
                                'values' in template;

                if (isTemplate) {
                    await this.renderTemplateInstance(template as TemplateResult);
                }

                const isFirstRender = !this._hasRendered;
                this._hasRendered = true;

                this.updated(changedProperties);
                this._reportDebugLayer('updated');

                if (isFirstRender && !this._hasCalledFirstUpdated) {
                    this._hasCalledFirstUpdated = true;
                    this.firstUpdated(changedProperties);
                }

                // Call onMount once after first render
                if (isFirstRender) {
                    this.onMount();
                }

                // Track performance
                this._performanceMetrics.renderTime = performance.now() - startTime;
                this._performanceMetrics.lastRenderTime = Date.now();
                reportTimelineEvent({
                    subsystem: 'element',
                    stage: 'render',
                    message: `Render completed for ${this.localName || this.constructor.name}`,
                    componentTag: this.localName || undefined,
                    componentClass: this.constructor.name,
                    element: this,
                    values: {
                        renderTime: this._performanceMetrics.renderTime,
                        updateCount: this._performanceMetrics.updateCount,
                    },
                });
                updateSucceeded = true;
            } catch (error) {
                this._annotateErrorSource(error);
                this._hasError = true;
                this._reportElementDiagnostic(error as Error, changedProperties);
                this._reportDebugLayer('error', error as Error);
                reportTimelineEvent({
                    subsystem: 'element',
                    stage: 'update',
                    severity: 'error',
                    message: `Update failed for ${this.localName || this.constructor.name}`,
                    componentTag: this.localName || undefined,
                    componentClass: this.constructor.name,
                    element: this,
                    values: {
                        error: error instanceof Error ? error.message : String(error),
                    },
                });
                console.error(`Error updating ${this.constructor.name}:`, error);
                this.onError(error as Error);
            }
        })();

        this._updatePromise = currentUpdate;

        try {
            await currentUpdate;
        } finally {
            if (this._updatePromise === currentUpdate) {
                this._updatePromise = null;
            }
            resolveUpdate?.(updateSucceeded);
            if (this.updateResolver === resolveUpdate) {
                this.updateResolver = undefined;
            }
        }
    }

    private resetUpdateCompletePromise(): void {
        this.updateComplete = new Promise((resolve) => {
            this.updateResolver = resolve;
        });
    }

    /**
     * Ensures the template instance is created and updated with the latest values.
     * Only creates a new instance on first render; updates values on subsequent renders.
     * @private
     * @param {TemplateResult} template - The template to render or update
     * @returns {Promise<void>}
     */
    private async renderTemplateInstance(template: TemplateResult): Promise<void> {
        const ctor = this.constructor as typeof MiuraElement;
        ensureUtilityStylesInRoot(this._shadowRoot);

        if (ctor.compiler === 'AOT') {
            // ── AOT path ────────────────────────────────────────────────────────
            // Compile once (cached by TemplateCompiler's WeakMap on strings ref).
            // On first render: create DOM + cache refs. Node bindings are managed
            // by real NodeBinding instances (full JIT quality: TemplateResult,
            // RepeatResult, arrays all handled correctly).
            // On subsequent updates: generated code patches attribute/event/property
            // refs directly; NodeBindings handle complex node content.
            const compiled = _getAotCompiler().compile(template);
            this._aotCompiled = compiled;
            const shouldRecreate = !this._aotRefs || this._templateStrings !== template.strings;

            if (shouldRecreate) {
                this.disconnectAotBindings();
                this.clearRenderedRegion();
                const { fragment, refs } = compiled.render(template.values);
                this._aotRefs = refs;
                this._renderEnd.parentNode?.insertBefore(fragment, this._renderEnd);
                this._templateStrings = template.strings;

                // Create NodeBinding instances for every Node-type ref
                this._aotNodeBindings = [];
                for (const ri of compiled.nodeBindingIndices) {
                    const ref = refs[ri] as any;
                    const nb = new NodeBinding(
                        (ref.startComment?.parentElement ?? this._shadowRoot) as Element,
                        ref.startComment,
                        ref.endComment,
                        this._processor
                    );
                    this._aotNodeBindings.push(nb);
                    await nb.setValue(template.values[ri]);
                }

                // Create DirectiveBinding instances for every Directive-type ref
                this._aotDirectiveBindings = [];
                for (const { refIndex, name } of compiled.directiveBindingInfos) {
                    const ref = refs[refIndex] as any;
                    const db = new DirectiveBinding(ref.el, name);
                    this._aotDirectiveBindings.push(db);
                    await db.setValue(template.values[refIndex]);
                }
            } else {
                // Generated code handles all non-Node, non-Directive bindings
                const values: unknown[] = template.values == null ? [] : template.values;
                compiled.update((this._aotRefs ?? []) as unknown[], values);

                // NodeBindings handle complex node content
                if (this._aotNodeBindings) {
                    for (let i = 0; i < compiled.nodeBindingIndices.length; i++) {
                        const ri = compiled.nodeBindingIndices[i];
                        await this._aotNodeBindings[i].setValue(template.values[ri]);
                    }
                }

                // DirectiveBindings handle structural directives
                if (this._aotDirectiveBindings) {
                    for (let i = 0; i < compiled.directiveBindingInfos.length; i++) {
                        const { refIndex } = compiled.directiveBindingInfos[i];
                        await this._aotDirectiveBindings[i].setValue(template.values[refIndex]);
                    }
                }
            }
        } else {
            // ── JIT path (default) ──────────────────────────────────────────────
            // Full TemplateProcessor pipeline with BindingManager-managed Binding
            // objects. Supports directives, signals, async bindings, etc.
            if (!this.templateInstance || this._templateStrings !== template.strings) {
                if (this.templateInstance) {
                    this.templateInstance.disconnect();
                    this.templateInstance = null;
                }
                this.clearRenderedRegion();
                this.templateInstance = await this._processor.createInstance(template, this);
                this.templateInstance.connect(this);
                this._renderEnd.parentNode?.insertBefore(this.templateInstance.getFragment(), this._renderEnd);
                this._templateStrings = template.strings;
            } else {
                await this.templateInstance.update(template.values, this);
            }
        }
    }

    private clearRenderedRegion(): void {
        let node = this._renderStart.nextSibling;
        while (node && node !== this._renderEnd) {
            const next = node.nextSibling;
            node.parentNode?.removeChild(node);
            node = next;
        }
    }

    private disconnectAotBindings(): void {
        if (this._aotNodeBindings) {
            for (const nb of this._aotNodeBindings) nb.disconnect();
            this._aotNodeBindings = null;
        }
        if (this._aotDirectiveBindings) {
            for (const db of this._aotDirectiveBindings) db.disconnect();
            this._aotDirectiveBindings = null;
        }
        this._aotRefs = null;
        this._aotCompiled = null;
    }

    /**
     * Renders the element's template.
     * Subclasses should override this to return a TemplateResult.
     * @protected
     * @returns {TemplateResult | void}
     */
    protected template(): TemplateResult | void {
        // implement renderPipeline
        return;
    }

    /**
     * Emits a custom event from this element.
     * Convenience wrapper around CustomEvent and dispatchEvent.
     * 
     * @param {string} eventName - The name of the event to emit
     * @param {any} detail - The detail payload for the event
     * @param {CustomEventInit} options - Additional event options (bubbles, composed, cancelable)
     * @returns {boolean} false if event is cancelable and was cancelled, true otherwise
     * 
     * @example
     * this.emit('close');
     * this.emit('selection-change', { selectedIds: [...this._selectedIds] });
     * this.emit('item-select', { id: this.id }, { bubbles: true, composed: true });
     */
    protected emit(eventName: string, detail?: any, options?: CustomEventInit): boolean {
        const event = new CustomEvent(eventName, {
            detail,
            bubbles: options?.bubbles ?? false,
            composed: options?.composed ?? false,
            cancelable: options?.cancelable ?? false,
            ...options
        });
        return this.dispatchEvent(event);
    }

    /**
     * Checks if a named slot has any assigned content.
     * Useful for conditionally rendering UI based on slot content.
     * 
     * @param {string} name - The name of the slot to check
     * @returns {boolean} true if the slot has assigned nodes, false otherwise
     * 
     * @example
     * if (this.hasSlot('actions')) {
     *   // Render actions container
     * }
     */
    protected hasSlot(name: string): boolean {
        const slot = this.shadowRoot?.querySelector(`slot[name="${name}"]`) as HTMLSlotElement | null;
        if (!slot) return false;
        return slot.assignedNodes({ flatten: true }).length > 0;
    }

    /**
     * Called after an update is completed.
     * Subclasses can override to react to updates.
     * @protected
     * @param {PropertyValues} [changedProperties] - Map of changed properties with their previous values
     * @returns {void}
     */
    protected updated(changedProperties?: PropertyValues): void { }

    /**
     * Called once after the first successful render completes.
     * Use for one-time DOM setup that should happen as soon as the initial
     * template is present in the shadow root.
     *
     * @param {PropertyValues} [changedProperties] - Map of changed properties with their previous values
     * @protected
     */
    protected firstUpdated(changedProperties?: PropertyValues): void { }

    /**
     * Called once after the component's first render completes.
     * Use for one-time setup that requires DOM access:
     * fetching data, setting up third-party libraries, etc.
     *
     * @example
     * onMount() {
     *   this.chart = new Chart(this.shadowRoot.querySelector('canvas'));
     *   this.fetchData();
     * }
     * @protected
     */
    protected onMount(): void { }

    /**
     * Called when the element is removed from the DOM.
     * Use for cleanup: cancel fetches, remove global listeners,
     * dispose of resources.
     *
     * @example
     * onUnmount() {
     *   this.abortController?.abort();
     *   this.chart?.destroy();
     * }
     * @protected
     */
    protected onUnmount(): void { }

    /**
     * Called before each render. Use for pre-render computation
     * (e.g., deriving values from changed properties).
     *
     * @param {PropertyValues} changedProperties - Map of changed property names to old values
     * @protected
     */
    protected willUpdate(changedProperties: PropertyValues): void { }

    /**
     * Return false to skip an update entirely.
     * Useful for performance optimization when you know a render is unnecessary.
     *
     * @param {PropertyValues} changedProperties - Map of changed property names to old values
     * @returns {boolean} true to proceed with update (default), false to skip
     * @protected
     */
    protected shouldUpdate(changedProperties: PropertyValues): boolean {
        return true;
    }

    /**
     * Called when the element is moved to a new document (adoptedCallback).
     * Rarely needed — useful for elements that depend on document-level resources.
     * @protected
     */
    protected onAdopt(): void { }

    /**
     * Error boundary handler. Called when an error occurs during rendering.
     * Override to display fallback UI or report errors.
     *
     * Return `true` to indicate the error was handled (suppresses console.error).
     * Return `false` or don't override to let the error propagate.
     *
     * @example
     * onError(error: Error) {
     *   this.errorMessage = error.message;
     *   this.shadowRoot.innerHTML = `<div class="error">${error.message}</div>`;
     *   return true;
     * }
     *
     * @param {Error} error - The error that occurred
     * @returns {boolean} true if the error was handled
     * @protected
     */
    protected onError(error: Error): boolean {
        return false;
    }

    /**
     * Whether this component is currently in an error state.
     */
    get hasError(): boolean {
        return this._hasError;
    }

    // ── Two-Way Binding ─────────────────────────────────────

    /**
     * Create a two-way binder for a reactive property.
     * Returns a `{ value, set }` object that can be passed to an `&` binding.
     *
     * @param {string} propertyName - The reactive property to bind
     * @returns {{ value: unknown, set: (v: unknown) => void }}
     *
     * @example
     * template() {
     *   return html`<input &value=${this.bind('name')}>`;
     * }
     */
    protected bind(propertyName: string): { value: unknown; set: (v: unknown) => void } {
        return {
            value: (this as any)[propertyName],
            set: (v: unknown) => {
                (this as any)[propertyName] = v;
            }
        };
    }

    // ── Standalone signal helpers ────────────────────────────

    /**
     * Create a standalone writable signal tied to this component.
     * Pass it directly to template expressions for fine-grained updates.
     *
     * Use this for reactive state that is NOT part of the public `static
     * properties` interface — e.g. internal counters, derived values, etc.
     *
     * @example
     * readonly #open = this.$signal(false);
     * template() { return html`<dialog ?open=${this.#open}>...</dialog>`; }
     */
    protected $signal<T>(initial: T): Signal<T> {
        return signal(initial);
    }

    /**
     * Create a derived read-only signal tied to this component.
     *
     * @example
     * readonly #doubled = this.$computed(() => this.count() * 2);
     */
    protected $computed<T>(fn: () => T): ReadonlySignal<T> {
        return computed(fn);
    }

    /**
     * Stable proxy for signal-backed fields.
     *
     * Use `this.$.count` in templates to bind directly to the backing Signal of
     * a decorated `@signal` / `@global` field while preserving plain property
     * syntax in component logic.
     */
    protected get $(): Record<string, FieldRef<unknown>> {
        if (!this._signalRefsProxy) {
            this._signalRefsProxy = new Proxy({}, {
                get: (_target, property) => this.$ref(String(property)),
                has: (_target, property) => {
                    const name = String(property);
                    return Boolean(
                        (this as any)[`${LOCAL_SIGNAL_KEY_PREFIX}${name}`]
                        || (this as any)[`${GLOBAL_SIGNAL_KEY_PREFIX}${name}`]
                    );
                },
                ownKeys: () => {
                    const ctor = this.constructor as typeof MiuraElement;
                    return [
                        ...Object.keys(ctor.signals || {}),
                        ...Object.keys(ctor.globals || {}),
                    ];
                },
                getOwnPropertyDescriptor: (_target, property) => {
                    const name = String(property);
                    try {
                        const value = this.$ref(name);
                        return {
                            enumerable: true,
                            configurable: true,
                            value,
                        };
                    } catch {
                        return undefined;
                    }
                },
            }) as Record<string, FieldRef<unknown>>;
        }

        return this._signalRefsProxy;
    }

    /**
     * Access the backing Signal for an `@signal` field by name.
     *
     * This enables direct fine-grained bindings while the decorated field keeps
     * plain property syntax for component logic.
     */
    protected $signalRef<T>(propertyName: string): FieldRef<T> {
        const signalRef = this.$ref<T>(propertyName);
        if (!signalRef || typeof signalRef.subscribe !== 'function') {
            throw new Error(`No local signal found for "${propertyName}".`);
        }
        return signalRef;
    }

    /**
     * Access the backing Signal for an `@global` field by name.
     */
    protected $globalRef<T>(propertyName: string): FieldRef<T> {
        const signalRef = this._resolveFieldRefSignal<T>(propertyName, 'global');
        if (!signalRef || typeof signalRef.subscribe !== 'function') {
            throw new Error(`No global signal found for "${propertyName}".`);
        }
        return this._getOrCreateFieldRef(propertyName, signalRef);
    }

    /**
     * Access the backing Signal for a decorated `@signal` or `@global` field.
     */
    protected $ref<T>(propertyName: string): FieldRef<T> {
        const resolvedSignal =
            this._resolveFieldRefSignal<T>(propertyName, 'local')
            ?? this._resolveFieldRefSignal<T>(propertyName, 'global');
        if (resolvedSignal) {
            return this._getOrCreateFieldRef(propertyName, resolvedSignal);
        }

        throw new Error(`No signal-backed field found for "${propertyName}".`);
    }

    /**
     * Create or retrieve shared reactive state by key.
     * Multiple components using the same key receive the same signal instance.
     */
    protected $shared<T>(key: SharedKey, initial: T): Signal<T> {
        return shared(key, initial);
    }

    /**
     * Create or retrieve a named global event channel with payload.
     */
    protected $beacon<T>(key: string): Beacon<T> {
        return useBeacon<T>(key);
    }

    /**
     * Create or retrieve a named global void event channel.
     */
    protected $pulse(key: string): Pulse {
        return usePulse(key);
    }

    /**
     * Framework-native helper for emitting on beacons and pulses.
     */
    protected $emit(channel: Pulse): void;
    protected $emit<T>(channel: Beacon<T>, value: T): void;
    protected $emit<T>(channel: Beacon<T> | Pulse, value?: T): void {
        (channel as Beacon<T>).emit(value as T);
    }

    /**
     * Subscribe to a beacon or pulse for the lifetime of this component
     * connection. The unsubscribe function is cleaned up automatically on
     * disconnect.
     */
    protected $on(channel: Pulse, listener: () => void): () => void;
    protected $on<T>(channel: Beacon<T>, listener: (value: T) => void): () => void;
    protected $on<T>(channel: Beacon<T> | Pulse, listener: ((value: T) => void) | (() => void)): () => void {
        const unsubscribe = (channel as Beacon<T>).on(listener as (value: T) => void);
        this._propSignalUnsubs.push(unsubscribe);
        return unsubscribe;
    }

    /**
     * Subscribe once to a beacon or pulse for the lifetime of this component
     * connection.
     */
    protected $once(channel: Pulse, listener: () => void): () => void;
    protected $once<T>(channel: Beacon<T>, listener: (value: T) => void): () => void;
    protected $once<T>(channel: Beacon<T> | Pulse, listener: ((value: T) => void) | (() => void)): () => void {
        const unsubscribe = (channel as Beacon<T>).once(listener as (value: T) => void);
        this._propSignalUnsubs.push(unsubscribe);
        return unsubscribe;
    }

    /**
     * Access the nearest enclosing <miura-island> wrapper, if this component was hydrated as an island.
     */
    protected $island(): MiuraIsland | null {
        return findIslandHost(this);
    }

    /**
     * Access the props that were serialized into the nearest enclosing <miura-island>.
     * Returns a stable proxy so it can be assigned during field initialization.
     */
    protected $islandProps<T extends Record<string, any> = Record<string, any>>(): T {
        if (!this._islandPropsProxy) {
            this._islandPropsProxy = new Proxy({}, {
                get: (_target, property) => this._islandPropsValue[property as string],
                has: (_target, property) => property in this._islandPropsValue,
                ownKeys: () => Reflect.ownKeys(this._islandPropsValue),
                getOwnPropertyDescriptor: (_target, property) => {
                    if (property in this._islandPropsValue) {
                        return {
                            enumerable: true,
                            configurable: true,
                            value: this._islandPropsValue[property as string],
                        };
                    }
                    return undefined;
                },
            });
        }

        return this._islandPropsProxy as T;
    }

    /**
     * Create a resource that starts from island-provided data and can optionally revalidate on the client.
     */
    protected $islandResource<T>(
        hydrate: () => T | undefined,
        loader: () => Promise<T> | T,
        options?: Omit<ResourceOptions, 'key'> & {
            key?: ResourceKey | (() => ResourceKey);
            revalidate?: boolean;
        },
    ): Resource<T> {
        const resolvedKey = typeof options?.key === 'function' ? undefined : options?.key;
        const wrappedLoader = async () => {
            reportTimelineEvent({
                subsystem: 'island',
                stage: 'hydration',
                message: 'Island resource refresh started',
                componentTag: this.localName || undefined,
                componentClass: this.constructor.name,
                element: this,
            });
            try {
                const value = await loader();
                reportTimelineEvent({
                    subsystem: 'island',
                    stage: 'hydration',
                    message: 'Island resource refresh resolved',
                    componentTag: this.localName || undefined,
                    componentClass: this.constructor.name,
                    element: this,
                });
                return value;
            } catch (error) {
                reportTimelineEvent({
                    subsystem: 'island',
                    stage: 'hydration',
                    severity: 'error',
                    message: 'Island resource refresh failed',
                    componentTag: this.localName || undefined,
                    componentClass: this.constructor.name,
                    element: this,
                    values: { error: error instanceof Error ? error.message : String(error) },
                });
                throw error;
            }
        };
        const resource = createResource(wrappedLoader, () => this.requestUpdate(), { ...options, auto: false, key: resolvedKey });
        this._registerDebugResource('island-resource', resource as Resource<unknown>, 'island-resource');

        this._connectionSetups.push(() => {
            this._resolveIslandProps();
            if (typeof options?.key === 'function') {
                resource.rekey(options.key());
            }
            const hydratedValue = hydrate();
            if (hydratedValue !== undefined) {
                resource.hydrate(hydratedValue);
                if (options?.revalidate === false) {
                    return;
                }
            } else if (options?.auto === false) {
                return;
            }

            void resource.refresh().catch(() => undefined);
        });

        return resource;
    }

    /**
     * Provide a tree-scoped value to descendant components.
     * Descendants can retrieve it with `$inject()`.
     */
    protected $provide<T>(key: ContextKey<T>, value: T): T {
        return provideContext(this, key, value);
    }

    /**
     * Resolve the nearest tree-scoped value for this component.
     * When the provided value is a signal, descendants can bind it directly for reactive updates.
     */
    protected $inject<T>(key: ContextKey<T>, fallback?: T): T | undefined {
        return consumeContext(this, key, fallback);
    }

    /**
     * Access the current route context as a signal-like value.
     */
    protected $route<TRoute = unknown>(router: RouterBridgeLike) {
        const signal = router.currentSignal as RouteSignalLike<TRoute | undefined>;
        this._registerDebugRouteSignal(signal as RouteSignalLike<unknown>, 'route.current');
        return signal;
    }

    /**
     * Derive a reactive value from the current route context.
     */
    protected $routeSelect<T>(router: RouterBridgeLike, selector: (context: unknown) => T) {
        const signal = router.select(selector);
        this._registerDebugRouteSignal(signal as RouteSignalLike<unknown>, 'route.select');
        return signal;
    }

    /**
     * Access route loader data by key as a signal-like value.
     */
    protected $routeData<T = unknown>(router: RouterBridgeLike): RouteSignalLike<T | undefined>;
    protected $routeData<T = unknown>(router: RouterBridgeLike, key: string, fallback?: T): RouteSignalLike<T | undefined>;
    protected $routeData<T = unknown>(router: RouterBridgeLike, key?: string, fallback?: T) {
        const signal = key === undefined
            ? router.dataSignal<T>()
            : router.dataSignal<T>(key, fallback);
        this._registerDebugRouteSignal(signal as RouteSignalLike<unknown>, key ? `route.data:${key}` : 'route.data');
        return signal;
    }

    /**
     * Create a resource that refreshes whenever a selected route-derived value changes.
     */
    protected $routeResource<TKey, T>(
        router: RouterBridgeLike,
        selector: (context: unknown) => TKey,
        loader: (key: TKey) => Promise<T> | T,
        options?: ResourceOptions & {
            skip?: (key: TKey) => boolean;
            equals?: (previous: TKey, next: TKey) => boolean;
            key?: ResourceKey | ((key: TKey) => ResourceKey);
            hydrateFromRouteData?: true | string | ((context: unknown) => T | undefined);
        },
    ): Resource<T> {
        const selected = router.select(selector);
        const currentKey = selected.peek();
        const resource = createResource(
            async () => {
                const selectedKey = selected.peek();
                reportTimelineEvent({
                    subsystem: 'router',
                    stage: 'loader',
                    message: 'Route resource refresh started',
                    componentTag: this.localName || undefined,
                    componentClass: this.constructor.name,
                    element: this,
                    values: { key: selectedKey },
                });
                try {
                    const value = await loader(selectedKey);
                    reportTimelineEvent({
                        subsystem: 'router',
                        stage: 'loader',
                        message: 'Route resource refresh resolved',
                        componentTag: this.localName || undefined,
                        componentClass: this.constructor.name,
                        element: this,
                        values: { key: selectedKey },
                    });
                    return value;
                } catch (error) {
                    reportTimelineEvent({
                        subsystem: 'router',
                        stage: 'loader',
                        severity: 'error',
                        message: 'Route resource refresh failed',
                        componentTag: this.localName || undefined,
                        componentClass: this.constructor.name,
                        element: this,
                        values: {
                            key: selectedKey,
                            error: error instanceof Error ? error.message : String(error),
                        },
                    });
                    throw error;
                }
            },
            () => this.requestUpdate(),
            {
                ...options,
                auto: false,
                key: this._resolveRouteResourceKey(currentKey, options?.key),
            },
        );
        this._registerDebugRouteSignal(selected as RouteSignalLike<unknown>, 'route.resource:key');
        this._registerDebugResource('route-resource', resource as Resource<unknown>, 'route-resource');
        const equals = options?.equals ?? Object.is;
        const skip = options?.skip ?? (() => false);
        let hasValue = false;
        let previousValue!: TKey;

        this._connectionSetups.push(() => {
            const sync = (nextValue: TKey) => {
                resource.rekey(this._resolveRouteResourceKey(nextValue, options?.key));
                this._hydrateRouteResource(router, resource, options?.hydrateFromRouteData);
                if (skip(nextValue)) {
                    hasValue = false;
                    return;
                }

                if (hasValue && equals(previousValue, nextValue)) {
                    return;
                }

                previousValue = nextValue;
                hasValue = true;
                void resource.refresh().catch(() => undefined);
            };

            sync(selected.peek());
            return selected.subscribe(sync);
        });

        return resource;
    }

    private _resolveRouteResourceKey<TKey>(
        selectedKey: TKey,
        explicitKey?: ResourceKey | ((key: TKey) => ResourceKey),
    ): ResourceKey | undefined {
        if (typeof explicitKey === 'function') {
            return explicitKey(selectedKey);
        }

        if (explicitKey !== undefined) {
            return explicitKey;
        }

        if (selectedKey === undefined || selectedKey === null || typeof selectedKey === 'object') {
            return undefined;
        }

        return resourceKey('route', selectedKey as string | number | boolean);
    }

    private _hydrateRouteResource<T>(
        router: RouterBridgeLike,
        resource: Resource<T>,
        hydrateFromRouteData?: true | string | ((context: unknown) => T | undefined),
    ): void {
        if (!hydrateFromRouteData) {
            return;
        }

        const context = router.currentSignal.peek();
        if (!context) {
            return;
        }

        const hydratedValue = typeof hydrateFromRouteData === 'function'
            ? hydrateFromRouteData(context)
            : hydrateFromRouteData === true
                ? (() => {
                    const data = router.dataSignal<Record<string, unknown>>().peek();
                    return data && Object.keys(data).length > 0 ? (data as T) : undefined;
                })()
            : router.dataSignal<T>(hydrateFromRouteData).peek();

        if (hydratedValue !== undefined) {
            resource.hydrate(hydratedValue);
        }
    }

    /**
     * Create a resource tied to this component.
     * A resource tracks async loading state and requests an update whenever its
     * state changes.
     */
    protected $resource<T>(
        loader: () => Promise<T> | T,
        options?: ResourceOptions
    ): Resource<T> {
        const wrappedLoader = async () => {
            reportTimelineEvent({
                subsystem: 'element',
                stage: 'loader',
                message: 'Resource refresh started',
                componentTag: this.localName || undefined,
                componentClass: this.constructor.name,
                element: this,
            });
            try {
                const value = await loader();
                reportTimelineEvent({
                    subsystem: 'element',
                    stage: 'loader',
                    message: 'Resource refresh resolved',
                    componentTag: this.localName || undefined,
                    componentClass: this.constructor.name,
                    element: this,
                });
                return value;
            } catch (error) {
                reportTimelineEvent({
                    subsystem: 'element',
                    stage: 'loader',
                    severity: 'error',
                    message: 'Resource refresh failed',
                    componentTag: this.localName || undefined,
                    componentClass: this.constructor.name,
                    element: this,
                    values: { error: error instanceof Error ? error.message : String(error) },
                });
                throw error;
            }
        };
        const resource = createResource(wrappedLoader, () => this.requestUpdate(), options);
        this._registerDebugResource('resource', resource as Resource<unknown>, 'resource');
        return resource;
    }

    /**
     * Create a form tied to this component.
     * A form tracks values, dirty/touched state, validation, and submit state.
     */
    protected $form<T extends Record<string, any>>(
        initialValues: T,
        options?: FormOptions<T>
    ): Form<T> {
        const form = createForm(initialValues, () => this.requestUpdate(), options);
        const originalSubmit = form.submit.bind(form);
        form.submit = (async <R>(handler: (values: Readonly<T>, form: Form<T>) => Promise<R> | R): Promise<R> => {
            reportTimelineEvent({
                subsystem: 'element',
                stage: 'runtime',
                message: 'Form submit started',
                componentTag: this.localName || undefined,
                componentClass: this.constructor.name,
                element: this,
                values: { values: form.values },
            });
            try {
                const result = await originalSubmit(handler);
                reportTimelineEvent({
                    subsystem: 'element',
                    stage: 'runtime',
                    message: 'Form submit resolved',
                    componentTag: this.localName || undefined,
                    componentClass: this.constructor.name,
                    element: this,
                });
                return result;
            } catch (error) {
                reportTimelineEvent({
                    subsystem: 'element',
                    stage: 'runtime',
                    severity: 'error',
                    message: 'Form submit failed',
                    componentTag: this.localName || undefined,
                    componentClass: this.constructor.name,
                    element: this,
                    values: { error: error instanceof Error ? error.message : String(error) },
                });
                throw error;
            }
        }) as Form<T>['submit'];

        const originalValidateAsync = form.validateAsync.bind(form);
        form.validateAsync = (async (): Promise<boolean> => {
            reportTimelineEvent({
                subsystem: 'element',
                stage: 'runtime',
                message: 'Async form validation started',
                componentTag: this.localName || undefined,
                componentClass: this.constructor.name,
                element: this,
            });
            const valid = await originalValidateAsync();
            reportTimelineEvent({
                subsystem: 'element',
                stage: 'runtime',
                message: valid ? 'Async form validation passed' : 'Async form validation failed',
                severity: valid ? 'info' : 'warning',
                componentTag: this.localName || undefined,
                componentClass: this.constructor.name,
                element: this,
                values: { errors: form.errors },
            });
            return valid;
        }) as Form<T>['validateAsync'];
        this._registerDebugForm(form as Form<Record<string, any>>);
        return form;
    }

    // ── Slot Utilities ──────────────────────────────────────

    /**
     * Query slotted elements assigned to a named slot (or default slot).
     *
     * @param {string} [slotName=''] - Name of the slot. Empty string for default slot.
     * @returns {Element[]} Array of elements assigned to the slot.
     *
     * @example
     * const items = this.querySlotted('items');
     * const defaultContent = this.querySlotted();
     */
    protected querySlotted(slotName: string = ''): Element[] {
        const selector = slotName
            ? `slot[name="${slotName}"]`
            : 'slot:not([name])';
        const slot = this._shadowRoot.querySelector(selector) as HTMLSlotElement | null;
        if (!slot) return [];
        return slot.assignedElements({ flatten: true });
    }

    /**
     * Register a callback for slot change events.
     * Automatically cleaned up on disconnect.
     *
     * @param {string} slotName - Name of the slot (empty string for default)
     * @param {(elements: Element[]) => void} callback - Called with the new assigned elements
     *
     * @example
     * onMount() {
     *   this.onSlotChange('', (elements) => {
     *     console.log('Default slot changed:', elements);
     *   });
     *   this.onSlotChange('header', (elements) => {
     *     this.hasHeader = elements.length > 0;
     *   });
     * }
     */
    protected onSlotChange(slotName: string, callback: (elements?: Element[]) => void): void {
        // Wait for next microtask to ensure template is rendered
        queueMicrotask(() => {
            const selector = slotName
                ? `slot[name="${slotName}"]`
                : 'slot:not([name])';
            const slot = this._shadowRoot.querySelector(selector) as HTMLSlotElement | null;
            if (!slot) return;

            const listener = () => {
                const elements = slot.assignedElements({ flatten: true });
                callback(elements);
            };

            // Remove previous listener for this slot if any
            const prevListener = this._slotListeners.get(slotName);
            if (prevListener) {
                slot.removeEventListener('slotchange', prevListener);
            }

            slot.addEventListener('slotchange', listener);
            this._slotListeners.set(slotName, listener);

            // Fire immediately with current state
            listener();
        });
    }

    /**
     * Apply the component's styles to its shadow root.
     * @private
     * @returns {void}
     */
    private applyStyles(): void {
        const styles = this.getComponentStyles();
        if (Array.isArray(styles)) {
            styles.forEach(style => style.applyTo(this._shadowRoot));
        } else if (styles) {
            styles.applyTo(this._shadowRoot);
        }
    }

    /**
     * Returns the component's styles, supporting both static property and static getter.
     */
    protected getComponentStyles(): CSSResult | CSSResult[] | undefined {
        const ctor = this.constructor as any;
        
        // 1. Try property descriptor to support getters
        const desc = Object.getOwnPropertyDescriptor(ctor, 'styles');
        if (desc) {
            if (typeof desc.get === 'function') {
                return ctor.styles;
            }
            return desc.value;
        }
        
        // 2. Fallback to direct property access (handles prototype inheritance and Babel-defined properties)
        return ctor.styles;
    }

    /**
     * Subscribes each signal-backed property (and state) to call requestUpdate()
     * when its value changes. Called in connectedCallback, torn down in
     * disconnectedCallback via _propSignalUnsubs.
     * @private
     */
    private _subscribePropertySignals(): void {
        const ctor = this.constructor as typeof MiuraElement;
        const propKeys = Object.keys(ctor.properties || {});
        const stateKeys = typeof ctor.state === 'function'
            ? Object.keys(ctor.state() || {})
            : [];
        const globalKeys = Object.keys(ctor.globals || {});

        for (const name of [...propKeys, ...stateKeys, ...globalKeys]) {
            const sig = (this as any)[`${SIGNAL_KEY_PREFIX}${name}`]
                ?? (this as any)[`${GLOBAL_SIGNAL_KEY_PREFIX}${name}`];
            if (sig && typeof sig.subscribe === 'function') {
                const unsub = sig.subscribe(() => {
                    this._invalidateComputedCache(name);
                    this.requestUpdate(name);
                });
                this._propSignalUnsubs.push(unsub);
            }
        }
    }

    private _setupConnectionSubscriptions(): void {
        for (const setup of this._connectionSetups) {
            const unsub = setup();
            if (typeof unsub === 'function') {
                this._propSignalUnsubs.push(unsub);
            }
        }
    }

    private _resolveIslandProps(): void {
        this._islandPropsValue = readIslandProps<Record<string, unknown>>(this) ?? {};
    }

    private _initializeChannelFields(): void {
        const ctor = this.constructor as typeof MiuraElement;

        for (const [name, channel] of Object.entries(ctor.beacons || {})) {
            if (Object.prototype.hasOwnProperty.call(this, name)) {
                continue;
            }
            Object.defineProperty(this, name, {
                value: channel,
                writable: false,
                enumerable: true,
                configurable: true,
            });
        }

        for (const [name, channel] of Object.entries(ctor.pulses || {})) {
            if (Object.prototype.hasOwnProperty.call(this, name)) {
                continue;
            }
            Object.defineProperty(this, name, {
                value: channel,
                writable: false,
                enumerable: true,
                configurable: true,
            });
        }
    }

    private _resolveFieldRefSignal<T>(propertyName: string, scope: 'local' | 'global'): Signal<T> | undefined {
        const keyPrefix = scope === 'local' ? LOCAL_SIGNAL_KEY_PREFIX : GLOBAL_SIGNAL_KEY_PREFIX;
        const signalRef = (this as any)[`${keyPrefix}${propertyName}`];
        if (signalRef && typeof signalRef.subscribe === 'function') {
            return signalRef as Signal<T>;
        }
        return undefined;
    }

    private _getOrCreateFieldRef<T>(propertyName: string, signalRef: Signal<T>): FieldRef<T> {
        const cached = this._fieldRefCache.get(propertyName);
        if (cached) {
            return cached as FieldRef<T>;
        }

        const created = createFieldRef(signalRef);
        this._fieldRefCache.set(propertyName, created as FieldRef<unknown>);
        return created;
    }

    private _registerDebugResource(kind: DebugResourceRegistration['kind'], resource: Resource<unknown>, label?: string): void {
        const existing = this._debugResources.find((entry) => entry.resource === resource);
        if (existing) {
            existing.kind = kind;
            existing.label = label ?? existing.label;
            return;
        }

        this._debugResources.push({
            kind,
            label: label ?? `${kind}-${this._debugResources.length + 1}`,
            resource,
        });
    }

    private _registerDebugForm(form: Form<Record<string, any>>, label?: string): void {
        const existing = this._debugForms.find((entry) => entry.form === form);
        if (existing) {
            existing.label = label ?? existing.label;
            return;
        }

        this._debugForms.push({
            label: label ?? `form-${this._debugForms.length + 1}`,
            form,
        });
    }

    private _registerDebugRouteSignal(signal: RouteSignalLike<unknown>, label: string): void {
        const existing = this._debugRouteSignals.find((entry) => entry.signal === signal);
        if (existing) {
            existing.label = label;
            return;
        }

        this._debugRouteSignals.push({ label, signal });
    }

    private _getComponentDebugOptions() {
        const ctor = this.constructor as typeof MiuraElement & { debug?: Record<string, unknown> };
        return {
            ...getComponentDebugOptions(ctor),
            ...(ctor.debug ?? {}),
        };
    }

    private _createDebugValuesSnapshot(): Record<string, unknown> {
        const ctor = this.constructor as typeof MiuraElement;
        const propKeys = Object.keys(ctor.properties || {});
        const stateKeys = typeof ctor.state === 'function'
            ? Object.keys(ctor.state() || {})
            : [];
        const computedKeys = ctor.__computedDefinitions
            ? Array.from(ctor.__computedDefinitions.keys())
            : [];
        const keys = Array.from(new Set([...propKeys, ...stateKeys, ...computedKeys]));

        return Object.fromEntries(
            keys.map((key) => [key, (this as any)[key]])
        );
    }

    private _createDebugResourceSnapshot(): Array<Record<string, unknown>> {
        return this._debugResources.map(({ kind, label, resource }) => ({
            kind,
            label,
            key: resource.key,
            state: resource.state,
            loading: resource.loading,
            refreshing: resource.refreshing,
            hasValue: resource.value !== undefined,
            value: resource.value,
            error: resource.error,
        }));
    }

    private _createDebugFormSnapshot(): Array<Record<string, unknown>> {
        return this._debugForms.map(({ label, form }) => ({
            label,
            values: form.values,
            errors: form.errors,
            visibleErrors: form.visibleErrors,
            dirty: form.dirty,
            valid: form.valid,
            validating: form.validating,
            submitting: form.submitting,
            submitSucceeded: form.submitSucceeded,
            submitError: form.submitError,
            touched: Array.from(form.touched),
        }));
    }

    private _createDebugRouteSnapshot(): Array<Record<string, unknown>> {
        return this._debugRouteSignals.map(({ label, signal }) => ({
            label,
            value: signal.peek(),
        }));
    }

    private _reportDebugLayer(status: 'idle' | 'updated' | 'error', error?: Error): void {
        const options = this._getComponentDebugOptions();
        if (options.disabled || options.layers === false) {
            unregisterDebugLayer(this);
            return;
        }

        const ctor = this.constructor as typeof MiuraElement;
        const label = options.label || this.localName || ctor.tagName || ctor.name;
        registerDebugLayer({
            id: `${this.localName || this.constructor.name}-${this._performanceMetrics.updateCount}`,
            label,
            element: this,
            status,
            renderTime: options.performance === false ? undefined : this._performanceMetrics.renderTime,
            updateCount: this._performanceMetrics.updateCount,
            errorMessage: error?.message,
            color: options.color,
            showName: options.showName,
            showRenderTime: options.showRenderTime ?? options.performance,
            componentTag: this.localName || ctor.tagName,
            componentClass: ctor.name,
            valuesSnapshot: this._createDebugValuesSnapshot(),
            resources: this._createDebugResourceSnapshot(),
            forms: this._createDebugFormSnapshot(),
            routes: this._createDebugRouteSnapshot(),
            metrics: {
                renderTime: this._performanceMetrics.renderTime,
                updateCount: this._performanceMetrics.updateCount,
                lastRenderTime: this._performanceMetrics.lastRenderTime,
            },
        });
    }

    private _reportElementDiagnostic(error: Error, changedPropertiesMap?: Map<PropertyKey, unknown>): void {
        const options = this._getComponentDebugOptions();
        if (options.disabled || options.report === false) {
            return;
        }

        const ctor = this.constructor as typeof MiuraElement;
        const source = this._resolveDiagnosticSource(error);
        const changedProperties = Object.fromEntries(
            Array.from((changedPropertiesMap ?? this._changedProperties).entries()).map(([key]) => [String(key), (this as any)[key]])
        );
        const hasChangedProperties = Object.keys(changedProperties).length > 0;

        reportDiagnostic({
            subsystem: 'element',
            stage: 'update',
            severity: 'error',
            message: `Failed to update ${options.label ?? source.componentTag ?? ctor.tagName ?? this.localName ?? ctor.name}`,
            summary: error.message,
            componentTag: options.label ?? source.componentTag,
            componentClass: source.componentClass,
            valuesSnapshot: hasChangedProperties ? changedProperties : undefined,
            stack: error.stack,
            error,
            element: source.element,
        });
    }

    private _annotateErrorSource(error: unknown): void {
        if (!(error instanceof Error)) {
            return;
        }

        const sourceError = error as MiuraSourceError;
        if (!sourceError.miuraSourceElement) {
            sourceError.miuraSourceElement = this;
        }

        if (!sourceError.miuraComponentTag) {
            const ctor = this.constructor as typeof MiuraElement;
            sourceError.miuraComponentTag = this.localName || ctor.tagName || ctor.name;
        }

        if (!sourceError.miuraComponentClass) {
            sourceError.miuraComponentClass = this.constructor.name;
        }
    }

    private _resolveDiagnosticSource(error: Error): {
        element: HTMLElement;
        componentTag: string;
        componentClass: string;
    } {
        const ctor = this.constructor as typeof MiuraElement;
        const sourceError = error as MiuraSourceError;

        return {
            element: sourceError.miuraSourceElement ?? this,
            componentTag: sourceError.miuraComponentTag ?? this.localName ?? ctor.tagName ?? ctor.name,
            componentClass: sourceError.miuraComponentClass ?? ctor.name,
        };
    }

    /**
     * Initializes property observers and event listeners.
     * Subclasses can override to set up observers.
     * @private
     * @returns {void}
     */
    protected initializeObservers(): void {}

    /**
     * Cleans up observers and event listeners.
     * Subclasses can override to clean up observers.
     * @private
     * @returns {void}
     */
    protected cleanupObservers(): void {}

    /**
     * Subclasses can override to define internal, non-reflected state fields.
     * @returns {PropertyDeclarations}
     */
    static state?(): PropertyDeclarations;

    /**
     * Get performance metrics for this element
     * @returns {PerformanceMetrics}
     */
    get performanceMetrics() {
        return { ...this._performanceMetrics };
    }
}
