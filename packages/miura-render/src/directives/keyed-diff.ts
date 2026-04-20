import { ITemplateProcessor, ITemplateInstance } from '../processor/types';
import { TemplateResult } from '../processor/template-result';
import { RepeatResult, KeyFn, TemplateFn } from './repeat';

// ── LIS-based keyed diff (ported from Miura) ────────────────────

/**
 * Compute the indexes of the Longest Increasing Subsequence within
 * `values`. Entries < 0 are treated as "new" and skipped.
 * O(n log n) via patience-sorting.
 */
function longestIncreasingSubsequenceIndexes(values: readonly number[]): number[] {
    const predecessors = new Array<number>(values.length).fill(-1);
    const pileTops: number[] = [];
    const pileTopIndexes: number[] = [];

    for (let i = 0; i < values.length; i++) {
        const value = values[i];
        if (value < 0) continue; // new item, no previous position

        let left = 0;
        let right = pileTops.length;
        while (left < right) {
            const mid = (left + right) >> 1;
            if (value <= pileTops[mid]) {
                right = mid;
            } else {
                left = mid + 1;
            }
        }

        if (left === pileTops.length) {
            pileTops.push(value);
            pileTopIndexes.push(i);
        } else {
            pileTops[left] = value;
            pileTopIndexes[left] = i;
        }

        if (left > 0) {
            predecessors[i] = pileTopIndexes[left - 1];
        }
    }

    const result: number[] = [];
    if (pileTopIndexes.length === 0) return result;

    let cursor = pileTopIndexes[pileTopIndexes.length - 1];
    for (let i = pileTopIndexes.length - 1; i >= 0; i--) {
        result[i] = cursor;
        cursor = predecessors[cursor];
    }

    return result;
}

// ── Keyed item state ─────────────────────────────────────────────

interface KeyedItem {
    key: unknown;
    instance: ITemplateInstance;
    nodes: Node[];
}

/**
 * Manages keyed list reconciliation for a NodeBinding.
 * Uses an LIS-based algorithm to compute the minimal set of DOM
 * moves required to reorder existing items, while reusing
 * TemplateInstance objects and only creating/removing as needed.
 */
export class KeyedListState {
    private items: KeyedItem[] = [];
    private keyMap = new Map<unknown, KeyedItem>();

    constructor(
        private startMarker: Comment,
        private endMarker: Comment,
        private processor: ITemplateProcessor
    ) {}

    /**
     * Reconcile the DOM to reflect a new RepeatResult.
     *
     * 1. Compute new keys & detect removals.
     * 2. Reuse or create TemplateInstances per key.
     * 3. Use LIS on the old→new position mapping to find items
     *    that can stay in place (the longest already-ordered run).
     * 4. Move only the items not in the LIS.
     */
    async update(result: RepeatResult, context?: unknown): Promise<void> {
        const { items: newData, keyFn, templateFn } = result;
        const parent = this.endMarker.parentNode!;

        // ── 1. Compute new keys ─────────────────────────────────
        const newKeys: unknown[] = [];
        const newKeySet = new Set<unknown>();
        for (let i = 0; i < newData.length; i++) {
            const key = keyFn(newData[i], i);
            if (newKeySet.has(key)) {
                console.warn(`[miura][repeat] Duplicate key: ${String(key)}. Items may not reconcile correctly.`);
            }
            newKeys.push(key);
            newKeySet.add(key);
        }

        // ── 2. Remove items whose keys are gone ─────────────────
        for (const [key, item] of this.keyMap) {
            if (!newKeySet.has(key)) {
                this.removeItem(item);
                this.keyMap.delete(key);
            }
        }

        // ── 3. Build old-key→old-index map ──────────────────────
        const oldKeyToIndex = new Map<unknown, number>();
        for (let i = 0; i < this.items.length; i++) {
            if (this.keyMap.has(this.items[i].key)) {
                oldKeyToIndex.set(this.items[i].key, i);
            }
        }

        // ── 4. Reuse or create items ────────────────────────────
        const newItemsList: KeyedItem[] = new Array(newData.length);
        const positions: number[] = new Array(newData.length);
        const createPromises: { idx: number; promise: Promise<ITemplateInstance> }[] = [];

        for (let i = 0; i < newData.length; i++) {
            const key = newKeys[i];
            const existing = this.keyMap.get(key);

            if (existing) {
                // Reuse — update values
                const templateResult = templateFn(newData[i], i);
                await existing.instance.update(templateResult.values, context);
                newItemsList[i] = existing;
                positions[i] = oldKeyToIndex.get(key) ?? -1;
            } else {
                // Will create below
                const templateResult = templateFn(newData[i], i);
                createPromises.push({
                    idx: i,
                    promise: this.processor.createInstance(templateResult, context)
                });
                positions[i] = -1; // new item
            }
        }

        // Await creations
        for (const { idx, promise } of createPromises) {
            const instance = await promise;
            const fragment = instance.getFragment();
            const nodes = Array.from(fragment.childNodes);
            newItemsList[idx] = { key: newKeys[idx], instance, nodes };
        }

        // ── 5. LIS — find items that can stay in place ──────────
        const lisIndexes = longestIncreasingSubsequenceIndexes(positions);
        const lisSet = new Set(lisIndexes);

        // ── 6. Apply DOM moves ──────────────────────────────────
        // Items in the LIS are already in correct relative order.
        // Everything else needs to be inserted at the right position.
        // Walk backwards from the end: maintain a `nextSibling` reference.
        let nextSibling: Node = this.endMarker;

        for (let i = newItemsList.length - 1; i >= 0; i--) {
            const item = newItemsList[i];
            const nodes = item.nodes;
            if (nodes.length === 0) continue;

            if (lisSet.has(i)) {
                // This item can stay — but verify it's actually in the DOM
                // and update nextSibling reference.
                if (nodes[0].parentNode === parent) {
                    nextSibling = nodes[0];
                    continue;
                }
            }

            // Move or insert all nodes for this item
            for (let j = nodes.length - 1; j >= 0; j--) {
                parent.insertBefore(nodes[j], nextSibling);
                nextSibling = nodes[j];
            }
        }

        // ── 7. Update internal state ────────────────────────────
        this.items = newItemsList;
        this.keyMap = new Map();
        for (const item of newItemsList) {
            this.keyMap.set(item.key, item);
        }
    }

    private removeItem(item: KeyedItem): void {
        item.instance.disconnect();
        for (const node of item.nodes) {
            node.parentNode?.removeChild(node);
        }
        item.nodes = [];
    }

    clear(): void {
        for (const item of this.items) {
            this.removeItem(item);
        }
        this.items = [];
        this.keyMap.clear();
    }

    disconnect(): void {
        this.clear();
    }
}
