/**
 * MUI List Components
 * 
 * Versatile list component for displaying data in vertical lists.
 * Supports selection, icons, actions, and various layouts.
 * 
 * @example
 * ```html
 * <mui-list>
 *   <mui-list-item>
 *     <mui-icon slot="start" name="file"></mui-icon>
 *     <span slot="primary">Document.pdf</span>
 *     <span slot="secondary">2.4 MB</span>
 *     <mui-icon-button slot="end" icon="download"></mui-icon-button>
 *   </mui-list-item>
 * </mui-list>
 * ```
 */

import { MiuraElement, html, css, component, property, state } from '@miurajs/miura-element';

/**
 * List Container
 */
@component({ tag: 'mui-list' })
export default class MuiList extends MiuraElement {
  /**
   * List variant
   */
  @property({ type: String })
  variant: 'default' | 'nav' | 'menu' = 'default';

  /**
   * Enable item selection
   */
  @property({ type: Boolean })
  selectable = false;

  /**
   * Allow multiple selection
   */
  @property({ type: Boolean })
  multi = false;

  /**
   * Dense layout (reduces padding)
   */
  @property({ type: Boolean })
  dense = false;

  /**
   * Selected value(s)
   */
  @property({ type: String })
  value = '';

  static styles = css`
    :host {
      display: block;
    }

    .list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
    }

    .list.dense {
      --list-item-padding: var(--mui-space-2, 8px) var(--mui-space-3, 12px);
    }

    /* Nav variant - used for navigation menus */
    .list.variant-nav {
      gap: var(--mui-space-1, 4px);
    }
  `;

  private _handleItemClick(e: CustomEvent) {
    if (!this.selectable) return;
    
    const value = e.detail.value;
    if (this.multi) {
      // Toggle selection
      const selected = new Set(this.value ? this.value.split(',') : []);
      if (selected.has(value)) {
        selected.delete(value);
      } else {
        selected.add(value);
      }
      this.value = Array.from(selected).join(',');
    } else {
      this.value = value;
    }

    this.emit('change', { value: this.value });
  }

  template() {
    const classes = [
      'list',
      `variant-${this.variant}`,
      this.dense ? 'dense' : '',
    ].filter(Boolean).join(' ');

    return html`
      <div class="${classes}" role="list" @item-select="${this._handleItemClick}">
        <slot></slot>
      </div>
    `;
  }
}

/**
 * List Item
 */
@component({ tag: 'mui-list-item' })
export class MuiListItem extends MiuraElement {
  /**
   * Item value (for selectable lists)
   */
  @property({ type: String })
  value = '';

  /**
   * Selected state
   */
  @property({ type: Boolean })
  selected = false;

  /**
   * Active/current state (for navigation)
   */
  @property({ type: Boolean })
  active = false;

  /**
   * Disabled state
   */
  @property({ type: Boolean })
  disabled = false;

  /**
   * Make item clickable
   */
  @property({ type: Boolean })
  clickable = true;

  /**
   * Navigation href
   */
  @property({ type: String })
  href = '';

  /**
   * Icon name (shorthand for start slot)
   */
  @property({ type: String })
  icon = '';

