import { html, css } from '@miura/miura-element';
import { MuiBase } from '../base/mui-base.js';

type CheckboxSize = 'sm' | 'md' | 'lg';

export class MuiCheckbox extends MuiBase {
    static tagName = 'mui-checkbox';

    static properties = {
        checked: { type: Boolean, reflect: true },
        disabled: { type: Boolean, reflect: true },
        readonly: { type: Boolean, reflect: true },
        indeterminate: { type: Boolean, reflect: true },
        value: { type: String },
        name: { type: String },
        required: { type: Boolean, reflect: true },
        size: { type: String, reflect: true },
    };

    checked = false;
    disabled = false;
    readonly = false;
    indeterminate = false;
    value = 'on';
    name = '';
    required = false;
    size: CheckboxSize = 'md';

    private handleChange = (event: Event) => {
        if (this.readonly) {
            event.preventDefault();
            return;
        }
        const input = event.target as HTMLInputElement;
        this.checked = input.checked;
        this.indeterminate = input.indeterminate;
        this.emit('mui-change', { checked: this.checked, value: this.value });
    };

    static styles = css`
        :host {
            --mui-checkbox-size: 1.125rem;
            --mui-checkbox-border: var(--mui-color-border, rgba(15, 23, 42, 0.18));
            --mui-checkbox-border-active: var(--mui-color-primary);
            --mui-checkbox-bg: var(--mui-surface, #ffffff);
            --mui-checkbox-check: var(--mui-color-primary-foreground, #ffffff);
            display: inline-flex;
            align-items: center;
            gap: var(--mui-spacing-xs);
            cursor: pointer;
            font-family: var(--mui-type-font-family);
            font-size: var(--mui-type-font-size-md);
            line-height: var(--mui-type-line-height-normal);
            user-select: none;
        }

        :host([size='sm']) {
            --mui-checkbox-size: 1rem;
            font-size: var(--mui-type-font-size-sm);
        }

        :host([size='lg']) {
            --mui-checkbox-size: 1.25rem;
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

        .box {
            width: var(--mui-checkbox-size);
            height: var(--mui-checkbox-size);
            border-radius: var(--mui-radius-sm);
            border: 1.5px solid var(--mui-checkbox-border);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: var(--mui-checkbox-bg);
            transition: border-color var(--mui-motion-duration-fast) var(--mui-motion-easing-standard),
                background var(--mui-motion-duration-fast) var(--mui-motion-easing-standard),
                box-shadow var(--mui-motion-duration-fast) var(--mui-motion-easing-standard);
            position: relative;
        }

        input {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            margin: 0;
            cursor: inherit;
        }

        :host([checked]) .box {
            background: var(--mui-checkbox-border-active);
            border-color: var(--mui-checkbox-border-active);
            box-shadow: 0 0 0 2px color-mix(in srgb, var(--mui-color-primary) 20%, transparent);
        }

        :host([indeterminate]) .box {
            background: var(--mui-checkbox-border-active);
            border-color: var(--mui-checkbox-border-active);
        }

        .checkmark,
        .indeterminate {
            width: calc(var(--mui-checkbox-size) * 0.5);
            height: calc(var(--mui-checkbox-size) * 0.5);
            stroke: var(--mui-checkbox-check);
            stroke-width: 2px;
            stroke-linecap: round;
            stroke-linejoin: round;
            transform-origin: center;
        }

        .checkmark {
            opacity: 0;
        }

        :host([checked]) .checkmark {
            opacity: 1;
        }

        .indeterminate {
            opacity: 0;
        }

        :host([indeterminate]) .indeterminate {
            opacity: 1;
        }
    `;

    template() {
        return html`
            <label part="label">
                <span class="box" part="box">
                    <svg class="checkmark" viewBox="0 0 24 24" aria-hidden="true">
                        <polyline points="4 12 9 17 20 6"></polyline>
                    </svg>
                    <svg class="indeterminate" viewBox="0 0 24 24" aria-hidden="true">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    <input
                        type="checkbox"
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

export function registerMuiCheckbox() {
    if (!customElements.get(MuiCheckbox.tagName)) {
        customElements.define(MuiCheckbox.tagName, MuiCheckbox);
    }
}

registerMuiCheckbox();