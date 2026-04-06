import { MiuraElement, html, css, component, property, state } from '@miurajs/miura-element';

/**
 * Menu container component for dropdown/context menus
 * Usage:
 * <mui-menu open>
 *   <mui-menu-item label="Edit" icon="✏️"></mui-menu-item>
 *   <mui-menu-item label="Delete" icon="🗑️" danger></mui-menu-item>
 * </mui-menu>
 */
@component({ tag: 'mui-menu' })
export class MuiMenu extends MiuraElement {
  @property({ type: Boolean, default: false })
  open!: boolean;

  @property({ type: String, default: 'bottom-start' })
  placement!: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';

  @property({ type: Boolean, default: true })
  closeOnSelect!: boolean;

  @property({ type: Boolean, default: true })
  closeOnClickOutside!: boolean;

  @state({ default: -1 })
  private _focusedIndex!: number;

  static get styles() {
    return css`
      :host {
        display: inline-block;
        position: relative;
      }

      .trigger {
        display: inline-block;
      }

      .menu-container {
        position: absolute;
        z-index: var(--mui-z-dropdown, 1300);
        opacity: 0;
        visibility: hidden;
        transform: scale(0.95);
        transition: opacity var(--mui-duration-fast) var(--mui-easing-standard),
                    transform var(--mui-duration-fast) var(--mui-easing-emphasized),
                    visibility var(--mui-duration-fast) var(--mui-easing-standard);
      }

      :host([open]) .menu-container {
        opacity: 1;
        visibility: visible;
        transform: scale(1);
      }

      .menu {
        min-width: 200px;
        max-width: 320px;
        background: var(--mui-surface);
        border: 1px solid var(--mui-border);
        border-radius: var(--mui-radius-md);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08),
                    0 0 0 1px rgba(0, 0, 0, 0.04);
        padding: var(--mui-space-2) 0;
        overflow: auto;
        max-height: 400px;
      }

      .menu::-webkit-scrollbar {
        width: 8px;
      }

      .menu::-webkit-scrollbar-track {
        background: transparent;
      }

      .menu::-webkit-scrollbar-thumb {
        background: var(--mui-border);
        border-radius: 4px;
      }

      /* Placement variants */
      :host([placement="bottom-start"]) .menu-container {
        top: calc(100% + 4px);
        left: 0;
      }

      :host([placement="bottom-end"]) .menu-container {
        top: calc(100% + 4px);
        right: 0;
      }

      :host([placement="top-start"]) .menu-container {
        bottom: calc(100% + 4px);
        left: 0;
      }

      :host([placement="top-end"]) .menu-container {
        bottom: calc(100% + 4px);
        right: 0;
      }

      :host([placement="left-start"]) .menu-container {
        right: calc(100% + 4px);
        top: 0;
      }

      :host([placement="left-end"]) .menu-container {
        right: calc(100% + 4px);
        bottom: 0;
      }

      :host([placement="right-start"]) .menu-container {
        left: calc(100% + 4px);
        top: 0;
      }

      :host([placement="right-end"]) .menu-container {
        left: calc(100% + 4px);
        bottom: 0;
      }

      ::slotted(mui-menu-item) {
        display: block;
      }
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.closeOnClickOutside) {
      document.addEventListener('click', this._handleClickOutside);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._handleClickOutside);
  }

  private _handleClickOutside = (e: MouseEvent) => {
    if (!this.open) return;
    const path = e.composedPath();
    if (!path.includes(this)) {
      this.open = false;
      this.emit('close');
    }
  };

  private _handleTriggerClick() {
    this.open = !this.open;
    this.emit(this.open ? 'open' : 'close');
  }

  private _handleMenuItemSelect(e: CustomEvent) {
    if (this.closeOnSelect) {
      this.open = false;
      this.emit('close');
    }
    this.emit('select', e.detail);
  }

  private _handleKeyDown(e: KeyboardEvent) {
    if (!this.open) return;

    const items = Array.from(this.querySelectorAll('mui-menu-item:not([disabled])'));
    
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        this.open = false;
        this.emit('close');
        break;
      
      case 'ArrowDown':
        e.preventDefault();
        this._focusedIndex = Math.min(this._focusedIndex + 1, items.length - 1);
        (items[this._focusedIndex] as HTMLElement)?.focus();
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        this._focusedIndex = Math.max(this._focusedIndex - 1, 0);
        (items[this._focusedIndex] as HTMLElement)?.focus();
        break;
      
      case 'Home':
        e.preventDefault();
        this._focusedIndex = 0;
        (items[0] as HTMLElement)?.focus();
        break;
      
      case 'End':
        e.preventDefault();
        this._focusedIndex = items.length - 1;
        (items[items.length - 1] as HTMLElement)?.focus();
        break;
    }
  }

  template() {
    return html`
      <div class="trigger" @click=${this._handleTriggerClick.bind(this)}>
        <slot name="trigger"></slot>
      </div>
      <div class="menu-container" @keydown=${this._handleKeyDown.bind(this)}>
        <div class="menu" role="menu">
          <slot @menu-item-select=${this._handleMenuItemSelect.bind(this)}></slot>
        </div>
      </div>
    `;
  }
}

/**
 * Menu item component
 * Usage:
 * <mui-menu-item label="Edit" icon="✏️"></mui-menu-item>
 * <mui-menu-item label="Delete" icon="🗑️" danger></mui-menu-item>
 */
@component({ tag: 'mui-menu-item' })
export class MuiMenuItem extends MiuraElement {
  @property({ type: String, default: '' })
  label!: string;

  @property({ type: String, default: '' })
  icon!: string;

  @property({ type: String, default: '' })
  href!: string;

  @property({ type: Boolean, default: false })
  disabled!: boolean;

  @property({ type: Boolean, default: false })
  danger!: boolean;

  @property({ type: Boolean, default: false })
  divider!: boolean;

  @property({ type: String, default: '' })
  shortcut!: string;

  static get styles() {
    return css`
      :host {
        display: block;
      }

      :host([divider]) {
        height: 1px;
        margin: var(--mui-space-1) 0;
        background: var(--mui-border);
        pointer-events: none;
      }

      .item {
        display: flex;
        align-items: center;
        gap: var(--mui-space-3);
        padding: var(--mui-space-2) var(--mui-space-4);
        min-height: 36px;
        color: var(--mui-text);
        text-decoration: none;
        cursor: pointer;
        transition: background var(--mui-duration-fast) var(--mui-easing-standard),
                    color var(--mui-duration-fast) var(--mui-easing-standard);
        user-select: none;
      }

      .item:hover {
        background: var(--mui-surface-hover);
      }

      .item:focus {
        outline: none;
        background: var(--mui-surface-hover);
      }

      .item:focus-visible {
        outline: 2px solid var(--mui-primary);
        outline-offset: -2px;
      }

      :host([disabled]) .item {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      :host([danger]) .item {
        color: var(--mui-danger);
      }

      :host([danger]) .item:hover {
        background: color-mix(in srgb, var(--mui-danger) 10%, transparent);
      }

      .icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        flex-shrink: 0;
        font-size: var(--mui-text-md);
      }

      .label {
        flex: 1;
        font-size: var(--mui-text-sm);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .shortcut {
        font-size: var(--mui-text-xs);
        color: var(--mui-text-secondary);
        font-family: monospace;
        margin-left: auto;
      }

      .submenu-icon {
        width: 16px;
        height: 16px;
        color: var(--mui-text-secondary);
        margin-left: auto;
      }
    `;
  }

  private _handleClick(e: MouseEvent) {
    if (this.disabled) return;
    
    if (this.href) {
      // Let the browser handle navigation
      return;
    }

    e.preventDefault();
    this.emit('menu-item-select', { label: this.label }, { bubbles: true, composed: true });
  }

  template() {
    if (this.divider) {
      return html``;
    }

    const content = html`
      ${this.icon ? html`<span class="icon">${this.icon}</span>` : ''}
      <span class="label">${this.label || html`<slot></slot>`}</span>
      ${this.shortcut ? html`<span class="shortcut">${this.shortcut}</span>` : ''}
      ${this.hasSlot('submenu') ? html`
        <svg class="submenu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      ` : ''}
    `;

    if (this.href) {
      return html`
        <a 
          class="item" 
          href=${this.href}
          role="menuitem"
          tabindex=${this.disabled ? -1 : 0}
          @click=${this._handleClick.bind(this)}
        >
          ${content}
        </a>
      `;
    }

    return html`
      <div 
        class="item" 
        role="menuitem"
        tabindex=${this.disabled ? -1 : 0}
        @click=${this._handleClick.bind(this)}
      >
        ${content}
      </div>
    `;
  }
}
