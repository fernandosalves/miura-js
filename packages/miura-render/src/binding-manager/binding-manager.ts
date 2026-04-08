import { NodeBinding } from './bindings/node-binding';
import { Binding } from './bindings/binding';
import { TemplateBinding } from '../processor/parser';
import { BindingType } from '../processor/template-result';
import { ITemplateProcessor } from '../processor/types';
import { debugLog } from '../utils/debug';

import { PropertyBinding } from './bindings/property-binding';
import { EventBinding } from './bindings/event-binding';
import { ClassBinding } from './bindings/class-binding';
import { BooleanBinding } from './bindings/boolean-binding';
import { ReferenceBinding } from './bindings/reference-binding';
import { StyleBinding } from './bindings/style-binding';
import { DirectiveBinding } from './bindings/directive-binding';
import { AttributeBinding, AttributePartBinding } from './bindings/attribute-binding';
import { BindBinding } from './bindings/bind-binding';
import { ObjectClassBinding } from './bindings/object-class-binding';
import { ObjectStyleBinding } from './bindings/object-style-binding';
import { SpreadBinding } from './bindings/spread-binding';
import { AsyncBinding } from './bindings/async-binding';
import { UtilityBinding, UtilityPartBinding } from './bindings/utility-binding';

type SignalLike = { peek(): unknown; subscribe(fn: (v: unknown) => void): () => void };
type MultipartBinding = AttributeBinding | UtilityBinding;

function _isSignal(v: unknown): v is SignalLike {
    return typeof v === 'function' && (v as any).__isSignal === true;
}

export class BindingManager {
    private static formatBindingContext(binding?: TemplateBinding, fallbackIndex?: number): string {
        if (binding?.debugLabel) {
            return `${binding.debugLabel} (binding:${binding.index})`;
        }
        if (binding) {
            return `binding:${binding.index}`;
        }
        return `binding:${fallbackIndex ?? 'unknown'}`;
    }
    /**
     * Performance tracking
     */
    private static metrics = {
        createTime: 0,
        initTime: 0,
        bindingCount: 0
    };

    /**
     * Get performance metrics
     */
    static getPerformanceMetrics() {
        return { ...this.metrics };
    }

    /**
     * Reset performance metrics
     */
    static resetMetrics() {
        this.metrics = {
            createTime: 0,
            initTime: 0,
            bindingCount: 0
        };
    }

    static async createAndInitializeParts(
        fragment: DocumentFragment,
        bindings: TemplateBinding[],
        values: unknown[],
        context?: unknown,
        processor?: ITemplateProcessor
    ): Promise<Binding[]> {
        const startTime = performance.now();
        const parts = this.createBindings(fragment, bindings, processor);
        await this.initializeBindings(parts, bindings, values, context);
        this.metrics.createTime = performance.now() - startTime;
        this.metrics.bindingCount += bindings.length;
        return parts;
    }

    private static createBindings(
        fragment: DocumentFragment,
        bindings: TemplateBinding[],
        processor?: ITemplateProcessor
    ): Binding[] {
        debugLog('bindingManager', 'Creating bindings', { bindingsCount: bindings.length });
        const bindingInstances: Binding[] = [];

        // Caches for multi-part attribute groups
        const elementCache = new Map<number, Element>();
        const attrBindingCache = new Map<number, MultipartBinding>();

        bindings.forEach(binding => {
            // Handle multi-part Attribute bindings
            if (binding.type === BindingType.Attribute || binding.type === BindingType.Utility) {
                const groupStart = binding.groupStart ?? binding.index;
                let element: Element | null;

                if (groupStart === binding.index) {
                    // First part in the group — find element via marker
                    element = this.findBindingElement(fragment, binding.index);
                    if (element) elementCache.set(groupStart, element);
                } else {
                    // Subsequent part — reuse cached element
                    element = elementCache.get(groupStart) || null;
                }

                if (!element) return;

                if (groupStart === binding.index) {
                    const strings = binding.strings || ['', ''];
                    if (binding.type === BindingType.Utility) {
                        const utilityBinding = new UtilityBinding(element, binding.name || '', strings);
                        attrBindingCache.set(groupStart, utilityBinding);
                        bindingInstances[binding.index] = utilityBinding;
                    } else {
                        const attrBinding = new AttributeBinding(element, binding.name || '', strings);
                        attrBindingCache.set(groupStart, attrBinding);
                        bindingInstances[binding.index] = attrBinding;
                    }
                } else {
                    const parent = attrBindingCache.get(groupStart);
                    if (parent) {
                        if (binding.type === BindingType.Utility) {
                            bindingInstances[binding.index] = new UtilityPartBinding(parent as UtilityBinding, binding.partIndex ?? 0);
                        } else {
                            bindingInstances[binding.index] = new AttributePartBinding(parent as AttributeBinding, binding.partIndex ?? 0);
                        }
                    }
                }
                return;
            }

            // Non-attribute bindings — original logic
            const element = this.findBindingElement(fragment, binding.index);
            if (element) {
                const bindingInstance = this.createBindingForType(element, binding, processor);
                if (bindingInstance) {
                    bindingInstances[binding.index] = bindingInstance;
                }
            }
        });

        return bindingInstances;
    }

