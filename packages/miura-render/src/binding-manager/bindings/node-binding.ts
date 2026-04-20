import { Binding } from './binding';
import { TemplateResult, TRUSTED_SYMBOL } from '../../processor/template-result';
import { ITemplateProcessor } from '../../processor/types';
import { RepeatResult } from '../../directives/repeat';
import { KeyedListState } from '../../directives/keyed-diff';

/**
 * Tracks the "shape" of a previous render so we can decide whether to
 * reuse existing DOM or tear-down and rebuild.
 */
const enum PrevKind {
    None,
    Template,
    TemplateArray,
    Text,
    Node,
    Keyed,
}

export class NodeBinding implements Binding {
    private previousValue: unknown = undefined;

    /** What kind of content we last rendered */
    private prevKind: PrevKind = PrevKind.None;

    // ── Single TemplateResult reuse ──
    /** Cached instance for a single TemplateResult */
    private templateInstance: any = null;
    /** strings identity of the current templateInstance */
    private templateStrings: TemplateStringsArray | null = null;

    // ── Array of TemplateResults reuse ──
    /** Cached instances when rendering an array */
    private arrayInstances: any[] = [];
    /** Per-index strings identity for each array item */
    private arrayStrings: (TemplateStringsArray | null)[] = [];

    // ── Primitive text reuse ──
    private textNode: Text | null = null;

    // ── Keyed list (repeat) ──
    private keyedState: KeyedListState | null = null;

    constructor(
        private element: Element,
        private startMarker: Comment,
        private endMarker: Comment,
        private processor?: ITemplateProcessor
    ) { }

    async setValue(value: unknown, context?: unknown): Promise<void> {
        // Fast path: identical value reference
        if (value === this.previousValue) return;

        // ── Keyed list (repeat directive) ───────────────────────
        if (value instanceof RepeatResult && this.processor) {
            if (this.prevKind !== PrevKind.Keyed) {
                this.teardown();
            }
            if (!this.keyedState) {
                this.keyedState = new KeyedListState(
                    this.startMarker,
                    this.endMarker,
                    this.processor
                );
            }
            await this.keyedState.update(value, context);
            this.prevKind = PrevKind.Keyed;
            this.previousValue = value;
            return;
        }

        // Leaving keyed mode — tear it down
        if (this.keyedState) {
            this.keyedState.clear();
            this.keyedState = null;
        }

        // ── null / undefined ────────────────────────────────────
        if (value === null || value === undefined) {
            this.teardown();
            this.previousValue = value;
            return;
        }

        // ── Single TemplateResult ───────────────────────────────
        if (value instanceof TemplateResult && this.processor) {
            if (
                this.prevKind === PrevKind.Template &&
                this.templateInstance &&
                this.templateStrings === value.strings
            ) {
                // Same template structure → just update values (no DOM teardown)
                await this.templateInstance.update(value.values, context);
            } else {
                // Different template or first render → full create
                this.teardown();
                const instance = await this.processor.createInstance(value, context);
                this.templateInstance = instance;
                this.templateStrings = value.strings;
                this.insert(instance.getFragment());
            }
            this.prevKind = PrevKind.Template;
            this.previousValue = value;
            return;
        }

        // ── Array of values ─────────────────────────────────────
        if (Array.isArray(value) && this.processor) {
            await this.setArrayValue(value, context);
            this.prevKind = PrevKind.TemplateArray;
            this.previousValue = value;
            return;
        }

        // ── Raw DOM Node ────────────────────────────────────────
        if (value instanceof Node) {
            this.teardown();
            this.insert(value);
            this.prevKind = PrevKind.Node;
            this.previousValue = value;
            return;
        }

        // ── Primitive (string / number / boolean / TrustedValue) ───────────────
        if (value && typeof value === 'object' && (value as any)[TRUSTED_SYMBOL]) {
            this.teardown();
            const html = (value as any).value;
            const temp = document.createElement('template');
            temp.innerHTML = html;
            const fragment = document.importNode(temp.content, true);
            this.insert(fragment);
            // We don't cache textNode for trusted HTML as it can be multiple nodes
            this.prevKind = PrevKind.Node; 
            this.previousValue = value;
            return;
        }

        if (this.prevKind === PrevKind.Text && this.textNode) {
            // Reuse existing text node — zero DOM operations
            this.textNode.nodeValue = String(value);
        } else {
            this.teardown();
            this.textNode = document.createTextNode(String(value));
            this.insert(this.textNode);
        }
        this.prevKind = PrevKind.Text;
        this.previousValue = value;
    }

