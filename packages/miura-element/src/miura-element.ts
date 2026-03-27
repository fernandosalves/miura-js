import { PropertyValues } from './property-values';
import { PropertyDeclarations, createProperties, createStateProperties, SIGNAL_KEY_PREFIX } from './properties';
import { signal, computed, Signal, ReadonlySignal } from './signals.js';

import { TemplateResult, CSSResult, debugLog } from '@miurajs/miura-render';
import { TemplateProcessor, TemplateCompiler, NodeBinding, DirectiveBinding } from '@miurajs/miura-render';
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
        this.updateComplete = new Promise(r => this.updateResolver = r);
        // Initialize reactive signal-backed properties (static properties)
        const ctor = this.constructor as typeof MiuraElement;
        if (ctor.properties) {
            createProperties(this, ctor.properties);
        }

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
        if (this._pendingUpdate) {
            this.requestUpdate();  // Single render on connect
        }
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
        
        this.cleanupObservers();
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
            queueMicrotask(() => {
                this._updateScheduled = false;
                this.performUpdate();
            });
        }
    }

    /**
     * Performs the element update, including template rendering.
     * Handles update coalescing to ensure all updates are processed.
     * @protected
     * @returns {Promise<void>}
     */
    protected async performUpdate(): Promise<void> {
        if (!this._initialized) {
            this._pendingUpdate = true;
            return;
        }

        const startTime = performance.now();
        this._performanceMetrics.updateCount++;

        try {
            // Get all changed properties and clear the map
            const changedProperties = new Map(this._changedProperties);
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
            if (template instanceof TemplateResult) {
                await this.renderTemplateInstance(template);
            }

            const isFirstRender = !this._hasRendered;
            this._hasRendered = true;

            this.updated(changedProperties);

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
        } catch (error) {
            this._hasError = true;
            const handled = this.onError(error as Error);
            if (!handled) {
                console.error(`Error updating ${this.constructor.name}:`, error);
            }
        }
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

            if (!this._aotRefs) {
                const { fragment, refs } = compiled.render(template.values);
                this._aotRefs = refs;
                this._shadowRoot.appendChild(fragment);

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
                compiled.update(this._aotRefs, template.values);

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
            if (!this.templateInstance) {
                this.templateInstance = await this._processor.createInstance(template, this);
                this.templateInstance.connect(this);
                this._shadowRoot.appendChild(this.templateInstance.getFragment());
            } else {
                await this.templateInstance.update(template.values, this);
            }
        }
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
        const desc = Object.getOwnPropertyDescriptor(ctor, 'styles');
        if (desc) {
            if (typeof desc.get === 'function') {
                return ctor.styles;
            }
            return desc.value;
        }
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

        for (const name of [...propKeys, ...stateKeys]) {
            const sig = (this as any)[`${SIGNAL_KEY_PREFIX}${name}`];
            if (sig && typeof sig.subscribe === 'function') {
                const unsub = sig.subscribe(() => this.requestUpdate(name));
                this._propSignalUnsubs.push(unsub);
            }
        }
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
