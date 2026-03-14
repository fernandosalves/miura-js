import { Binding } from './binding';
import { debugLog } from '../../utils/debug';

/**
 * Handles reference bindings (#ref=${callback})
 * Allows getting direct references to DOM elements
 */
export class ReferenceBinding implements Binding {
    private callback: ((element: Element | null) => void) | null = null;

    constructor(
        private element: Element
    ) {
        debugLog('referenceBinding', 'Created reference binding', {
            element: element.tagName
        });
    }

    setValue(value: unknown): void {
        debugLog('referenceBinding', 'Setting value', {
            element: this.element.tagName,
            value
        });

        // Clear previous callback
        if (this.callback) {
            this.callback(null);
            this.callback = null;
        }

        // Set new callback if it's a function
        if (typeof value === 'function') {
            this.callback = value as (element: Element | null) => void;
            this.callback(this.element);
        }
    }

    clear(): void {
        debugLog('referenceBinding', 'Clearing binding', {
            element: this.element.tagName
        });

        if (this.callback) {
            this.callback(null);
            this.callback = null;
        }
    }

    disconnect(): void {
        this.clear();
    }
} 