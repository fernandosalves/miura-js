import { MiuraElement, html, css, component, property } from '@miurajs/miura-element';

/**
 * Dockable panel component that can be opened/closed
 * Can contain content like tree-views, message lists, etc.
 * Usage:
 * <mui-panel open placement="left" collapsible>
 *   <span slot="title">Files</span>
 *   <mui-tree-view>...</mui-tree-view>
 * </mui-panel>
 */
@component({ tag: 'mui-panel' })
export class MuiPanel extends MiuraElement {
  @property({ type: String, reflect: true })
  title = '';

  @property({ type: Boolean, default: true, reflect: true })
  open!: boolean;

  @property({ type: String, default: 'left', reflect: true })
  placement!: 'left' | 'right' | 'top' | 'bottom';

  @property({ type: Boolean, default: true, reflect: true })
  collapsible!: boolean;

  @property({ type: Boolean, default: false, reflect: true })
  resizable!: boolean;

  @property({ type: String, default: 'md', reflect: true })
  size!: 'sm' | 'md' | 'lg' | 'xl' | 'custom';

  @property({ type: String, default: '', reflect: false })
  customSize!: string;

  static styles: any = css`
    :host {
      display: block;
      position: relative;
      height: 100%;
      /* Only transition during open/close, not resizing */
      transition: width var(--mui-duration-normal) var(--mui-easing-emphasized),
                  height var(--mui-duration-normal) var(--mui-easing-emphasized);
    }

    .panel {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--mui-surface);
      border-right: 1px solid var(--mui-border);
      box-shadow: var(--mui-shadow-sm);
      position: relative;
      /* Transitions removed from here to prevent drag jumping */
    }

    /* Placement borders & shadows */
    :host([placement="left"]) .panel {
      border-left: none;
      border-right: 1px solid var(--mui-border);
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.04);
    }

    :host([placement="right"]) .panel {
      border-right: none;
      border-left: 1px solid var(--mui-border);
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.04);
    }

    :host([placement="top"]) .panel {
      border-top: none;
      border-bottom: 1px solid var(--mui-border);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }

    :host([placement="bottom"]) .panel {
      border-bottom: none;
      border-top: 1px solid var(--mui-border);
      box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
    }

    /* Size variants - horizontal */
    :host([placement="left"]) .panel,
    :host([placement="right"]) .panel {
      width: var(--panel-size, 280px);
    }

    :host([placement="left"][size="sm"]) .panel,
    :host([placement="right"][size="sm"]) .panel { --panel-size: 200px; }
    
    :host([placement="left"][size="md"]) .panel,
    :host([placement="right"][size="md"]) .panel { --panel-size: 280px; }
    
    :host([placement="left"][size="lg"]) .panel,
    :host([placement="right"][size="lg"]) .panel { --panel-size: 360px; }
    
    :host([placement="left"][size="xl"]) .panel,
    :host([placement="right"][size="xl"]) .panel { --panel-size: 480px; }

    /* Size variants - vertical */
    :host([placement="top"]) .panel,
    :host([placement="bottom"]) .panel {
      height: var(--panel-size, 40vh);
    }

    :host([placement="top"][size="sm"]) .panel,
    :host([placement="bottom"][size="sm"]) .panel { --panel-size: 25vh; }
    
    :host([placement="top"][size="md"]) .panel,
    :host([placement="bottom"][size="md"]) .panel { --panel-size: 40vh; }
    
    :host([placement="top"][size="lg"]) .panel,
    :host([placement="bottom"][size="lg"]) .panel { --panel-size: 60vh; }
    
    :host([placement="top"][size="xl"]) .panel,
    :host([placement="bottom"][size="xl"]) .panel { --panel-size: 80vh; }

    /* Custom size */
    :host([size="custom"]) .panel {
      --panel-size: var(--custom-size, 280px);
    }

    :host([size="custom"][placement="top"]) .panel,
    :host([size="custom"][placement="bottom"]) .panel {
      height: var(--custom-size, 40vh);
      width: 100%;
    }

    /* Collapsed state */
    :host(:not([open])[placement="left"]) .panel,
    :host(:not([open])[placement="right"]) .panel {
      width: 0;
      border: none;
    }

    :host(:not([open])[placement="top"]) .panel,
    :host(:not([open])[placement="bottom"]) .panel {
      height: 0;
      border: none;
    }

    /* Header */
    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--mui-space-3);
      padding: var(--mui-space-3) var(--mui-space-4);
      border-bottom: 1px solid var(--mui-border);
      flex-shrink: 0;
      min-height: 48px;
    }

    .panel-title {
      flex: 1;
      font-weight: var(--mui-weight-semibold);
      font-size: var(--mui-text-md);
      color: var(--mui-text);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--mui-space-1);
    }

    .action-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      padding: 0;
      background: transparent;
      border: none;
      border-radius: var(--mui-radius-sm);
      color: var(--mui-text-secondary);
      cursor: pointer;
      transition: background var(--mui-duration-fast) var(--mui-easing-standard),
                  color var(--mui-duration-fast) var(--mui-easing-standard);
    }

    .action-button:hover {
      background: var(--mui-surface-hover);
      color: var(--mui-text);
    }

    .action-button:focus-visible {
      outline: 2px solid var(--mui-primary);
      outline-offset: 1px;
    }

    .action-button svg {
      width: 16px;
      height: 16px;
    }

    /* Body */
    .panel-body {
      flex: 1;
      overflow: auto;
      padding: 0;
    }

    .panel-body::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    .panel-body::-webkit-scrollbar-track {
      background: transparent;
    }

    .panel-body::-webkit-scrollbar-thumb {
      background: var(--mui-border);
      border-radius: 4px;
    }

    .panel-body::-webkit-scrollbar-thumb:hover {
      background: var(--mui-border-hover);
    }

    /* Resize handle */
    .resize-handle {
      position: absolute;
      background: transparent;
      z-index: 10;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .resize-handle::after {
      content: '';
      display: block;
      background: transparent;
      transition: background var(--mui-duration-fast) var(--mui-easing-standard);
    }

    .resize-handle:hover::after,
    .resize-handle.resizing::after {
      background: var(--mui-primary);
    }

    /* Horizontal resize handle */
    :host([placement="left"]) .resize-handle,
    :host([placement="right"]) .resize-handle {
      width: 12px;
      height: 100%;
      cursor: ew-resize;
      top: 0;
    }

    :host([placement="left"]) .resize-handle {
      right: -6px;
    }

    :host([placement="right"]) .resize-handle {
      left: -6px;
    }

    :host([placement="left"]) .resize-handle::after,
    :host([placement="right"]) .resize-handle::after {
      width: 2px;
      height: 100%;
    }

    /* Vertical resize handle */
    :host([placement="top"]) .resize-handle,
    :host([placement="bottom"]) .resize-handle {
      width: 100%;
      height: 12px;
      cursor: ns-resize;
      left: 0;
    }

    :host([placement="top"]) .resize-handle {
      bottom: -6px;
    }

    :host([placement="bottom"]) .resize-handle {
      top: -6px;
    }

    :host([placement="top"]) .resize-handle::after,
    :host([placement="bottom"]) .resize-handle::after {
      width: 100%;
      height: 2px;
    }

    /* Hide resize handle when not resizable */
    :host(:not([resizable])) .resize-handle {
      display: none;
    }
  `;

