import { html, css } from '@miurajs/miura-element';
import { MuiBase } from '../base/mui-base.js';

/**
 * Tokenized table wrapper supporting sticky headers and zebra rows.
 */
export class MuiTable extends MuiBase {
    static tagName = 'mui-table';

    static properties = {
        density: { type: String, reflect: true },
        zebra: { type: Boolean, reflect: true },
        hoverable: { type: Boolean, reflect: true },
        stickyHeader: { type: Boolean, reflect: true },
    };

    density: 'comfortable' | 'compact' = 'comfortable';
    zebra = false;
    hoverable = false;
    stickyHeader = false;

    static styles = css`
        :host {
            display: block;
        }

        .wrapper {
            width: 100%;
            overflow-x: auto;
            border-radius: var(--mui-radius-lg);
            box-shadow: var(--mui-shadow-soft);
            background: var(--mui-surface);
            border: 1px solid color-mix(in srgb, var(--mui-color-border) 60%, transparent);
        }

        ::slotted(table) {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.95rem;
        }

        ::slotted(th), ::slotted(td) {
            padding: var(--mui-table-cell-y, 0.85rem) var(--mui-table-cell-x, 1rem);
            border-bottom: 1px solid color-mix(in srgb, var(--mui-color-border) 65%, transparent);
            text-align: left;
        }

        :host([density='compact']) ::slotted(th),
        :host([density='compact']) ::slotted(td) {
            --mui-table-cell-y: 0.55rem;
        }

        ::slotted(th) {
            background: color-mix(in srgb, var(--mui-color-border) 10%, transparent);
            font-weight: var(--mui-type-font-weight-semibold);
        }

        :host([stickyHeader]) ::slotted(th) {
            position: sticky;
            top: 0;
            z-index: 1;
            background: var(--mui-surface);
        }

        :host([zebra]) ::slotted(tbody tr:nth-child(even)) {
            background: color-mix(in srgb, var(--mui-color-border) 7%, transparent);
        }

        :host([hoverable]) ::slotted(tbody tr:hover) {
            background: color-mix(in srgb, var(--mui-color-primary) 5%, transparent);
        }
    `;

    template() {
        return html`<div class="wrapper" part="wrapper"><slot></slot></div>`;
    }
}

export function registerMuiTable() {
    if (!customElements.get(MuiTable.tagName)) {
        customElements.define(MuiTable.tagName, MuiTable);
    }
}

registerMuiTable();