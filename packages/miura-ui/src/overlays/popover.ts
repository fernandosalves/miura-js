import { MiuraElement, html, css, component, property, state } from '@miurajs/miura-element';

/**
 * Dropdown Menu — floating action menu anchored to a trigger.
 * The most common pattern: "3-dots" → floating list of actions.
 *
 * Usage:
 * <mui-dropdown-menu>
 *   <mui-icon-button slot="trigger" icon="more-vertical" label="Actions"></mui-icon-button>
 *   <mui-menu-item icon="edit">Edit</mui-menu-item>
 *   <mui-menu-item icon="trash-2" variant="danger">Delete</mui-menu-item>
 * </mui-dropdown-menu>
 */
@component({ tag: 'mui-dropdown-menu' })
export class MuiDropdownMenu extends MiuraElement {
  @property({ type: Boolean, default: false, reflect: true })
  open!: boolean;

  @property({ type: String, default: 'bottom-start' })
  placement!: 'bottom-start' | 'bottom-end' | 'bottom' | 'top-start' | 'top-end' | 'top';

  @property({ type: Boolean, default: false })
  disabled!: boolean;

  private _handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this._close();
  };

  private _handleOutsideClick = (e: MouseEvent) => {
    if (!this.contains(e.target as Node)) this._close();
  };

  private _toggle() {
    if (this.disabled) return;
    this.open = !this.open;
    this.emit('toggle', { open: this.open });
  }

  private _close() {
    if (!this.open) return;
    this.open = false;
    this.emit('close');
  }

  updated() {
    if (this.open) {
      document.addEventListener('keydown', this._handleKeyDown);
      window.addEventListener('scroll', this._handleLayoutShift, true);
      window.addEventListener('resize', this._handleLayoutShift);
      // Slight delay so the click that opened doesn't immediately close
      setTimeout(() => document.addEventListener('click', this._handleOutsideClick), 0);
      this._positionMenu();
    } else {
      this._cleanup();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback?.();
    this._cleanup();
  }

  private _handleLayoutShift = () => {
    if (this.open) this._positionMenu();
  };

  private _cleanup() {
    document.removeEventListener('keydown', this._handleKeyDown);
    document.removeEventListener('click', this._handleOutsideClick);
    window.removeEventListener('scroll', this._handleLayoutShift, true);
    window.removeEventListener('resize', this._handleLayoutShift);
  }

  private _positionMenu() {
    requestAnimationFrame(() => {
      const trigger = this.shadowRoot?.querySelector('.trigger') as HTMLElement;
      const menu = this.shadowRoot?.querySelector('.menu') as HTMLElement;
      if (!trigger || !menu) return;

      const rect = trigger.getBoundingClientRect();
      const menuHeight = menu.offsetHeight;
      const menuWidth = menu.offsetWidth;
      const vp = { w: window.innerWidth, h: window.innerHeight };

      // Default: bottom-start
      let top = rect.bottom + 4;
      let left = rect.left;

      if (this.placement === 'bottom-end') left = rect.right - menuWidth;
      if (this.placement === 'bottom') left = rect.left + rect.width / 2 - menuWidth / 2;
      if (this.placement.startsWith('top')) {
        top = rect.top - menuHeight - 4;
        if (this.placement === 'top-end') left = rect.right - menuWidth;
        if (this.placement === 'top') left = rect.left + rect.width / 2 - menuWidth / 2;
      }

      // Flip if off-screen
      if (top + menuHeight > vp.h) top = rect.top - menuHeight - 4;
      if (left + menuWidth > vp.w) left = vp.w - menuWidth - 8;
      if (left < 8) left = 8;

      menu.style.top = `${top}px`;
      menu.style.left = `${left}px`;
    });
  }

  static styles: any = css`
    :host {
      display: inline-flex;
      position: relative;
    }

    .trigger {
      display: contents;
    }

    .menu {
      position: fixed;
      z-index: var(--mui-z-dropdown, 1100);
      min-width: 180px;
      background: var(--mui-surface, #fff);
      border: 1px solid var(--mui-border, #e5e7eb);
      border-radius: var(--mui-radius-lg, 8px);
      box-shadow: var(--mui-shadow-lg, 0 8px 24px rgba(0,0,0,0.12));
      padding: var(--mui-space-1, 4px);
      opacity: 0;
      visibility: hidden;
      transform: translateY(-4px) scale(0.97);
      transform-origin: top left;
      transition:
        opacity var(--mui-duration-fast, 100ms) ease,
        transform var(--mui-duration-fast, 100ms) ease,
        visibility var(--mui-duration-fast, 100ms) ease;
    }

    :host([open]) .menu {
      opacity: 1;
      visibility: visible;
      transform: translateY(0) scale(1);
    }
  `;

  template() {
    return html`
      <div class="trigger" @click=${() => this._toggle()}>
        <slot name="trigger"></slot>
      </div>
      <div class="menu" role="menu" aria-hidden="${!this.open}">
        <slot></slot>
      </div>
    `;
  }
}