    private static createBindingForType(
        element: Element,
        binding: TemplateBinding,
        processor?: ITemplateProcessor
    ): Binding {
        const name = binding.name || '';
        
        switch (binding.type) {
            case BindingType.Node:
                const [startMarker, endMarker] = this.findMarkers(element, binding.index);
                return new NodeBinding(element, startMarker, endMarker, processor);
                
            case BindingType.Property:
                return new PropertyBinding(element, name.slice(1)); // Remove . prefix
                
            case BindingType.Boolean:
                const booleanAttrName = name.startsWith('?') ? name.slice(1) : name;
                return new BooleanBinding(element, booleanAttrName);
                
            case BindingType.Event:
                return new EventBinding(
                    element, 
                    name,
                    binding.modifiers || []
                );
                
            case BindingType.Class:
                debugLog('bindingManager', 'Creating class binding', {
                    element: element.tagName,
                    name
                });
                return new ClassBinding(element);
                
            case BindingType.Reference:
                const refName = name.startsWith('#') ? name.slice(1) : name;
                return new ReferenceBinding(element);
                
            case BindingType.Style:
                return new StyleBinding(element);
                
            case BindingType.Directive:
                const directiveName = name.replace(/^#/, '');
                return new DirectiveBinding(element, directiveName);

            case BindingType.Bind: {
                const bindProp = name.startsWith('&') ? name.slice(1) : name;
                return new BindBinding(element, bindProp);
            }

            case BindingType.ObjectClass:
                return new ObjectClassBinding(element);

            case BindingType.ObjectStyle:
                return new ObjectStyleBinding(element as HTMLElement);

            case BindingType.Spread:
                return new SpreadBinding(element);

            case BindingType.Async: {
                const asyncProp = name.startsWith('~') ? name.slice(1) : name;
                return new AsyncBinding(element, asyncProp);
            }

            case BindingType.Utility:
                return new UtilityBinding(element, name, ['', '']);

            default:
                throw new Error(`Unsupported binding type: ${binding.type}`);
        }
    }

    private static findBindingElement(
        fragment: DocumentFragment,
        index: number
    ): Element | null {
        const walker = document.createTreeWalker(
            fragment,
            NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_ELEMENT
        );

        let node: Node | null;
        while ((node = walker.nextNode())) {
            if (node.nodeType === Node.COMMENT_NODE) {
                const comment = node as Comment;
                if (this.isBindingMarker(comment, index)) {
                    return comment.parentElement;
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;
                if (this.hasBindingAttribute(element, index)) {
                    return element;
                }
            }
        }

        return null;
    }

    private static findMarkers(
        element: Element,
        index: number
    ): [Comment, Comment] {
        const walker = document.createTreeWalker(
            element.parentElement || element,
            NodeFilter.SHOW_COMMENT
        );

        let startMarker: Comment | null = null;
        let endMarker: Comment | null = null;
        let foundStart = false;

        let node: Node | null;
        while ((node = walker.nextNode())) {
            const comment = node as Comment;
            const value = comment.nodeValue || '';

            if (!foundStart && value === `binding:${index}`) {
                startMarker = comment;
                foundStart = true;
            } else if (foundStart && value === `/binding:${index}`) {
                endMarker = comment;
                break;
            }
        }

        if (!startMarker || !endMarker) {
            debugLog('bindingManager', 'Failed to find markers', {
                index,
                element,
                parentHTML: element.parentElement?.innerHTML
            });
            throw new Error(`Could not find markers for binding:${index}`);
        }

        return [startMarker, endMarker];
    }

    private static isBindingMarker(comment: Comment, index: number): boolean {
        return comment.nodeValue === `binding:${index}`;
    }

    private static hasBindingAttribute(element: Element, index: number): boolean {
        return Array.from(element.attributes).some(attr => 
            attr.value === `binding:${index}`
        );
    }

    public static async initializeBindings(
        bindings: Binding[],
        bindingDefs: TemplateBinding[],
        values: unknown[],
        context?: unknown
    ): Promise<void> {
        const startTime = performance.now();
        debugLog('bindingManager', 'Initializing bindings', {
            bindingsCount: bindings.length,
            valuesCount: values.length
        });

        const promises = bindings.map(async (binding, i) => {
            try {
                const bindingDef = bindingDefs[i];
                const value = values[i];
                if (value === undefined) return;

                if (_isSignal(value)) {
                    // Already subscribed to this exact signal — skip (idempotent)
                    if ((binding as any).__lastSignal === value) return;

                    // Cancel previous subscription if the signal instance changed
                    const prev = (binding as any).__signalUnsub;
                    if (typeof prev === 'function') prev();

                    (binding as any).__lastSignal = value;
                    (binding as any).__signalUnsub = value.subscribe((v: unknown) => {
                        binding.setValue(v, context);
                    });

                    // Set current value immediately (no full re-render needed)
                    await binding.setValue(value.peek(), context);
                    return;
                }

                // Handle async directive bindings
                if (binding.setValue.constructor.name === 'AsyncFunction') {
                    await binding.setValue(value, context);
                } else {
                    binding.setValue(value, context);
                }
            } catch (error) {
                console.error(`Error initializing ${this.formatBindingContext(bindingDefs[i], i)}:`, error);
                throw error;
            }
        });

        await Promise.all(promises);
        this.metrics.initTime = performance.now() - startTime;
    }
}
