import { html, css } from '@miura/miura-element';
import { MuiBase } from '../base/mui-base.js';

type SpacerSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export class MuiSpacer extends MuiBase {
    static tagName = 'mui-spacer';

    static properties = {
        size: { type: String, reflect: true },
        orientation: { type: String, reflect: true },
        flex: { type: Boolean, reflect: true },
        inline: { type: Boolean, reflect: true },
    };

    size: SpacerSize = 'md';
    orientation: 'horizontal' | 'vertical' = 'horizontal';
    flex = false;
    inline = false;

    static styles = css`
        :host {
            display: block;
            width: var(--mui-spacer-width, 0);
            height: var(--mui-spacer-height, var(--mui-spacing-md));
            flex: var(--mui-spacer-flex, 0 0 auto);
            min-width: 1px;
            min-height: 1px;
        }

        :host([inline]) {
            display: inline-block;
        }

        :host([orientation='horizontal']) {
            --mui-spacer-width: var(--mui-spacer-size, var(--mui-spacing-md));
            --mui-spacer-height: 1px;
        }

        :host([orientation='vertical']) {
            --mui-spacer-width: 1px;
            --mui-spacer-height: var(--mui-spacer-size, var(--mui-spacing-md));
        }

        :host([flex]) {
            --mui-spacer-flex: 1;
        }

        :host([size='none']) {
            --mui-spacer-size: 0;
        }

        :host([size='xs']) {
            --mui-spacer-size: var(--mui-spacing-xs);
        }

        :host([size='sm']) {
            --mui-spacer-size: var(--mui-spacing-sm);
        }

        :host([size='md']) {
            --mui-spacer-size: var(--mui-spacing-md);
        }

        :host([size='lg']) {
            --mui-spacer-size: var(--mui-spacing-lg);
        }

        :host([size='xl']) {
            --mui-spacer-size: var(--mui-spacing-xl);
        }

        :host([size='2xl']) {
            --mui-spacer-size: calc(var(--mui-spacing-xl) * 1.5);
        }
    `;

    template() {
        return html``;
    }
}

export function registerMuiSpacer() {
    if (!customElements.get(MuiSpacer.tagName)) {
        customElements.define(MuiSpacer.tagName, MuiSpacer);
    }
}

registerMuiSpacer();