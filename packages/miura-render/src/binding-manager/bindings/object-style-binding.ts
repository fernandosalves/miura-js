import { Binding } from './binding';

/**
 * ObjectStyleBinding — handles `:style=${{ color: 'red', fontSize: '16px' }}`
 *
 * Accepts a Record<string, string>. Properties present in the map are set on
 * element.style; properties that were set in the previous render but are absent
 * from the new map are removed.
 */
export class ObjectStyleBinding implements Binding {
    private previousKeys: Set<string> = new Set();

    constructor(private readonly element: HTMLElement) {}

    async setValue(value: unknown): Promise<void> {
        if (typeof value !== 'object' || value === null) return;

        const next = value as Record<string, string>;
        const nextKeys = new Set(Object.keys(next));

        // Remove properties no longer in the map
        for (const prop of this.previousKeys) {
            if (!nextKeys.has(prop)) {
                (this.element.style as any)[prop] = '';
            }
        }

        // Apply new/updated properties
        for (const [prop, val] of Object.entries(next)) {
            (this.element.style as any)[prop] = val;
        }

        this.previousKeys = nextKeys;
    }

    clear(): void {
        for (const prop of this.previousKeys) {
            (this.element.style as any)[prop] = '';
        }
        this.previousKeys = new Set();
    }
}
