import { Binding } from './binding';

/**
 * Value passed to a two-way binding. Either:
 * - A tuple: [currentValue, setter]
 * - A binder object: { value, set }
 */
export interface BinderObject {
    value: unknown;
    set: (value: unknown) => void;
}

type BindValue = [unknown, (v: unknown) => void] | BinderObject;

/**
 * Default event names for common DOM properties.
 * Maps property name → DOM event that fires when the property changes.
 */
const PROPERTY_EVENT_MAP: Record<string, string> = {
    value: 'input',
    checked: 'change',
    selected: 'change',
    selectedIndex: 'change',
    files: 'change',
};

/**
 * Two-way binding: sets a DOM property and listens for the corresponding
 * DOM event to push changes back to the host component.
 *
 * Template syntax:
 *   <input ~value=${[this.name, (v) => this.name = v]}>
 *   <input ~value=${this.bind('name')}>
 */
export class BindBinding implements Binding {
    private handler: EventListener | null = null;
    private eventName: string;
    private setter: ((v: unknown) => void) | null = null;

    constructor(
        private element: Element,
        private propertyName: string
    ) {
        this.eventName = PROPERTY_EVENT_MAP[propertyName] || 'input';
    }

    setValue(value: unknown): void {
        // Extract current value and setter from the bind value
        let currentValue: unknown;
        let setter: ((v: unknown) => void) | null = null;

        if (Array.isArray(value) && value.length === 2 && typeof value[1] === 'function') {
            // Tuple form: [value, setter]
            currentValue = value[0];
            setter = value[1] as (v: unknown) => void;
        } else if (value && typeof value === 'object' && 'set' in value && 'value' in value) {
            // Binder object form: { value, set }
            const binder = value as BinderObject;
            currentValue = binder.value;
            setter = binder.set;
        } else {
            // Fallback: treat as one-way (just set the property)
            (this.element as any)[this.propertyName] = value;
            return;
        }

        // Set the DOM property
        (this.element as any)[this.propertyName] = currentValue;

        // Update event listener if setter changed
        if (setter !== this.setter) {
            // Remove old listener
            if (this.handler) {
                this.element.removeEventListener(this.eventName, this.handler);
                this.handler = null;
            }

            this.setter = setter;

            if (setter) {
                this.handler = () => {
                    const newValue = (this.element as any)[this.propertyName];
                    setter!(newValue);
                };
                this.element.addEventListener(this.eventName, this.handler);
            }
        }
    }

    clear(): void {
        if (this.handler) {
            this.element.removeEventListener(this.eventName, this.handler);
            this.handler = null;
        }
        this.setter = null;
    }

    disconnect(): void {
        this.clear();
    }
}
