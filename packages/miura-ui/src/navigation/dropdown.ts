import { html, css } from '@miura/miura-element';
import { MuiBase } from '../base/mui-base.js';

type DropdownPlacement = 'start' | 'end';

export class MuiDropdown extends MuiBase {
    static tagName = 'mui-dropdown';

    static properties = {
        open: { type: Boolean, reflect: true },
        placement: { type: String, reflect: true },
    };

    open = false;
    placement: DropdownPlacement = 'start';

    static styles = css`
        :host {
            position: relative;
            display: inline-block;
        }

        .menu {
            position: absolute;
            top: calc(100% + 0.25rem);
            left: 0;
            min-width: 180px;
            background: var(--mui-surface);
            border-radius: var(--mui-radius-lg);
            box-shadow: var(--mui-shadow-medium);
            padding: var(--mui-spacing-sm) 0;
            display: none;
        }

        :host([placement='end']) .menu {
            right: 0;
            left: auto;
        }

        :host([open]) .menu {
            display: block;
        }
    `;

    connectedCallback(): void {
        super.connectedCallback?.();
        document.addEventListener('click', this.handleDocumentClick, true);
    }

    disconnectedCallback(): void {
        super.disconnectedCallback?.();
        document.removeEventListener('click', this.handleDocumentClick, true);
    }

    private toggle = (event: Event) => {
        event.stopPropagation();
        this.open = !this.open;
        this.emit('mui-dropdown-toggle', { open: this.open });
    };

    private handleDocumentClick = (event: Event) => {
        if (!this.open) return;
        if (!this.contains(event.target as Node)) {
            this.open = false;
            this.emit('mui-dropdown-toggle', { open: this.open });
        }
    };

    private handleKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && this.open) {
            this.open = false;
            event.stopPropagation();
        }
    };

    template() {
        return html`
            <span class="trigger" part="trigger" @click=${this.toggle} @keydown=${this.handleKeydown}>
                <slot name="trigger"></slot>
            </span>
            <div class="menu" part="menu" role="menu" @keydown=${this.handleKeydown}>
                <slot name="menu"></slot>
            </div>
        `;
    }
}

export function registerMuiDropdown() {
    if (!customElements.get(MuiDropdown.tagName)) {
        customElements.define(MuiDropdown.tagName, MuiDropdown);
    }
}

registerMuiDropdown();
