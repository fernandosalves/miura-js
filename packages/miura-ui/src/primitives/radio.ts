import { html, css } from '@miura/miura-element';
import { MuiBase } from '../base/mui-base.js';

type RadioSize = 'sm' | 'md' | 'lg';

export class MuiRadio extends MuiBase {
    static tagName = 'mui-radio';

    static properties = {
        checked: { type: Boolean, reflect: true },
        disabled: { type: Boolean, reflect: true },
        readonly: { type: Boolean, reflect: true },
        value: { type: String },
        name: { type: String },
        required: { type: Boolean, reflect: true },
        size: { type: String, reflect: true },
    };

    checked = false;
    disabled = false;
    readonly = false;
    value = '';
    name = '';
    required = false;
    size: RadioSize = 'md';

    private handleChange = (event: Event) => {
        if (this.readonly) {
            event.preventDefault();
            return;
        }
        const input = event.target as HTMLInputElement;
        this.checked = input.checked;
        this.emit('mui-change', { checked: this.checked, value: this.value });
    };

    static styles = css`
        :host {
            --mui-radio-size: 1.125rem;
            --mui-radio-border: var(--mui-color-border, rgba(15, 23, 42, 0.18));
            --mui-radio-border-active: var(--mui-color-primary);
            --mui-radio-dot: var(--mui-color-primary-foreground, #ffffff);
            display: inline-flex;
            align-items: center;
            gap: var(--mui-spacing-xs);
            cursor: pointer;
            font-family: var(--mui-type-font-family);
            font-size: var(--mui-type-font-size-md);
            line-height: var(--mui-type-line-height-normal);
        }

        :host([size='sm']) {
            --mui-radio-size: 1rem;
            font-size: var(--mui-type-font-size-sm);
        }

        :host([size='lg']) {
            --mui-radio-size: 1.25rem;
            font-size: var(--mui-type-font-size-lg);
        }

        :host([disabled]) {
            opacity: 0.6;
            cursor: not-allowed;
        }

        label {
            display: inline-flex;
            align-items: center;
            gap: var(--mui-spacing-xs);
        }

        .outer {
            width: var(--mui-radio-size);
            height: var(--mui-radio-size);
            border-radius: 999px;
            border: 1.5px solid var(--mui-radio-border);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: border-color var(--mui-motion-duration-fast) var(--mui-motion-easing-standard),
                box-shadow var(--mui-motion-duration-fast) var(--mui-motion-easing-standard);
            position: relative;
        }

        input {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            cursor: inherit;
            margin: 0;
        }

        :host([checked]) .outer {
            border-color: var(--mui-radio-border-active);
            box-shadow: 0 0 0 2px color-mix(in srgb, var(--mui-color-primary) 20%, transparent);
        }

        .dot {
            width: calc(var(--mui-radio-size) * 0.45);
            height: calc(var(--mui-radio-size) * 0.45);
            border-radius: 999px;
            background: var(--mui-radio-border-active);
            transform: scale(0);
            transition: transform var(--mui-motion-duration-fast) var(--mui-motion-easing-emphasized),
                background var(--mui-motion-duration-fast) var(--mui-motion-easing-standard);
        }

        :host([checked]) .dot {
            transform: scale(1);
        }
    `;

    template() {
        return html`
            <label part="label">
                <span class="outer" part="outer">
                    <span class="dot" part="dot"></span>
                    <input
                        type="radio"
                        .checked=${this.checked}
                        .value=${this.value}
                        name=${this.name}
                        ?disabled=${this.disabled}
                        ?readonly=${this.readonly}
                        ?required=${this.required}
                        @change=${this.handleChange}
                    />
                </span>
                <span part="text"><slot></slot></span>
            </label>
        `;
    }
}

export function registerMuiRadio() {
    if (!customElements.get(MuiRadio.tagName)) {
        customElements.define(MuiRadio.tagName, MuiRadio);
    }
}

registerMuiRadio();