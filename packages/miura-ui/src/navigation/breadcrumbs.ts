import { html, css } from '@miura/miura-element';
import { MuiBase } from '../base/mui-base.js';

export class MuiBreadcrumbs extends MuiBase {
    static tagName = 'mui-breadcrumbs';

    static properties = {
        separator: { type: String },
    };

    separator = '/';
    private renderedItems: Array<{ content: unknown }> = [];

    static styles = css`
        :host {
            display: block;
        }

        nav {
            display: flex;
            align-items: center;
            gap: var(--mui-spacing-xs);
            font-size: 0.9rem;
            color: var(--mui-color-text-muted, #475569);
        }

        .sep {
            user-select: none;
        }
    `;

    private handleSlotChange = () => {
        const items = Array.from(this.querySelectorAll('mui-breadcrumb')) as MuiBreadcrumb[];
        this.renderedItems = items.map((item) => ({ content: item.renderLabel() }));
        this.requestUpdate();
    };

    template() {
        return html`
            <slot hidden @slotchange=${this.handleSlotChange}></slot>
            <nav aria-label="Breadcrumb">
                ${this.renderedItems.map((item, index) => html`
                    ${index > 0 ? html`<span class="sep">${this.separator}</span>` : null}
                    <span part="item">${item.content}</span>
                `)}
            </nav>
        `;
    }
}

export class MuiBreadcrumb extends MuiBase {
    static tagName = 'mui-breadcrumb';

    static properties = {
        href: { type: String },
    };

    href = '';

    renderLabel() {
        return this.href
            ? html`<a href=${this.href} part="link"><slot></slot></a>`
            : html`<span part="current" aria-current="page"><slot></slot></span>`;
    }

    template() {
        return html`<slot @slotchange=${() => this.dispatchEvent(new Event('slotchange'))}></slot>`;
    }
}

export function registerMuiBreadcrumbs() {
    if (!customElements.get(MuiBreadcrumbs.tagName)) {
        customElements.define(MuiBreadcrumbs.tagName, MuiBreadcrumbs);
    }
    if (!customElements.get(MuiBreadcrumb.tagName)) {
        customElements.define(MuiBreadcrumb.tagName, MuiBreadcrumb);
    }
}

registerMuiBreadcrumbs();
