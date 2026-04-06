/**
 * MUI Layout System
 * 
 * A flexible multi-panel layout system with:
 * - Icon rail (fixed primary navigation)
 * - Collapsible/resizable navigation panel
 * - Main content area
 * - Optional side panels that can dock left/right
 * 
 * @example
 * ```html
 * <mui-layout>
 *   <mui-layout-rail slot="rail">
 *     <mui-rail-item icon="home" active></mui-rail-item>
 *   </mui-layout-rail>
 *   
 *   <mui-layout-panel slot="nav" collapsible resizable>
 *     Navigation content
 *   </mui-layout-panel>
 *   
 *   <mui-layout-main>
 *     Main content
 *   </mui-layout-main>
 *   
 *   <mui-layout-panel slot="end" collapsible>
 *     Properties panel
 *   </mui-layout-panel>
 * </mui-layout>
 * ```
 */

import { MiuraElement, html, css, component, property, state } from '@miurajs/miura-element';

/**
 * Main Layout Container
 * Orchestrates rail, panels, and main content in a flexbox row.
 */
@component({ tag: 'mui-layout' })
export default class MuiLayout extends MiuraElement {
  /**
   * Full viewport height
   */
  @property({ type: Boolean, attribute: 'full-height' })
  fullHeight = true;

  static styles = css`
    :host {
      display: flex;
      flex-direction: row;
      width: 100%;
      background: var(--mui-background, #fafafa);
    }

    :host([full-height]) {
      height: 100vh;
      height: 100dvh;
    }

    .layout {
      display: flex;
      flex-direction: row;
      flex: 1;
      min-width: 0;
      overflow: hidden;
    }

    /* Rail slot */
    ::slotted([slot="rail"]) {
      flex-shrink: 0;
    }

    /* Nav slot (start panel) */
    ::slotted([slot="nav"]) {
      flex-shrink: 0;
    }

    /* End slot (end panel) */
    ::slotted([slot="end"]) {
      flex-shrink: 0;
    }

    /* Main content fills remaining space */
    .main-wrapper {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
  `;

  template() {
    return html`
      <div class="layout">
        <slot name="rail"></slot>
        <slot name="nav"></slot>
        <div class="main-wrapper">
          <slot></slot>
        </div>
        <slot name="end"></slot>
      </div>
    `;
  }
}

/**
 * Layout Rail (Icon Navigation)
 * Fixed-width vertical icon navigation bar.
 */
@component({ tag: 'mui-layout-rail' })
export class MuiLayoutRail extends MiuraElement {
  /**
   * Rail width in pixels
   */
  @property({ type: Number })
  width = 56;

  /**
   * Show app logo slot
   */
  @property({ type: Boolean })
  logo = true;

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      background: var(--mui-surface, white);
      border-right: 1px solid var(--mui-border, #e5e7eb);
      flex-shrink: 0;
    }

    .rail {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--mui-space-3, 12px) var(--mui-space-2, 8px);
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .logo {
      margin-bottom: var(--mui-space-4, 16px);
      flex-shrink: 0;
    }

    .nav-items {
      display: flex;
      flex-direction: column;
      gap: var(--mui-space-1, 4px);
      flex: 1;
    }

    .bottom-items {
      display: flex;
      flex-direction: column;
      gap: var(--mui-space-1, 4px);
      margin-top: auto;
      padding-top: var(--mui-space-4, 16px);
    }
  `;

  template() {
    const style = `width: ${this.width}px;`;

    return html`
      <nav class="rail" style="${style}" aria-label="Main navigation">
        ${this.logo ? html`
          <div class="logo">
            <slot name="logo"></slot>
          </div>
        ` : ''}
        <div class="nav-items">
          <slot></slot>
        </div>
        <div class="bottom-items">
          <slot name="bottom"></slot>
        </div>
      </nav>
    `;
  }
}


/**
 * Layout Panel
 * Collapsible, resizable side panel for navigation or properties.
 */
@component({ tag: 'mui-layout-panel' })
export class MuiLayoutPanel extends MiuraElement {
  /**
   * Panel is collapsed
   */
  @property({ type: Boolean })
  collapsed = false;

  /**
   * Allow panel to be collapsed
   */
  @property({ type: Boolean })
  collapsible = false;

  /**
   * Allow panel to be resized
   */
  @property({ type: Boolean })
  resizable = false;

  /**
   * Minimum width (px)
   */
  @property({ type: Number, attribute: 'min-width' })
  minWidth = 200;

  /**
   * Maximum width (px)
   */
  @property({ type: Number, attribute: 'max-width' })
  maxWidth = 400;

  /**
   * Default/current width (px)
   */
  @property({ type: Number, attribute: 'default-width' })
  defaultWidth = 280;

  /**
   * Position (affects resize handle placement)
   */
  @property({ type: String })
  position: 'start' | 'end' = 'start';

  /**
   * Panel title
   */
  @property({ type: String })
  title = '';

  /**
   * Border position
   */
  @property({ type: String })
  border: 'none' | 'start' | 'end' = 'end';

  @state()
  private _currentWidth: number = 280;

  @state()
  private _isResizing = false;

  connectedCallback(): void {
    super.connectedCallback?.();
    this._currentWidth = this.defaultWidth;
  }

  static styles = css`
    :host {
      display: flex;
      position: relative;
      background: var(--mui-surface, white);
      flex-shrink: 0;
    }

