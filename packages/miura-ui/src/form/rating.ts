import { html, css } from '@miura/miura-element';
import { MuiBase } from '../base/mui-base.js';

type RatingSize = 'sm' | 'md' | 'lg';

export class MuiRating extends MuiBase {
    static tagName = 'mui-rating';

    static properties = {
        value: { type: Number },
        max: { type: Number },
        readonly: { type: Boolean, reflect: true },
        disabled: { type: Boolean, reflect: true },
        name: { type: String },
        allowHalf: { type: Boolean, reflect: true },
        size: { type: String, reflect: true },
    };

    value = 0;
    max = 5;
    readonly = false;
    disabled = false;
    name = '';
    allowHalf = false;
    size: RatingSize = 'md';

    private handleClick(index: number, isHalf = false): void {
        if (this.disabled || this.readonly) return;
        const nextValue = isHalf ? index + 0.5 : index + 1;
        this.value = nextValue;
        this.emit('mui-change', { value: this.value, name: this.name });
    }

    private handleKeydown = (event: KeyboardEvent): void => {
        if (this.disabled || this.readonly) return;
        const increment = this.allowHalf ? 0.5 : 1;
        if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
            event.preventDefault();
            this.value = Math.min(this.max, Math.round((this.value + increment) / increment) * increment);
            this.emit('mui-change', { value: this.value, name: this.name });
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
            event.preventDefault();
            this.value = Math.max(0, Math.round((this.value - increment) / increment) * increment);
            this.emit('mui-change', { value: this.value, name: this.name });
        }
    };

    private getSegments(): number[] {
        return Array.from({ length: this.max }, (_, index) => index);
    }

    private segmentState(index: number): 'full' | 'half' | 'empty' {
        const current = index + 1;
        if (this.value >= current) return 'full';
        if (this.allowHalf && this.value >= current - 0.5) return 'half';
        return 'empty';
    }

    static styles = css`
        :host {
            display: inline-flex;
            align-items: center;
            gap: var(--mui-spacing-xs);
            font-family: var(--mui-type-font-family);
            color: var(--mui-color-text, #0f172a);
        }

        :host([disabled]) {
            opacity: 0.6;
            pointer-events: none;
        }

        .stars {
            display: inline-flex;
            gap: calc(var(--mui-spacing-xs) / 2);
        }

        button {
            appearance: none;
            border: none;
            background: transparent;
            padding: 0;
            cursor: pointer;
            line-height: 0;
        }

        .star {
            width: var(--mui-rating-size, 1.5rem);
            height: var(--mui-rating-size, 1.5rem);
            fill: none;
            stroke: color-mix(in srgb, var(--mui-color-border) 60%, transparent);
            stroke-width: 1.5;
        }

        :host([size='sm']) {
            --mui-rating-size: 1.2rem;
        }

        :host([size='lg']) {
            --mui-rating-size: 1.8rem;
        }

        .star[data-state='full'] {
            fill: var(--mui-color-warning, #fbbf24);
            stroke: var(--mui-color-warning, #fbbf24);
        }

        .star[data-state='half'] {
            stroke: var(--mui-color-warning, #fbbf24);
        }

        .star[data-state='half'] path {
            fill: url(#half-gradient);
        }

        :host([readonly]) button {
            cursor: default;
        }
    `;

    template() {
        const segments = this.getSegments();
        return html`
            <div class="stars" role="radiogroup" @keydown=${this.handleKeydown}>
                <defs>
                    <linearGradient id="half-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="50%" stop-color="var(--mui-color-warning, #fbbf24)"></stop>
                        <stop offset="50%" stop-color="transparent"></stop>
                    </linearGradient>
                </defs>
                ${segments.map((index) => {
            const state = this.segmentState(index);
            const fullClick = () => this.handleClick(index, false);
            const halfClick = () => this.handleClick(index, true);
            return html`
                        <button
                            type="button"
                            part="star"
                            data-index=${index}
                            aria-checked=${state !== 'empty'}
                            role="radio"
                            tabindex=${index === 0 ? 0 : -1}
                            @click=${fullClick}
                        >
                            <svg class="star" data-state=${state} viewBox="0 0 24 24" aria-hidden="true">
                                <path
                                    d="M12 2.5l2.6 5.5 6.1.9-4.4 4.3 1 6-5.3-2.8-5.3 2.8 1-6-4.4-4.3 6.1-.9z"
                                ></path>
                            </svg>
                            ${this.allowHalf
                    ? html`<span class="half" part="half" @click=${halfClick}></span>`
                    : null}
                        </button>
                    `;
        })}
            </div>
        `;
    }
}

export function registerMuiRating() {
    if (!customElements.get(MuiRating.tagName)) {
        customElements.define(MuiRating.tagName, MuiRating);
    }
}

registerMuiRating();
