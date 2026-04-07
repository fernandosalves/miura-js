import { MiuraElement, html, css, component, property } from '@miurajs/miura-element';
import '../primitives/icon.js';
import '../primitives/button.js';
import '../layout/stack.js';
import '../layout/box.js';
import '../layout/layout.js';

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

  static styles = css`
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
      --_rail-width: 64px; /* Increased slightly for better tile breathing room */
    }

    .rail-header {
      display: flex;
      align-items: center;
      padding: var(--mui-space-3);
      border-bottom: 1px solid var(--mui-border);
      min-height: 64px;
      position: relative;
    }

    .rail-logo-wrapper {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .rail-title {
      flex: 1;
      font-weight: var(--mui-weight-semibold);
      font-size: var(--mui-text-md);
      margin-left: var(--mui-space-3);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      opacity: 1;
      transition: all var(--mui-duration-normal) var(--mui-easing-standard);
    }

    :host([collapsed]) .rail-title {
      opacity: 0;
      width: 0;
      margin: 0;
    }

    .collapse-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      background: white;
      border: 1px solid var(--mui-border);
      border-radius: var(--mui-radius-full);
      color: var(--mui-text-secondary);
      cursor: pointer;
      position: absolute;
      right: -12px;
      top: 20px;
      z-index: 10;
      box-shadow: var(--mui-shadow-sm);
      transition: all 0.2s ease;
    }

    :host([collapsed]) .collapse-button {
        right: -12px;
    }

    .rail-body {
      flex: 1;
      overflow-y: auto;
      padding: var(--mui-space-4) 0;
      display: flex;
      flex-direction: column;
      gap: var(--mui-space-1);
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
          <div class="rail-logo-wrapper">
             <slot name="logo"></slot>
          </div>
          ${!this.collapsed ? html`
            <div class="rail-title">
              <slot name="title"></slot>
            </div>
          ` : ''}
          ${this.collapsible ? html`
            <button 
              class="collapse-button"
              aria-label="${this.collapsed ? 'Expand' : 'Collapse'} navigation"
              @click=${this._toggleCollapse.bind(this)}
            >
              ${collapseIcon}
            </button>
          ` : ''}
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

  static styles = css`
    :host {
      display: block;
      height: 48px;
      margin: 4px 0;
    }

    /* Precision controlled button */
    mui-button {
      width: 100%;
      --mui-button-px: 0;
      --mui-button-h: 48px;
      --mui-button-background: transparent; /* No row-level background */
    }

    /* Icon Gutter (Stable 64px) */
    .item-content {
      display: flex;
      align-items: center;
      width: 100%;
      height: 100%;
      position: relative;
    }

    .icon-box {
      width: 64px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: relative;
    }

    /* The 'Gallery' selection tile */
    .tile {
      position: absolute;
      inset: 4px 8px;
      background: transparent;
      border-radius: var(--mui-radius-lg, 12px);
      z-index: 0;
      transition: all var(--mui-duration-fast) var(--mui-easing-standard);
    }

    :host([active]) .tile {
      background: #f1f5f9;
      border: 1px solid var(--mui-border);
      box-shadow: var(--mui-shadow-sm);
    }

    mui-button:hover .tile {
      background: var(--mui-surface-subtle);
    }

    /* Ensure icon is ALWAYS on top of tile */
    .icon-wrapper {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--mui-text-secondary);
    }

    :host([active]) .icon-wrapper {
      color: var(--mui-primary);
    }

    /* Alignment */
    .item-label {
      font-size: var(--mui-text-sm);
      font-weight: var(--mui-weight-medium);
      color: var(--mui-text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: all var(--mui-duration-normal) var(--mui-easing-emphasized);
      opacity: 1;
      padding-left: 4px;
    }

    :host([active]) .item-label {
      color: var(--mui-text);
      font-weight: var(--mui-weight-semibold);
    }

    :host-context(mui-icon-rail[collapsed]) .item-label {
      opacity: 0;
      width: 0;
      margin: 0;
      padding: 0;
    }

    .badge-wrapper {
        margin-left: auto;
        margin-right: var(--mui-space-4);
        position: relative;
        z-index: 2;
    }

    :host-context(mui-icon-rail[collapsed]) .badge-wrapper {
        position: absolute;
        top: 6px;
        right: 12px;
        margin: 0;
    }
  `;

  private _handleClick(e: Event) {
    if (this.disabled) {
      e.preventDefault();
      return;
    }
    this.emit('click', { href: this.href });
  }

  template() {
    return html`
      <mui-button 
        variant="ghost"
        ?disabled=${this.disabled}
        @click=${this._handleClick.bind(this)}
      >
        <div class="item-content">
          <div class="icon-box">
            <div class="tile"></div>
            <div class="icon-wrapper">
              <slot name="icon">
                ${this.icon ? html`<mui-icon name="${this.icon}" size="md"></mui-icon>` : ''}
              </slot>
            </div>
          </div>
          
          <span class="item-label">${this.label}</span>
          
          ${this.badge ? html`
            <div class="badge-wrapper">
              <mui-badge variant="solid" tone="primary" size="sm">
                ${this.badge}
              </mui-badge>
            </div>
          ` : ''}
        </div>
      </mui-button>
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