    :host([collapsed]) {
      width: 0 !important;
    }

    .panel {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .panel.border-start {
      border-left: 1px solid var(--mui-border, #e5e7eb);
    }

    .panel.border-end {
      border-right: 1px solid var(--mui-border, #e5e7eb);
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--mui-space-3, 12px) var(--mui-space-4, 16px);
      border-bottom: 1px solid var(--mui-border, #e5e7eb);
      flex-shrink: 0;
    }

    .header-title {
      font-size: var(--mui-text-sm, 0.875rem);
      font-weight: 600;
      color: var(--mui-text, #1f2937);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--mui-space-1, 4px);
    }

    .content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
    }

    /* Resize Handle */
    .resize-handle {
      position: absolute;
      top: 0;
      width: 4px;
      height: 100%;
      cursor: col-resize;
      background: transparent;
      z-index: 10;
      transition: background var(--mui-duration-fast, 100ms) ease;
    }

    .resize-handle.position-start {
      left: -2px;
    }

    .resize-handle.position-end {
      right: -2px;
    }

    .resize-handle:hover,
    .resize-handle.resizing {
      background: var(--mui-primary, #3b82f6);
    }

    /* Collapse button */
    .collapse-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: none;
      background: transparent;
      cursor: pointer;
      color: var(--mui-text-muted, #9ca3af);
      border-radius: var(--mui-radius-sm, 4px);
      transition: all var(--mui-duration-fast, 100ms) ease;
    }

    .collapse-btn:hover {
      background: var(--mui-surface-hover, rgba(0, 0, 0, 0.04));
      color: var(--mui-text, #1f2937);
    }
  `;

  private _startResize = (e: MouseEvent) => {
    if (!this.resizable) return;
    e.preventDefault();

    this._isResizing = true;
    const startX = e.clientX;
    const startWidth = this._currentWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = this.position === 'start' 
        ? e.clientX - startX 
        : startX - e.clientX;
      const newWidth = Math.max(this.minWidth, Math.min(this.maxWidth, startWidth + deltaX));
      this._currentWidth = newWidth;
    };

    const handleMouseUp = () => {
      this._isResizing = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      
      this.emit('resize', { width: this._currentWidth });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  private _toggleCollapse = () => {
    this.collapsed = !this.collapsed;
    this.emit('collapse', { collapsed: this.collapsed });
  };

  template() {
    const style = this.collapsed ? 'width: 0' : `width: ${this._currentWidth}px`;
    
    const panelClasses = [
      'panel',
      this.border !== 'none' ? `border-${this.border}` : '',
    ].filter(Boolean).join(' ');

    const handleClasses = [
      'resize-handle',
      `position-${this.position}`,
      this._isResizing ? 'resizing' : '',
    ].filter(Boolean).join(' ');

    const collapseIcon = this.position === 'start'
      ? (this.collapsed ? 'panel-right-open' : 'panel-left-close')
      : (this.collapsed ? 'panel-left-open' : 'panel-right-close');

    return html`
      <div class="${panelClasses}" style="${style}">
        ${(this.title || this.collapsible) ? html`
          <div class="header">
            <span class="header-title">${this.title}</span>
            <div class="header-actions">
              <slot name="actions"></slot>
              ${this.collapsible ? html`
                <button 
                  class="collapse-btn" 
                  @click="${this._toggleCollapse}"
                  aria-label="${this.collapsed ? 'Expand panel' : 'Collapse panel'}"
                >
                  <mui-icon name="${collapseIcon}" size="sm"></mui-icon>
                </button>
              ` : ''}
            </div>
          </div>
        ` : ''}
        <div class="content">
          <slot></slot>
        </div>
      </div>
      ${this.resizable && !this.collapsed ? html`
        <div 
          class="${handleClasses}" 
          @mousedown="${this._startResize}"
        ></div>
      ` : ''}
    </div>
  `;
 }
}

// Main Content Area (fix misplaced code)
@component({ tag: 'mui-layout-main' })
export class MuiLayoutMain extends MiuraElement {
  /**
   * Padding
   */
  @property({ type: String })
  padding: 'none' | 'sm' | 'md' | 'lg' = 'none';

  @property({ type: String })
  bg: 'transparent' | 'surface' | 'subtle' = 'surface';

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
      overflow: hidden;
    }

    .main {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      overflow: auto;
    }

    .main.bg-transparent { background: transparent; }
    .main.bg-surface { background: var(--mui-surface, white); }
    .main.bg-subtle { background: var(--mui-surface-subtle, #f9fafb); }

    .main.padding-none { padding: 0; }
    .main.padding-sm { padding: var(--mui-space-3, 12px); }
    .main.padding-md { padding: var(--mui-space-4, 16px); }
    .main.padding-lg { padding: var(--mui-space-6, 24px); }

    /* Header slot */
    ::slotted([slot="header"]) {
      flex-shrink: 0;
    }
  `;

  template() {
    const classes = [
      'main',
      `bg-${this.bg}`,
      `padding-${this.padding}`,
    ].join(' ');

    return html`
      <slot name="header"></slot>
      <div class="${classes}">
        <slot></slot>
      </div>
    `;
  }
}