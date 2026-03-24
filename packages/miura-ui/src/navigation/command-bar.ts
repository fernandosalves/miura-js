import { html, css } from '@miurajs/miura-element';
import { MuiBase } from '../base/mui-base.js';

type CommandBarVariant = 'surface' | 'transparent';
type CommandBarDensity = 'compact' | 'comfortable';

/**
 * Tokenized command bar with variant and density options.
 */
export class MuiCommandBar extends MuiBase {
    static tagName = 'mui-command-bar';

    static properties = {
        variant: { type: String, reflect: true },
        density: { type: String, reflect: true },
    };

    variant: CommandBarVariant = 'surface';
    density: CommandBarDensity = 'comfortable';

    static styles = css`
        :host {
            display: flex;
            align-items: center;
            gap: var(--mui-spacing-sm);
            padding: var(--mui-cb-padding-y, var(--mui-spacing-md)) var(--mui-cb-padding-x, var(--mui-spacing-lg));
            border-radius: var(--mui-radius-lg);
            background: var(--mui-cb-bg, var(--mui-surface));
            border: 1px solid var(--mui-cb-border, color-mix(in srgb, var(--mui-color-border) 60%, transparent));
        }

        :host([variant='transparent']) {
            --mui-cb-bg: transparent;
            --mui-cb-border: transparent;
        }

        :host([density='compact']) {
            --mui-cb-padding-y: var(--mui-spacing-sm);
            --mui-cb-padding-x: var(--mui-spacing-md);
        }

        :host([density='comfortable']) {
            --mui-cb-padding-y: var(--mui-spacing-md);
            --mui-cb-padding-x: var(--mui-spacing-lg);
        }

        ::slotted(*) {
            flex-shrink: 0;
        }

        ::slotted([slot='spacer']) {
            flex-grow: 1;
        }
    `;

    template() {
        return html`
            <div part="bar">
                <slot></slot>
                <slot name="spacer"></slot>
                <slot name="actions"></slot>
            </div>
        `;
    }
}

export function registerMuiCommandBar() {
    if (!customElements.get(MuiCommandBar.tagName)) {
        customElements.define(MuiCommandBar.tagName, MuiCommandBar);
    }
}

registerMuiCommandBar(); 