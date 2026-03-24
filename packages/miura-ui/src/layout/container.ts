import { html, css } from '@miurajs/miura-element';
import { MuiBase } from '../base/mui-base.js';

type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

const BREAKPOINTS: Record<Exclude<ContainerSize, 'full'>, string> = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
};

export class MuiContainer extends MuiBase {
    static tagName = 'mui-container';

    static properties = {
        maxWidth: { type: String, reflect: true },
        size: { type: String, reflect: true },
        gutters: { type: String, reflect: true },
        padded: { type: Boolean, reflect: true },
    };

    maxWidth = 'var(--mui-container-width)';
    size: ContainerSize = 'lg';
    gutters: ContainerSize = 'md';
    padded = true;

    static styles = css`
        :host {
            display: block;
            width: 100%;
            box-sizing: border-box;
            --mui-container-width: 100%;
            --mui-container-gutters: var(--mui-spacing-md);
        }

        :host([size='sm']) {
            --mui-container-width: min(100%, ${BREAKPOINTS.sm});
        }

        :host([size='md']) {
            --mui-container-width: min(100%, ${BREAKPOINTS.md});
        }

        :host([size='lg']) {
            --mui-container-width: min(100%, ${BREAKPOINTS.lg});
        }

        :host([size='xl']) {
            --mui-container-width: min(100%, ${BREAKPOINTS.xl});
        }

        :host([size='full']) {
            --mui-container-width: 100%;
        }

        :host([gutters='sm']) {
            --mui-container-gutters: var(--mui-spacing-sm);
        }

        :host([gutters='md']) {
            --mui-container-gutters: var(--mui-spacing-md);
        }

        :host([gutters='lg']) {
            --mui-container-gutters: var(--mui-spacing-lg);
        }

        :host([gutters='xl']) {
            --mui-container-gutters: var(--mui-spacing-xl);
        }

        .container {
            margin-left: auto;
            margin-right: auto;
            width: 100%;
            max-width: var(--mui-container-width);
            padding-left: var(--mui-container-gutters);
            padding-right: var(--mui-container-gutters);
            box-sizing: border-box;
        }

        :host(:not([padded])) .container {
            padding-left: 0;
            padding-right: 0;
        }
    `;

    template() {
        return html`<div class="container" part="container"><slot></slot></div>`;
    }
}

export function registerMuiContainer() {
    if (!customElements.get(MuiContainer.tagName)) {
        customElements.define(MuiContainer.tagName, MuiContainer);
    }
}

registerMuiContainer();