import { MiuraElement, css, html } from '@miurajs/miura-element';

export interface SegmentedControlItem {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
}

export class MuiSegmentedControl extends MiuraElement {
  static properties = {
    items: { type: Array, default: () => [] },
    value: { type: String, default: '' },
    size: { type: String, default: 'md', reflect: true },
  };

  declare items: SegmentedControlItem[];
  declare value: string;
  declare size: 'sm' | 'md';

  static styles = css`
    :host {
      display: inline-flex;
      font-family: var(--mui-font-sans);
      color: var(--mui-color-text);
    }

    .control {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      padding: 2px;
      border: 1px solid var(--mui-color-border);
      border-radius: var(--mui-radius-md);
      background: var(--mui-color-surface-muted);
    }

    button {
      min-height: calc(var(--mui-control-height-md) - 6px);
      padding: 0 var(--mui-space-4);
      border: 0;
      border-radius: var(--mui-radius-sm);
      background: transparent;
      color: var(--mui-color-text-muted);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--mui-space-2);
      font: inherit;
      font-size: var(--mui-text-sm);
      font-weight: var(--mui-weight-medium);
      transition: background var(--mui-duration-fast), color var(--mui-duration-fast), box-shadow var(--mui-duration-fast);
    }

    :host([size="sm"]) button {
      min-height: calc(var(--mui-control-height-sm) - 4px);
      padding-inline: var(--mui-space-3);
      font-size: var(--mui-text-xs);
    }

    button:hover {
      color: var(--mui-color-text);
      background: var(--mui-color-surface-hover);
    }

    button[aria-pressed="true"] {
      background: var(--mui-color-surface);
      color: var(--mui-color-text);
      box-shadow: var(--mui-shadow-sm);
    }

    button:focus-visible {
      outline: none;
      box-shadow: var(--mui-focus-ring);
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.48;
    }
  `;

  private select(item: SegmentedControlItem): void {
    if (item.disabled) return;
    this.value = item.id;
    this.emit('change', { value: this.value, item }, { bubbles: true, composed: true });
  }

  private onKeydown(event: KeyboardEvent): void {
    const items = (this.items ?? []).filter((item) => !item.disabled);
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key) || items.length === 0) return;
    event.preventDefault();

    const currentIndex = Math.max(0, items.findIndex((item) => item.id === this.value));
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? items.length - 1
        : event.key === 'ArrowRight'
          ? (currentIndex + 1) % items.length
          : (currentIndex - 1 + items.length) % items.length;

    this.select(items[nextIndex]);
  }

  template() {
    const items = this.items ?? [];
    const value = this.value || items.find((item) => !item.disabled)?.id || '';
    if (value !== this.value) this.value = value;

    return html`
      <div class="control" part="control" role="group" @keydown=${(event: KeyboardEvent) => this.onKeydown(event)}>
        ${items.map((item) => html`
          <button
            part="item"
            type="button"
            aria-pressed=${item.id === this.value ? 'true' : 'false'}
            tabindex=${item.id === this.value ? '0' : '-1'}
            ?disabled=${Boolean(item.disabled)}
            @click=${() => this.select(item)}
          >
            ${item.icon ? html`<mui-icon name=${item.icon}></mui-icon>` : ''}
            <span>${item.label}</span>
          </button>
        `)}
      </div>
    `;
  }
}

if (!customElements.get('mui-segmented-control')) {
  customElements.define('mui-segmented-control', MuiSegmentedControl);
}
