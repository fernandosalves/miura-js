import { MiuraElement, css, html } from '@miurajs/miura-element';
import type { ContextInfo, StoreInfo } from '../types.js';

export class MiuraArchitectDataBrowser extends MiuraElement {
  static properties = {
    stores: { type: Array, default: () => [] },
    contexts: { type: Array, default: () => [] },
  };

  declare stores: StoreInfo[];
  declare contexts: ContextInfo[];

  static styles = css`
    :host { display: block; padding: var(--mui-space-3); }
    .section { margin-bottom: var(--mui-space-4); }
    .title { font-size: var(--mui-text-xs); color: var(--mui-color-text-muted); margin-bottom: var(--mui-space-2); }
    .item {
      border: 1px solid var(--mui-color-border);
      border-radius: var(--mui-radius-md);
      padding: var(--mui-space-2) var(--mui-space-3);
      margin-bottom: var(--mui-space-2);
      background: var(--mui-color-surface);
      font-size: var(--mui-text-sm);
    }
  `;

  template() {
    return html`
      <section class="section">
        <div class="title">Stores</div>
        ${this.stores.map((store) => html`<div class="item">${store.key} (${Object.keys(store.state ?? {}).length} keys)</div>`)}
      </section>
      <section class="section">
        <div class="title">Contexts</div>
        ${this.contexts.map((context) => html`<div class="item">${context.key} (${context.consumerIds?.length ?? 0} consumers)</div>`)}
      </section>
    `;
  }
}

if (!customElements.get('miura-architect-data-browser')) {
  customElements.define('miura-architect-data-browser', MiuraArchitectDataBrowser);
}
