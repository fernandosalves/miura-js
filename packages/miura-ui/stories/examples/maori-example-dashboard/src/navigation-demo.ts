import { MiuraElement, html, css } from '@miurajs/miura-element';
import { component } from '@miurajs/miura-element';

@component({ tag: 'navigation-demo' })
export class NavigationDemo extends MiuraElement {
  tab = 0;
  menuOpen = false;
  menuSelection = 'Item 1';
  page = 1;
  breadcrumbs = ['Home', 'Section', 'Current'];

  static get styles() {
    return css`
      .row { display: flex; gap: 1em; margin-bottom: 1em; }
      .value { font-size: 0.95em; color: #888; }
    `;
  }

  template() {
    return html`
      <section>
        <h2>🧭 Navigation</h2>
        <mui-tabs .selected=${this.tab} @change=${(e: any) => { this.tab = e.detail; this.requestUpdate(); }}>
          <mui-tab slot="tab">Tab 1</mui-tab>
          <mui-tab slot="tab">Tab 2</mui-tab>
          <mui-tab-panel slot="panel">Panel 1</mui-tab-panel>
          <mui-tab-panel slot="panel">Panel 2</mui-tab-panel>
        </mui-tabs>
        <div class="row">
          <mui-menu .open=${this.menuOpen} @close=${() => { this.menuOpen = false; this.requestUpdate(); }}>
            <mui-menu-item @click=${() => { this.menuSelection = 'Item 1'; this.menuOpen = false; this.requestUpdate(); }}>Item 1</mui-menu-item>
            <mui-menu-item @click=${() => { this.menuSelection = 'Item 2'; this.menuOpen = false; this.requestUpdate(); }}>Item 2</mui-menu-item>
          </mui-menu>
          <mui-button @click=${() => { this.menuOpen = !this.menuOpen; this.requestUpdate(); }}>Toggle Menu</mui-button>
          <span class="value">Selected: ${this.menuSelection}</span>
        </div>
        <mui-breadcrumbs>
          ${this.breadcrumbs.map((crumb, i) => html`
            <mui-breadcrumb href="#" @click=${(e: Event) => { e.preventDefault(); this.breadcrumbs = this.breadcrumbs.slice(0, i + 1); this.requestUpdate(); }}>${crumb}</mui-breadcrumb>
          `)}
        </mui-breadcrumbs>
        <mui-pagination .page=${this.page} pagecount="5" @change=${(e: any) => { this.page = e.detail; this.requestUpdate(); }}></mui-pagination>
      </section>
    `;
  }
} 