import { Binding } from './binding';

/**
 * ObjectClassBinding — handles `:class=${{ active: bool, loading: bool }}`
 *
 * Accepts a Record<string, boolean>. Keys with truthy values are added to
 * classList; keys with falsy values are removed. Previous keys that are no
 * longer present in the new map are also removed.
 */
export class ObjectClassBinding implements Binding {
    private previous: Record<string, boolean> = {};

    constructor(private readonly element: Element) {}

    async setValue(value: unknown): Promise<void> {
        if (typeof value !== 'object' || value === null) return;

        const next = value as Record<string, boolean>;

        // Remove classes that were previously set but are now falsy or absent
        for (const cls of Object.keys(this.previous)) {
            if (!next[cls]) {
                this.element.classList.remove(cls);
            }
        }

        // Add/remove based on current map
        for (const [cls, active] of Object.entries(next)) {
            if (active) {
                this.element.classList.add(cls);
            } else {
                this.element.classList.remove(cls);
            }
        }

        this.previous = { ...next };
    }

    clear(): void {
        for (const cls of Object.keys(this.previous)) {
            this.element.classList.remove(cls);
        }
        this.previous = {};
    }
}
