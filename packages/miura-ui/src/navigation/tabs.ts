/**
 * MUI Tabs Component
 * 
 * Tab navigation with multiple styles.
 * 
 * @example
 * ```html
 * <mui-tabs value="tab1" @change=${this.handleChange}>
 *   <mui-tab value="tab1" icon="file">Documents</mui-tab>
 *   <mui-tab value="tab2" icon="image">Media</mui-tab>
 *   <mui-tab value="tab3" disabled>Disabled</mui-tab>
 * </mui-tabs>
 * ```
 */

import { MiuraElement, html, css, component, property, state } from '@miurajs/miura-element';

@component({ tag: 'mui-tabs' })
export default class MuiTabs extends MiuraElement {
  /**
   * Currently selected tab value
   */
  @property({ type: String })
  value = '';

  /**
   * Tab style variant
   */
  @property({ type: String })
  variant: 'line' | 'contained' | 'pills' = 'line';

  /**
   * Tab orientation
   */
  @property({ type: String })
  orientation: 'horizontal' | 'vertical' = 'horizontal';

  /**
   * Size
   */
  @property({ type: String })
  size: 'sm' | 'md' | 'lg' = 'md';

  /**
   * Stretch tabs to fill container
   */
  @property({ type: Boolean })
  stretch = false;

  static styles = css`
    :host {
      display: block;
    }

    .tabs {
      display: flex;
      position: relative;
    }

    /* Orientation */
    .tabs.horizontal {
      flex-direction: row;
    }

    .tabs.vertical {
      flex-direction: column;
    }

    /* Size */
    .tabs.size-sm {
      --tab-padding: var(--mui-space-2, 8px) var(--mui-space-3, 12px);
      --tab-font-size: var(--mui-text-xs, 0.75rem);
      --tab-height: 36px;
    }

    .tabs.size-md {
      --tab-padding: var(--mui-space-2, 8px) var(--mui-space-4, 16px);
      --tab-font-size: var(--mui-text-sm, 0.875rem);
      --tab-height: 44px;
    }

    .tabs.size-lg {
      --tab-padding: var(--mui-space-3, 12px) var(--mui-space-5, 20px);
      --tab-font-size: var(--mui-text-md, 1rem);
      --tab-height: 52px;
    }

    /* Line variant */
    .tabs.variant-line {
      border-bottom: 1px solid var(--mui-border, #e5e7eb);
      gap: 0;
    }

    .tabs.variant-line.vertical {
      border-bottom: none;
      border-right: 1px solid var(--mui-border, #e5e7eb);
    }

    /* Contained variant */
    .tabs.variant-contained {
      background: var(--mui-surface-subtle, #f3f4f6);
      border-radius: var(--mui-radius-md, 8px);
      padding: 4px;
      gap: 4px;
    }

    /* Pills variant */
    .tabs.variant-pills {
      gap: var(--mui-space-1, 4px);
    }

    /* Stretch */
    .tabs.stretch ::slotted(mui-tab) {
      flex: 1;
    }
  `;

  private _handleTabClick(e: CustomEvent) {
    const value = e.detail.value;
    if (value === this.value) return;
    
    this.emit('change', { value, previousValue: this.value });
    this.value = value;
  }

  connectedCallback(): void {
    super.connectedCallback?.();
    this.addEventListener('tab-click', this._handleTabClick as EventListener);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback?.();
    this.removeEventListener('tab-click', this._handleTabClick as EventListener);
  }

  template() {
    const classes = [
      'tabs',
      this.orientation,
      `variant-${this.variant}`,
      `size-${this.size}`,
      this.stretch ? 'stretch' : '',
    ].filter(Boolean).join(' ');

    return html`
      <div 
        class="${classes}" 
        role="tablist"
        aria-orientation="${this.orientation}"
      >
        <slot></slot>
      </div>
    `;
  }

  updated(changedProps: Map<string, unknown>) {
    if (changedProps.has('value')) {
      // Update tab selected states via attribute
      const slot = this.shadowRoot?.querySelector('slot');
      const tabs = slot?.assignedElements() as HTMLElement[];
      tabs?.forEach(tab => {
        if (tab.tagName === 'MUI-TAB') {
          const tabValue = tab.getAttribute('value');
          if (tabValue === this.value) {
            tab.setAttribute('selected', '');
          } else {
            tab.removeAttribute('selected');
          }
        }
      });
    }
  }
}

