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
        this._updateTabs();
        this.requestUpdate();
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
        this._updateTabs();
    }

    _updateTabs() {
        const tabs = this.querySelectorAll('[slot="tab"]');
        const panels = this.querySelectorAll('[slot="panel"]');

        tabs.forEach((tab, i) => {
            const tabEl = tab as HTMLElement;
            tabEl.classList.toggle('active', i === this.selected);
            tabEl.onclick = () => this._onTabClick(i);
        });

        panels.forEach((panel, i) => {
            const panelEl = panel as HTMLElement;
            panelEl.style.display = i === this.selected ? 'block' : 'none';
        });
    }

    styles = css`
    .mui-tabs-list {
      display: flex;
      gap: var(--mui-spacing-2);
      border-bottom: 1px solid #eee;
    }
    
    ::slotted([slot="tab"]) {
      background: none;
      border: none;
      padding: var(--mui-spacing-2) var(--mui-spacing-3);
      cursor: pointer;
      font: inherit;
      border-bottom: 2px solid transparent;
      transition: border-color 0.2s;
    }
    
    ::slotted([slot="tab"].active) {
      border-bottom-color: var(--mui-primary, #0078d4);
      color: var(--mui-primary, #0078d4);
    }
    
    .mui-tabs-panels {
      padding: var(--mui-spacing-3) 0;
    }
    
    ::slotted([slot="panel"]) {
      display: none;
    }
  `;
}
customElements.define('mui-tabs', MuiTabs);

export class MuiTab extends MiuraElement {
    template() {
        return html`<slot></slot>`;
    }
}
customElements.define('mui-tab', MuiTab);

export class MuiTabPanel extends MiuraElement {
    template() {
        return html`<slot></slot>`;
    }
}
customElements.define('mui-tab-panel', MuiTabPanel); 