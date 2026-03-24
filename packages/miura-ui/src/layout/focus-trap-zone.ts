import { html, css } from '@miurajs/miura-element';
import { MuiBase } from '../base/mui-base.js';

export class MuiFocusTrapZone extends MuiBase {
    static tagName = 'mui-focus-trap-zone';

    static properties = {
        active: { type: Boolean, reflect: true },
        returnFocus: { type: Boolean, reflect: true },
    };

    active = true;
    returnFocus = true;

    private lastFocused: HTMLElement | null = null;
    private firstSentinel?: HTMLSpanElement;
    private lastSentinel?: HTMLSpanElement;

    connectedCallback(): void {
        super.connectedCallback?.();
        if (this.returnFocus) {
            this.lastFocused = document.activeElement as HTMLElement;
        }
    }

    disconnectedCallback(): void {
        super.disconnectedCallback?.();
        if (this.returnFocus && this.lastFocused) {
            this.lastFocused.focus();
        }
    }

    firstUpdated(): void {
        this.firstSentinel = this.shadowRoot?.querySelector('[data-focus="start"]') as HTMLSpanElement;
        this.lastSentinel = this.shadowRoot?.querySelector('[data-focus="end"]') as HTMLSpanElement;
        this.firstSentinel?.addEventListener('focus', this.handleFirstFocus);
        this.lastSentinel?.addEventListener('focus', this.handleLastFocus);
    }

    updated(changed: Map<PropertyKey, unknown>): void {
        if (changed.has('active') && this.active) {
            this.focusFirstElement();
        }
    }

    private getFocusableElements(): HTMLElement[] {
        const nodes = this.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        return Array.from(nodes).filter((el) => !el.hasAttribute('inert'));
    }

    private focusFirstElement(): void {
        const focusables = this.getFocusableElements();
        if (focusables.length > 0) {
            focusables[0].focus();
        } else {
            (this.shadowRoot?.querySelector('.trap') as HTMLElement)?.focus();
        }
    }

    private handleFirstFocus = () => {
        if (!this.active) return;
        const focusables = this.getFocusableElements();
        const last = focusables[focusables.length - 1];
        (last ?? this.shadowRoot?.querySelector('.trap') as HTMLElement)?.focus();
    };

    private handleLastFocus = () => {
        if (!this.active) return;
        const focusables = this.getFocusableElements();
        const first = focusables[0];
        (first ?? this.shadowRoot?.querySelector('.trap') as HTMLElement)?.focus();
    };

    static styles = css`
        :host {
            display: block;
        }

        .trap {
            outline: 2px dashed color-mix(in srgb, var(--mui-color-primary) 35%, transparent);
            border-radius: var(--mui-radius-md);
            padding: var(--mui-spacing-md);
            background: color-mix(in srgb, var(--mui-surface) 95%, transparent);
        }

        [data-focus] {
            position: absolute;
            width: 1px;
            height: 1px;
            overflow: hidden;
            clip: rect(1px, 1px, 1px, 1px);
        }
    `;

    template() {
        return html`
            <span tabindex="0" data-focus="start" aria-hidden="true"></span>
            <div class="trap" part="trap" tabindex="-1"><slot></slot></div>
            <span tabindex="0" data-focus="end" aria-hidden="true"></span>
        `;
    }
}

export function registerMuiFocusTrapZone() {
    if (!customElements.get(MuiFocusTrapZone.tagName)) {
        customElements.define(MuiFocusTrapZone.tagName, MuiFocusTrapZone);
    }
}

registerMuiFocusTrapZone();