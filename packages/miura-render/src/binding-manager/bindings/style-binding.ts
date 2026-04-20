import { Binding } from './binding';
import { debugLog } from '../../utils/debug';

type StyleObject = { [key: string]: string | number | null | undefined };

export class StyleBinding implements Binding {
    private previousKeys: Set<string> = new Set();
    private partValues: unknown[];
    private strings: string[];
    private hasStaticText = false;

    constructor(
        private element: Element,
        strings?: string[]
    ) {
        this.strings = strings || ['', ''];
        this.partValues = new Array(this.strings.length - 1).fill('');
        this.hasStaticText = this.strings.some(s => s.trim().length > 0);
        debugLog('styleBinding', 'Created style binding', {
            element: element.tagName,
            strings: this.strings
        });
    }

    setPartValue(partIndex: number, value: unknown): void {
        this.partValues[partIndex] = value;
        this.commit();
    }

    setValue(value: unknown): void {
        this.setPartValue(0, value);
    }

    private commit(): void {
        const element = this.element as HTMLElement;
        const nextKeys = new Set<string>();
        const nextStyles: Record<string, string> = {};

        // 1. Process static and dynamic parts into a consolidated style object
        // If we have static text or multiple expressions, we treat it as a composite string
        if (this.hasStaticText || this.strings.length > 2) {
            let composite = '';
            for (let i = 0; i < this.strings.length; i++) {
                composite += this.strings[i];
                if (i < this.partValues.length) {
                    const v = this.partValues[i];
                    if (typeof v === 'object' && v !== null) {
                        // Inline object in a composite string: serialize it
                        composite += Object.entries(v as StyleObject)
                            .map(([k, val]) => `${this.camelToKebab(k)}: ${val ?? ''}`)
                            .join('; ');
                    } else {
                        composite += v ?? '';
                    }
                }
            }
            element.style.cssText = composite;
            // We don't track individual keys for cssText updates to avoid overhead
            this.previousKeys.clear();
        } else {
            // Single expression, no static text: use direct property updates for performance
            const value = this.partValues[0];
            if (typeof value === 'string') {
                element.style.cssText = value;
                this.previousKeys.clear();
            } else if (typeof value === 'object' && value !== null) {
                const styleObj = value as StyleObject;
                
                // Clear old keys
                for (const key of this.previousKeys) {
                    if (!(key in styleObj)) {
                        element.style[key as any] = '';
                    }
                }

                // Apply new keys
                for (const [key, val] of Object.entries(styleObj)) {
                    const cssValue = (val ?? '') as any;
                    element.style[key as any] = cssValue;
                    nextKeys.add(key);
                }
                this.previousKeys = nextKeys;
            } else {
                element.style.cssText = '';
                this.previousKeys.clear();
            }
        }
    }

    private camelToKebab(str: string): string {
        return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
    }

    clear(): void {
        const element = this.element as HTMLElement;
        element.style.cssText = '';
        this.previousKeys.clear();
        this.partValues.fill('');
    }

    disconnect(): void {
        this.clear();
    }
}

/**
 * Part wrapper for multi-part style attributes.
 */
export class StylePartBinding implements Binding {
    constructor(
        private parent: StyleBinding,
        private partIndex: number
    ) {}

    setValue(value: unknown): void {
        this.parent.setPartValue(this.partIndex, value);
    }

    clear(): void {}
    disconnect(): void {}
}
 
