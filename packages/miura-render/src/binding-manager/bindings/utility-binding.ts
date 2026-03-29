import { Binding } from './binding';
import { applyUtilityValue, clearAppliedUtilities, type UtilityApplicationState } from '../../utilities/utility-resolver';

export class UtilityBinding implements Binding {
    private values: unknown[];
    private state: UtilityApplicationState | null = null;

    constructor(
        private readonly element: Element,
        private readonly attrName: string,
        private readonly strings: string[]
    ) {
        this.values = new Array(strings.length - 1).fill('');
    }

    setPartValue(partIndex: number, value: unknown): void {
        this.values[partIndex] = value;
        this.commit();
    }

    setValue(value: unknown): void {
        this.setPartValue(0, value);
    }

    private commit(): void {
        let result = '';
        for (let i = 0; i < this.strings.length; i++) {
            result += this.strings[i];
            if (i < this.values.length) {
                const value = this.values[i];
                result += value == null ? '' : String(value);
            }
        }

        this.state = applyUtilityValue(this.element, this.attrName, result, this.state);
        this.element.removeAttribute(this.attrName);
    }

    clear(): void {
        this.state = clearAppliedUtilities(this.element, this.state);
        this.element.removeAttribute(this.attrName);
    }

    disconnect(): void {
        this.clear();
    }
}

export class UtilityPartBinding implements Binding {
    constructor(
        private readonly parent: UtilityBinding,
        private readonly partIndex: number
    ) {}

    setValue(value: unknown): void {
        this.parent.setPartValue(this.partIndex, value);
    }

    clear(): void {}

    disconnect(): void {}
}