  private _handleToggle() {
    this.open = !this.open;
    this.emit('toggle', { open: this.open });
  }

  private _handleResize(e: MouseEvent) {
    if (!this.resizable) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const panel = this.shadowRoot?.querySelector('.panel') as HTMLElement;
    const startWidth = panel.offsetWidth;
    const startHeight = panel.offsetHeight;

    const handle = this.shadowRoot?.querySelector('.resize-handle') as HTMLElement;
    handle?.classList.add('resizing');

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (this.placement === 'left') {
        const newWidth = startWidth + (moveEvent.clientX - startX);
        this.customSize = `${Math.max(200, Math.min(800, newWidth))}px`;
        this.size = 'custom';
      } else if (this.placement === 'right') {
        const newWidth = startWidth - (moveEvent.clientX - startX);
        this.customSize = `${Math.max(200, Math.min(800, newWidth))}px`;
        this.size = 'custom';
      } else if (this.placement === 'top') {
        const newHeight = startHeight + (moveEvent.clientY - startY);
        this.customSize = `${Math.max(100, Math.min(window.innerHeight * 0.8, newHeight))}px`;
        this.size = 'custom';
      } else if (this.placement === 'bottom') {
        const newHeight = startHeight - (moveEvent.clientY - startY);
        this.customSize = `${Math.max(100, Math.min(window.innerHeight * 0.8, newHeight))}px`;
        this.size = 'custom';
      }
      
      this.style.setProperty('--custom-size', this.customSize);
      this.emit('resize', { size: this.customSize });
    };

    const handleMouseUp = () => {
      handle?.classList.remove('resizing');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = this.placement === 'left' || this.placement === 'right' ? 'ew-resize' : 'ns-resize';
    document.body.style.userSelect = 'none';
  }

  template() {
    return html`
      <div class="panel">
        <div class="panel-header">
          <h3 class="panel-title">
            <slot name="title">${this.title || 'Panel'}</slot>
          </h3>
          <div class="header-actions">
            <slot name="actions"></slot>
            ${this.collapsible ? html`
              <button 
                class="action-button"
                aria-label="${this.open ? 'Close' : 'Open'} panel"
                @click=${() => this._handleToggle()}
              >
                <mui-icon name="${this.open ? 'panel-left-close' : 'panel-right-open'}" size="sm"></mui-icon>
              </button>
            ` : ''}
          </div>
        </div>
        <div class="panel-body">
          <slot></slot>
        </div>
        ${(this.resizable && this.open) ? html`
          <div 
            class="resize-handle"
            @mousedown=${(e: MouseEvent) => this._handleResize(e)}
          ></div>
        ` : ''}
      </div>
    `;
  }
}
