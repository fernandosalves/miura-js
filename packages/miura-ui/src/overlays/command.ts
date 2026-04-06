import { MiuraElement, html, css, component, property, state } from '@miurajs/miura-element';

/**
 * Command Palette — keyboard-accessible search and action overlay
 */
@component({ tag: 'mui-command-palette' })
export class MuiCommandPalette extends MiuraElement {
  @property({ type: Boolean, default: false, reflect: true })
  open!: boolean;

  @property({ type: String, default: 'Search commands...' })
  placeholder = 'Search commands...';

  private _handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.open) {
      this.open = false;
      this.emit('close');
    }
    if (e.metaKey && e.key === 'k') {
      e.preventDefault();
      this.open = !this.open;
      if (!this.open) this.emit('close');
    }
  };

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('open')) {
      if (this.open) {
        document.addEventListener('keydown', this._handleKeyDown);
        setTimeout(() => this.shadowRoot?.querySelector('input')?.focus(), 0);
      } else {
        document.removeEventListener('keydown', this._handleKeyDown);
      }
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback?.();
    document.removeEventListener('keydown', this._handleKeyDown);
  }

  static styles: any = css`
    :host { display: block; }
    
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      z-index: var(--mui-z-modal, 1000);
      display: flex;
      justify-content: center;
      padding-top: 15vh;
      opacity: 0;
      visibility: hidden;
      transition: opacity 200ms;
    }

    :host([open]) .overlay { opacity: 1; visibility: visible; }

    .palette {
      width: 100%;
      max-width: 600px;
      background: var(--mui-surface, #fff);
      border-radius: var(--mui-radius-xl, 12px);
      box-shadow: var(--mui-shadow-xl, 0 20px 40px rgba(0,0,0,0.2));
      overflow: hidden;
      transform: scale(0.95);
      transition: transform 200ms;
    }

    :host([open]) .palette { transform: scale(1); }

    .header { border-bottom: 1px solid var(--mui-border, #e5e7eb); padding: var(--mui-space-4, 16px); display: flex; align-items: center; gap: 12px; }
    
    input { 
      flex: 1;
      border: none;
      outline: none;
      font-size: 16px;
      font-family: inherit;
      background: transparent;
    }

    .list { max-height: 400px; overflow-y: auto; padding: var(--mui-space-2, 8px); }

    .footer { 
      padding: var(--mui-space-3, 12px); 
      border-top: 1px solid var(--mui-border, #e5e7eb); 
      display: flex; 
      gap: 16px; 
      font-size: 11px; 
      color: var(--mui-text-muted, #9ca3af);
      background: var(--mui-surface-subtle, #f9fafb);
    }

    kbd { background: #eee; padding: 2px 4px; border-radius: 4px; border: 1px solid #ddd; border-bottom-width: 2px; }
  `;

  template() {
    return html`
      <div class="overlay" @click=${(e: any) => { if (e.target === e.currentTarget) { this.open = false; this.emit('close'); } }}>
        <div class="palette">
          <div class="header">
            <mui-icon name="search" size="md" color="muted"></mui-icon>
            <input type="text" placeholder="${this.placeholder}">
          </div>
          <div class="list">
            <slot></slot>
          </div>
          <div class="footer">
            <span><kbd>↑↓</kbd> to navigate</span>
            <span><kbd>↵</kbd> to select</span>
            <span><kbd>esc</kbd> to close</span>
          </div>
        </div>
      </div>
    `;
  }
}

/**
 * Command Item — individual action in the palette
 */
@component({ tag: 'mui-command-item' })
export class MuiCommandItem extends MiuraElement {
  @property({ type: String, default: '' })
  icon = '';

  @property({ type: String, default: '' })
  shortcut = '';

  static styles: any = css`
    :host { display: block; }
    .item { 
      display: flex; 
      align-items: center; 
      gap: 12px; 
      padding: 10px 12px; 
      border-radius: 8px; 
      cursor: pointer;
      transition: background 150ms;
      font-size: 14px;
    }
    .item:hover { background: var(--mui-surface-hover, rgba(0,0,0,0.04)); }
    .label { flex: 1; }
    .shortcut { font-size: 11px; color: var(--mui-text-muted, #9ca3af); }
  `;

  template() {
    return html`
      <div class="item">
        ${this.icon ? html`<mui-icon name="${this.icon}" size="sm" color="muted"></mui-icon>` : ''}
        <span class="label"><slot></slot></span>
        ${this.shortcut ? html`<span class="shortcut">${this.shortcut}</span>` : ''}
      </div>
    `;
  }
}

/**
 * Command Group — group of items
 */
@component({ tag: 'mui-command-group' })
export class MuiCommandGroup extends MiuraElement {
  @property({ type: String, default: '' })
  label = '';

  static styles: any = css`
    .group-label { font-size: 11px; color: var(--mui-text-muted, #9ca3af); text-transform: uppercase; letter-spacing: 0.05em; padding: 12px 12px 4px; }
  `;

  template() {
    return html`
      <div>
        ${this.label ? html`<div class="group-label">${this.label}</div>` : ''}
        <slot></slot>
      </div>
    `;
  }
}
