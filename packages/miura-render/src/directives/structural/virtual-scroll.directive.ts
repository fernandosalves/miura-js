import { StructuralDirective } from './structural.directive';
import { TemplateResult } from '../../processor/template-result';
import { ITemplateProcessor, getDefaultProcessor } from '../../processor/types';
import { debugLog } from '../../utils/debug';

/**
 * Configuration passed to the #virtualScroll directive.
 */
export interface VirtualScrollDirectiveConfig<T = unknown> {
    /** Full list of items */
    items: readonly T[];
    /** Fixed height of each item in pixels */
    itemHeight: number;
    /** Height of the scrollable container in pixels */
    containerHeight: number;
    /** Render function for each visible item */
    render: (item: T, index: number) => TemplateResult;
    /** Extra items above/below the visible area (default: 3) */
    overscan?: number;
}

/**
 * Structural directive that virtualizes a list, rendering only the visible
 * items. Manages its own scroll container, spacer, and content region.
 *
 * Usage:
 * ```html
 * <div #virtualScroll=${{
 *   items: this.items,
 *   itemHeight: 40,
 *   containerHeight: 400,
 *   render: (item, i) => html`<div class="row">${item.name}</div>`,
 *   overscan: 3
 * }}></div>
 * ```
 */
export class VirtualScrollDirective extends StructuralDirective {
    private scrollContainer: HTMLDivElement | null = null;
    private spacer: HTMLDivElement | null = null;
    private contentWrapper: HTMLDivElement | null = null;

    private childInstances: any[] = [];
    private config: VirtualScrollDirectiveConfig | null = null;
    private scrollTop = 0;
    private rafId: number | null = null;

    private get processor(): ITemplateProcessor | null {
        return getDefaultProcessor();
    }

    // ── Lifecycle ────────────────────────────────────────

    mount(element: Element) {
        super.mount(element);

        // Build the DOM skeleton:
        //   <comment:structural-directive>
        //   <div.vs-container>
        //     <div.vs-spacer>
        //       <div.vs-content>
        //         ...visible items...
        //       </div>
        //     </div>
        //   </div>
        this.scrollContainer = document.createElement('div');
        this.scrollContainer.style.cssText = 'overflow-y:auto;position:relative;';

        this.spacer = document.createElement('div');
        this.spacer.style.cssText = 'position:relative;';

        this.contentWrapper = document.createElement('div');
        this.contentWrapper.style.cssText = 'position:absolute;left:0;right:0;top:0;';

        this.spacer.appendChild(this.contentWrapper);
        this.scrollContainer.appendChild(this.spacer);

        // Insert after the comment placeholder
        this.comment!.parentNode!.insertBefore(this.scrollContainer, this.comment!.nextSibling);

        // Native scroll listener — updates only the visible slice, no reactive cycle
        this.scrollContainer.addEventListener('scroll', this.onScroll, { passive: true });

        debugLog('virtualScroll', 'Mounted virtual scroll directive');
    }

    async update(value: unknown) {
        if (!value || typeof value !== 'object') {
            debugLog('virtualScroll', 'Invalid config', { value });
            return;
        }

        const cfg = value as VirtualScrollDirectiveConfig;

        // Validate required fields
        if (!Array.isArray(cfg.items) || typeof cfg.itemHeight !== 'number' ||
            typeof cfg.containerHeight !== 'number' || typeof cfg.render !== 'function') {
            debugLog('virtualScroll', 'Missing required config fields', { value });
            return;
        }

        this.config = cfg;

        // Apply container height
        if (this.scrollContainer) {
            this.scrollContainer.style.height = `${cfg.containerHeight}px`;
        }

        // Apply total height
        const totalHeight = cfg.items.length * cfg.itemHeight;
        if (this.spacer) {
            this.spacer.style.height = `${totalHeight}px`;
        }

        await this.renderSlice();
    }

    unmount() {
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }

        if (this.scrollContainer) {
            this.scrollContainer.removeEventListener('scroll', this.onScroll);
            this.scrollContainer.parentNode?.removeChild(this.scrollContainer);
        }

        this.clearChildren();
        this.scrollContainer = null;
        this.spacer = null;
        this.contentWrapper = null;
        this.config = null;
        super.unmount();
    }

    // ── Internal ─────────────────────────────────────────

    protected updateContent(_value: unknown): void {
        // Not used — we override update() directly
    }

    private onScroll = () => {
        if (!this.scrollContainer) return;

        const newTop = this.scrollContainer.scrollTop;
        if (newTop === this.scrollTop) return;
        this.scrollTop = newTop;

        // Coalesce with rAF to avoid layout thrashing
        if (this.rafId === null) {
            this.rafId = requestAnimationFrame(() => {
                this.rafId = null;
                this.renderSlice();
            });
        }
    };

    private async renderSlice(): Promise<void> {
        if (!this.config || !this.contentWrapper) return;

        const { items, itemHeight, containerHeight, render, overscan = 3 } = this.config;
        const totalCount = items.length;

        // Compute visible range
        const rawStart = Math.floor(this.scrollTop / itemHeight);
        const visibleCount = Math.ceil(containerHeight / itemHeight);
        const startIndex = Math.max(0, rawStart - overscan);
        const endIndex = Math.min(totalCount, rawStart + visibleCount + overscan);

        // Position the content wrapper
        this.contentWrapper.style.top = `${startIndex * itemHeight}px`;

        // Clear previous children
        this.clearChildren();

        // Render visible items
        const fragment = document.createDocumentFragment();

        for (let i = startIndex; i < endIndex; i++) {
            const result = render(items[i], i);

            if (result instanceof TemplateResult && this.processor) {
                const instance = await this.processor.createInstance(result, { item: items[i], index: i });
                this.childInstances.push(instance);
                fragment.appendChild(instance.getFragment());
            } else {
                fragment.appendChild(document.createTextNode(String(result)));
            }
        }

        this.contentWrapper.appendChild(fragment);

        debugLog('virtualScroll', 'Rendered slice', {
            startIndex,
            endIndex,
            total: totalCount,
            rendered: endIndex - startIndex,
        });
    }

    private clearChildren(): void {
        for (const instance of this.childInstances) {
            if (instance.disconnect) {
                instance.disconnect();
            }
        }
        this.childInstances = [];

        if (this.contentWrapper) {
            while (this.contentWrapper.firstChild) {
                this.contentWrapper.removeChild(this.contentWrapper.firstChild);
            }
        }
    }
}
