import { TemplateResult } from '../processor/template-result';

/**
 * Key function: extracts a unique key from an item.
 */
export type KeyFn<T> = (item: T, index: number) => unknown;

/**
 * Template function: produces a TemplateResult for an item.
 */
export type TemplateFn<T> = (item: T, index: number) => TemplateResult;

/**
 * Marker object returned by repeat(). Detected by NodeBinding
 * to trigger keyed reconciliation instead of full teardown+rebuild.
 */
export class RepeatResult {
    constructor(
        public readonly items: readonly unknown[],
        public readonly keyFn: KeyFn<any>,
        public readonly templateFn: TemplateFn<any>
    ) {}
}

/**
 * Keyed list rendering directive.
 *
 * Usage:
 * ```ts
 * html`
 *   <ul>
 *     ${repeat(
 *       this.items,
 *       item => item.id,
 *       (item, index) => html`<li>${item.name}</li>`
 *     )}
 *   </ul>
 * `
 * ```
 *
 * When items change, the diff algorithm:
 * - Reuses DOM for items with the same key (calls instance.update())
 * - Creates new DOM only for genuinely new items
 * - Removes DOM only for items that disappeared
 * - Moves DOM nodes to match the new order
 *
 * This is dramatically faster than the default array rendering
 * which tears down and rebuilds all DOM on every update.
 *
 * @param items - The array of items to render
 * @param keyFn - Function that returns a unique key for each item
 * @param templateFn - Function that returns a TemplateResult for each item
 */
export function repeat<T>(
    items: readonly T[],
    keyFn: KeyFn<T>,
    templateFn: TemplateFn<T>
): RepeatResult {
    return new RepeatResult(items, keyFn, templateFn);
}
