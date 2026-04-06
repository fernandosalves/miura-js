import { MiuraElement, html, css, component, property } from '@miurajs/miura-element';

/**
 * Icon rail navigation component - can collapse/expand between icon-only and full menu
 * Usage:
 * <mui-icon-rail collapsed>
 *   <mui-rail-item icon="home" label="Home" href="/"></mui-rail-item>
 *   <mui-rail-item icon="folder" label="Files" href="/files"></mui-rail-item>
 * </mui-icon-rail>
 */
@component({ tag: 'mui-icon-rail' })
export class MuiIconRail extends MiuraElement {
  @property({ type: Boolean, default: false })
  collapsed!: boolean;

  @property({ type: String, default: 'left' })
  placement!: 'left' | 'right';

  @property({ type: Boolean, default: true })
  collapsible!: boolean;

  static get styles() {
    return css`
      :host {
        display: block;
        height: 100%;
      }

      .rail {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--mui-surface);
        border-right: 1px solid var(--mui-border);
        width: var(--_rail-width, 240px);
        transition: width var(--mui-duration-normal) var(--mui-easing-emphasized);
        position: relative;
      }

      :host([placement="right"]) .rail {
        border-right: none;
        border-left: 1px solid var(--mui-border);
      }

      :host([collapsed]) .rail {
        --_rail-width: 56px;
      }

      .rail-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--mui-space-3);
        border-bottom: 1px solid var(--mui-border);
        min-height: 56px;
      }

      .rail-title {
        font-weight: var(--mui-weight-semibold);
        font-size: var(--mui-text-md);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        opacity: 1;
        transition: opacity var(--mui-duration-fast) var(--mui-easing-standard);
      }

      :host([collapsed]) .rail-title {
        opacity: 0;
        width: 0;
      }

      .collapse-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        padding: 0;
        background: transparent;
        border: none;
        border-radius: var(--mui-radius-md);
        color: var(--mui-text-secondary);
        cursor: pointer;
        transition: background var(--mui-duration-fast) var(--mui-easing-standard);
      }

      .collapse-button:hover {
        background: var(--mui-surface-subtle);
      }

      .collapse-icon {
        width: 18px;
        height: 18px;
        transition: transform var(--mui-duration-fast) var(--mui-easing-standard);
      }

      :host([collapsed]) .collapse-icon {
        transform: rotate(180deg);
      }

      :host([placement="right"]) .collapse-icon {
        transform: rotate(180deg);
      }

      :host([placement="right"][collapsed]) .collapse-icon {
        transform: rotate(0deg);
      }

      .rail-body {
        flex: 1;
        overflow-y: auto;
        padding: var(--mui-space-2) 0;
      }

      .rail-footer {
        border-top: 1px solid var(--mui-border);
        padding: var(--mui-space-2) 0;
      }

      /* Hide footer if empty */
      .rail-footer:not(:has(::slotted(*))) {
        display: none;
        border-top: none;
      }
    `;
  }

  private _toggleCollapse() {
    this.collapsed = !this.collapsed;
    this.emit('toggle', { collapsed: this.collapsed });
  }

  template() {
    const collapseIcon = html`
      <svg class="collapse-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    `;

    return html`
      <nav class="rail">
        <div class="rail-header">
          <div class="rail-title">
            <slot name="title">Navigation</slot>
          </div>
          <button 
            class="collapse-button"
            aria-label="${this.collapsed ? 'Expand' : 'Collapse'} navigation"
            @click=${this._toggleCollapse.bind(this)}
            #if=${this.collapsible}
          >
            ${collapseIcon}
          </button>
        </div>
        <div class="rail-body">
          <slot></slot>
        </div>
        <div class="rail-footer">
          <slot name="footer"></slot>
        </div>
      </nav>
    `;
  }
}

/**
 * Rail item component
 */
@component({ tag: 'mui-rail-item' })
export class MuiRailItem extends MiuraElement {
  @property({ type: String, default: '' })
  icon!: string;

