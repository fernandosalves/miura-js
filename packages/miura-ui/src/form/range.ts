import { html, css } from '@miura/miura-element';
import { MuiBase } from '../base/mui-base.js';

type RangeVariant = 'solid' | 'minimal';

export class MuiRange extends MuiBase {
    static tagName = 'mui-range';

    static properties = {
        value: { type: Number },
        min: { type: Number },
        max: { type: Number },
        step: { type: Number },
        variant: { type: String, reflect: true },
        disabled: { type: Boolean, reflect: true },
        name: { type: String },
        showValue: { type: Boolean, reflect: true },
    };

    value = 0;
    min = 0;
    max = 100;
    step = 1;
    variant: RangeVariant = 'solid';
    disabled = false;
    name = '';
    showValue = false;

    private handleInput = (event: Event) => {
        const nextValue = Number((event.target as HTMLInputElement).value);
        if (!Number.isNaN(nextValue)) {
            this.value = nextValue;
            this.emit('mui-input', { value: this.value, name: this.name });
        }
    };

    private handleChange = () => {
        this.emit('mui-change', { value: this.value, name: this.name });
    };

    static styles = css`
        :host {
            display: inline-flex;
            flex-direction: column;
            gap: var(--mui-spacing-xs);
            width: 100%;
            font-family: var(--mui-type-font-family);
        }

        .track {
            position: relative;
            width: 100%;
        }

        input[type='range'] {
            -webkit-appearance: none;
            width: 100%;
            height: 0.4rem;
            border-radius: 999px;
            background: var(--mui-range-track, color-mix(in srgb, var(--mui-color-border) 35%, transparent));
            outline: none;
            cursor: pointer;
        }

        input[type='range']::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 1.2rem;
            height: 1.2rem;
            border-radius: 999px;
            background: var(--mui-range-thumb, var(--mui-color-primary));
            border: 2px solid var(--mui-surface, #fff);
            box-shadow: 0 2px 6px rgba(15, 23, 42, 0.25);
            transition: transform var(--mui-motion-duration-fast) var(--mui-motion-easing-standard);
        }

        input[type='range']::-moz-range-thumb {
            width: 1.2rem;
            height: 1.2rem;
            border-radius: 999px;
            background: var(--mui-range-thumb, var(--mui-color-primary));
            border: 2px solid var(--mui-surface, #fff);
            box-shadow: 0 2px 6px rgba(15, 23, 42, 0.25);
            transition: transform var(--mui-motion-duration-fast) var(--mui-motion-easing-standard);
        }

        input[type='range']:active::-webkit-slider-thumb,
        input[type='range']:active::-moz-range-thumb {
            transform: scale(1.05);
        }

        :host([variant='minimal']) input[type='range'] {
            height: 0.2rem;
            background: color-mix(in srgb, var(--mui-color-border) 20%, transparent);
        }

        :host([disabled]) {
            opacity: 0.6;
            pointer-events: none;
        }

        .value-badge {
            align-self: flex-end;
            padding: 0.1rem 0.4rem;
            border-radius: var(--mui-radius-pill);
            background: color-mix(in srgb, var(--mui-color-primary) 15%, var(--mui-surface));
            color: var(--mui-color-primary);
            font-size: var(--mui-type-font-size-sm);
            font-weight: var(--mui-type-font-weight-medium);
        }
    `;

    template() {
        return html`
            <div class="track" part="track">
                <input
                    part="input"
                    type="range"
                    .value=${String(this.value)}
                    .min=${String(this.min)}
                    .max=${String(this.max)}
                    .step=${String(this.step)}
                    name=${this.name}
                    ?disabled=${this.disabled}
                    @input=${this.handleInput}
                    @change=${this.handleChange}
                />
            </div>
            ${this.showValue ? html`<span class="value-badge" part="value">${this.value}</span>` : null}
        `;
    }
}

export function registerMuiRange() {
    if (!customElements.get(MuiRange.tagName)) {
        customElements.define(MuiRange.tagName, MuiRange);
    }
}

registerMuiRange();
