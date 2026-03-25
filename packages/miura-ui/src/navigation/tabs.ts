import { MiuraElement, html, css } from '@miurajs/miura-element';

/**
 * <mui-tabs selected="0">
 *   <button slot="tab">Tab 1</button>
 *   <button slot="tab">Tab 2</button>
 *   <div slot="panel">Panel 1</div>
 *   <div slot="panel">Panel 2</div>
 * </mui-tabs>
 */
export class MuiTabs extends MiuraElement {
    static properties = {
        selected: { type: Number },
    };
    selected = 0;

    _onTabClick(idx: number) {
        this.selected = idx;
        this.requestUpdate();

        // Emit custom event for parent to listen
        this.dispatchEvent(new CustomEvent('tab-change', {
            detail: { selected: idx }
        }));
    }

    template() {
        return html`
      <div class="mui-tabs-list">
        <slot name="tab"></slot>
      </div>
      <div class="mui-tabs-panels">
        <slot name="panel"></slot>
      </div>
    `;
    }

    connectedCallback() {
        super.connectedCallback();
        this._setupTabs();
    }

    _setupTabs() {
        // Find all tab elements and set up click handlers
        const tabs = this.querySelectorAll('[slot="tab"]');
        const panels = this.querySelectorAll('[slot="panel"]');

        tabs.forEach((tab, i) => {
            const tabEl = tab as HTMLElement;
            tabEl.onclick = () => this._onTabClick(i);
            tabEl.classList.add('mui-tab-btn');
        });

        this._updatePanels();
    }

    updated() {
        this._updatePanels();
    }

    _updatePanels() {
        const panels = this.querySelectorAll('[slot="panel"]');
        panels.forEach((panel, i) => {
            const panelEl = panel as HTMLElement;
            panelEl.style.display = i === this.selected ? 'block' : 'none';
        });

        // Update active tab styling
        const tabs = this.querySelectorAll('[slot="tab"]');
        tabs.forEach((tab, i) => {
            const tabEl = tab as HTMLElement;
            tabEl.classList.toggle('active', i === this.selected);
        });
    }

    static styles = css`
    .mui-tabs-list {
      display: flex;
      gap: 0;
      border-bottom: 1px solid var(--color-border, #e2e8f0);
    }

    ::slotted([slot="tab"]) {
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      padding: 0.75rem 1rem;
      cursor: pointer;
      font: inherit;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text-muted, #64748b);
      transition: color 0.15s, border-color 0.15s;
      margin-bottom: -1px;
      outline: none;
    }

    ::slotted([slot="tab"].active) {
      border-bottom-color: var(--color-primary, #6366f1);
      color: var(--color-primary, #6366f1);
      font-weight: 600;
    }

    .mui-tabs-panels {
      padding: 0;
    }
  `;
}
customElements.define('mui-tabs', MuiTabs);