    // ── Array optimisation ──────────────────────────────────────

    private async setArrayValue(value: unknown[], context?: unknown): Promise<void> {
        const prevLen = this.arrayInstances.length;
        const newLen = value.length;

        // Fast path: same length AND same template structure → pure in-place value update, no DOM changes.
        // NOTE: We intentionally exclude shrink/grow from this path because getFragment() on an already-
        // inserted TemplateInstance returns an empty DocumentFragment (its children were moved to the live
        // DOM on first insert). removeTrailingNodes relied on re-inserting from those empty fragments,
        // which caused all "kept" cards to disappear. Shrink/grow go to the slow path instead.
        if (
            this.prevKind === PrevKind.TemplateArray &&
            prevLen > 0 &&
            newLen === prevLen
        ) {
            let canReuse = true;
            for (let i = 0; i < newLen && canReuse; i++) {
                const item = value[i];
                if (
                    !(item instanceof TemplateResult) ||
                    this.arrayStrings[i] !== item.strings ||
                    !this.arrayInstances[i]
                ) {
                    canReuse = false;
                }
            }
            if (canReuse) {
                for (let i = 0; i < newLen; i++) {
                    await this.arrayInstances[i].update((value[i] as TemplateResult).values, context);
                }
                return;
            }
        }

        // Slow path: full teardown + rebuild (handles grow, shrink, and structure changes)
        this.teardown();

        const fragment = document.createDocumentFragment();
        this.arrayInstances = [];
        this.arrayStrings = [];

        for (let i = 0; i < newLen; i++) {
            const item = value[i];
            if (item instanceof TemplateResult) {
                // Mix in loop index with parent context if possible, or just pass context
                // For now, we prioritize the parent context (signals/element)
                const instance = await this.processor!.createInstance(item, context);
                this.arrayInstances.push(instance);
                this.arrayStrings.push(item.strings);
                fragment.appendChild(instance.getFragment());
            } else {
                this.arrayInstances.push(null);
                this.arrayStrings.push(null);
                fragment.appendChild(document.createTextNode(String(item)));
            }
        }

        this.insert(fragment);
    }

    /**
     * Remove DOM nodes that belong to array items from index `fromIndex` onwards.
     */
    private removeTrailingNodes(fromIndex: number): void {
        // Walk backwards from endMarker to find and remove excess nodes.
        // Each template instance's DOM sits between the markers.
        // Since we can't easily map instance → DOM range, remove all DOM
        // after the last kept instance and re-insert would be wasteful.
        // Instead, count nodes per instance during teardown — but for now,
        // clear everything from startMarker to endMarker and re-insert kept instances.
        // This is still better than full teardown because we don't recreate instances.
        let node = this.startMarker.nextSibling;
        while (node && node !== this.endMarker) {
            const next = node.nextSibling;
            node.parentNode?.removeChild(node);
            node = next;
        }
        // Re-insert kept instances
        for (let i = 0; i < fromIndex; i++) {
            if (this.arrayInstances[i]) {
                this.insert(this.arrayInstances[i].getFragment());
            }
        }
    }

    // ── Shared helpers ──────────────────────────────────────────

    private insert(node: Node): void {
        this.endMarker.parentNode?.insertBefore(node, this.endMarker);
    }

    /**
     * Full teardown: disconnect instances, remove DOM nodes, reset state.
     */
    private teardown(): void {
        // Disconnect single template instance
        if (this.templateInstance) {
            this.templateInstance.disconnect();
            this.templateInstance = null;
            this.templateStrings = null;
        }

        // Disconnect array instances
        for (const inst of this.arrayInstances) {
            if (inst?.disconnect) inst.disconnect();
        }
        this.arrayInstances = [];
        this.arrayStrings = [];

        // Clear text node ref
        this.textNode = null;

        // Remove all DOM between markers
        let node = this.startMarker.nextSibling;
        while (node && node !== this.endMarker) {
            const next = node.nextSibling;
            node.parentNode?.removeChild(node);
            node = next;
        }

        this.prevKind = PrevKind.None;
    }

    clear(): void {
        this.teardown();
    }

    disconnect(): void {
        if (this.keyedState) {
            this.keyedState.disconnect();
            this.keyedState = null;
        }
        this.teardown();
    }
} 