/**
 * Type for template expressions that can be either values or functions
 */
export type TemplateExpression = Function | ((context: unknown) => unknown);

/**
 * Symbol used to mark strings as trusted/safe for raw HTML injection
 */
export const TRUSTED_SYMBOL = Symbol('miura:trusted');

export type TrustedValue = {
    [TRUSTED_SYMBOL]: true;
    value: string;
}

/**
 * Represents the result of processing a template literal.
 * Contains the strings and values that make up the template.
 * @interface TemplateResult
 */
export class TemplateResult {
    /**
     * @param strings The array of static strings in the template
     * @param values The array of dynamic values in the template
     */
    constructor(
        /** The array of static strings in the template */
        public readonly strings: TemplateStringsArray,
        /** The array of dynamic values in the template */
        public readonly values: unknown[]
    ) { }
}

import { BindingType } from '../binding-manager/binding-type';
export { BindingType };

/**
 * Represents a binding in a template.
 * A binding connects a value in the template to a specific location in the DOM.
 * @interface TemplateBinding
 */
export interface TemplateBinding {
    /** The type of binding (Node, Property, Event, etc.) */
    type: BindingType;
    /** 
     * The name of the binding target.
     * - For Node bindings: empty string
     * - For Property bindings: property name (e.g., "value", "checked")
     * - For Event bindings: event name (e.g., "click", "input")
     * - For Class bindings: "class"
     */
    name?: string;
    /** The index of the value in the template's values array */
    index: number;
    /** Human-readable debug context for developer-facing errors */
    debugLabel?: string;
}
