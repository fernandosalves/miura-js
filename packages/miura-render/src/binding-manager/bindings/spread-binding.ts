import { Binding } from './binding';

/**
 * SpreadBinding — handles `...=${propsObj}`
 *
 * Accepts a Record<string, unknown>. Each key is set as a property on the
 * element (same semantics as PropertyBinding). Properties set by a previous
 * render that are absent from the new object are reset to undefined.
 */
export class SpreadBinding implements Binding {
    private previousKeys: Set<string> = new Set();

    constructor(private readonly element: Element) {}

    async setValue(value: unknown): Promise<void> {
        if (typeof value !== 'object' || value === null) {
            this.clear();
            return;
        }

        const next = value as Record<string, unknown>;
        const nextKeys = new Set(Object.keys(next));

        // Remove properties no longer in the spread object
        for (const key of this.previousKeys) {
            if (!nextKeys.has(key)) {
                (this.element as any)[key] = undefined;
            }
        }

        // Apply new/updated properties
        for (const [key, val] of Object.entries(next)) {
            (this.element as any)[key] = val;
        }

        this.previousKeys = nextKeys;
    }

    clear(): void {
        for (const key of this.previousKeys) {
            (this.element as any)[key] = undefined;
        }
        this.previousKeys = new Set();
    }
}
