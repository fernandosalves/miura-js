import { MiuraElement, html, css } from '../../packages/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';
import { component } from '../../packages/miura-element';
import type { VirtualScrollDirectiveConfig } from '../../packages/miura-element';

interface DataRow {
    id: number;
    name: string;
    value: number;
}

function generateItems(count: number): DataRow[] {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        name: `Item ${i + 1}`,
        value: Math.round(Math.random() * 1000),
    }));
}

@component({ tag: 'virtual-scroll-demo' })
class VirtualScrollDemo extends MiuraElement {
    declare items: DataRow[];

    static properties = {
        items: { type: Array, default: [] as DataRow[] },
    };

    static get styles() {
        return css`
            :host { display: block; padding: 20px; font-family: system-ui, sans-serif; }
            .stats { margin-bottom: 12px; font-size: 14px; color: #6b7280; }
            .stats strong { color: #111827; }
            .row {
                display: flex; align-items: center; padding: 0 16px;
                height: 40px; box-sizing: border-box;
                border-bottom: 1px solid #f3f4f6; font-size: 14px;
            }
            .row:hover { background: #f9fafb; }
            .row .id { width: 60px; color: #9ca3af; }
            .row .name { flex: 1; font-weight: 500; }
            .row .val { width: 80px; text-align: right; font-variant-numeric: tabular-nums; }
            .header {
                display: flex; padding: 0 16px; height: 36px; align-items: center;
                background: #f9fafb; font-size: 12px; font-weight: 700;
                color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;
                border-bottom: 2px solid #e5e7eb;
            }
            .header .id { width: 60px; }
            .header .name { flex: 1; }
            .header .val { width: 80px; text-align: right; }
            .syntax { margin-top: 12px; padding: 12px; background: #1e1e2e; color: #cdd6f4; border-radius: 8px; font-family: monospace; font-size: 13px; white-space: pre; overflow-x: auto; }
        `;
    }

    onMount() {
        this.items = generateItems(10000);
    }

    template() {
        const vsConfig: VirtualScrollDirectiveConfig<DataRow> = {
            items: this.items,
            itemHeight: 40,
            containerHeight: 400,
            render: (item: DataRow, _i: number) => html`
                <div class="row">
                    <span class="id">#${item.id}</span>
                    <span class="name">${item.name}</span>
                    <span class="val">${item.value}</span>
                </div>
            `,
            overscan: 3,
        };

        return html`
            <div>
                <h3>Virtual Scrolling (10,000 items)</h3>
                <div class="stats">
                    <strong>${this.items.length.toLocaleString()}</strong> items — only visible rows are in the DOM
                </div>

                <div class="header">
                    <span class="id">ID</span>
                    <span class="name">Name</span>
                    <span class="val">Value</span>
                </div>

                <div #virtualScroll=${vsConfig}></div>

                <div class="syntax"><div #virtualScroll=\${{
  items: this.items,       // 10,000 items
  itemHeight: 40,
  containerHeight: 400,
  render: (item) => html\`...\`,
}}></div>

// The directive manages scroll, spacer, and visible slice</div>
            </div>
        `;
    }
}

export default {
    title: 'Miura/Directives/Structural/03. Virtual Scroll',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: `
The \`#virtualScroll\` structural directive renders only visible items
from a large list. It manages the scroll container, spacer, and
visible slice internally — no manual scroll listeners needed.

\`\`\`html
<div #virtualScroll=\${{
  items: this.items,
  itemHeight: 40,
  containerHeight: 400,
  render: (item) => html\`<div>\${item.name}</div>\`,
  overscan: 3,
}}></div>
\`\`\`

The lower-level \`computeVirtualSlice()\` function is also available
for custom implementations.
                `
            }
        }
    }
} as Meta;

export const VirtualScroll: StoryObj = {
    render: () => '<virtual-scroll-demo></virtual-scroll-demo>',
    name: 'Virtual Scroll (10k items)',
};
