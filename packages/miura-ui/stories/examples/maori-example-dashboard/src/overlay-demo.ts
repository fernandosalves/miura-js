import { MiuraElement, html, css } from '@miura/miura-element';
import { component } from '@miura/miura-element';

@component({ tag: 'overlay-demo' })
export class OverlayDemo extends MiuraElement {
  showDialog = false;
  showDrawer = false;
  showPopover = false;
  showToast = false;

  static get styles() {
    return css`
      .row { display: flex; gap: 1em; margin-bottom: 1em; }
    `;
  }

  template() {
    return html`
      <section>
        <h2>🪟 Overlay</h2>
        <div class="row">
          <mui-button @click=${() => { this.showDialog = true; this.requestUpdate(); }}>Open Dialog</mui-button>
          <mui-button @click=${() => { this.showDrawer = true; this.requestUpdate(); }}>Open Drawer</mui-button>
          <mui-button @click=${() => { this.showPopover = !this.showPopover; this.requestUpdate(); }}>Toggle Popover</mui-button>
          <mui-button id="tooltip-btn">Hover me</mui-button>
          <mui-button @click=${() => { this.showToast = true; this.requestUpdate(); }}>Show Toast</mui-button>
        </div>
        ${this.showDialog ? html`
          <mui-dialog open @close=${() => { this.showDialog = false; this.requestUpdate(); }}>
            <div>Dialog content</div>
            <mui-button @click=${() => { this.showDialog = false; this.requestUpdate(); }}>Close</mui-button>
          </mui-dialog>
        ` : ''}
        ${this.showDrawer ? html`
          <mui-drawer open position="left">
            <div>Drawer content</div>
            <mui-button @click=${() => { this.showDrawer = false; this.requestUpdate(); }}>Close</mui-button>
          </mui-drawer>
        ` : ''}
        ${this.showPopover ? html`
          <mui-popover open anchor="body">
            <div>Popover content</div>
            <mui-button @click=${() => { this.showPopover = false; this.requestUpdate(); }}>Close</mui-button>
          </mui-popover>
        ` : ''}
        <mui-tooltip for="#tooltip-btn">Tooltip content</mui-tooltip>
        ${this.showToast ? html`
          <mui-toast open @close=${() => { this.showToast = false; this.requestUpdate(); }}>Toast message</mui-toast>
        ` : ''}
      </section>
    `;
  }
} 