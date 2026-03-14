import { Binding } from './binding';
import { TemplateResult } from '../../processor/template-result';
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
    ) {}

    async setValue(value: unknown): Promise<void> {
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
            await this.keyedState.update(value);
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
                await this.templateInstance.update(value.values);
            } else {
                // Different template or first render → full create
                this.teardown();
                const instance = await this.processor.createInstance(value);
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
            await this.setArrayValue(value);
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

        // ── Primitive (string / number / boolean) ───────────────
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

    private async setArrayValue(value: unknown[]): Promise<void> {
        const prevLen = this.arrayInstances.length;
        const newLen = value.length;

        // Try to reuse instances that have the same template strings
        const reusableCount = Math.min(prevLen, newLen);
        let canReuseAll = this.prevKind === PrevKind.TemplateArray && prevLen > 0;

        // Check if we can do in-place updates for existing items
        for (let i = 0; i < reusableCount && canReuseAll; i++) {
            const item = value[i];
            if (
                item instanceof TemplateResult &&
                this.arrayStrings[i] === item.strings &&
                this.arrayInstances[i]
            ) {
                // This item can be reused
            } else {
                canReuseAll = false;
            }
        }

        if (canReuseAll && newLen <= prevLen) {
            // Fast path: update existing items in-place, remove extras
            for (let i = 0; i < reusableCount; i++) {
                const item = value[i] as TemplateResult;
                await this.arrayInstances[i].update(item.values);
            }
            // Remove excess items from the end
            for (let i = newLen; i < prevLen; i++) {
                if (this.arrayInstances[i]?.disconnect) {
                    this.arrayInstances[i].disconnect();
                }
            }
            // Remove excess DOM nodes (from the last reusable instance to end marker)
            if (newLen < prevLen) {
                this.removeTrailingNodes(newLen);
            }
            this.arrayInstances.length = newLen;
            this.arrayStrings.length = newLen;
            return;
        }

        // Slow path: full teardown + rebuild
        this.teardown();

        const fragment = document.createDocumentFragment();
        this.arrayInstances = [];
        this.arrayStrings = [];

        for (let i = 0; i < newLen; i++) {
            const item = value[i];
            if (item instanceof TemplateResult) {
                const instance = await this.processor!.createInstance(item, { index: i });
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