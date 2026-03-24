import { MiuraElement, html, css } from '@miurajs/miura-element';

/**
 * <mui-tabs selected="0">
 *   <mui-tab slot="tab">Tab 1</mui-tab>
 *   <mui-tab slot="tab">Tab 2</mui-tab>
 *   <mui-tab-panel slot="panel">Panel 1</mui-tab-panel>
 *   <mui-tab-panel slot="panel">Panel 2</mui-tab-panel>
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
  }

  template() {
    const tabs = Array.from(this.querySelectorAll('mui-tab'));
    const panels = Array.from(this.querySelectorAll('mui-tab-panel'));
    return html`
      <div class="mui-tabs-list">
        ${tabs.map((tab, i) => html`
          <button class="mui-tab-btn${i === this.selected ? ' active' : ''}" @click=${() => this._onTabClick(i)}>${tab.textContent}</button>
        `)}
      </div>
      <div class="mui-tabs-panels">
        ${panels.map((panel, i) => html`
          <div style="display:${i === this.selected ? 'block' : 'none'}">${panel.innerHTML}</div>
        `)}
      </div>
    `;
  }

  styles = css`
    .mui-tabs-list {
      display: flex;
      gap: var(--mui-spacing-2);
      border-bottom: 1px solid #eee;
    }
    .mui-tab-btn {
      background: none;
      border: none;
      padding: var(--mui-spacing-2) var(--mui-spacing-3);
      cursor: pointer;
      font: inherit;
      border-bottom: 2px solid transparent;
      transition: border-color 0.2s;
    }
    .mui-tab-btn.active {
      border-bottom: 2px solid var(--mui-primary, #0078d4);
      color: var(--mui-primary, #0078d4);
    }
    .mui-tabs-panels {
      padding: var(--mui-spacing-3) 0;
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