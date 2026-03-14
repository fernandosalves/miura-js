/**
 * Represents the different types of bindings that can be used in templates
 */
export enum BindingType {
    /** Text/Node content binding */
    Node = 'node',
    
    /** Event binding (@event) */
    Event = 'event',
    
    /** Property binding (.prop) */
    Property = 'property',
    
    /** Boolean attribute binding (?attr) */
    Boolean = 'boolean',
    
    /** Reference binding (#ref) */
    Reference = 'reference',
    
    /** Class binding (class="...") */
    Class = 'class',
    
    /** Style binding (style="...") */
    Style = 'style',
    
    /** Template binding (for nested templates) */
    Template = 'template',
    
    /** Expression binding (for computed values) */
    Expression = 'expression'
} 