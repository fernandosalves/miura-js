import { html, css } from '@miurajs/miura-element';
import { MuiBase } from '../base/mui-base.js';

type ResizeAxis = 'both' | 'x' | 'y';

export class MuiResizable extends MuiBase {
    static tagName = 'mui-resizable';

    static properties = {
        axis: { type: String, reflect: true },
        minWidth: { type: String },
        minHeight: { type: String },
        maxWidth: { type: String },
        maxHeight: { type: String },
        padding: { type: String, reflect: true },
    };

    axis: ResizeAxis = 'both';
    minWidth = '80px';
    minHeight = '60px';
    maxWidth = '100%';
    maxHeight = '100%';
    padding = 'md';

    static styles = css`
        :host {
            display: inline-block;
            position: relative;
            max-width: var(--mui-resize-max-width, 100%);
            max-height: var(--mui-resize-max-height, 100%);
        }

        .resizable {
            resize: both;
            overflow: auto;
            min-width: var(--mui-resize-min-width, 60px);
            min-height: var(--mui-resize-min-height, 40px);
            border: 1px solid color-mix(in srgb, var(--mui-color-border) 60%, transparent);
            border-radius: var(--mui-radius-md);
            background: var(--mui-surface);
            padding: var(--mui-resize-padding, var(--mui-spacing-md));
            box-shadow: var(--mui-shadow-soft);
            box-sizing: border-box;
        }

        :host([axis='x']) .resizable {
            resize: horizontal;
        }

        :host([axis='y']) .resizable {
            resize: vertical;
        }

        :host([padding='sm']) {
            --mui-resize-padding: var(--mui-spacing-sm);
        }

        :host([padding='lg']) {
            --mui-resize-padding: var(--mui-spacing-lg);
        }

        .grip {
            position: absolute;
            width: 12px;
            height: 12px;
            right: 4px;
            bottom: 4px;
            background: color-mix(in srgb, var(--mui-color-border) 60%, transparent);
            border-radius: 2px;
            pointer-events: none;
        }
    `;

    updated(): void {
        this.style.setProperty('--mui-resize-min-width', this.minWidth);
        this.style.setProperty('--mui-resize-min-height', this.minHeight);
        this.style.setProperty('--mui-resize-max-width', this.maxWidth);
        this.style.setProperty('--mui-resize-max-height', this.maxHeight);
    }

    template() {
        return html`
            <div class="resizable" part="resizable">
                <slot></slot>
                <span class="grip" aria-hidden="true"></span>
            </div>
        `;
    }
}

export function registerMuiResizable() {
    if (!customElements.get(MuiResizable.tagName)) {
        customElements.define(MuiResizable.tagName, MuiResizable);
    }
}

registerMuiResizable();