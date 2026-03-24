import { StructuralDirective } from './structural.directive';
import { debugLog } from '../../utils/debug';
import { TemplateResult } from '../../processor/template-result';
import { ITemplateProcessor, getDefaultProcessor } from '../../processor/types';

interface ForCallback<T> {
    (item: T, index: number): TemplateResult;
}

/**
 * Resolve a dotted property path like "$item.name" against a scope object.
 * Returns the resolved value, or '' if any segment is undefined.
 */
function resolvePath(scope: Record<string, unknown>, path: string): string {
    const parts = path.split('.');
    let current: unknown = scope;

    for (const part of parts) {
        if (current === null || current === undefined) return '';
        current = (current as Record<string, unknown>)[part];
    }

    return current === null || current === undefined ? '' : String(current);
}

/**
 * Replace all `{{$item}}`, `{{$item.prop.sub}}`, and `{{$index}}`
 * tokens in a string with values from the given scope.
 */
function interpolate(text: string, scope: Record<string, unknown>): string {
    return text.replace(/\{\{(\$[a-zA-Z0-9_.]+)\}\}/g, (_match, expr: string) => {
        return resolvePath(scope, expr);
    });
}

/**
 * Walk every Text node and attribute value in a DOM tree and interpolate
 * `{{$item}}` / `{{$index}}` tokens.
 */
function interpolateDOM(root: Node, scope: Record<string, unknown>): void {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);

    let node: Node | null = root;
    while (node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node as Text;
            if (text.nodeValue && text.nodeValue.includes('{{')) {
                text.nodeValue = interpolate(text.nodeValue, scope);
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as Element;
            for (const attr of Array.from(el.attributes)) {
                if (attr.value.includes('{{')) {
                    attr.value = interpolate(attr.value, scope);
                }
            }
        }
        node = walker.nextNode();
    }
}

/**
 * For directive — list iteration.
 *
 * ## Callback mode (existing)
 * ```html
 * <li #for=${[this.items, (item) => html`<div>${item}</div>`]}></li>
 * ```
 *
 * ## Template mode 
 * Pass just the items array. The directive clones the child `<template>`
 * for each item, interpolating `{{$item}}` / `{{$index}}` tokens:
 * ```html
 * <ul #for=${this.users}>
 *   <template>
 *     <li>{{$index}}. {{$item.name}} — {{$item.email}}</li>
 *   </template>
 * </ul>
 * ```
 */
export class ForDirective extends StructuralDirective {
    private callback: ForCallback<any> | null = null;
    private itemsData: any[] | null = null;
    private childInstances: any[] = [];

    private get processor(): ITemplateProcessor | null {
        return getDefaultProcessor();
    }
    private startMarker: Comment | null = null;
    private endMarker: Comment | null = null;

    // ── Template mode ────────────────────────────────────
    /** The `<template>` child found inside the host element (grabbed before mount replaces it) */
    private itemTemplate: HTMLTemplateElement | null = null;

    mount(element: Element) {
        // Grab the <template> child BEFORE super.mount() replaces the element
        const tpl = element.querySelector('template');
        if (tpl) {
            this.itemTemplate = tpl;
            debugLog('for', 'Found <template> child — entering template mode');
        }

        super.mount(element);

        // Create start/end markers to delimit the list region
        this.startMarker = document.createComment('for-start');
        this.endMarker = document.createComment('for-end');
        this.comment!.parentNode!.insertBefore(this.startMarker, this.comment);
        this.comment!.parentNode!.insertBefore(this.endMarker, this.comment);
    }

    // ── Callback mode (existing) ─────────────────────────

    protected async updateContent(items: unknown[]): Promise<void> {
        if (!Array.isArray(items) || !this.startMarker?.parentNode) {
            debugLog('for', 'Cannot update: missing requirements', {
                isArray: Array.isArray(items),
                hasMarker: !!this.startMarker,
                items: items
            });
            return;
        }

        // Only proceed if we have a callback (callback mode)
        if (!this.callback) {
            debugLog('for', 'No callback available - likely template mode');
            return;
        }

        debugLog('for', 'Updating for directive (callback mode)', { 
            items,
            currentItems: this.childInstances.length,
            callback: this.callback
        });

        // Disconnect and remove previous items
        this.clearChildren();

        // Render each item through the TemplateProcessor to preserve bindings
        const fragment = document.createDocumentFragment();

        for (let index = 0; index < items.length; index++) {
            const item = items[index];
            debugLog('for', 'Rendering item', { item, index });

            const result = this.callback(item, index);

            if (result instanceof TemplateResult && this.processor) {
                const instance = await this.processor.createInstance(result, { item, index });
                this.childInstances.push(instance);
                fragment.appendChild(instance.getFragment());
            } else {
                fragment.appendChild(document.createTextNode(String(result)));
            }
        }

        // Insert all rendered items between the markers
        this.endMarker!.parentNode!.insertBefore(fragment, this.endMarker);
    }

    // ── Template mode (new) ──────────────────────────────

    private updateContentFromTemplate(items: unknown[]): void {
        if (!Array.isArray(items) || !this.startMarker?.parentNode || !this.itemTemplate) {
            return;
        }

        debugLog('for', 'Updating for directive (template mode)', {
            itemCount: items.length,
        });

        this.clearChildren();

        const fragment = document.createDocumentFragment();

        for (let index = 0; index < items.length; index++) {
            const item = items[index];
            const clone = this.itemTemplate.content.cloneNode(true) as DocumentFragment;

            // Build scope: {{$item}}, {{$item.name}}, {{$index}}
            const scope: Record<string, unknown> = {
                $item: item,
                $index: index,
            };

            interpolateDOM(clone, scope);
            fragment.appendChild(clone);
        }

        this.endMarker!.parentNode!.insertBefore(fragment, this.endMarker);
    }

    // ── Dispatch ─────────────────────────────────────────

    async update(value: unknown) {
        debugLog('for', 'Update called with', { value, type: typeof value });

        // Callback mode: [items, callback]
        if (Array.isArray(value) && value.length === 2 && typeof value[1] === 'function') {
            this.itemsData = value[0] as any[];
            this.callback = value[1] as ForCallback<any>;
            await this.updateContent(this.itemsData);
            return;
        }

        // Template mode: plain array + <template> child
        if (Array.isArray(value) && this.itemTemplate) {
            this.itemsData = value;
            this.updateContentFromTemplate(value);
            return;
        }

        debugLog('for', 'Unrecognised value shape', { value });
    }

    private clearChildren(): void {
        // Disconnect all child template instances
        for (const instance of this.childInstances) {
            if (instance.disconnect) {
                instance.disconnect();
            }
        }
        this.childInstances = [];

        // Remove DOM nodes between markers
        if (this.startMarker && this.endMarker) {
            let node = this.startMarker.nextSibling;
            while (node && node !== this.endMarker) {
                const next = node.nextSibling;
                node.parentNode?.removeChild(node);
                node = next;
            }
        }
    }

    unmount() {
        this.clearChildren();
        if (this.startMarker?.parentNode) {
            this.startMarker.parentNode.removeChild(this.startMarker);
        }
        if (this.endMarker?.parentNode) {
            this.endMarker.parentNode.removeChild(this.endMarker);
        }
        this.startMarker = null;
        this.endMarker = null;
        this.callback = null;
        this.itemsData = null;
        this.itemTemplate = null;
        super.unmount();
    }
} 