@component({ tag: 'mui-tab' })
export class MuiTab extends MiuraElement {
  /**
   * Tab value (identifier)
   */
  @property({ type: String })
  value = '';

  /**
   * Is this tab selected?
   */
  @property({ type: Boolean })
  selected = false;

  /**
   * Is this tab disabled?
   */
  @property({ type: Boolean })
  disabled = false;

  /**
   * Icon name
   */
  @property({ type: String })
  icon = '';

  /**
   * Badge count
   */
  @property({ type: Number })
  badge: number | null = null;

  static styles = css`
    :host {
      display: inline-flex;
    }

    .tab {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--mui-space-2, 8px);
      padding: var(--tab-padding, var(--mui-space-2, 8px) var(--mui-space-4, 16px));
      min-height: var(--tab-height, 44px);
      font-size: var(--tab-font-size, var(--mui-text-sm, 0.875rem));
      font-weight: 500;
      color: var(--mui-text-secondary, #6b7280);
      background: transparent;
      border: none;
      cursor: pointer;
      position: relative;
      white-space: nowrap;
      transition: all var(--mui-duration-fast, 100ms) ease;
      font-family: inherit;
    }

    .tab:focus-visible {
      outline: 2px solid var(--mui-primary, #3b82f6);
      outline-offset: -2px;
    }

    .tab:hover:not(.disabled) {
      color: var(--mui-text, #1f2937);
    }

    .tab.selected {
      color: var(--mui-primary, #3b82f6);
    }

    .tab.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Line variant indicator */
    :host-context(mui-tabs[variant="line"]) .tab::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background: transparent;
      transition: background var(--mui-duration-fast, 100ms) ease;
    }

    :host-context(mui-tabs[variant="line"]) .tab.selected::after {
      background: var(--mui-primary, #3b82f6);
    }

    :host-context(mui-tabs[variant="line"][orientation="vertical"]) .tab::after {
      bottom: auto;
      top: 0;
      left: auto;
      right: -1px;
      width: 2px;
      height: 100%;
    }

    /* Contained variant */
    :host-context(mui-tabs[variant="contained"]) .tab {
      border-radius: var(--mui-radius-sm, 6px);
    }

    :host-context(mui-tabs[variant="contained"]) .tab.selected {
      background: var(--mui-surface, white);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      color: var(--mui-text, #1f2937);
    }

    /* Pills variant */
    :host-context(mui-tabs[variant="pills"]) .tab {
      border-radius: var(--mui-radius-full, 9999px);
    }

    :host-context(mui-tabs[variant="pills"]) .tab.selected {
      background: var(--mui-primary, #3b82f6);
      color: white;
    }

    :host-context(mui-tabs[variant="pills"]) .tab:hover:not(.disabled):not(.selected) {
      background: var(--mui-surface-subtle, #f3f4f6);
    }

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      height: 18px;
      padding: 0 6px;
      font-size: 10px;
      font-weight: 600;
      background: var(--mui-surface-subtle, #f3f4f6);
      color: var(--mui-text-secondary, #6b7280);
      border-radius: 9999px;
    }

    .tab.selected .badge {
      background: rgba(59, 130, 246, 0.1);
      color: var(--mui-primary, #3b82f6);
    }

    :host-context(mui-tabs[variant="pills"]) .tab.selected .badge {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }
  `;

  private _handleClick = () => {
    if (this.disabled) return;
    this.emit('tab-click', { value: this.value }, { bubbles: true, composed: true });
  };

  template() {
    const classes = [
      'tab',
      this.selected ? 'selected' : '',
      this.disabled ? 'disabled' : '',
    ].filter(Boolean).join(' ');

    return html`
      <button
        class="${classes}"
        role="tab"
        aria-selected="${this.selected}"
        aria-disabled="${this.disabled}"
        tabindex="${this.disabled ? -1 : 0}"
        @click="${this._handleClick}"
      >
        ${this.icon ? html`<mui-icon name="${this.icon}" size="sm"></mui-icon>` : ''}
        <slot></slot>
        ${this.badge !== null ? html`<span class="badge">${this.badge}</span>` : ''}
      </button>
    `;
  }
}
