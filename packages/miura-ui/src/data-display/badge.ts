import { html, css } from '@miurajs/miura-element';
import { MuiBase } from '../base/mui-base.js';

type BadgeVariant = 'solid' | 'soft' | 'outline';
type BadgeTone = 'primary' | 'neutral' | 'success' | 'warning' | 'danger';
type BadgePlacement = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'inline';

export class MuiBadge extends MuiBase {
    static tagName = 'mui-badge';

    static properties = {
        value: { type: String },
        max: { type: Number },
        variant: { type: String, reflect: true },
        tone: { type: String, reflect: true },
        placement: { type: String, reflect: true },
        dot: { type: Boolean, reflect: true },
    };

    value = '';
    max = 99;
    variant: BadgeVariant = 'solid';
    tone: BadgeTone = 'primary';
    placement: BadgePlacement = 'top-right';
    dot = false;

    static styles = css`
        :host {
            display: inline-flex;
            position: relative;
        }

        .wrapper {
            display: inline-flex;
            position: relative;
        }

        .badge {
            position: absolute;
            min-width: 1.2rem;
            height: 1.2rem;
            border-radius: 999px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0 0.35rem;
            font-size: 0.7rem;
            font-weight: var(--mui-type-font-weight-semibold);
            background: var(--mui-badge-bg, var(--mui-color-primary));
            color: var(--mui-badge-fg, var(--mui-color-primary-foreground));
            box-shadow: var(--mui-shadow-soft);
            pointer-events: none;
            border: var(--mui-badge-border, none);
        }

        :host([placement='inline']) .badge {
            position: static;
            transform: none;
            margin-left: var(--mui-spacing-xs);
        }

        :host(:not([placement='inline'])) .badge {
            transform: translate(var(--mui-badge-translate-x, 50%), var(--mui-badge-translate-y, -50%));
        }

        :host([placement='top-right']) .badge {
            top: 0;
            right: 0;
            --mui-badge-translate-x: 50%;
            --mui-badge-translate-y: -50%;
        }

        :host([placement='top-left']) .badge {
            top: 0;
            left: 0;
            --mui-badge-translate-x: -50%;
            --mui-badge-translate-y: -50%;
        }

        :host([placement='bottom-right']) .badge {
            bottom: 0;
            right: 0;
            --mui-badge-translate-x: 50%;
            --mui-badge-translate-y: 50%;
        }

        :host([placement='bottom-left']) .badge {
            bottom: 0;
            left: 0;
            --mui-badge-translate-x: -50%;
            --mui-badge-translate-y: 50%;
        }

        :host([dot]) .badge {
            min-width: 0.5rem;
            height: 0.5rem;
            padding: 0;
        }

        :host([variant='soft']) {
            --mui-badge-bg: color-mix(in srgb, var(--mui-color-primary) 15%, var(--mui-surface));
            --mui-badge-fg: var(--mui-color-primary);
            --mui-badge-border: none;
        }

        :host([variant='outline']) {
            --mui-badge-bg: transparent;
            --mui-badge-fg: var(--mui-color-primary);
            --mui-badge-border: 1px solid color-mix(in srgb, var(--mui-color-primary) 40%, transparent);
        }

        :host([tone='neutral']) {
            --mui-badge-bg: var(--mui-color-neutral);
            --mui-badge-fg: var(--mui-surface);
        }

        :host([tone='success']) {
            --mui-badge-bg: var(--mui-color-success);
            --mui-badge-fg: var(--mui-surface);
        }

        :host([tone='warning']) {
            --mui-badge-bg: var(--mui-color-warning);
            --mui-badge-fg: var(--mui-color-text);
        }

        :host([tone='danger']) {
            --mui-badge-bg: var(--mui-color-danger);
            --mui-badge-fg: var(--mui-color-danger-foreground);
        }
    `;

    private get displayValue(): string | null {
        if (!this.value) return null;
        if (this.dot) return null;
        const numeric = Number(this.value);
        if (!Number.isNaN(numeric) && numeric > this.max) {
            return `${this.max}+`;
        }
        return this.value;
    }

    template() {
        const badgeContent = this.displayValue;
        const showBadge = this.dot || badgeContent;
        return html`
            <span class="wrapper" part="wrapper">
                <slot></slot>
                ${showBadge ? html`<span class="badge" part="badge" aria-label=${this.value}>${badgeContent}</span>` : null}
            </span>
        `;
    }
}

export function registerMuiBadge() {
    if (!customElements.get(MuiBadge.tagName)) {
        customElements.define(MuiBadge.tagName, MuiBadge);
    }
}

registerMuiBadge();
