import { html, css } from '@miurajs/miura-element';
import { MuiBase } from '../base/mui-base.js';

type ChipVariant = 'solid' | 'soft' | 'outline';
type ChipTone = 'primary' | 'neutral' | 'success' | 'warning' | 'danger';
type ChipSize = 'sm' | 'md';

export class MuiChip extends MuiBase {
    static tagName = 'mui-chip';

    static properties = {
        removable: { type: Boolean, reflect: true },
        variant: { type: String, reflect: true },
        tone: { type: String, reflect: true },
        size: { type: String, reflect: true },
    };

    removable = false;
    variant: ChipVariant = 'soft';
    tone: ChipTone = 'neutral';
    size: ChipSize = 'md';

    static styles = css`
        :host {
            display: inline-flex;
        }

        .chip {
            display: inline-flex;
            align-items: center;
            gap: var(--mui-spacing-xs);
            border-radius: 999px;
            padding: var(--mui-chip-padding-y, 0.2rem) var(--mui-chip-padding-x, 0.65rem);
            font-size: var(--mui-chip-font-size, 0.85rem);
            font-weight: var(--mui-type-font-weight-medium);
            background: var(--mui-chip-bg, color-mix(in srgb, var(--mui-color-border) 15%, transparent));
            color: var(--mui-chip-fg, var(--mui-color-text));
            border: var(--mui-chip-border, none);
            box-shadow: var(--mui-chip-shadow, none);
        }

        :host([size='sm']) {
            --mui-chip-padding-y: 0.15rem;
            --mui-chip-padding-x: 0.5rem;
            --mui-chip-font-size: 0.75rem;
        }

        :host([size='md']) {
            --mui-chip-padding-y: 0.25rem;
            --mui-chip-padding-x: 0.75rem;
            --mui-chip-font-size: 0.85rem;
        }

        :host([variant='solid']) {
            --mui-chip-bg: var(--mui-color-primary);
            --mui-chip-fg: var(--mui-color-primary-foreground);
        }

        :host([variant='soft']) {
            --mui-chip-bg: color-mix(in srgb, var(--mui-color-primary) 12%, var(--mui-surface));
            --mui-chip-fg: var(--mui-color-primary);
        }

        :host([variant='outline']) {
            --mui-chip-bg: transparent;
            --mui-chip-fg: var(--mui-color-primary);
            --mui-chip-border: 1px solid color-mix(in srgb, var(--mui-color-primary) 35%, transparent);
        }

        :host([tone='neutral']) {
            --mui-chip-bg: color-mix(in srgb, var(--mui-color-border) 15%, transparent);
            --mui-chip-fg: var(--mui-color-text);
        }

        :host([tone='success']) {
            --mui-chip-bg: color-mix(in srgb, var(--mui-color-success) 15%, var(--mui-surface));
            --mui-chip-fg: var(--mui-color-success);
        }

        :host([tone='warning']) {
            --mui-chip-bg: color-mix(in srgb, var(--mui-color-warning) 25%, var(--mui-surface));
            --mui-chip-fg: var(--mui-color-warning);
        }

        :host([tone='danger']) {
            --mui-chip-bg: color-mix(in srgb, var(--mui-color-danger) 15%, var(--mui-surface));
            --mui-chip-fg: var(--mui-color-danger);
        }

        button {
            border: none;
            background: none;
            cursor: pointer;
            padding: 0;
            width: 1.1rem;
            height: 1.1rem;
            border-radius: 999px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: inherit;
            transition: background var(--mui-motion-duration-fast) var(--mui-motion-easing-standard);
        }

        button:hover {
            background: color-mix(in srgb, currentColor 10%, transparent);
        }
    `;

    private handleRemove = () => {
        this.emit('mui-chip-remove', {});
        this.remove();
    };

    template() {
        return html`
            <span class="chip" part="chip">
                <slot name="icon" part="icon"></slot>
                <slot></slot>
                ${this.removable
                ? html`<button type="button" part="remove" aria-label="Remove" @click=${this.handleRemove}>&times;</button>`
                : null}
            </span>
        `;
    }
}

export function registerMuiChip() {
    if (!customElements.get(MuiChip.tagName)) {
        customElements.define(MuiChip.tagName, MuiChip);
    }
}

registerMuiChip();
