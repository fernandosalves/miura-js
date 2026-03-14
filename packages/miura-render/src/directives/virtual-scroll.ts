import { TemplateResult } from '../processor/template-result';

/**
 * Configuration for virtual scrolling.
 */
export interface VirtualScrollConfig<T> {
    /** Full list of items */
    items: readonly T[];
    /** Fixed height of each item in pixels */
    itemHeight: number;
    /** Height of the scrollable container in pixels */
    containerHeight: number;
    /** Render function for each visible item */
    render: (item: T, index: number) => TemplateResult;
    /** Number of extra items to render above/below the visible area (default: 2) */
    overscan?: number;
}

/**
 * Result of a virtual scroll computation.
 * Contains the container styles, spacer info, and rendered visible items.
 */
export interface VirtualScrollResult<T> {
    /** CSS styles for the outer scrollable container */
    containerStyle: string;
    /** CSS styles for the inner spacer that maintains total scroll height */
    spacerStyle: string;
    /** CSS styles for the content wrapper positioned at the correct offset */
    contentStyle: string;
    /** The visible items to render */
    visibleItems: { item: T; index: number; template: TemplateResult }[];
    /** Total number of items */
    totalCount: number;
    /** Total scrollable height in px */
    totalHeight: number;
    /** First visible index */
    startIndex: number;
    /** Last visible index (exclusive) */
    endIndex: number;
}

/**
 * Compute which items are visible given a scroll offset, and return
 * the positioning metadata needed to render them.
 *
 * This is a pure function — it does not touch the DOM. The component
 * is responsible for:
 * 1. Providing a scroll container with `overflow-y: auto`
 * 2. Listening for `scroll` events and calling this again
 * 3. Rendering the returned templates
 *
 * @example
 * ```ts
 * @component({ tag: 'my-list' })
 * class MyList extends MiuraElement {
 *   declare items: any[];
 *   declare scrollTop: number;
 *
 *   static properties = {
 *     items: { type: Array, default: [] },
 *     scrollTop: { type: Number, default: 0 },
 *   };
 *
 *   private onScroll = (e: Event) => {
 *     this.scrollTop = (e.target as HTMLElement).scrollTop;
 *   };
 *
 *   template() {
 *     const vs = computeVirtualSlice({
 *       items: this.items,
 *       itemHeight: 40,
 *       containerHeight: 400,
 *       render: (item, i) => html`<div class="row">${item.name}</div>`,
 *     }, this.scrollTop);
 *
 *     return html`
 *       <div style=${vs.containerStyle} @scroll=${this.onScroll}>
 *         <div style=${vs.spacerStyle}>
 *           <div style=${vs.contentStyle}>
 *             ${vs.visibleItems.map(v => v.template)}
 *           </div>
 *         </div>
 *       </div>
 *     `;
 *   }
 * }
 * ```
 */
export function computeVirtualSlice<T>(
    config: VirtualScrollConfig<T>,
    scrollTop: number = 0
): VirtualScrollResult<T> {
    const { items, itemHeight, containerHeight, render, overscan = 2 } = config;
    const totalCount = items.length;
    const totalHeight = totalCount * itemHeight;

    // Compute visible range
    const rawStart = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, rawStart - overscan);
    const endIndex = Math.min(totalCount, rawStart + visibleCount + overscan);

    // Build visible items
    const visibleItems: VirtualScrollResult<T>['visibleItems'] = [];
    for (let i = startIndex; i < endIndex; i++) {
        visibleItems.push({
            item: items[i],
            index: i,
            template: render(items[i], i)
        });
    }

    const offsetY = startIndex * itemHeight;

    return {
        containerStyle: `overflow-y:auto;height:${containerHeight}px;position:relative;`,
        spacerStyle: `height:${totalHeight}px;position:relative;`,
        contentStyle: `position:absolute;top:${offsetY}px;left:0;right:0;`,
        visibleItems,
        totalCount,
        totalHeight,
        startIndex,
        endIndex,
    };
}
