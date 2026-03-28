import { html, css } from '@miurajs/miura-element';
import { MuiBase } from '../base/mui-base.js';

type ButtonVariant = 'solid' | 'soft' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonTone = 'primary' | 'secondary' | 'neutral' | 'danger';

export class MuiButton extends MuiBase {
    static tagName = 'mui-button';

    static properties = {
        variant: { type: String, reflect: true },
        size: { type: String, reflect: true },
        tone: { type: String, reflect: true },
        loading: { type: Boolean, reflect: true },
        disabled: { type: Boolean, reflect: true },
        block: { type: Boolean, reflect: true },
    };

    declare variant: ButtonVariant;
    declare size: ButtonSize;
    declare tone: ButtonTone;
    declare loading: boolean;
    declare disabled: boolean;
    declare block: boolean;

    static styles = css`
        :host {
            --mui-button-bg: var(--mui-color-primary);
            --mui-button-fg: var(--mui-color-primary-foreground);
            --mui-button-border: transparent;
            --mui-button-radius: var(--mui-radius-md);
            --mui-button-shadow: var(--mui-shadow-soft);
            --mui-button-padding-y: calc(var(--mui-spacing-sm) * 0.8);
            --mui-button-padding-x: var(--mui-spacing-lg);
            --mui-button-gap: var(--mui-spacing-xs);
            display: inline-block;
            width: auto;
        }

        :host([block]) {
            width: 100%;
        }

        button {
            appearance: none;
            border: 1px solid var(--mui-button-border);
            border-radius: var(--mui-button-radius);
            padding: var(--mui-button-padding-y) var(--mui-button-padding-x);
            background: var(--mui-button-bg);
            color: var(--mui-button-fg);
            font-family: var(--mui-type-font-family);
            font-weight: var(--mui-type-font-weight-medium);
            font-size: var(--mui-type-font-size-md);
            line-height: var(--mui-type-line-height-normal);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: var(--mui-button-gap);
            width: 100%;
            cursor: pointer;
            transition: background var(--mui-motion-duration-normal) var(--mui-motion-easing-standard),
                color var(--mui-motion-duration-normal) var(--mui-motion-easing-standard),
                border-color var(--mui-motion-duration-normal) var(--mui-motion-easing-standard),
                transform var(--mui-motion-duration-fast) var(--mui-motion-easing-emphasized),
                box-shadow var(--mui-motion-duration-fast) var(--mui-motion-easing-standard);
            box-shadow: var(--mui-button-shadow);
        }

        button:focus-visible {
            outline: none;
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--mui-color-primary) 25%, transparent);
        }

        :host([disabled]) button,
        button:disabled {
            cursor: not-allowed;
            opacity: 0.6;
            box-shadow: none;
        }

        :host([loading]) button {
            cursor: progress;
        }

        :host([variant='soft']) {
            --mui-button-bg: color-mix(in srgb, var(--mui-color-primary) 15%, var(--mui-surface));
            --mui-button-fg: var(--mui-color-primary);
            --mui-button-border: color-mix(in srgb, var(--mui-color-primary) 30%, transparent);
        }

        :host([variant='outline']) {
            --mui-button-bg: transparent;
            --mui-button-fg: var(--mui-color-primary);
            --mui-button-border: color-mix(in srgb, var(--mui-color-primary) 45%, transparent);
            --mui-button-shadow: none;
        }

        :host([variant='ghost']) {
            --mui-button-bg: transparent;
            --mui-button-fg: var(--mui-color-primary);
            --mui-button-border: transparent;
            --mui-button-shadow: none;
        }

        :host([tone='secondary']) {
            --mui-button-bg: var(--mui-color-secondary);
            --mui-button-fg: var(--mui-color-secondary-foreground);
        }

        :host([tone='danger']) {
            --mui-button-bg: var(--mui-color-danger);
            --mui-button-fg: var(--mui-color-danger-foreground);
        }

        :host([tone='neutral']) {
            --mui-button-bg: var(--mui-color-neutral);
            --mui-button-fg: var(--mui-surface);
        }

        :host([size='sm']) {
            --mui-button-padding-y: var(--mui-spacing-xs);
            --mui-button-padding-x: var(--mui-spacing-md);
            --mui-button-gap: calc(var(--mui-spacing-xs) / 2);
        }

        :host([size='lg']) {
            --mui-button-padding-y: var(--mui-spacing-md);
            --mui-button-padding-x: calc(var(--mui-spacing-lg) * 1.2);
            font-size: var(--mui-type-font-size-lg);
        }

        .loader {
            width: 1rem;
            height: 1rem;
            border-radius: 999px;
            border: 2px solid color-mix(in srgb, currentColor 35%, transparent);
            border-top-color: currentColor;
            animation: spin var(--mui-motion-duration-slow) linear infinite;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }
    `;

    firstUpdated(): void {
        this.setRole('button');
        this.attachInternalsIfNeeded();
    }

    template() {
        const isDisabled = this.disabled || this.loading;
        return html`
            <button
                part="button"
                data-variant="${this.variant}"
                data-tone="${this.tone}"
                data-size="${this.size}"
                ?disabled=${isDisabled}
                aria-busy=${this.loading}
            >
                ${this.loading ? html`<span class="loader" aria-hidden="true"></span>` : null}
                <slot></slot>
            </button>
        `;
    }
}

export function registerMuiButton() {
    if (!customElements.get(MuiButton.tagName)) {
        customElements.define(MuiButton.tagName, MuiButton);
    }
}

registerMuiButton();