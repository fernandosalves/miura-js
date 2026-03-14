import { html, css } from '@miura/miura-element';
import { MuiBase } from '../base/mui-base.js';

type BoxPadding = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type BoxRadius = 'none' | 'sm' | 'md' | 'lg' | 'pill';
type BoxElevation = 'none' | 'soft' | 'medium' | 'strong';

export class MuiBox extends MuiBase {
    static tagName = 'mui-box';

    static properties = {
        padding: { type: String, reflect: true },
        margin: { type: String, reflect: true },
        radius: { type: String, reflect: true },
        elevation: { type: String, reflect: true },
        background: { type: String, reflect: true },
        border: { type: String },
        width: { type: String },
        height: { type: String },
    };

    padding: BoxPadding = 'md';
    margin: BoxPadding = 'none';
    radius: BoxRadius = 'md';
    elevation: BoxElevation = 'none';
    background = 'surface';
    border = '';
    width = 'auto';
    height = 'auto';

    static styles = css`
        :host {
            display: block;
            box-sizing: border-box;
            background: var(--mui-box-background, var(--mui-surface));
            border-radius: var(--mui-box-radius, var(--mui-radius-md));
            padding: var(--mui-box-padding, var(--mui-spacing-md));
            margin: var(--mui-box-margin, 0);
            width: var(--mui-box-width, auto);
            height: var(--mui-box-height, auto);
            border: var(--mui-box-border, none);
            box-shadow: var(--mui-box-shadow, none);
            color: inherit;
        }

        :host([padding='none']) {
            --mui-box-padding: 0;
        }

        :host([padding='xs']) {
            --mui-box-padding: var(--mui-spacing-xs);
        }

        :host([padding='sm']) {
            --mui-box-padding: var(--mui-spacing-sm);
        }

        :host([padding='md']) {
            --mui-box-padding: var(--mui-spacing-md);
        }

        :host([padding='lg']) {
            --mui-box-padding: var(--mui-spacing-lg);
        }

        :host([padding='xl']) {
            --mui-box-padding: var(--mui-spacing-xl);
        }

        :host([margin='none']) {
            --mui-box-margin: 0;
        }

        :host([margin='xs']) {
            --mui-box-margin: var(--mui-spacing-xs);
        }

        :host([margin='sm']) {
            --mui-box-margin: var(--mui-spacing-sm);
        }

        :host([margin='md']) {
            --mui-box-margin: var(--mui-spacing-md);
        }

        :host([margin='lg']) {
            --mui-box-margin: var(--mui-spacing-lg);
        }

        :host([margin='xl']) {
            --mui-box-margin: var(--mui-spacing-xl);
        }

        :host([radius='none']) {
            --mui-box-radius: 0;
        }

        :host([radius='sm']) {
            --mui-box-radius: var(--mui-radius-sm);
        }

        :host([radius='md']) {
            --mui-box-radius: var(--mui-radius-md);
        }

        :host([radius='lg']) {
            --mui-box-radius: var(--mui-radius-lg);
        }

        :host([radius='pill']) {
            --mui-box-radius: var(--mui-radius-pill);
        }

        :host([elevation='soft']) {
            --mui-box-shadow: var(--mui-shadow-soft);
        }

        :host([elevation='medium']) {
            --mui-box-shadow: var(--mui-shadow-medium);
        }

        :host([elevation='strong']) {
            --mui-box-shadow: var(--mui-shadow-strong);
        }

        :host([background='surface']) {
            --mui-box-background: var(--mui-surface);
        }

        :host([background='surface-alt']) {
            --mui-box-background: var(--mui-surface-alt);
        }

        :host([background='primary']) {
            --mui-box-background: var(--mui-color-primary);
            color: var(--mui-color-primary-foreground);
        }
    `;

    updated(): void {
        if (this.border) {
            this.style.setProperty('--mui-box-border', this.border);
        }
        if (this.width) {
            this.style.setProperty('--mui-box-width', this.width);
        }
        if (this.height) {
            this.style.setProperty('--mui-box-height', this.height);
        }
    }

    template() {
        return html`<slot></slot>`;
    }
}

export function registerMuiBox() {
    if (!customElements.get(MuiBox.tagName)) {
        customElements.define(MuiBox.tagName, MuiBox);
    }
}

registerMuiBox();