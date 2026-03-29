/**
 * Type for template expressions that can be either values or functions
 */
export type TemplateExpression = Function | ((context: unknown) => unknown);

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

/**
 * Represents the type of binding in a template.
 * @enum {number}
 */
export enum BindingType {
    /** A binding that represents a DOM node (text content) */
    Node = 'node',
    /** A binding that represents a property on an element */
    Property = 'property',
    /** A binding that represents an event handler */
    Event = 'event',
    Reference = 'reference',
    Boolean = 'boolean',
    /** A binding that represents a class attribute */
    Class = 'class',
    Style = "Style",
    Directive = 'directive',
    /** A binding that represents a generic attribute value (single or multi-expression) */
    Attribute = 'attribute',
    /** Two-way binding: syncs a property with a DOM element value via events */
    Bind = 'bind',
    /** Object class map: :class=${{ active: bool }} */
    ObjectClass = 'object-class',
    /** Object style map: :style=${{ color: 'red' }} */
    ObjectStyle = 'object-style',
    /** Spread binding: ...=${propsObj} — sets each key as a property */
    Spread = 'spread',
    /** Async auto-unwrap: ~prop=${promise} — resolves and sets when promise settles */
    Async = 'async',
    /** Utility styling: %=${'flex gap-2'} or %padding=${'1rem'} */
    Utility = 'utility'
}

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
}
