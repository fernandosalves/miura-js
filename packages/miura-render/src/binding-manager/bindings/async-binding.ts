import { Binding } from './binding';

/**
 * AsyncBinding — handles `~prop=${promise}`
 *
 * Accepts a Promise (or any thenable). While the promise is pending, sets a
 * `data-pending` attribute on the element and optionally a `pending` property.
 * When the promise resolves, sets `name` property to the resolved value and
 * removes the pending marker. On rejection, sets `name` to undefined and adds
 * a `data-error` attribute with the error message.
 *
 * Supports re-entrant updates: if a new promise arrives before the previous
 * one settles, the previous result is discarded (last-write wins).
 */
export class AsyncBinding implements Binding {
    private generation = 0;

    constructor(
        private readonly element: Element,
        private readonly name: string,
    ) {}

    async setValue(value: unknown): Promise<void> {
        if (value === null || value === undefined) {
            (this.element as any)[this.name] = value;
            this.element.removeAttribute('data-pending');
            this.element.removeAttribute('data-error');
            return;
        }

        // Plain (non-promise) value — set directly
        if (typeof (value as any).then !== 'function') {
            (this.element as any)[this.name] = value;
            this.element.removeAttribute('data-pending');
            this.element.removeAttribute('data-error');
            return;
        }

        const gen = ++this.generation;
        this.element.setAttribute('data-pending', '');
        (this.element as any)['pending'] = true;

        try {
            const resolved = await (value as Promise<unknown>);
            if (gen !== this.generation) return; // superseded
            (this.element as any)[this.name] = resolved;
            (this.element as any)['pending'] = false;
            this.element.removeAttribute('data-pending');
            this.element.removeAttribute('data-error');
        } catch (err) {
            if (gen !== this.generation) return; // superseded
            (this.element as any)[this.name] = undefined;
            (this.element as any)['pending'] = false;
            this.element.removeAttribute('data-pending');
            this.element.setAttribute(
                'data-error',
                err instanceof Error ? err.message : String(err),
            );
        }
    }

    clear(): void {
        this.generation++;
        (this.element as any)[this.name] = undefined;
        (this.element as any)['pending'] = false;
        this.element.removeAttribute('data-pending');
        this.element.removeAttribute('data-error');
    }

    disconnect(): void {
        this.generation++; // cancel any in-flight promise
    }
}
