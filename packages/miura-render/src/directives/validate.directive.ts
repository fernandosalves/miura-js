import { BaseDirective } from './directive';
import { debugLog } from '../utils/debug';

interface ValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    email?: boolean;
    url?: boolean;
    number?: boolean;
    min?: number;
    max?: number;
    custom?: (value: string) => boolean | string;
}

interface ValidationOptions {
    rules?: ValidationRule;
    onError?: (errors: string[]) => void;
    onSuccess?: () => void;
    validateOnInput?: boolean;
    validateOnBlur?: boolean;
    showErrors?: boolean;
}

interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export class ValidateDirective extends BaseDirective {
    private options: ValidationOptions = {};
    private currentErrors: string[] = [];

    mount(element: Element) {
        debugLog('validate', 'Mounting validate directive');

        this.options = {
            validateOnInput: true,
            validateOnBlur: true,
            showErrors: true,
            rules: {},
            ...this.options
        };

        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
            if (this.options.validateOnInput) {
                element.addEventListener('input', this.handleInput.bind(this));
            }
            if (this.options.validateOnBlur) {
                element.addEventListener('blur', this.handleBlur.bind(this));
            }
        }
    }

    private handleInput = (event: Event) => {
        const element = event.target as HTMLInputElement;
        this.validateElement(element);
    };

    private handleBlur = (event: Event) => {
        const element = event.target as HTMLInputElement;
        this.validateElement(element);
    };

    private validateElement(element: HTMLInputElement): ValidationResult {
        const value = element.value;
        const errors: string[] = [];
        const rules = this.options.rules || {};

        // Required validation
        if (rules.required && !value.trim()) {
            errors.push('This field is required');
        }

        if (value.trim()) {
            // Min length validation
            if (rules.minLength && value.length < rules.minLength) {
                errors.push(`Minimum length is ${rules.minLength} characters`);
            }

            // Max length validation
            if (rules.maxLength && value.length > rules.maxLength) {
                errors.push(`Maximum length is ${rules.maxLength} characters`);
            }

            // Pattern validation
            if (rules.pattern && !rules.pattern.test(value)) {
                errors.push('Invalid format');
            }

            // Email validation
            if (rules.email) {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(value)) {
                    errors.push('Invalid email format');
                }
            }

            // URL validation
            if (rules.url) {
                try {
                    new URL(value);
                } catch {
                    errors.push('Invalid URL format');
                }
            }

            // Number validation
            if (rules.number) {
                const num = parseFloat(value);
                if (isNaN(num)) {
                    errors.push('Must be a number');
                } else {
                    if (rules.min !== undefined && num < rules.min) {
                        errors.push(`Minimum value is ${rules.min}`);
                    }
                    if (rules.max !== undefined && num > rules.max) {
                        errors.push(`Maximum value is ${rules.max}`);
                    }
                }
            }

            // Custom validation
            if (rules.custom) {
                const result = rules.custom(value);
                if (result === false) {
                    errors.push('Invalid value');
                } else if (typeof result === 'string') {
                    errors.push(result);
                }
            }
        }

        const isValid = errors.length === 0;
        this.currentErrors = errors;

        // Update element styling
        this.updateElementStyling(element, isValid);

        // Call callbacks
        if (isValid) {
            this.options.onSuccess?.();
        } else {
            this.options.onError?.(errors);
        }

        debugLog('validate', 'Validation result:', { isValid, errors });

        return { isValid, errors };
    }

    private updateElementStyling(element: HTMLInputElement, isValid: boolean) {
        if (this.options.showErrors) {
            element.classList.remove('valid', 'invalid');
            element.classList.add(isValid ? 'valid' : 'invalid');

            // Add or update error message
            let errorContainer = element.parentElement?.querySelector('.validation-error');
            if (!errorContainer && !isValid) {
                errorContainer = document.createElement('div');
                errorContainer.className = 'validation-error';
                if (errorContainer instanceof HTMLElement) {
                    errorContainer.style.color = 'red';
                    errorContainer.style.fontSize = '12px';
                    errorContainer.style.marginTop = '4px';
                }
                element.parentElement?.appendChild(errorContainer);
            }

            if (errorContainer) {
                if (isValid) {
                    errorContainer.remove();
                } else {
                    errorContainer.textContent = this.currentErrors[0];
                }
            }
        }
    }

    update(options: ValidationOptions) {
        this.options = { ...this.options, ...options };
    }

    unmount() {
        if (this.element instanceof HTMLInputElement) {
            this.element.removeEventListener('input', this.handleInput);
            this.element.removeEventListener('blur', this.handleBlur);
        }
    }

    // Public methods
    validate(): ValidationResult {
        if (this.element instanceof HTMLInputElement) {
            return this.validateElement(this.element);
        }
        return { isValid: false, errors: ['Element not found'] };
    }

    getErrors(): string[] {
        return this.currentErrors;
    }

    clearErrors() {
        this.currentErrors = [];
        if (this.element instanceof HTMLInputElement) {
            this.updateElementStyling(this.element, true);
        }
    }
} 