  static styles = css`
    :host {
      display: block;
    }

    .item {
      display: flex;
      align-items: center;
      gap: var(--mui-space-3, 12px);
      padding: var(--list-item-padding, var(--mui-space-3, 12px) var(--mui-space-4, 16px));
      min-height: 44px;
      text-decoration: none;
      color: inherit;
      cursor: default;
      border-radius: var(--mui-radius-md, 6px);
      transition: all var(--mui-duration-fast, 100ms) ease;
      position: relative;
    }

    .item.clickable {
      cursor: pointer;
    }

    .item.clickable:hover {
      background: var(--mui-surface-hover, rgba(0, 0, 0, 0.04));
    }

    .item.clickable:active {
      background: var(--mui-surface-active, rgba(0, 0, 0, 0.08));
    }

    .item.selected {
      background: rgba(59, 130, 246, 0.08);
      color: var(--mui-primary, #3b82f6);
    }

    .item.active {
      background: var(--mui-primary, #3b82f6);
      color: white;
    }

    .item.active:hover {
      background: var(--mui-primary-hover, #2563eb);
    }

    .item.disabled {
      opacity: 0.5;
      pointer-events: none;
    }

    /* Focus visible */
    .item:focus-visible {
      outline: 2px solid var(--mui-primary, #3b82f6);
      outline-offset: -2px;
    }

    /* Start slot (icons) */
    .start {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: var(--mui-text-secondary, #6b7280);
    }

    .item.selected .start,
    .item.active .start {
      color: inherit;
    }

    /* Content */
    .content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    ::slotted([slot="primary"]),
    .primary {
      font-size: var(--mui-text-sm, 0.875rem);
      font-weight: 500;
      color: var(--mui-text, #1f2937);
      line-height: 1.4;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item.selected ::slotted([slot="primary"]),
    .item.selected .primary {
      color: var(--mui-primary, #3b82f6);
    }

    .item.active ::slotted([slot="primary"]),
    .item.active .primary {
      color: white;
    }

    ::slotted([slot="secondary"]),
    .secondary {
      font-size: var(--mui-text-xs, 0.75rem);
      color: var(--mui-text-secondary, #6b7280);
      line-height: 1.4;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item.active ::slotted([slot="secondary"]),
    .item.active .secondary {
      color: rgba(255, 255, 255, 0.8);
    }

    /* End slot (actions) */
    .end {
      display: flex;
      align-items: center;
      gap: var(--mui-space-1, 4px);
      flex-shrink: 0;
      opacity: 0;
      transition: opacity var(--mui-duration-fast, 100ms) ease;
    }

    .item:hover .end,
    .item:focus-within .end,
    .end.always-visible {
      opacity: 1;
    }

    /* Chevron for navigation */
    .chevron {
      color: var(--mui-text-muted, #9ca3af);
    }

    .item.active .chevron {
      color: rgba(255, 255, 255, 0.7);
    }
  `;

  private _handleClick = (e: Event) => {
    if (this.disabled) return;
    
    if (this.href) {
      // Navigation handled by anchor
      return;
    }

    this.emit('item-select', { value: this.value }, { bubbles: true, composed: true });
    this.emit('click', {});
  };

  template() {
    const classes = [
      'item',
      this.clickable && !this.disabled ? 'clickable' : '',
      this.selected ? 'selected' : '',
      this.active ? 'active' : '',
      this.disabled ? 'disabled' : '',
    ].filter(Boolean).join(' ');

    const Tag = this.href ? 'a' : 'div';
    
    return html`
      <${Tag} 
        class="${classes}"
        href="${this.href || undefined}"
        role="listitem"
        tabindex="${this.clickable && !this.disabled ? 0 : -1}"
        @click="${this._handleClick}"
        @keydown="${(e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this._handleClick(e);
          }
        }}"
      >
        <span class="start">
          ${this.icon ? html`<mui-icon name="${this.icon}" size="sm"></mui-icon>` : ''}
          <slot name="start"></slot>
        </span>
        <div class="content">
          <slot name="primary"></slot>
          <slot name="secondary"></slot>
          <slot></slot>
        </div>
        <span class="end">
          <slot name="end"></slot>
        </span>
      </${Tag}>
    `;
  }
}

/**
 * List Section Header
 */
@component({ tag: 'mui-list-header' })
export class MuiListHeader extends MiuraElement {
  static styles = css`
    :host {
      display: block;
    }

    .header {
      padding: var(--mui-space-3, 12px) var(--mui-space-4, 16px);
      font-size: var(--mui-text-xs, 0.75rem);
      font-weight: 600;
      color: var(--mui-text-muted, #9ca3af);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    :host(:not(:first-child)) .header {
      margin-top: var(--mui-space-2, 8px);
      border-top: 1px solid var(--mui-border, #e5e7eb);
      padding-top: var(--mui-space-4, 16px);
    }
  `;

  template() {
    return html`
      <div class="header" role="presentation">
        <slot></slot>
      </div>
    `;
  }
}

/**
 * List Divider
 */
@component({ tag: 'mui-list-divider' })
export class MuiListDivider extends MiuraElement {
  /**
   * Inset the divider (leave space for icons)
   */
  @property({ type: Boolean })
  inset = false;

  static styles = css`
    :host {
      display: block;
    }

    .divider {
      height: 1px;
      background: var(--mui-border, #e5e7eb);
      margin: var(--mui-space-2, 8px) 0;
    }

    .divider.inset {
      margin-left: 52px; /* Icon space + padding */
    }
  `;

  template() {
    return html`
      <div class="divider ${this.inset ? 'inset' : ''}" role="separator"></div>
    `;
  }
}