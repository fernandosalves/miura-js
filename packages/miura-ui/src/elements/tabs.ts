import { MiuraElement, css, html } from '@miurajs/miura-element';

export interface TabItem {
  id: string;
  label: string;
  disabled?: boolean;
}

export class MuiTabs extends MiuraElement {
  static properties = {
    items: { type: Array, default: () => [] },
    active: { type: String, default: '' },
  };

  declare items: TabItem[];
  declare active: string;

  static styles = css`
    :host {
      display: block;
      font-family: var(--mui-font-sans);
      color: var(--mui-color-text);
    }

    .list {
      display: flex;
      align-items: center;
      gap: var(--mui-space-2);
      border-bottom: 1px solid var(--mui-color-border);
    }

    button {
      min-height: var(--mui-control-height-md);
      padding: 0 var(--mui-space-4);
      border: 0;
      border-bottom: 2px solid transparent;
      background: transparent;
      color: var(--mui-color-text-muted);
      cursor: pointer;
      font: inherit;
      font-size: var(--mui-text-md);
      font-weight: var(--mui-weight-medium);
    }

    button:hover {
      color: var(--mui-color-text);
      background: var(--mui-color-surface-hover);
    }

    button.active {
      color: var(--mui-color-accent);
      border-bottom-color: var(--mui-color-accent);
    }

    button:focus-visible {
      outline: none;
      box-shadow: var(--mui-focus-ring);
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.45;
    }

    .panel {
      padding: var(--mui-space-5) 0 0;
    }
  `;

  private select(item: TabItem): void {
    if (item.disabled) return;
    this.active = item.id;
    this.emit('change', { active: this.active, item }, { bubbles: true, composed: true });
  }

  private onKeydown(event: KeyboardEvent): void {
    const items = (this.items ?? []).filter((item) => !item.disabled);
    if (items.length === 0) return;
    const currentIndex = Math.max(0, items.findIndex((item) => item.id === this.active));
    let nextIndex = currentIndex;

    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % items.length;
    if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + items.length) % items.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = items.length - 1;
    if (nextIndex === currentIndex && !['Home', 'End'].includes(event.key)) return;

    event.preventDefault();
    this.select(items[nextIndex]);
  }

  template() {
    const items = this.items ?? [];
    const active = this.active || items.find((item) => !item.disabled)?.id || '';

    if (active !== this.active) {
      this.active = active;
    }

    return html`
      <div class="list" part="list" role="tablist" @keydown=${(event: KeyboardEvent) => this.onKeydown(event)}>
        ${items.map((item) => html`
          <button
            part="tab"
            role="tab"
            class=${item.id === this.active ? 'active' : ''}
            aria-selected=${item.id === this.active ? 'true' : 'false'}
            tabindex=${item.id === this.active ? '0' : '-1'}
            ?disabled=${Boolean(item.disabled)}
            @click=${() => this.select(item)}
          >${item.label}</button>
        `)}
      </div>
      <div class="panel" part="panel" role="tabpanel">
        <slot></slot>
      </div>
    `;
  }
}

if (!customElements.get('mui-tabs')) {
  customElements.define('mui-tabs', MuiTabs);
}
