import { html, css } from '@miurajs/miura-element';
import { MuiBase } from '../base/mui-base.js';

type InputSize = 'sm' | 'md' | 'lg';
type InputStatus = 'default' | 'success' | 'error';

export class MuiInput extends MuiBase {
    static tagName = 'mui-input';

    static properties = {
        value: { type: String },
        type: { type: String, reflect: true },
        placeholder: { type: String },
        size: { type: String, reflect: true },
        status: { type: String, reflect: true },
        disabled: { type: Boolean, reflect: true },
        readonly: { type: Boolean, reflect: true },
        required: { type: Boolean, reflect: true },
    };

    declare value: string;
    declare type: string;
    declare placeholder: string;
    declare size: InputSize;
    declare status: InputStatus;
    declare disabled: boolean;
    declare readonly: boolean;
    declare required: boolean;

    private handleInput = (event: Event) => {
        if (this.readonly || this.disabled) return;
        const target = event.target as HTMLInputElement;
        const nextValue = target.value;
        if (nextValue !== this.value) {
            this.value = nextValue;
            this.emit('mui-input', { value: nextValue });
        }
    };

    private handleChange = (event: Event) => {
        if (this.readonly || this.disabled) return;
        const target = event.target as HTMLInputElement;
        this.emit('mui-change', { value: target.value });
    };

    static styles = css`
        :host {
            --mui-input-bg: var(--mui-surface, #ffffff);
            --mui-input-border: var(--mui-color-border, rgba(15, 23, 42, 0.12));
            --mui-input-border-active: var(--mui-color-primary);
            --mui-input-border-error: var(--mui-color-danger);
            --mui-input-border-success: var(--mui-color-success);
            --mui-input-radius: var(--mui-radius-md);
            --mui-input-padding-y: var(--mui-spacing-xs);
            --mui-input-padding-x: var(--mui-spacing-md);
            --mui-input-height: 2.75rem;
            display: inline-block;
            width: 100%;
        }

        .wrapper {
            display: inline-flex;
            align-items: center;
            gap: var(--mui-spacing-xs);
            width: 100%;
            padding: 0 var(--mui-spacing-xs);
            border-radius: var(--mui-input-radius);
            border: 1px solid var(--mui-input-border);
            background: var(--mui-input-bg);
            height: var(--mui-input-height);
            transition: border-color var(--mui-motion-duration-normal) var(--mui-motion-easing-standard),
                box-shadow var(--mui-motion-duration-fast) var(--mui-motion-easing-standard),
                background var(--mui-motion-duration-normal) var(--mui-motion-easing-standard);
        }

        :host([status='error']) .wrapper {
            border-color: var(--mui-input-border-error);
            box-shadow: 0 0 0 2px color-mix(in srgb, var(--mui-color-danger) 20%, transparent);
        }

        :host([status='success']) .wrapper {
            border-color: var(--mui-input-border-success);
            box-shadow: 0 0 0 2px color-mix(in srgb, var(--mui-color-success) 20%, transparent);
        }

        :host([disabled]) .wrapper {
            opacity: 0.6;
            cursor: not-allowed;
        }

        :host([size='sm']) {
            --mui-input-height: 2.25rem;
            --mui-input-padding-y: calc(var(--mui-spacing-xs) * 0.75);
            --mui-input-padding-x: var(--mui-spacing-sm);
        }

        :host([size='lg']) {
            --mui-input-height: 3.25rem;
            --mui-input-padding-y: var(--mui-spacing-sm);
            --mui-input-padding-x: var(--mui-spacing-lg);
        }

        .slot {
            color: var(--mui-color-muted, #94a3b8);
            display: inline-flex;
            align-items: center;
            font-size: var(--mui-type-font-size-sm);
        }

        input {
            flex: 1;
            background: transparent;
            border: none;
            outline: none;
            color: var(--mui-color-text, #0f172a);
            font-family: var(--mui-type-font-family);
            font-size: var(--mui-type-font-size-md);
            line-height: var(--mui-type-line-height-normal);
            padding: var(--mui-input-padding-y) var(--mui-input-padding-x);
            min-width: 0;
        }

        input::placeholder {
            color: var(--mui-color-text-muted, #475569);
            opacity: 0.7;
        }

        input:focus {
            caret-color: var(--mui-input-border-active);
        }

        .wrapper:focus-within {
            border-color: var(--mui-input-border-active);
            box-shadow: 0 0 0 2px color-mix(in srgb, var(--mui-color-primary) 25%, transparent);
        }
    `;

    firstUpdated(): void {
        this.setRole('textbox');
        this.attachInternalsIfNeeded();
    }

    template() {
        const ariaInvalid = this.status === 'error';
        return html`
            <label class="wrapper" part="wrapper">
                <span class="slot" part="prefix"><slot name="prefix"></slot></span>
                <input
                    part="input"
                    .value=${this.value ?? ''}
                    type=${this.type}
                    placeholder=${this.placeholder}
                    ?disabled=${this.disabled}
                    ?readonly=${this.readonly}
                    ?required=${this.required}
                    aria-invalid=${ariaInvalid}
                    aria-readonly=${this.readonly}
                    aria-required=${this.required}
                    @input=${this.handleInput}
                    @change=${this.handleChange}
                />
                <span class="slot" part="suffix"><slot name="suffix"></slot></span>
            </label>
        `;
    }
}

export function registerMuiInput() {
    if (!customElements.get(MuiInput.tagName)) {
        customElements.define(MuiInput.tagName, MuiInput);
    }
}

registerMuiInput();