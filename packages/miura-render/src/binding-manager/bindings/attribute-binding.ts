import { Binding } from './binding';

/**
 * Handles generic attribute value composition — both single and multi-expression.
 * For multi-expression attributes like style="color: ${a}; bg: ${b}",
 * the binding concatenates static string segments with dynamic values.
 */
export class AttributeBinding implements Binding {
    private values: unknown[];
    private committed = false;

    constructor(
        private element: Element,
        private attrName: string,
        private strings: string[]
    ) {
        // strings has N+1 entries for N expression slots
        this.values = new Array(strings.length - 1).fill('');
    }

    /**
     * Set a specific part's value (for multi-expression attributes).
     */
    setPartValue(partIndex: number, value: unknown): void {
        this.values[partIndex] = value;
        this.commit();
    }

    /**
     * Standard Binding interface — sets the first (and possibly only) value.
     */
    setValue(value: unknown): void {
        this.setPartValue(0, value);
    }

    /**
     * Recompute and apply the full attribute value.
     */
    private commit(): void {
        let result = '';
        for (let i = 0; i < this.strings.length; i++) {
            result += this.strings[i];
            if (i < this.values.length) {
                const v = this.values[i];
                result += v == null ? '' : String(v);
            }
        }

        // Strip the binding prefix (@, ., ?, #) from the actual DOM attribute name
        const domName = this.attrName.replace(/^[.@?#]/, '');
        this.element.setAttribute(domName, result);
        this.committed = true;
    }

    clear(): void {
        const domName = this.attrName.replace(/^[.@?#]/, '');
        this.element.removeAttribute(domName);
        this.committed = false;
    }

    disconnect(): void {
        this.clear();
    }
}

/**
 * Thin wrapper for subsequent expressions in a multi-expression attribute.
 * Delegates to the parent AttributeBinding with the correct part index.
 */
export class AttributePartBinding implements Binding {
    constructor(
        private parent: AttributeBinding,
        private partIndex: number
    ) {}

    setValue(value: unknown): void {
        this.parent.setPartValue(this.partIndex, value);
    }

    clear(): void {
        // Only the parent AttributeBinding clears the attribute
    }

    disconnect(): void {
        // Managed by parent
    }
}
