/**
 * Represents the different types of bindings that can be used in templates.
 * 
 * This is the single source of truth for all binding types across miura-render.
 * Use string values for easier debugging and persistence.
 */
export enum BindingType {
    /** Text/Node content binding (${...}) */
    Node = 'node',
    
    /** Event binding (@event=${...}) */
    Event = 'event',
    
    /** Property binding (.prop=${...}) */
    Property = 'property',
    
    /** Boolean attribute binding (?attr=${...}) */
    Boolean = 'boolean',
    
    /** Reference binding (#ref=${...}) */
    Reference = 'reference',
    
    /** Class binding (class="...") */
    Class = 'class',
    
    /** Style binding (style="...") */
    Style = 'style',
    
    /** Template binding (for nested templates #if, #for, etc.) */
    Template = 'template',
    
    /** Expression binding (for context-aware expressions) */
    Expression = 'expression',
    
    /** Directive binding (#directive=${...}) */
    Directive = 'directive',
    
    /** Standard attribute binding (attr=${...}) */
    Attribute = 'attribute',
    
    /** Two-way data binding (&model=${...}) */
    Bind = 'bind',
    
    /** Object class map binding (class=${{ active: true }}) */
    ObjectClass = 'object-class',
    
    /** Object style map binding (style=${{ color: 'red' }}) */
    ObjectStyle = 'object-style',
    
    /** Spread binding (...=${obj}) */
    Spread = 'spread',

    /** Async binding (#async=${promise}) */
    Async = 'async',

    /** Utility/CSS-Part binding (~part=${value}) */
    Utility = 'utility'
}