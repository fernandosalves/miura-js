import { html, css } from '@miura/miura-element';
import { MuiBase } from '../base/mui-base.js';

type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

/**
 * Tokenized tooltip with placement, delay, and hover/focus triggers.
 */
export class MuiTooltip extends MuiBase {
    static tagName = 'mui-tooltip';

    static properties = {
        for: { type: String },
        open: { type: Boolean, reflect: true },
        placement: { type: String, reflect: true },
        delay: { type: Number },
    };

    for = '';
    open = false;
    placement: TooltipPlacement = 'top';
    delay = 300;

    private anchor: Element | null = null;
    private showTimer: number | null = null;
    private hideTimer: number | null = null;

    static styles = css`
        :host {
            position: absolute;
            pointer-events: none;
            z-index: 1100;
        }

        .content {
            background: var(--mui-color-neutral-900, #1e293b);
            color: var(--mui-color-neutral-100, #f1f5f9);
            border-radius: var(--mui-radius-md);
            padding: var(--mui-spacing-xs) var(--mui-spacing-sm);
            font-size: var(--mui-type-font-size-sm);
            line-height: 1.4;
            max-width: 200px;
            word-wrap: break-word;
            opacity: 0;
            transform: scale(0.95);
            transition: opacity 0.15s ease, transform 0.15s ease;
        }

        :host([open]) .content {
            opacity: 1;
            transform: scale(1);
        }

        .arrow {
            position: absolute;
            width: 0;
            height: 0;
            border: 5px solid transparent;
        }

        .arrow.top {
            border-top-color: var(--mui-color-neutral-900, #1e293b);
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
        }

        .arrow.bottom {
            border-bottom-color: var(--mui-color-neutral-900, #1e293b);
            top: -10px;
            left: 50%;
            transform: translateX(-50%);
        }

        .arrow.left {
            border-left-color: var(--mui-color-neutral-900, #1e293b);
            right: -10px;
            top: 50%;
            transform: translateY(-50%);
        }

        .arrow.right {
            border-right-color: var(--mui-color-neutral-900, #1e293b);
            left: -10px;
            top: 50%;
            transform: translateY(-50%);
        }
    `;

    connectedCallback(): void {
        super.connectedCallback?.();
        this.attachListeners();
    }

    disconnectedCallback(): void {
        super.disconnectedCallback?.();
        this.detachListeners();
        this.clearTimers();
    }

    private attachListeners(): void {
        if (!this.for) return;
        this.anchor = document.querySelector(this.for);
        if (!this.anchor) return;
        this.anchor.addEventListener('mouseenter', this.handleMouseEnter);
        this.anchor.addEventListener('mouseleave', this.handleMouseLeave);
        this.anchor.addEventListener('focus', this.handleFocus);
        this.anchor.addEventListener('blur', this.handleBlur);
    }

    private detachListeners(): void {
        if (!this.anchor) return;
        this.anchor.removeEventListener('mouseenter', this.handleMouseEnter);
        this.anchor.removeEventListener('mouseleave', this.handleMouseLeave);
        this.anchor.removeEventListener('focus', this.handleFocus);
        this.anchor.removeEventListener('blur', this.handleBlur);
        this.anchor = null;
    }

    private clearTimers(): void {
        if (this.showTimer !== null) {
            clearTimeout(this.showTimer);
            this.showTimer = null;
        }
        if (this.hideTimer !== null) {
            clearTimeout(this.hideTimer);
            this.hideTimer = null;
        }
    }

    private scheduleShow = (): void => {
        this.clearTimers();
        this.showTimer = window.setTimeout(() => {
            this.open = true;
            this.updatePosition();
        }, this.delay);
    };

    private scheduleHide = (): void => {
        this.clearTimers();
        this.hideTimer = window.setTimeout(() => {
            this.open = false;
        }, 50);
    };

    private handleMouseEnter = this.scheduleShow;
    private handleMouseLeave = this.scheduleHide;
    private handleFocus = this.scheduleShow;
    private handleBlur = this.scheduleHide;

    private updatePosition(): void {
        if (!this.anchor) return;

        const anchorRect = this.anchor.getBoundingClientRect();
        const contentEl = this.shadowRoot?.querySelector('.content') as HTMLElement;
        if (!contentEl) return;

        const contentRect = contentEl.getBoundingClientRect();
        const gap = 8;

        let top = 0;
        let left = 0;

        switch (this.placement) {
            case 'top':
                top = anchorRect.top - contentRect.height - gap;
                left = anchorRect.left + (anchorRect.width - contentRect.width) / 2;
                break;
            case 'bottom':
                top = anchorRect.bottom + gap;
                left = anchorRect.left + (anchorRect.width - contentRect.width) / 2;
                break;
            case 'left':
                top = anchorRect.top + (anchorRect.height - contentRect.height) / 2;
                left = anchorRect.left - contentRect.width - gap;
                break;
            case 'right':
                top = anchorRect.top + (anchorRect.height - contentRect.height) / 2;
                left = anchorRect.right + gap;
                break;
        }

        this.style.top = `${top + window.scrollY}px`;
        this.style.left = `${left + window.scrollX}px`;
    }

    template() {
        return html`
            <div class="content" part="content">
                <slot></slot>
                <div class="arrow ${this.placement}" part="arrow"></div>
            </div>
        `;
    }
}

export function registerMuiTooltip() {
    if (!customElements.get(MuiTooltip.tagName)) {
        customElements.define(MuiTooltip.tagName, MuiTooltip);
    }
}

registerMuiTooltip(); 