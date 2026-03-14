import { Binding } from './binding';
import { debugLog } from '../../utils/debug';

type StyleObject = { [key: string]: string | number };

export class StyleBinding implements Binding {
    private previousValue: StyleObject | null = null;

    constructor(
        private element: Element
    ) {
        debugLog('styleBinding', 'Created style binding', {
            element: element.tagName
        });
    }

    setValue(value: unknown): void {
        if (!value || typeof value !== 'object') {
            this.clear();
            return;
        }

        const styleObj = value as StyleObject;
        const element = this.element as HTMLElement;

        // Skip if unchanged
        if (JSON.stringify(styleObj) === JSON.stringify(this.previousValue)) {
            return;
        }

        debugLog('styleBinding', 'Setting styles', {
            element: element.tagName,
            styles: styleObj
        });

        // Clear previous styles
        this.clear();

        // Apply new styles
        Object.entries(styleObj).forEach(([key, value]) => {
            const cssValue = typeof value === 'number' ? `${value}px` : value;
            element.style[key as any] = cssValue;
        });

        this.previousValue = styleObj;
    }

    clear(): void {
        const element = this.element as HTMLElement;
        element.removeAttribute('style');
        this.previousValue = null;
    }

    disconnect(): void {
        this.clear();
    }
} 