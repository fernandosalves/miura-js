import { Binding } from './binding';
import { debugLog } from '../../utils/debug';

export class ClassBinding implements Binding {
    private previousClasses: Set<string> = new Set();

    constructor(
        private element: Element
    ) {
        debugLog('classBinding', 'Created class binding', {
            element: element.tagName
        });
    }

    setValue(value: unknown): void {
        debugLog('classBinding', 'Setting value', {
            element: this.element.tagName,
            value,
            previousClasses: Array.from(this.previousClasses),
            currentClassList: Array.from(this.element.classList),
            valueType: typeof value,
            valueIsObject: typeof value === 'object'
        });

        // Convert value to array of class names
        const newClasses = new Set<string>();
        
        if (typeof value === 'string') {
            // Handle string value
            value.split(/\s+/).filter(Boolean).forEach(c => newClasses.add(c));
            debugLog('classBinding', 'String value processed', {
                value,
                newClasses: Array.from(newClasses)
            });
        } else if (typeof value === 'object' && value !== null) {
            // Handle object value { class: boolean }
            const entries = Object.entries(value as Record<string, boolean>);
            debugLog('classBinding', 'Object value processing', {
                entries
            });
            entries
                .filter(([_, active]) => active)
                .forEach(([className]) => newClasses.add(className));
        }

        debugLog('classBinding', 'Classes to apply', {
            newClasses: Array.from(newClasses),
            previousClasses: Array.from(this.previousClasses)
        });

        // Remove old classes that aren't in new set
        this.previousClasses.forEach(className => {
            if (!newClasses.has(className)) {
                this.element.classList.remove(className);
            }
        });

        // Add new classes
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
    }

    disconnect(): void {
        this.clear();
    }
} 