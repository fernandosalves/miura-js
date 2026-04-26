import { emitConsumeResolved } from '@miurajs/miura-debugger';

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

function resolveContextValue<T>(host: Node, key: ContextKey<T>, fallback?: T): T | undefined {
    return resolveContext(host, key, fallback).value;
}

function resolveContext<T>(host: Node, key: ContextKey<T>, fallback?: T): { value: T | undefined; provider: Node | null } {
    let current: Node | null = host;

    while (current) {
        const map = getContextMap(current);
        if (map?.has(key as ContextKey<unknown>)) {
            return { value: map.get(key as ContextKey<unknown>) as T, provider: current };
        }
        current = getTraversalParent(current);
    }

    return { value: fallback, provider: null };
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
    const target = function contextValueProxy() { /* lazy context proxy */ };

    return new Proxy(target as any, {
        apply(_target, thisArg, args) {
            const resolved = resolveContext(host, key, fallback);
            const actualValue = resolved.value;
            reportContextResolved(host, key, resolved.provider, actualValue);
            if (typeof actualValue !== 'function') {
                return actualValue;
            }

            return Reflect.apply(actualValue, thisArg, args);
        },
        get(_target, prop, _receiver) {
            const resolved = resolveContext(host, key, fallback);
            const actualValue = resolved.value;
            reportContextResolved(host, key, resolved.provider, actualValue);

            if (prop === Symbol.toPrimitive) {
                return () => actualValue as any;
            }

            if (prop === 'valueOf') {
                return () => actualValue as any;
            }

            if (prop === 'toString') {
                return () => String(actualValue);
            }

            if (actualValue === undefined || actualValue === null) {
                return undefined;
            }

            const valueType = typeof actualValue;
            if (valueType !== 'object' && valueType !== 'function') {
                const boxed = Object(actualValue) as Record<PropertyKey, unknown>;
                const result = boxed[prop as keyof typeof boxed];
                return typeof result === 'function' ? result.bind(actualValue) : result;
            }

            const result = Reflect.get(actualValue as object, prop, actualValue);
            return typeof result === 'function' ? result.bind(actualValue) : result;
        },
        has(_target, prop) {
            const resolved = resolveContext(host, key, fallback);
            const actualValue = resolved.value;
            reportContextResolved(host, key, resolved.provider, actualValue);
            if (actualValue === undefined || actualValue === null) {
                return false;
            }

            return prop in Object(actualValue);
        },
    }) as T;
}

function reportContextResolved<T>(host: Node, key: ContextKey<T>, provider: Node | null, value: T | undefined): void {
    emitConsumeResolved({
        consumerComponentId: (host as { __miura_id?: string }).__miura_id,
        contextKey: key.description ?? String(key),
        providerId: (provider as { __miura_id?: string } | null)?.__miura_id,
        value,
    });
}
