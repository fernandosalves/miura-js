import { html, css } from '@miurajs/miura-element';
import { MuiBase } from '../base/mui-base.js';

type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export class MuiGrid extends MuiBase {
    static tagName = 'mui-grid';

    static properties = {
        columns: { type: Number },
        minWidth: { type: String },
        gap: { type: String, reflect: true },
        columnGap: { type: String },
        rowGap: { type: String },
        autoFit: { type: Boolean, reflect: true },
    };

    columns = 2;
    minWidth = '240px';
    gap: GridGap = 'md';
    columnGap: GridGap | null = null;
    rowGap: GridGap | null = null;
    autoFit = false;

    static styles = css`
        :host {
            display: block;
            width: 100%;
            box-sizing: border-box;
            --mui-grid-gap: var(--mui-spacing-md);
        }

        :host([gap='none']) {
            --mui-grid-gap: 0;
        }

        :host([gap='xs']) {
            --mui-grid-gap: var(--mui-spacing-xs);
        }

        :host([gap='sm']) {
            --mui-grid-gap: var(--mui-spacing-sm);
        }

        :host([gap='md']) {
            --mui-grid-gap: var(--mui-spacing-md);
        }

        :host([gap='lg']) {
            --mui-grid-gap: var(--mui-spacing-lg);
        }

        :host([gap='xl']) {
            --mui-grid-gap: var(--mui-spacing-xl);
        }

        .grid {
            display: grid;
            width: 100%;
            gap: var(--mui-grid-gap);
        }
    `;

    updated(): void {
        const grid = this.shadowRoot?.querySelector('.grid') as HTMLDivElement | null;
        if (!grid) return;
        const template = this.autoFit
            ? `repeat(auto-fit, minmax(${this.minWidth}, 1fr))`
            : `repeat(${this.columns}, minmax(${this.minWidth}, 1fr))`;
        grid.style.gridTemplateColumns = template;

        if (this.columnGap) {
            grid.style.columnGap = `var(--mui-spacing-${this.columnGap})`;
        } else {
            grid.style.columnGap = '';
        }

        if (this.rowGap) {
            grid.style.rowGap = `var(--mui-spacing-${this.rowGap})`;
        } else {
            grid.style.rowGap = '';
        }
    }

    template() {
        return html`<div class="grid" part="grid"><slot></slot></div>`;
    }
}

export function registerMuiGrid() {
    if (!customElements.get(MuiGrid.tagName)) {
        customElements.define(MuiGrid.tagName, MuiGrid);
    }
}

registerMuiGrid();