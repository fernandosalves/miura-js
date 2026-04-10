import type { ComponentDebugOptions } from '@miurajs/miura-debugger';
import { setComponentDebugOptions } from '@miurajs/miura-debugger';
import { MiuraElement } from "./miura-element";
import { consumeContext, type ContextKey } from "./context.js";
import { createBeacon, createPulse, type Beacon, type Pulse } from './channels.js';

export interface ComponentOptions {
    tag?: string;
}

export interface PropertyOptions {
    type?: typeof String | typeof Number | typeof Boolean | typeof Array | typeof Object;
    default?: unknown;
    attribute?: string | false;
    reflect?: boolean;
}

export interface StateOptions {
    type?: typeof String | typeof Number | typeof Boolean | typeof Array | typeof Object;
    default?: unknown;
}

export interface SignalOptions {
    type?: typeof String | typeof Number | typeof Boolean | typeof Array | typeof Object;
    default?: unknown;
}

export interface GlobalOptions {
    key?: string | readonly (string | number)[];
    initial?: unknown;
}

export interface BeaconOptions<T = unknown> {
    channel?: Beacon<T>;
    key?: string;
}

export interface PulseOptions {
    channel?: Pulse;
    key?: string;
}

export type ComponentDebugDecoratorOptions = ComponentDebugOptions;

/**
 * Class decorator that registers the custom element
 * @example
 * @component({ tag: 'my-element' })
 * class MyElement extends MiuraElement { ... }
 */
export function component<T extends typeof MiuraElement>(options: ComponentOptions) {
    return function (target: T): T {
        // Register the element
        if (options.tag) {
            customElements.define(options.tag, target);
        }
        return target;
    };
}

/**
 * Class decorator for component-specific debugger configuration.
 */
export function debug<T extends typeof MiuraElement>(options: ComponentDebugDecoratorOptions = {}) {
    return function (target: T): T {
        setComponentDebugOptions(target, options);
        return target;
    };
}

/**
 * Compatibility alias for earlier debugger decorator naming.
 */
export const componentDebug = debug;

/**
 * Property decorator for reactive properties that can be set via attributes
 * @example
 * @component({ tag: 'my-element' })
 * class MyElement extends MiuraElement {
 *   @property({ type: String, default: '' })
 *   name!: string;
 * }
 */
export function property(options: PropertyOptions = {}) {
    return function (target: MiuraElement, propertyKey: string) {
        const constructor = target.constructor as typeof MiuraElement & { properties?: Record<string, PropertyOptions> };

        // Ensure properties object exists
        if (!constructor.hasOwnProperty('properties')) {
            constructor.properties = { ...constructor.properties };
        }

        // Add this property to the static properties
        constructor.properties![propertyKey] = {
            type: options.type ?? _inferType(options.default),
            default: options.default,
            attribute: options.attribute !== undefined ? options.attribute : propertyKey.toLowerCase(),
            reflect: options.reflect,
        };
    };
}

function _inferType(defaultValue: unknown): typeof String | typeof Number | typeof Boolean | typeof Array | typeof Object | undefined {
    if (defaultValue === undefined) return undefined;
    if (defaultValue === null) return Object;
    if (typeof defaultValue === 'boolean') return Boolean;
    if (typeof defaultValue === 'number') return Number;
    if (typeof defaultValue === 'string') return String;
    if (Array.isArray(defaultValue)) return Array;
    return Object;
}

/**
 * State decorator for internal reactive state (not reflected to attributes)
 * @example
 * @component({ tag: 'my-element' })
 * class MyElement extends MiuraElement {
 *   @state({ default: false })
 *   isOpen!: boolean;
 * }
 */
export function state(options: StateOptions = {}) {
    return function (target: MiuraElement, propertyKey: string) {
        const constructor = target.constructor as typeof MiuraElement & {
            state?: () => Record<string, PropertyOptions>
        };

        // Get existing state declarations from any previous @state decorators
        const existingState = typeof constructor.state === 'function'
            ? constructor.state()
            : {};

        // Infer type from default value when not explicitly provided
        const inferredType = options.type ?? _inferType(options.default);

        // Merge new state property with existing ones
        const newState = {
            ...existingState,
            [propertyKey]: {
                type: inferredType,
                default: options.default,
            }
        };

        // Create/update the static state() function
        constructor.state = () => newState;
    };
}

/**
 * Local signal-backed field metadata.
 *
 * This is the decorator counterpart to `$signal()`, but field instances still
 * expose plain property syntax. Bindings can opt into fine-grained updates by
 * reading the backing signal through `this.$signalRef(name)`.
 */
export function signal(options: SignalOptions = {}) {
    return function (target: MiuraElement, propertyKey: string) {
        const constructor = target.constructor as typeof MiuraElement & {
            signals?: Record<string, PropertyOptions>
        };

        if (!Object.prototype.hasOwnProperty.call(constructor, 'signals')) {
            constructor.signals = { ...(constructor.signals || {}) };
        }

        constructor.signals![propertyKey] = {
            type: options.type ?? _inferType(options.default),
            default: options.default,
        };
    };
}

/**
 * Property decorator that automatically consumes a context value from the DOM tree.
 * 
 * This decorator uses a lazy getter mechanism which solves the "constructor bug"
 * (where context lookups fail because the element is not yet connected).
 * 
 * @example
 * class MyElement extends MiuraElement {
 *   @consume(MY_CONTEXT)
 *   data!: MyContextType;
 * }
 */
export function consume<T>(key: ContextKey<T>) {
    return function (target: MiuraElement, propertyKey: string) {
        Object.defineProperty(target, propertyKey, {
            get(this: MiuraElement) {
                return consumeContext(this, key);
            },
            enumerable: true,
            configurable: true,
        });
    };
}

/**
 * Early decorator scaffold for the upcoming shared global-state primitive.
 *
 * This stores only metadata for now so the public API can settle before the
 * runtime field wiring becomes permanent.
 */
export function global(options: GlobalOptions = {}) {
    return function (target: MiuraElement, propertyKey: string) {
        const constructor = target.constructor as typeof MiuraElement & {
            globals?: Record<string, GlobalOptions>
        };

        if (!Object.prototype.hasOwnProperty.call(constructor, 'globals')) {
            constructor.globals = { ...(constructor.globals || {}) };
        }

        constructor.globals![propertyKey] = {
            key: options.key,
            initial: options.initial,
        };
    };
}

/**
 * Early decorator scaffold for payload event channels.
 */
export function beacon<T = unknown>(options: BeaconOptions<T> = {}) {
    return function (target: MiuraElement, propertyKey: string) {
        const constructor = target.constructor as typeof MiuraElement & {
            beacons?: Record<string, Beacon<unknown>>
        };

        if (!Object.prototype.hasOwnProperty.call(constructor, 'beacons')) {
            constructor.beacons = { ...(constructor.beacons || {}) };
        }

        constructor.beacons![propertyKey] = (
            options.channel
            ?? (options.key ? createBeacon<T>(options.key) : createBeacon<T>(propertyKey))
        ) as Beacon<unknown>;
    };
}

/**
 * Early decorator scaffold for void event channels.
 */
export function pulse(options: PulseOptions = {}) {
    return function (target: MiuraElement, propertyKey: string) {
        const constructor = target.constructor as typeof MiuraElement & {
            pulses?: Record<string, Pulse>
        };

        if (!Object.prototype.hasOwnProperty.call(constructor, 'pulses')) {
            constructor.pulses = { ...(constructor.pulses || {}) };
        }

        constructor.pulses![propertyKey] = options.channel ?? createPulse(options.key ?? propertyKey);
    };
}
