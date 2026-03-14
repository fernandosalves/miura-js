import { html, css } from '@miura/miura-element';
import { MuiBase } from '../base/mui-base.js';

type ScrollPadding = 'none' | 'xs' | 'sm' | 'md' | 'lg';

export class MuiScrollArea extends MuiBase {
    static tagName = 'mui-scroll-area';

    static properties = {
        maxHeight: { type: String },
        shadow: { type: Boolean, reflect: true },
        radius: { type: String, reflect: true },
        padding: { type: String, reflect: true },
        hideScrollbar: { type: Boolean, reflect: true },
    };

    maxHeight = '320px';
    shadow = false;
    radius = 'md';
    padding: ScrollPadding = 'md';
    hideScrollbar = false;

    static styles = css`
        :host {
            display: block;
            width: 100%;
            max-height: var(--mui-scroll-area-height, 320px);
        }

        .area {
            overflow: auto;
            max-height: 100%;
            border-radius: var(--mui-scroll-area-radius, var(--mui-radius-md));
            background: var(--mui-scroll-area-background, var(--mui-surface));
            padding: var(--mui-scroll-area-padding, var(--mui-spacing-md));
            box-shadow: var(--mui-scroll-area-shadow, none);
            scrollbar-width: thin;
            scrollbar-color: color-mix(in srgb, var(--mui-color-border) 60%, transparent) transparent;
        }

        .area:focus-visible {
            outline: 2px solid color-mix(in srgb, var(--mui-color-primary) 40%, transparent);
            outline-offset: 2px;
        }

        .area::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }

        .area::-webkit-scrollbar-track {
            background: transparent;
        }

        .area::-webkit-scrollbar-thumb {
            background: color-mix(in srgb, var(--mui-color-border) 50%, transparent);
            border-radius: 999px;
        }

        :host([hideScrollbar]) .area {
            scrollbar-width: none;
        }

        :host([hideScrollbar]) .area::-webkit-scrollbar {
            display: none;
        }

        :host([shadow]) {
            --mui-scroll-area-shadow: var(--mui-shadow-soft);
        }

        :host([radius='sm']) {
            --mui-scroll-area-radius: var(--mui-radius-sm);
        }

        :host([radius='md']) {
            --mui-scroll-area-radius: var(--mui-radius-md);
        }

        :host([radius='lg']) {
            --mui-scroll-area-radius: var(--mui-radius-lg);
        }

        :host([padding='none']) {
            --mui-scroll-area-padding: 0;
        }

        :host([padding='xs']) {
            --mui-scroll-area-padding: var(--mui-spacing-xs);
        }

        :host([padding='sm']) {
            --mui-scroll-area-padding: var(--mui-spacing-sm);
        }

        :host([padding='md']) {
            --mui-scroll-area-padding: var(--mui-spacing-md);
        }

        :host([padding='lg']) {
            --mui-scroll-area-padding: var(--mui-spacing-lg);
        }
    `;

    updated(): void {
        this.style.setProperty('--mui-scroll-area-height', this.maxHeight);
    }

    template() {
        return html`<div class="area" part="area" tabindex="0"><slot></slot></div>`;
    }
}

export function registerMuiScrollArea() {
    if (!customElements.get(MuiScrollArea.tagName)) {
        customElements.define(MuiScrollArea.tagName, MuiScrollArea);
    }
}

registerMuiScrollArea();