/**
 * Dropdown Menu Item — used inside mui-dropdown-menu
 *
 * <mui-dropdown-item icon="edit">Edit</mui-dropdown-item>
 * <mui-dropdown-item icon="trash-2" variant="danger">Delete</mui-dropdown-item>
 */
@component({ tag: 'mui-dropdown-item' })
export class MuiDropdownItem extends MiuraElement {
  @property({ type: String, default: '' })
  icon!: string;

  @property({ type: String, default: 'default' })
  variant!: 'default' | 'danger';

  @property({ type: Boolean, default: false, reflect: true })
  disabled!: boolean;

  @property({ type: String, default: '' })
  shortcut!: string;

  static styles: any = css`
    :host {
      display: block;
    }

    .item {
      display: flex;
      align-items: center;
      gap: var(--mui-space-2, 8px);
      width: 100%;
      padding: var(--mui-space-2, 6px) var(--mui-space-3, 12px);
      background: transparent;
      border: none;
      border-radius: var(--mui-radius-md, 6px);
      font-size: var(--mui-text-sm, 0.875rem);
      font-family: inherit;
      color: var(--mui-text, #1f2937);
      cursor: pointer;
      text-align: left;
      transition: background var(--mui-duration-fast, 100ms) ease;
    }

    .item:hover:not(:disabled) {
      background: var(--mui-surface-hover, rgba(0,0,0,0.04));
    }

    .item:disabled,
    :host([disabled]) .item {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .item.danger {
      color: var(--mui-error, #ef4444);
    }

    .item.danger:hover:not(:disabled) {
      background: rgba(239, 68, 68, 0.06);
    }

    .label {
      flex: 1;
    }

    .shortcut {
      font-size: var(--mui-text-xs, 0.75rem);
      color: var(--mui-text-muted, #9ca3af);
      letter-spacing: 0.02em;
    }

    mui-icon {
      flex-shrink: 0;
      color: var(--mui-text-secondary, #6b7280);
    }

    .item.danger mui-icon {
      color: var(--mui-error, #ef4444);
    }
  `;

  private _handleClick() {
    if (this.disabled) return;
    this.emit('select', {}, { bubbles: true, composed: true });
    // Close the parent dropdown
    const dropdown = this.closest('mui-dropdown-menu') as any;
    dropdown?.open !== undefined && (dropdown.open = false);
  }

  template() {
    return html`
      <button
        class="item ${this.variant === 'danger' ? 'danger' : ''}"
        role="menuitem"
        ?disabled=${this.disabled}
        @click=${() => this._handleClick()}
      >
        ${this.icon ? html`<mui-icon name="${this.icon}" size="sm"></mui-icon>` : ''}
        <span class="label"><slot></slot></span>
        ${this.shortcut ? html`<span class="shortcut">${this.shortcut}</span>` : ''}
      </button>
    `;
  }
}

