import { Binding } from './binding';
import { debugLog } from '../../utils/debug';

export class ClassBinding implements Binding {
    private previousClasses: Set<string> = new Set();
    private partValues: unknown[];
    private strings: string[];

    constructor(
        private element: Element,
        strings?: string[]
    ) {
        this.strings = strings || ['', ''];
        this.partValues = new Array(this.strings.length - 1).fill('');
        debugLog('classBinding', 'Created class binding', {
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
        const newClasses = new Set<string>();

        for (let i = 0; i < this.strings.length; i++) {
            // Add static segment classes
            if (this.strings[i]) {
                this.strings[i].split(/\s+/).filter(Boolean).forEach(c => newClasses.add(c));
            }

            // Add dynamic part classes
            if (i < this.partValues.length) {
                const value = this.partValues[i];
                if (typeof value === 'string') {
                    value.split(/\s+/).filter(Boolean).forEach(c => newClasses.add(c));
                } else if (typeof value === 'object' && value !== null) {
                    Object.entries(value as Record<string, boolean>)
                        .filter(([_, active]) => active)
                        .forEach(([className]) => newClasses.add(className));
                }
            }
        }

        // Diff and apply
        this.previousClasses.forEach(className => {
            if (!newClasses.has(className)) {
                this.element.classList.remove(className);
            }
        });

        newClasses.forEach(className => {
            if (!this.previousClasses.has(className)) {
                this.element.classList.add(className);
            }
        });

        this.previousClasses = newClasses;
    }

    clear(): void {
        this.previousClasses.forEach(className => {
            this.element.classList.remove(className);
        });
        this.previousClasses.clear();
        this.partValues.fill('');
    }

    disconnect(): void {
        this.clear();
    }
}

/**
 * Part wrapper for multi-part class attributes.
 */
export class ClassPartBinding implements Binding {
    constructor(
        private parent: ClassBinding,
        private partIndex: number
    ) {}

    setValue(value: unknown): void {
        this.parent.setPartValue(this.partIndex, value);
    }

    clear(): void {}
    disconnect(): void {}
}
 