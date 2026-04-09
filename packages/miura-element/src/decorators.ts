import type { ComponentDebugOptions } from '@miurajs/miura-debugger';
import { setComponentDebugOptions } from '@miurajs/miura-debugger';
import { MiuraElement } from "./miura-element";

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
