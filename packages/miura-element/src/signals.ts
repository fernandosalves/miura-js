/**
 * Fine-grained reactive signals for miura.
 *
 * Properties declared in `static properties` are automatically backed by
 * signals. Setting a property directly notifies only the DOM bindings that
 * read it — no full `render()` re-invocation needed.
 *
 * `static state()` properties are plain, non-reactive fields.
 *
 * ── API ───────────────────────────────────────────────────────────────────────
 *
 *   class Counter extends MiuraElement {
 *     declare count: Signal<number>;          // typed as Signal
 *     static properties = { count: { type: Number, default: 0 } };
 *
 *     template() {
 *       return html`
 *         <p>${this.count}</p>                // passes signal → fine-grained
 *         <button @click=${() => this.count(this.count() + 1)}>+</button>
 *       `;
 *     }
 *   }
 *
 * ── Standalone usage ──────────────────────────────────────────────────────────
 *
 *   const price  = signal(9.99);
 *   const tax    = computed(() => price() * 0.2);
 *
 *   price.subscribe(v => console.log('price:', v));
 *   price(12);     // → logs "price: 12"
 *   tax();         // → 2.4
 */

// ── Types ─────────────────────────────────────────────────────────────────────

/** A writable reactive signal. Call with no args to read, with a value to write. */
export interface Signal<T> {
    (): T;
    (value: T): void;
    /** Subscribe to future value changes. Returns an unsubscribe function. */
    subscribe(fn: (value: T) => void): () => void;
    /** Read the current value without triggering tracking. */
    peek(): T;
    readonly __isSignal: true;
}

/** A derived, read-only signal. */
export interface ReadonlySignal<T> {
    (): T;
    subscribe(fn: (value: T) => void): () => void;
    peek(): T;
    readonly __isSignal: true;
    readonly __isComputed: true;
}

// ── Tracking context (computed dependency collection) ─────────────────────────

type SubscribableSignal<T = unknown> = {
    subscribe(fn: (value: T) => void): () => void;
};

type ComputedNode = { _registerDependency(source: SubscribableSignal): void };
let _currentComputed: ComputedNode | null = null;

// ── signal() ──────────────────────────────────────────────────────────────────

/**
 * Create a writable signal.
 *
 * ```ts
 * const count = signal(0);
 * count();    // read → 0
 * count(1);   // write → notifies subscribers
 * ```
 */
export function signal<T>(initial: T): Signal<T> {
    let _value = initial;
    const _subs = new Set<(v: T) => void>();

    function fn(): T;
    function fn(value: T): void;
    function fn(value?: T): T | void {
        if (arguments.length === 0) {
            if (_currentComputed) {
                _currentComputed._registerDependency(fn as Signal<T>);
            }
            return _value;
        }
        const next = value as T;
        if (Object.is(_value, next)) return;
        _value = next;
        _subs.forEach(s => s(_value));
    }

    fn.subscribe = (cb: (v: T) => void): (() => void) => {
        _subs.add(cb);
        return () => _subs.delete(cb);
    };
    fn.peek = (): T => _value;
    (fn as any).__isSignal = true;

    return fn as Signal<T>;
}

// ── computed() ────────────────────────────────────────────────────────────────

/**
 * Create a derived read-only signal.
 *
 * ```ts
 * const count   = signal(0);
 * const doubled = computed(() => count() * 2);
 * doubled();     // 0
 * count(3);
 * doubled();     // 6
 * ```
 */
export function computed<T>(fn: () => T): ReadonlySignal<T> {
    let _value: T;
    let _dirty = true;
    const _subs = new Set<(v: T) => void>();
    const _sourcesUnsubs: (() => void)[] = [];
    const _sources = new Set<SubscribableSignal>();

    const node: ComputedNode = {
        _registerDependency(source: SubscribableSignal) {
            if (_sources.has(source)) return;
            _sources.add(source);

            const unsub = source.subscribe(() => {
                if (_subs.size === 0) {
                    _dirty = true;
                    return;
                }

                const wasDirty = _dirty;
                const previous = wasDirty ? undefined : _value;
                const next = recompute();
                if (wasDirty || !Object.is(previous, next)) {
                    _subs.forEach((subscriber) => subscriber(next));
                }
            });

            _sourcesUnsubs.push(unsub);
        },
    };

    function recompute(): T {
        _sourcesUnsubs.splice(0).forEach(u => u());
        _sources.clear();

        const prev = _currentComputed;
        _currentComputed = node;
        try {
            _value = fn();
            _dirty = false;
        } finally {
            _currentComputed = prev;
        }
        return _value;
    }

    function rfn(): T {
        if (_currentComputed) {
            _currentComputed._registerDependency(rfn as ReadonlySignal<T>);
        }
        if (_dirty) recompute();
        return _value;
    }

    rfn.subscribe = (cb: (v: T) => void): (() => void) => {
        _subs.add(cb);
        return () => _subs.delete(cb);
    };
    rfn.peek = (): T => {
        if (_dirty) recompute();
        return _value;
    };
    (rfn as any).__isSignal = true;
    (rfn as any).__isComputed = true;

    return rfn as ReadonlySignal<T>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Type guard — true for both Signal and ReadonlySignal */
export function isSignal(value: unknown): value is Signal<unknown> | ReadonlySignal<unknown> {
    return typeof value === 'function' && (value as any).__isSignal === true;
}
