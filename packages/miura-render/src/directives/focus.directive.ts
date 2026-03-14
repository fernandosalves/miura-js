import { BaseDirective } from './directive';
import { debugLog } from '../utils/debug';

interface FocusOptions {
    autofocus?: boolean;
    onFocus?: (e: FocusEvent) => void;
    onBlur?: (e: FocusEvent) => void;
}

export class FocusDirective extends BaseDirective {
    private options: FocusOptions = {};

    mount(element: Element) {
        debugLog('focus', 'Mounting focus handlers');

        if (this.options.autofocus) {
            (element as HTMLElement).focus();
        }

        element.addEventListener('focus', this.handleFocus as EventListener);
        element.addEventListener('blur', this.handleBlur as EventListener);
    }

    private handleFocus = (e: FocusEvent) => {
        debugLog('focus', 'Element focused');
        this.options.onFocus?.(e);
    };

    private handleBlur = (e: FocusEvent) => {
        debugLog('focus', 'Element blurred');
        this.options.onBlur?.(e);
    };

    update(options: FocusOptions) {
        this.options = options;
    }
    unmount() {
        this.element?.removeEventListener('focus', this.handleFocus as EventListener);
        this.element?.removeEventListener('blur', this.handleBlur as EventListener);
    }
}