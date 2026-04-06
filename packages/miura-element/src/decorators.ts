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
  default?: unknown;
}

/**
 * Class decorator that registers the custom element
 * @example
 * @component({ tag: 'my-element' })
 * class MyElement extends MiuraElement { ... }
 */
export function component<T extends typeof MiuraElement>(options: ComponentOptions) {
  return function(target: T): T {
    // Register the element
    if (options.tag) {
      customElements.define(options.tag, target);
    }
    return target;
  };
}

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
  return function(target: MiuraElement, propertyKey: string) {
    const constructor = target.constructor as typeof MiuraElement & { properties?: Record<string, PropertyOptions> };
    
    // Ensure properties object exists
    if (!constructor.hasOwnProperty('properties')) {
      constructor.properties = { ...constructor.properties };
    }
    
    // Add this property to the static properties
    constructor.properties![propertyKey] = {
      type: options.type ?? String,
      default: options.default,
      attribute: options.attribute !== undefined ? options.attribute : propertyKey.toLowerCase(),
      reflect: options.reflect,
    };
  };
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
  return function(target: MiuraElement, propertyKey: string) {
    const constructor = target.constructor as typeof MiuraElement & { properties?: Record<string, PropertyOptions> };
    
    // Ensure properties object exists
    if (!constructor.hasOwnProperty('properties')) {
      constructor.properties = { ...constructor.properties };
    }
    
    // Add as internal state (no attribute reflection)
    constructor.properties![propertyKey] = {
      type: String,  // Default type, will be inferred from TypeScript
      default: options.default,
      attribute: false,
      reflect: false,
    };
  };
} 