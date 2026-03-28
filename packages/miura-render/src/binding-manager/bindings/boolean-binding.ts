import { Binding } from './binding';
import { debugLog } from '../../utils/debug';

/**
 * Handles boolean attribute bindings (?attribute=${value})
 * Examples:
 * - ?disabled=${isDisabled}
 * - ?readonly=${isReadOnly}
 * - ?checked=${isChecked}
 */
export class BooleanBinding implements Binding {
    private previousValue: boolean | null = null;

    constructor(
        private element: Element,
        private attributeName: string
    ) {
        debugLog('booleanBinding', 'Created boolean binding', {
            element: element.tagName,
            attributeName,
        });
    }

    setValue(value: unknown): void {
        const newValue = Boolean(value);
        
        // Skip if value hasn't changed
        if (newValue === this.previousValue) {
            return;
        }

        debugLog('booleanBinding', 'Setting value', {
            element: this.element.tagName,
            attributeName: this.attributeName,
            value: newValue,
            previousValue: this.previousValue
        });

        const isCustomElement = this.element.tagName.includes('-');
        const hasProperty = this.attributeName in this.element;

        if (isCustomElement && hasProperty) {
            // Let the component handle its own reflection
            (this.element as any)[this.attributeName] = newValue;
        } else {
            // Standard double-sync for native/legacy elements
            if (newValue) {
                this.element.setAttribute(this.attributeName, '');
            } else {
                this.element.removeAttribute(this.attributeName);
            }
            if (hasProperty) {
                (this.element as any)[this.attributeName] = newValue;
            }
        }

        this.previousValue = newValue;
    }

    clear(): void {
        debugLog('booleanBinding', 'Clearing binding', {
            element: this.element.tagName,
            attributeName: this.attributeName
        });

        this.element.removeAttribute(this.attributeName);
        if (this.attributeName in this.element) {
            (this.element as any)[this.attributeName] = false;
        }
        this.previousValue = null;
    }

    disconnect(): void {
        this.clear();
    }
} 