/**
 * Dropdown Divider — visual separator in dropdown menus
 */
@component({ tag: 'mui-dropdown-divider' })
export class MuiDropdownDivider extends MiuraElement {
  static styles: any = css`
    :host {
      display: block;
      height: 1px;
      background: var(--mui-border, #e5e7eb);
      margin: var(--mui-space-1, 4px) 0;
    }
  `;
  template() { return html``; }
}

/**
 * Tooltip — floating label on hover
 *
 * <mui-tooltip content="Save document">
 *   <mui-icon-button icon="save"></mui-icon-button>
 * </mui-tooltip>
 */
@component({ tag: 'mui-tooltip' })
export class MuiTooltip extends MiuraElement {
  @property({ type: String, default: '' })
  content!: string;

  @property({ type: String, default: 'top' })
  placement!: 'top' | 'bottom' | 'left' | 'right';

  @property({ type: Number, default: 600 })
  delay!: number;

  private _showTimer: number | null = null;

  @state({ default: false })
  private _visible = false;

  private _show() {
    this._showTimer = window.setTimeout(() => {
      this._visible = true;
      this._positionTooltip();
      window.addEventListener('scroll', this._handleLayoutShift, true);
      window.addEventListener('resize', this._handleLayoutShift);
    }, this.delay);
  }

  private _hide() {
    if (this._showTimer) clearTimeout(this._showTimer);
    this._visible = false;
    window.removeEventListener('scroll', this._handleLayoutShift, true);
    window.removeEventListener('resize', this._handleLayoutShift);
  }

  private _handleLayoutShift = () => {
    if (this._visible) this._positionTooltip();
  };

  disconnectedCallback() {
    super.disconnectedCallback?.();
    window.removeEventListener('scroll', this._handleLayoutShift, true);
    window.removeEventListener('resize', this._handleLayoutShift);
  }

  private _positionTooltip() {
    requestAnimationFrame(() => {
      const trigger = this.shadowRoot?.querySelector('.trigger') as HTMLElement;
      const tooltip = this.shadowRoot?.querySelector('.tooltip') as HTMLElement;
      if (!trigger || !tooltip) return;

      const rect = trigger.getBoundingClientRect();
      const tw = tooltip.offsetWidth;
      const th = tooltip.offsetHeight;

      let top = 0, left = 0;
      const GAP = 6;

      switch (this.placement) {
        case 'top':
          top = rect.top - th - GAP;
          left = rect.left + rect.width / 2 - tw / 2;
          break;
        case 'bottom':
          top = rect.bottom + GAP;
          left = rect.left + rect.width / 2 - tw / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - th / 2;
          left = rect.left - tw - GAP;
          break;
        case 'right':
          top = rect.top + rect.height / 2 - th / 2;
          left = rect.right + GAP;
          break;
      }

      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;
    });
  }

  static styles: any = css`
    :host { display: inline-flex; position: relative; }

    .trigger { display: contents; }

    .tooltip {
      position: fixed;
      z-index: var(--mui-z-tooltip, 1300);
      background: var(--mui-text, #1f2937);
      color: #fff;
      font-size: var(--mui-text-xs, 0.75rem);
      font-family: inherit;
      padding: 4px 8px;
      border-radius: var(--mui-radius-sm, 4px);
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity var(--mui-duration-fast, 100ms) ease;
      max-width: 260px;
      white-space: normal;
    }

    .tooltip.visible {
      opacity: 1;
    }
  `;

  template() {
    return html`
      <div
        class="trigger"
        @mouseenter=${() => this._show()}
        @mouseleave=${() => this._hide()}
        @focusin=${() => this._show()}
        @focusout=${() => this._hide()}
      >
        <slot></slot>
      </div>
      <div
        class="tooltip ${this._visible ? 'visible' : ''}"
        role="tooltip"
        aria-hidden="${!this._visible}"
      >
        ${this.content}
        <slot name="content"></slot>
      </div>
    `;
  }
}
