import { html } from '@miurajs/miura-element';
import { MuiBase } from '../base/mui-base.js';

/**
 * Teleports slotted content into a different DOM target (default: body).
 * Example: <mui-portal target="#modals"><my-dialog></my-dialog></mui-portal>
 */
export class MuiLayoutPortal extends MuiBase {
    static tagName = 'mui-portal';

    static properties = {
        target: { type: String },
        inheritClass: { type: Boolean, reflect: true },
    };

    target = 'body';
    inheritClass = false;

    private slotElement?: HTMLSlotElement;
    private portalRoot: HTMLDivElement | null = null;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback(): void {
        super.connectedCallback?.();
        this.renderRoot();
    }

    disconnectedCallback(): void {
        super.disconnectedCallback?.();
        this.teardownPortal();
    }

    private renderRoot(): void {
        if (!this.shadowRoot) return;
        this.shadowRoot.innerHTML = '<slot></slot>';
        this.slotElement = this.shadowRoot.querySelector('slot') ?? undefined;
        this.slotElement?.addEventListener('slotchange', this.handleSlotChange);
        this.setupPortal();
    }

    private setupPortal(): void {
        const targetEl = document.querySelector(this.target) ?? document.body;
        if (!targetEl) return;
        if (!this.portalRoot) {
            this.portalRoot = document.createElement('div');
            if (this.inheritClass) {
                this.portalRoot.className = this.className;
            }
        }
        targetEl.appendChild(this.portalRoot);
        this.moveNodesToPortal();
    }

    private teardownPortal(): void {
        if (!this.portalRoot) return;
        const nodes = Array.from(this.portalRoot.childNodes);
        nodes.forEach((node) => this.appendChild(node));
        this.portalRoot.remove();
        this.portalRoot = null;
        this.slotElement?.removeEventListener('slotchange', this.handleSlotChange);
    }

    private moveNodesToPortal(): void {
        if (!this.portalRoot || !this.slotElement) return;
        const assigned = this.slotElement.assignedNodes({ flatten: true });
        assigned.forEach((node) => this.portalRoot?.appendChild(node));
    }

    private handleSlotChange = () => {
        this.moveNodesToPortal();
    };

    template() {
        return html``;
    }
}

export function registerMuiPortal() {
    if (!customElements.get(MuiLayoutPortal.tagName)) {
        customElements.define(MuiLayoutPortal.tagName, MuiLayoutPortal);
    }
}

registerMuiPortal();