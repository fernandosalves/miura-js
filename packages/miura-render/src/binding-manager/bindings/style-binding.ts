import { Binding } from './binding';
import { debugLog } from '../../utils/debug';

type StyleObject = { [key: string]: string | number | null | undefined };

export class StyleBinding implements Binding {
    private previousValue: StyleObject | string | null = null;
    private previousKeys: Set<string> = new Set();

    constructor(
        private element: Element
    ) {
        debugLog('styleBinding', 'Created style binding', {
            element: element.tagName
        });
    }

    setValue(value: unknown): void {
        if (typeof value === 'string') {
            if (this.previousValue === value) return;
            this.clear();
            (this.element as HTMLElement).style.cssText = value;
            this.previousValue = value;
            return;
        }

        if (!value || typeof value !== 'object') {
            this.clear();
            return;
        }

        const styleObj = value as StyleObject;
        const element = this.element as HTMLElement;
        const nextKeys = new Set(Object.keys(styleObj));

        // Skip if unchanged
        if (JSON.stringify(styleObj) === JSON.stringify(this.previousValue)) {
            return;
        }

        debugLog('styleBinding', 'Setting styles', {
            element: element.tagName,
            styles: styleObj
        });

        if (typeof this.previousValue === 'string') {
            element.style.cssText = '';
        } else {
            for (const key of this.previousKeys) {
                if (!nextKeys.has(key)) {
                    element.style[key as any] = '';
                }
            }
        }

        // Apply new styles
        Object.entries(styleObj).forEach(([key, nextValue]) => {
            const cssValue = typeof nextValue === 'number' ? `${nextValue}px` : (nextValue ?? '');
            element.style[key as any] = cssValue;
        });

        this.previousKeys = nextKeys;
        this.previousValue = { ...styleObj };
    }

    clear(): void {
        const element = this.element as HTMLElement;
        if (typeof this.previousValue === 'string') {
            element.style.cssText = '';
        } else {
            for (const key of this.previousKeys) {
                element.style[key as any] = '';
            }
        }
        this.previousValue = null;
        this.previousKeys = new Set();
    }

    disconnect(): void {
        this.clear();
    }
} 
