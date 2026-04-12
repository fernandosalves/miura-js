import { Binding } from './binding';

export class PropertyBinding implements Binding {
    private previousValue: unknown;

    constructor(
        private element: Element,
        private propertyName: string,
        private isBoolean: boolean = false
    ) { }

    setValue(value: unknown): void {
        if (value === this.previousValue) return;

        if (this.isBoolean) {
            // Handle boolean attributes: Prefer property for custom elements to avoid sync loops
            const isCustomElement = this.element.tagName.includes('-');
            const hasProperty = this.propertyName in this.element;

            if (isCustomElement && hasProperty) {
                (this.element as any)[this.propertyName] = !!value;
            } else {
                if (value) {
                    (this.element as HTMLElement).setAttribute(this.propertyName, '');
                } else {
                    (this.element as HTMLElement).removeAttribute(this.propertyName);
                }
                if (hasProperty) {
                    (this.element as any)[this.propertyName] = !!value;
                }
            }
        } else {
            // Handle regular properties
            // SVG elements have a read-only className property (SVGAnimatedString).
            // Fall back to setAttribute for properties that can't be set directly.
            try {
                (this.element as any)[this.propertyName] = value;
            } catch {
                // Property is read-only (e.g. SVGElement.className) — use attribute instead
                const attrName = this.propertyName === 'className' ? 'class' : this.propertyName;
                if (value == null) {
                    this.element.removeAttribute(attrName);
                } else {
                    this.element.setAttribute(attrName, String(value));
                }
            }
        }

        this.previousValue = value;
    }

    clear(): void {
        if (this.isBoolean) {
            (this.element as HTMLElement).removeAttribute(this.propertyName);
            (this.element as any)[this.propertyName] = false;
        } else {
            (this.element as any)[this.propertyName] = null;
        }
        this.previousValue = undefined;
    }

    disconnect(): void {
        this.clear();
    }
} 