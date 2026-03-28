import { html, css } from '@miurajs/miura-element';
import { MuiBase } from '../base/mui-base.js';

type IconButtonSize = 'sm' | 'md' | 'lg';
type IconButtonVariant = 'ghost' | 'soft' | 'outline';

export class MuiIconButton extends MuiBase {
    static tagName = 'mui-icon-button';

    static properties = {
        size: { type: String, reflect: true },
        variant: { type: String, reflect: true },
        disabled: { type: Boolean, reflect: true },
        label: { type: String },
    };

    declare size: IconButtonSize;
    declare variant: IconButtonVariant;
    declare disabled: boolean;
    declare label: string;

    static styles = css`
        :host {
            --mui-icon-button-size: 2.5rem;
            --mui-icon-button-radius: 999px;
            --mui-icon-button-bg: transparent;
            --mui-icon-button-fg: var(--mui-color-primary);
            --mui-icon-button-border: transparent;
            display: inline-flex;
        }

        button {
            width: var(--mui-icon-button-size);
            height: var(--mui-icon-button-size);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: var(--mui-icon-button-radius);
            border: 1px solid var(--mui-icon-button-border);
            background: var(--mui-icon-button-bg);
            color: var(--mui-icon-button-fg);
            cursor: pointer;
            transition: background var(--mui-motion-duration-fast) var(--mui-motion-easing-standard),
                color var(--mui-motion-duration-fast) var(--mui-motion-easing-standard),
                border-color var(--mui-motion-duration-fast) var(--mui-motion-easing-standard),
                transform var(--mui-motion-duration-fast) var(--mui-motion-easing-emphasized);
        }

        button:hover {
            transform: translateY(-1px);
        }

        button:focus-visible {
            outline: none;
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--mui-color-primary) 25%, transparent);
        }

        button:disabled,
        :host([disabled]) button {
            cursor: not-allowed;
            opacity: 0.6;
            transform: none;
        }

        ::slotted(mui-icon) {
            width: 1.1rem;
            height: 1.1rem;
        }

        :host([size='sm']) {
            --mui-icon-button-size: 2rem;
        }

        :host([size='lg']) {
            --mui-icon-button-size: 3rem;
        }

        :host([variant='soft']) {
            --mui-icon-button-bg: color-mix(in srgb, var(--mui-color-primary) 15%, var(--mui-surface));
            --mui-icon-button-border: color-mix(in srgb, var(--mui-color-primary) 20%, transparent);
        }

        :host([variant='outline']) {
            --mui-icon-button-border: color-mix(in srgb, var(--mui-color-primary) 35%, transparent);
        }
    `;

    firstUpdated(): void {
        this.setRole('button');
        this.attachInternalsIfNeeded();
    }

    template() {
        return html`
            <button
                part="button"
                ?disabled=${this.disabled}
                aria-label="${this.label || ''}"
                title="${this.label || ''}"
            >
                <slot></slot>
            </button>
        `;
    }
}

export function registerMuiIconButton() {
    if (!customElements.get(MuiIconButton.tagName)) {
        customElements.define(MuiIconButton.tagName, MuiIconButton);
    }
}

registerMuiIconButton();
