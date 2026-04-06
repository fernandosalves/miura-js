import { MiuraElement, html, css, component, property, state } from '@miurajs/miura-element';

/**
 * Select — dropdown single/multi select
 *
 * <mui-select placeholder="Choose...">
 *   <mui-option value="a">Option A</mui-option>
 *   <mui-option value="b">Option B</mui-option>
 * </mui-select>
 */
@component({ tag: 'mui-select' })
export class MuiSelect extends MiuraElement {
  @property({ type: String, default: '' })
  value!: string;

  @property({ type: String, default: '' })
  placeholder!: string;

  @property({ type: String, default: '' })
  label!: string;

  @property({ type: Boolean, default: false, reflect: true })
  disabled!: boolean;

  @property({ type: Boolean, default: false, reflect: true })
  multiple!: boolean;

  @property({ type: String, default: 'md' })
  size!: 'sm' | 'md' | 'lg';

  @property({ type: String, default: 'default' })
  status!: 'default' | 'error' | 'success';

  @property({ type: Boolean, default: false, reflect: true })
  open!: boolean;

  @state({ default: [] })
  private _options: Array<{ value: string; label: string; disabled: boolean }> = [];

  private _toggleOpen() {
    if (this.disabled) return;
    this.open = !this.open;
  }

  private _select(value: string) {
    this.value = value;
    this.open = false;
    this.emit('change', { value });
  }

  private _handleOutside = (e: MouseEvent) => {
    if (!this.contains(e.target as Node)) {
      this.open = false;
      document.removeEventListener('click', this._handleOutside);
    }
  };

  updated() {
    if (this.open) {
      setTimeout(() => document.addEventListener('click', this._handleOutside), 0);
    }
  }

  onMount() {
    this._syncOptions();
    this.onSlotChange('', () => this._syncOptions());
  }

  private _syncOptions() {
    const options = this.querySelectorAll('mui-option') as NodeListOf<any>;
    this._options = Array.from(options).map(o => ({
      value: o.getAttribute('value') || o.textContent?.trim() || '',
      label: o.textContent?.trim() || '',
      disabled: o.hasAttribute('disabled'),
    }));
  }

  private _getLabel() {
    const found = this._options.find(o => o.value === this.value);
    return found?.label || this.placeholder || 'Select...';
  }

  static styles: any = css`
    :host { display: block; position: relative; }
    .wrapper { display: flex; flex-direction: column; gap: var(--mui-space-1, 4px); }
    .label { font-size: var(--mui-text-sm, 0.875rem); font-weight: var(--mui-weight-medium, 500); color: var(--mui-text, #1f2937); }
    .trigger { display: flex; align-items: center; justify-content: space-between; gap: var(--mui-space-2, 8px); padding: var(--mui-space-2, 8px) var(--mui-space-3, 12px); background: var(--mui-surface, #fff); border: 1px solid var(--mui-border, #e5e7eb); border-radius: var(--mui-radius-md, 6px); font-family: inherit; font-size: var(--mui-text-sm, 0.875rem); color: var(--mui-text, #1f2937); cursor: pointer; text-align: left; transition: border-color 100ms, box-shadow 100ms; width: 100%; }
    .trigger:hover:not(:disabled) { border-color: var(--mui-border-strong, #9ca3af); }
    :host([open]) .trigger { border-color: var(--mui-primary, #3b82f6); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15); }
    .trigger:disabled { opacity: 0.5; cursor: not-allowed; }
    .trigger-text { flex: 1; }
    .trigger-text.placeholder { color: var(--mui-text-muted, #9ca3af); }
    .chevron { transition: transform 200ms; color: var(--mui-text-secondary, #6b7280); flex-shrink: 0; }
    :host([open]) .chevron { transform: rotate(180deg); }
    .dropdown { position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: var(--mui-z-dropdown, 1100); background: var(--mui-surface, #fff); border: 1px solid var(--mui-border, #e5e7eb); border-radius: var(--mui-radius-lg, 8px); box-shadow: var(--mui-shadow-lg, 0 8px 24px rgba(0,0,0,0.12)); padding: var(--mui-space-1, 4px); max-height: 260px; overflow-y: auto; opacity: 0; visibility: hidden; transform: translateY(-4px); transition: opacity 100ms, transform 100ms, visibility 100ms; }
    :host([open]) .dropdown { opacity: 1; visibility: visible; transform: translateY(0); }
    .option { display: flex; align-items: center; gap: var(--mui-space-2, 8px); padding: var(--mui-space-2, 6px) var(--mui-space-3, 12px); font-size: var(--mui-text-sm, 0.875rem); color: var(--mui-text, #1f2937); border-radius: var(--mui-radius-md, 6px); cursor: pointer; transition: background 100ms; }
    .option:hover { background: var(--mui-surface-hover, rgba(0,0,0,0.04)); }
    .option.selected { background: var(--mui-primary-subtle, rgba(59,130,246,0.08)); color: var(--mui-primary, #3b82f6); font-weight: 500; }
    .option.disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
    .check { margin-left: auto; color: var(--mui-primary, #3b82f6); }
  `;

  template() {
    const label = this._getLabel();
    const isPlaceholder = !this.value;

    return html`
      <div class="wrapper">
        ${this.label ? html`<label class="label">${this.label}</label>` : ''}
        <button
          class="trigger"
          ?disabled=${this.disabled}
          aria-haspopup="listbox"
          aria-expanded="${this.open}"
          @click=${() => this._toggleOpen()}
        >
          <span class="trigger-text ${isPlaceholder ? 'placeholder' : ''}">${label}</span>
          <mui-icon name="chevron-down" size="sm" class="chevron"></mui-icon>
        </button>
        <div class="dropdown" role="listbox">
          ${this._options.map(opt => html`
            <div
              class="option ${opt.value === this.value ? 'selected' : ''} ${opt.disabled ? 'disabled' : ''}"
              role="option"
              aria-selected="${opt.value === this.value}"
              @click=${() => !opt.disabled && this._select(opt.value)}
            >
              ${opt.label}
              ${opt.value === this.value ? html`<mui-icon name="check" size="sm" class="check"></mui-icon>` : ''}
            </div>
          `)}
        </div>
      </div>
      <slot style="display:none"></slot>
    `;
  }
}

@component({ tag: 'mui-option' })
export class MuiOption extends MiuraElement {
  @property({ type: String, default: '' })
  value!: string;

  @property({ type: Boolean, default: false, reflect: true })
  disabled!: boolean;

  static styles: any = css`:host { display: none; }`;
  template() { return html``; }
}
