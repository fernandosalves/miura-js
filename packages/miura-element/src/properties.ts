import { signal, Signal } from './signals.js';

/**
 * Options for defining a property.
 */
export interface PropertyOptions {
    type: NumberConstructor | StringConstructor | BooleanConstructor | ArrayConstructor | ObjectConstructor;
    attribute?: string;
    reflect?: boolean;
    default?: any;
}

/**
 * Property declarations for a component.
 */
export interface PropertyDeclarations {
    [key: string]: PropertyOptions;
}

// ── Signal-backed reactive properties ────────────────────────────────────────

/**
 * Signal key prefix — used to look up a property's backing signal on an instance.
 * e.g.  element.__sig_count   → Signal<number> for property "count"
 */
export const SIGNAL_KEY_PREFIX = '__sig_';

/**
 * Creates signal-backed property accessors for `static properties`.
 *
 * - Getter returns the PLAIN VALUE — `this.count` → `5`, not a Signal.
 *   This preserves natural JS idioms: `this.count === 0`, `this.count * 2`, etc.
 * - Setter writes to the backing signal.
 * - The signal can be retrieved via `element.__sig_<name>` for subscriptions.
 * - `requestUpdate()` is wired up in `MiuraElement.connectedCallback()` via
 *   `_subscribePropertySignals()`, so DOM updates are triggered automatically.
 */
export function createProperties(
    instance: any,
    properties: PropertyDeclarations,
): void {
    for (const [name, options] of Object.entries(properties)) {
        _createSignalProperty(instance, name, options);
    }
}

function _createSignalProperty(
    instance: any,
    name: string,
    options: PropertyOptions,
): void {
    const sigKey = `${SIGNAL_KEY_PREFIX}${name}`;
    const defaultVal = 'default' in options
        ? convertValue(options.default, options.type)
        : null;

    // Create signal EAGERLY so subscriptions can be set up in connectedCallback
    const s = signal(defaultVal);

    // Store as non-enumerable so it doesn't show up in template evaluation etc.
    Object.defineProperty(instance, sigKey, {
        value: s,
        writable: false,
        enumerable: false,
        configurable: false,
    });

    // Attribute reflection — fires whenever the signal changes
    if (options.reflect) {
        s.subscribe((v) => {
            if (!instance.isConnected) return;
            const attrName = options.attribute || name.toLowerCase();
            if (v == null) {
                instance.removeAttribute(attrName);
            } else if (options.type === Boolean) {
                v ? instance.setAttribute(attrName, '') : instance.removeAttribute(attrName);
            } else {
                instance.setAttribute(attrName, String(v));
            }
        });
    }

    // Property accessor — getter returns PLAIN VALUE, setter writes to signal
    Object.defineProperty(instance, name, {
        get() {
            return (this as any)[sigKey].peek();
        },
        set(rawValue: unknown) {
            const converted = convertValue(rawValue, options.type);
            (this as any)[sigKey](converted);
        },
        configurable: true,
        enumerable: true,
    });
}

// ── Signal-backed internal state properties ───────────────────────────────────

/**
 * Creates signal-backed property accessors for `static state()`.
 *
 * Identical to `static properties` in reactivity — setting a state property
 * notifies only the DOM bindings that reference it (fine-grained, no full
 * re-render). The ONLY difference from `static properties` is that state
 * properties are NEVER reflected to HTML attributes and are not added to
 * `observedAttributes` — they are internal to the component.
 */
export function createStateProperties(
    instance: any,
    properties: PropertyDeclarations,
): void {
    for (const [name, options] of Object.entries(properties)) {
        // Force reflect: false — state is always internal
        _createSignalProperty(instance, name, { ...options, reflect: false });
    }
}

// ── Value conversion ──────────────────────────────────────────────────────────

export function convertValue(value: unknown, type: PropertyOptions['type']): unknown {
    if (value == null) return value;
    switch (type) {
        case String:  return String(value);
        case Number:  return Number(value);
        case Boolean: return Boolean(value);
        case Array:   return Array.isArray(value) ? value : [value];
        case Object:  return Object(value);
        default:      return value;
    }
}