  @property({ type: String, default: '' })
  label!: string;

  @property({ type: String, default: '' })
  href!: string;

  @property({ type: Boolean, default: false })
  active!: boolean;

  @property({ type: Boolean, default: false })
  disabled!: boolean;

  @property({ type: String, default: '' })
  badge!: string;

  static get styles() {
    return css`
      :host {
        display: block;
      }

      a, button {
        display: flex;
        align-items: center;
        gap: var(--mui-space-3);
        width: 100%;
        padding: var(--mui-space-2) var(--mui-space-3);
        margin: var(--mui-space-1) var(--mui-space-2);
        background: transparent;
        border: none;
        border-radius: var(--mui-radius-md);
        color: var(--mui-text-secondary);
        text-decoration: none;
        font-family: var(--mui-font-family);
        font-size: var(--mui-text-sm);
        font-weight: var(--mui-weight-medium);
        cursor: pointer;
        position: relative;
        transition: background var(--mui-duration-fast) var(--mui-easing-standard),
                    color var(--mui-duration-fast) var(--mui-easing-standard);
      }

      a:hover, button:hover {
        background: var(--mui-surface-subtle);
        color: var(--mui-text);
      }

      :host([active]) a,
      :host([active]) button {
        background: color-mix(in srgb, var(--mui-primary) 15%, transparent);
        color: var(--mui-primary);
      }

      :host([active]) a::before,
      :host([active]) button::before {
        content: '';
        position: absolute;
        left: 0;
        top: 6px;
        bottom: 6px;
        width: 3px;
        background: var(--mui-primary);
        border-radius: 0 2px 2px 0;
      }

      :host([disabled]) a,
      :host([disabled]) button {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      .item-icon {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }

      .item-label {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: left;
        opacity: 1;
        transition: opacity var(--mui-duration-fast) var(--mui-easing-standard);
      }

      /* Hide label when parent rail is collapsed */
      :host-context(mui-icon-rail[collapsed]) .item-label {
        opacity: 0;
        width: 0;
      }

      .item-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 18px;
        height: 18px;
        padding: 0 4px;
        background: var(--mui-primary);
        color: white;
        border-radius: var(--mui-radius-full);
        font-size: var(--mui-text-xs);
        font-weight: var(--mui-weight-semibold);
        line-height: 1;
      }

      :host-context(mui-icon-rail[collapsed]) .item-badge {
        position: absolute;
        top: 4px;
        right: 4px;
        min-width: 14px;
        height: 14px;
        font-size: 10px;
      }
    `;
  }

  private _handleClick(e: Event) {
    if (this.disabled) {
      e.preventDefault();
      return;
    }
    this.emit('click', { href: this.href });
  }

  template() {
    const iconSlot = html`
      <div class="item-icon">
        <slot name="icon">${this.icon}</slot>
      </div>
    `;

    const content = html`
      ${iconSlot}
      <span class="item-label">${this.label}</span>
      <span class="item-badge" #if=${this.badge}>${this.badge}</span>
    `;

    if (this.href) {
      return html`
        <a 
          href="${this.href}" 
          @click=${this._handleClick.bind(this)}
          aria-current="${this.active ? 'page' : 'false'}"
        >
          ${content}
        </a>
      `;
    }

    return html`
      <button 
        @click=${this._handleClick.bind(this)}
        aria-pressed="${this.active ? 'true' : 'false'}"
      >
        ${content}
      </button>
    `;
  }
}

/**
 * Rail Divider — visual separator in icon rails
 */
@component({ tag: 'mui-rail-divider' })
export class MuiRailDivider extends MiuraElement {
  static styles: any = css`
    :host {
      display: block;
      height: 1px;
      background: var(--mui-border, #e5e7eb);
      margin: var(--mui-space-4, 16px) var(--mui-space-3, 12px);
    }
    :host-context(mui-icon-rail[collapsed]) {
      margin: var(--mui-space-4, 16px) var(--mui-space-2, 8px);
    }
  `;
  template() { return html``; }
}

