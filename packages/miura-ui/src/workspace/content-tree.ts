import { MiuraElement, css, html } from '@miurajs/miura-element';
import '../elements/icon.js';

export interface ContentTreeItem {
  id: string;
  label: string;
  icon?: string;
  children?: ContentTreeItem[];
  disabled?: boolean;
}

export class MuiContentTree extends MiuraElement {
  static properties = {
    items: { type: Array, default: () => [] },
    active: { type: String, default: '' },
    expanded: { type: Array, default: () => [] },
    label: { type: String, default: 'Content tree' },
  };

  declare items: ContentTreeItem[];
  declare active: string;
  declare expanded: string[];
  declare label: string;

  static styles = css`
    :host {
      display: block;
      font-family: var(--mui-font-sans);
      color: var(--mui-color-text);
    }

    .tree {
      display: grid;
      gap: var(--mui-space-1);
    }

    .row {
      min-height: 32px;
      display: grid;
      grid-template-columns: 24px minmax(0, 1fr);
      align-items: center;
      gap: var(--mui-space-2);
      border: 1px solid transparent;
      border-radius: var(--mui-radius-md);
      background: transparent;
      color: var(--mui-color-text-muted);
      padding: 0 var(--mui-space-3);
      font: inherit;
      font-size: var(--mui-text-md);
      text-align: left;
      cursor: pointer;
      width: 100%;
    }

    .row:hover {
      background: var(--mui-color-surface-hover);
      color: var(--mui-color-text);
    }

    .row:focus-visible {
      outline: none;
      box-shadow: var(--mui-focus-ring);
    }

    .row.active {
      background: var(--mui-color-accent-muted);
      color: var(--mui-color-accent);
      font-weight: var(--mui-weight-medium);
    }

    .row:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .children {
      margin-left: 12px;
      padding-left: var(--mui-space-2);
      border-left: 1px solid var(--mui-color-border);
    }
  `;

  private isExpanded(item: ContentTreeItem): boolean {
    return this.expanded.includes(item.id);
  }

  private toggle(item: ContentTreeItem, event: Event): void {
    event.stopPropagation();
    const expanded = new Set(this.expanded);
    if (expanded.has(item.id)) {
      expanded.delete(item.id);
    } else {
      expanded.add(item.id);
    }
    this.expanded = [...expanded];
    this.emit('expanded-change', { expanded: this.expanded }, { bubbles: true, composed: true });
  }

  private select(item: ContentTreeItem): void {
    if (item.disabled) return;
    this.active = item.id;
    this.emit('item-select', item, { bubbles: true, composed: true });
  }

  private renderItem(item: ContentTreeItem): unknown {
    const hasChildren = Boolean(item.children?.length);
    const expanded = this.isExpanded(item);

    return html`
      <div class="item" role="treeitem" aria-expanded=${hasChildren ? String(expanded) : 'false'}>
        <button
          class=${item.id === this.active ? 'row active' : 'row'}
          ?disabled=${Boolean(item.disabled)}
          @click=${() => this.select(item)}
        >
          <span @click=${(event: Event) => hasChildren ? this.toggle(item, event) : undefined}>
            <mui-icon name=${hasChildren ? (expanded ? 'chevron-right' : 'chevron-right') : (item.icon ?? 'file')} size="16"></mui-icon>
          </span>
          <span class="label">${item.label}</span>
        </button>
        ${hasChildren && expanded ? html`<div class="children" role="group">${item.children!.map((child) => this.renderItem(child))}</div>` : ''}
      </div>
    `;
  }

  template() {
    return html`
      <div class="tree" part="tree" role="tree" aria-label=${this.label}>
        ${(this.items ?? []).map((item) => this.renderItem(item))}
      </div>
    `;
  }
}

if (!customElements.get('mui-content-tree')) {
  customElements.define('mui-content-tree', MuiContentTree);
}
