/**
 * Interface for all directives in the framework
 */
export interface Directive {
    /**
     * Called when the directive is first attached to an element
     * @param element The DOM element the directive is attached to
     */
    mount(element: Element): void;

    /**
     * Called when the directive's value changes
     * @param value The new value for the directive
     */
    update?(value: unknown): void;

    /**
     * Called when the directive is being removed
     */
    unmount?(): void;
}

/**
 * Base class for implementing directives
 * Provides common functionality and type safety
 */
export abstract class BaseDirective implements Directive {
    /** The element this directive is attached to */
    protected element: Element | null = null;

    /**
     * Creates a new directive instance
     * @param element Optional element to attach to
     */
    constructor(element?: Element) {
        if (element) {
            this.element = element;
        }
    }

    /**
     * Must be implemented by concrete directives
     * Sets up the initial directive state
     */
    abstract mount(element: Element): void;
} 