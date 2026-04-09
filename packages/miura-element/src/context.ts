const providedContexts = new WeakMap<object, Map<ContextKey<unknown>, unknown>>();

export type ContextKey<T = unknown> = string | symbol;

export function createContextKey<T = unknown>(description?: string): ContextKey<T> {
    return Symbol(description);
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

export function consumeContext<T>(host: Node, key: ContextKey<T>, fallback?: T): T | undefined {
    let current: Node | null = host;

    while (current) {
        const map = getContextMap(current);
        if (map?.has(key as ContextKey<unknown>)) {
            return map.get(key as ContextKey<unknown>) as T;
        }
        current = getTraversalParent(current);
    }

    return fallback;
}
