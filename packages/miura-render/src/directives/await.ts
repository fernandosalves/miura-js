import { TemplateResult } from '../processor/template-result';

/**
 * Result object for the `asyncReplace` directive.
 * Holds the current state of the tracked promise so the template
 * engine can render the appropriate branch on each update cycle.
 */
export class AsyncResult {
    constructor(
        public readonly state: 'pending' | 'resolved' | 'rejected',
        public readonly value?: unknown,
        public readonly error?: unknown
    ) {}
}

/**
 * Tracks a Promise and triggers a component re-render when it settles.
 *
 * Usage inside a component's `template()`:
 * ```ts
 * // Create the tracker once (e.g. in onMount or a reactive getter)
 * this._userTracker = createAsyncTracker(fetchUser(id), () => this.requestUpdate());
 *
 * // In template():
 * ${resolveAsync(this._userTracker,
 *   (user) => html`<p>Hello ${user.name}</p>`,       // resolved
 *   () => html`<p>Loading...</p>`,                     // pending
 *   (err)  => html`<p>Error: ${err.message}</p>`       // rejected
 * )}
 * ```
 */
export interface AsyncTracker<T = unknown> {
    /** Current state of the tracked promise */
    readonly state: 'pending' | 'resolved' | 'rejected';
    /** Resolved value (only when state === 'resolved') */
    readonly value?: T;
    /** Rejection reason (only when state === 'rejected') */
    readonly error?: unknown;
}

/**
 * Create an AsyncTracker that calls `onSettle` when the promise resolves or rejects.
 * The component should call `this.requestUpdate()` inside `onSettle` to trigger a re-render.
 *
 * @param promise - The Promise to track
 * @param onSettle - Callback invoked when the promise settles (resolve or reject)
 */
export function createAsyncTracker<T>(
    promise: Promise<T>,
    onSettle: () => void
): AsyncTracker<T> {
    const tracker: { state: 'pending' | 'resolved' | 'rejected'; value?: T; error?: unknown } = {
        state: 'pending'
    };

    promise.then(
        (value) => {
            tracker.state = 'resolved';
            tracker.value = value;
            onSettle();
        },
        (error) => {
            tracker.state = 'rejected';
            tracker.error = error;
            onSettle();
        }
    );

    return tracker;
}

/**
 * Resolve an AsyncTracker into a template based on its current state.
 * Returns the appropriate branch template.
 *
 * @param tracker - The AsyncTracker to resolve
 * @param resolved - Template function for the resolved state
 * @param pending - Template function for the pending state (optional)
 * @param rejected - Template function for the rejected state (optional)
 *
 * @example
 * ```ts
 * template() {
 *   return html`
 *     ${resolveAsync(this.dataTracker,
 *       (data) => html`<div>${data.name}</div>`,
 *       () => html`<span>Loading...</span>`,
 *       (err) => html`<span class="error">${err}</span>`
 *     )}
 *   `;
 * }
 * ```
 */
export function resolveAsync<T, R extends TemplateResult>(
    tracker: AsyncTracker<T>,
    resolved: (value: T) => R,
    pending?: () => R,
    rejected?: (error: unknown) => R
): R | undefined {
    switch (tracker.state) {
        case 'pending':
            return pending?.();
        case 'resolved':
            return resolved(tracker.value as T);
        case 'rejected':
            return rejected?.(tracker.error);
    }
}
