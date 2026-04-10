const providedContexts = new WeakMap<object, Map<ContextKey<unknown>, unknown>>();

export interface ContextKey<T> extends Symbol {
    /** 
     * Internal phantom type to preserve 'T' for inference. 
     * Never actually present at runtime.
     */
    readonly __contextType?: T;
}

export function createContextKey<T = unknown>(description?: string): ContextKey<T> {
    return Symbol(description) as unknown as ContextKey<T>;
}

function getContextMap(host: object, create = false): Map<ContextKey<unknown>, unknown> | undefined {
    let map = providedContexts.get(host);
    if (!map && create) {
        map = new Map();
        providedContexts.set(host, map);
    }
    return map;
}

function getTraversalParent(node: Node): Node | null {
    if (node.parentNode instanceof ShadowRoot) {
        return node.parentNode.host;
    }

    if (node.parentNode) {
        return node.parentNode;
    }

    const root = node.getRootNode?.();
    if (root instanceof ShadowRoot) {
        return root.host;
    }

    return null;
}

export function provideContext<T>(host: object, key: ContextKey<T>, value: T): T {
    const map = getContextMap(host, true)!;
    map.set(key as ContextKey<unknown>, value);
    return value;
}

export function hasProvidedContext(host: object, key: ContextKey<unknown>): boolean {
    return getContextMap(host)?.has(key) ?? false;
}

/**
 * Consumes a context value from the DOM tree.
 * 
 * This returns a "Lazy Proxy" that performs the DOM traversal lookup on every access.
 * This has three major benefits:
 * 1. It can be used in class field initializers (constructors) even before 
 *    the element is connected to the DOM.
 * 2. It is always type-safe, automatically inferring T from the ContextKey.
 * 3. It is dynamic — if a higher-level provider changes, the proxy will resolve
 *    to the new value on next access.
 */
export function consumeContext<T>(host: Node, key: ContextKey<T>, fallback?: T): T {
    return new Proxy({} as any, {
        get(_target, prop, receiver) {
            // Perform the actual DOM-walking lookup
            let current: Node | null = host;
            let value: any = undefined;

            while (current) {
                const map = getContextMap(current);
                if (map?.has(key as ContextKey<unknown>)) {
                    value = map.get(key as ContextKey<unknown>);
                    break;
                }
                current = getTraversalParent(current);
            }

            const actualValue = value !== undefined ? value : fallback;

            if (actualValue === undefined) {
                // If we're accessing a property on an undefined context,
                // we'll eventually throw a natural JS error, but for signals
                // and templates, we want to be as helpful as possible.
                return undefined;
            }

            const result = Reflect.get(actualValue, prop, receiver);
            
            // If the result is a function, we must bind it to the actual context value
            return typeof result === 'function' ? result.bind(actualValue) : result;
        }
    }) as T;
}
