import { MiuraElement, html, css, component, property, state } from '@miurajs/miura-element';

/**
 * Form Field Wrapper — label + helper/error text around any input
 *
 * <mui-field label="Email" required helper="We'll never share your email">
 *   <mui-input type="email"></mui-input>
 * </mui-field>
 */
@component({ tag: 'mui-field' })
export class MuiField extends MiuraElement {
  @property({ type: String, default: '' })
  label!: string;

  @property({ type: String, default: '' })
  helper!: string;

  @property({ type: String, default: '' })
  error!: string;

  @property({ type: Boolean, default: false, reflect: true })
  required!: boolean;

  @property({ type: Boolean, default: false, reflect: true })
  disabled!: boolean;

  static styles: any = css`
    :host { display: block; }

    .field { display: flex; flex-direction: column; gap: var(--mui-space-1, 4px); }

    .label-row {
      display: flex;
      align-items: center;
      gap: var(--mui-space-1, 4px);
      font-size: var(--mui-text-sm, 0.875rem);
      font-weight: var(--mui-weight-medium, 500);
      color: var(--mui-text, #1f2937);
    }

    :host([disabled]) .label-row { color: var(--mui-text-muted, #9ca3af); }

    .required-star {
      color: var(--mui-error, #ef4444);
      font-size: 0.875em;
    }

    .helper {
      font-size: var(--mui-text-xs, 0.75rem);
      color: var(--mui-text-secondary, #6b7280);
      line-height: 1.4;
    }

    .error-msg {
      font-size: var(--mui-text-xs, 0.75rem);
      color: var(--mui-error, #ef4444);
      line-height: 1.4;
      display: flex;
      align-items: center;
      gap: 4px;
    }
  `;

  template() {
    return html`
      <div class="field">
        ${this.label ? html`
          <label class="label-row">
            ${this.label}
            ${this.required ? html`<span class="required-star" aria-hidden="true">*</span>` : ''}
          </label>
        ` : ''}
        <slot></slot>
        ${this.error ? html`
          <div class="error-msg" role="alert">
            <mui-icon name="alert-circle" size="xs"></mui-icon>
            ${this.error}
          </div>
        ` : (this.helper ? html`<div class="helper">${this.helper}</div>` : '')}
      </div>
    `;
  }
}

/**
 * Textarea — multiline text input
 *
 * <mui-textarea label="Description" rows="4" counter maxlength="500"></mui-textarea>
 */
@component({ tag: 'mui-textarea' })
export class MuiTextarea extends MiuraElement {
  @property({ type: String, default: '' })
  value!: string;

  @property({ type: String, default: '' })
  placeholder!: string;

  @property({ type: String, default: '' })
  label!: string;

  @property({ type: Number, default: 4 })
  rows!: number;

  @property({ type: Number, default: 0 })
  maxlength!: number;

  @property({ type: Boolean, default: false })
  counter!: boolean;

  @property({ type: Boolean, default: false, reflect: true })
  disabled!: boolean;

  @property({ type: Boolean, default: false, reflect: true })
  readonly!: boolean;

  @property({ type: String, default: 'error' })
  status!: 'default' | 'error' | 'success';

  @property({ type: String, default: 'vertical', reflect: true })
  resize!: 'none' | 'vertical' | 'horizontal' | 'both';

  static styles: any = css`
    :host { display: block; width: 100%; }

    .wrapper { display: flex; flex-direction: column; gap: var(--mui-space-1, 4px); }

    .label {
      font-size: var(--mui-text-sm, 0.875rem);
      font-weight: var(--mui-weight-medium, 500);
      color: var(--mui-text, #1f2937);
    }

    textarea {
      width: 100%;
      box-sizing: border-box;
      padding: var(--mui-space-2, 8px) var(--mui-space-3, 12px);
      font-family: inherit;
      font-size: var(--mui-text-sm, 0.875rem);
      color: var(--mui-text, #1f2937);
      background: var(--mui-input-bg, var(--mui-surface, #fff));
      border: 1px solid var(--mui-input-border, var(--mui-border, #e5e7eb));
      border-radius: var(--mui-radius-md, 6px);
      outline: none;
      transition: border-color var(--mui-duration-fast, 100ms) ease,
                  box-shadow var(--mui-duration-fast, 100ms) ease;
      resize: var(--_resize, vertical);
      line-height: 1.5;
    }

    :host([resize="none"]) { --_resize: none; }
    :host([resize="horizontal"]) { --_resize: horizontal; }
    :host([resize="both"]) { --_resize: both; }

    textarea:focus {
      border-color: var(--mui-primary, #3b82f6);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    textarea:disabled { opacity: 0.5; cursor: not-allowed; }

    .counter {
      text-align: right;
      font-size: var(--mui-text-xs, 0.75rem);
      color: var(--mui-text-muted, #9ca3af);
    }
  `;

  private _handleInput(e: Event) {
    this.value = (e.target as HTMLTextAreaElement).value;
    this.emit('change', { value: this.value });
  }

  template() {
    return html`
      <div class="wrapper">
        ${this.label ? html`<label class="label">${this.label}</label>` : ''}
        <textarea
          placeholder="${this.placeholder}"
          rows="${this.rows}"
          .value="${this.value || ''}"
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          maxlength="${this.maxlength || ''}"
          @input=${(e: Event) => this._handleInput(e)}
        ></textarea>
        ${this.counter ? html`
          <div class="counter">${this.value.length}${this.maxlength ? `/${this.maxlength}` : ''}</div>
        ` : ''}
      </div>
    `;
  }
}

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
    // Collect mui-option children
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

    .label {
      font-size: var(--mui-text-sm, 0.875rem);
      font-weight: var(--mui-weight-medium, 500);
      color: var(--mui-text, #1f2937);
    }

    .trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--mui-space-2, 8px);
      padding: var(--mui-space-2, 8px) var(--mui-space-3, 12px);
      background: var(--mui-surface, #fff);
      border: 1px solid var(--mui-border, #e5e7eb);
      border-radius: var(--mui-radius-md, 6px);
      font-family: inherit;
      font-size: var(--mui-text-sm, 0.875rem);
      color: var(--mui-text, #1f2937);
      cursor: pointer;
      text-align: left;
      transition: border-color var(--mui-duration-fast, 100ms) ease,
                  box-shadow var(--mui-duration-fast, 100ms) ease;
      width: 100%;
    }

    .trigger:hover:not(:disabled) { border-color: var(--mui-border-strong, #9ca3af); }

    :host([open]) .trigger {
      border-color: var(--mui-primary, #3b82f6);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    .trigger:disabled { opacity: 0.5; cursor: not-allowed; }

    .trigger-text { flex: 1; }
    .trigger-text.placeholder { color: var(--mui-text-muted, #9ca3af); }

    .chevron {
      transition: transform 200ms ease;
      color: var(--mui-text-secondary, #6b7280);
      flex-shrink: 0;
    }

    :host([open]) .chevron { transform: rotate(180deg); }

    .dropdown {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      z-index: var(--mui-z-dropdown, 1100);
      background: var(--mui-surface, #fff);
      border: 1px solid var(--mui-border, #e5e7eb);
      border-radius: var(--mui-radius-lg, 8px);
      box-shadow: var(--mui-shadow-lg, 0 8px 24px rgba(0,0,0,0.12));
      padding: var(--mui-space-1, 4px);
      max-height: 260px;
      overflow-y: auto;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-4px);
      transition: opacity var(--mui-duration-fast, 100ms) ease,
                  transform var(--mui-duration-fast, 100ms) ease,
                  visibility var(--mui-duration-fast, 100ms) ease;
    }

    :host([open]) .dropdown {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .option {
      display: flex;
      align-items: center;
      gap: var(--mui-space-2, 8px);
      padding: var(--mui-space-2, 6px) var(--mui-space-3, 12px);
      font-size: var(--mui-text-sm, 0.875rem);
      color: var(--mui-text, #1f2937);
      border-radius: var(--mui-radius-md, 6px);
      cursor: pointer;
      transition: background var(--mui-duration-fast, 100ms) ease;
    }

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

/**
 * Checkbox
 *
 * <mui-checkbox checked>I agree</mui-checkbox>
 * <mui-checkbox indeterminate>Select all</mui-checkbox>
 */
@component({ tag: 'mui-checkbox' })
export class MuiCheckbox extends MiuraElement {
  @property({ type: Boolean, default: false, reflect: true })
  checked!: boolean;

  @property({ type: Boolean, default: false, reflect: true })
  indeterminate!: boolean;

  @property({ type: Boolean, default: false, reflect: true })
  disabled!: boolean;

  @property({ type: String, default: '' })
  value!: string;

  @property({ type: String, default: 'md' })
  size!: 'sm' | 'md';

  static styles: any = css`
    :host { display: inline-flex; }

    .checkbox-wrap {
      display: inline-flex;
      align-items: center;
      gap: var(--mui-space-2, 8px);
      cursor: pointer;
      user-select: none;
    }

    :host([disabled]) .checkbox-wrap { cursor: not-allowed; opacity: 0.5; }

    .box {
      width: var(--_sz, 18px);
      height: var(--_sz, 18px);
      border: 2px solid var(--mui-border-strong, #9ca3af);
      border-radius: var(--mui-radius-sm, 4px);
      background: var(--mui-surface, #fff);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: border-color var(--mui-duration-fast, 100ms) ease,
                  background var(--mui-duration-fast, 100ms) ease;
    }

    :host([size="sm"]) { --_sz: 14px; }

    :host([checked]) .box,
    :host([indeterminate]) .box {
      background: var(--mui-primary, #3b82f6);
      border-color: var(--mui-primary, #3b82f6);
    }

    .check-icon { color: white; display: none; }
    :host([checked]) .check-icon { display: block; }

    .indeterminate-icon { color: white; display: none; }
    :host([indeterminate]:not([checked])) .indeterminate-icon { display: block; }

    .label {
      font-size: var(--mui-text-sm, 0.875rem);
      color: var(--mui-text, #1f2937);
    }
  `;

  private _toggle() {
    if (this.disabled) return;
    if (this.indeterminate) { this.indeterminate = false; this.checked = true; }
    else { this.checked = !this.checked; }
    this.emit('change', { checked: this.checked, value: this.value }, { bubbles: true });
  }

  template() {
    return html`
      <div class="checkbox-wrap" role="checkbox" aria-checked="${this.indeterminate ? 'mixed' : this.checked}" tabindex="0"
        @click=${() => this._toggle()}
        @keydown=${(e: KeyboardEvent) => (e.key === ' ' || e.key === 'Enter') && this._toggle()}
      >
        <div class="box">
          <svg class="check-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg class="indeterminate-icon" width="10" height="2" viewBox="0 0 10 2" fill="none">
            <path d="M1 1h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <span class="label"><slot></slot></span>
      </div>
    `;
  }
}

/**
 * Switch — toggle switch
 *
 * <mui-switch checked>Dark Mode</mui-switch>
 */
@component({ tag: 'mui-switch' })
export class MuiSwitch extends MiuraElement {
  @property({ type: Boolean, default: false, reflect: true })
  checked!: boolean;

  @property({ type: Boolean, default: false, reflect: true })
  disabled!: boolean;

  @property({ type: String, default: 'md' })
  size!: 'sm' | 'md';

  static styles: any = css`
    :host { display: inline-flex; }

    .switch-wrap {
      display: inline-flex;
      align-items: center;
      gap: var(--mui-space-2, 8px);
      cursor: pointer;
      user-select: none;
    }

    :host([disabled]) .switch-wrap { cursor: not-allowed; opacity: 0.5; }

    .track {
      position: relative;
      width: var(--_track-w, 40px);
      height: var(--_track-h, 22px);
      background: var(--mui-border-strong, #d1d5db);
      border-radius: var(--mui-radius-full, 999px);
      transition: background var(--mui-duration-fast, 100ms) ease;
      flex-shrink: 0;
    }

    :host([size="sm"]) { --_track-w: 32px; --_track-h: 18px; }

    :host([checked]) .track { background: var(--mui-primary, #3b82f6); }

    .thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      width: calc(var(--_track-h, 22px) - 4px);
      height: calc(var(--_track-h, 22px) - 4px);
      background: white;
      border-radius: 50%;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      transition: transform var(--mui-duration-fast, 100ms) ease;
    }

    :host([checked]) .thumb {
      transform: translateX(calc(var(--_track-w, 40px) - var(--_track-h, 22px)));
    }

    .label { font-size: var(--mui-text-sm, 0.875rem); color: var(--mui-text, #1f2937); }
  `;

  private _toggle() {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.emit('change', { checked: this.checked }, { bubbles: true });
  }

  template() {
    return html`
      <div class="switch-wrap" role="switch" aria-checked="${this.checked}" tabindex="0"
        @click=${() => this._toggle()}
        @keydown=${(e: KeyboardEvent) => (e.key === ' ' || e.key === 'Enter') && this._toggle()}
      >
        <div class="track"><div class="thumb"></div></div>
        <span class="label"><slot></slot></span>
      </div>
    `;
  }
}

/**
 * Radio Group + Radio
 *
 * <mui-radio-group label="Plan" value="pro" @change=${e => this.plan = e.detail.value}>
 *   <mui-radio value="free">Free</mui-radio>
 *   <mui-radio value="pro">Pro</mui-radio>
 * </mui-radio-group>
 */
@component({ tag: 'mui-radio-group' })
export class MuiRadioGroup extends MiuraElement {
  @property({ type: String, default: '' })
  value!: string;

  @property({ type: String, default: '' })
  label!: string;

  @property({ type: String, default: 'vertical' })
  direction!: 'horizontal' | 'vertical';

  static styles: any = css`
    :host { display: block; }
    .group { display: flex; flex-direction: column; gap: var(--mui-space-1, 4px); }
    .label { font-size: var(--mui-text-sm, 0.875rem); font-weight: var(--mui-weight-medium, 500); color: var(--mui-text, #1f2937); margin-bottom: var(--mui-space-2, 8px); }
    .radios { display: flex; flex-direction: var(--_dir, column); gap: var(--mui-space-2, 8px); flex-wrap: wrap; }
  `;

  onMount() {
    this.addEventListener('radio-select', (e: any) => {
      this.value = e.detail.value;
      this.emit('change', { value: this.value });
      this._updateRadios();
    });
    this._updateRadios();
  }

  private _updateRadios() {
    const radios = this.querySelectorAll('mui-radio') as NodeListOf<any>;
    radios.forEach(r => {
      r.checked = r.value === this.value;
    });
  }

  template() {
    const dir = this.direction === 'horizontal' ? 'row' : 'column';
    return html`
      <div class="group">
        ${this.label ? html`<div class="label">${this.label}</div>` : ''}
        <div class="radios" style="flex-direction: ${dir}">
          <slot></slot>
        </div>
      </div>
    `;
  }
}

@component({ tag: 'mui-radio' })
export class MuiRadio extends MiuraElement {
  @property({ type: String, default: '' })
  value!: string;

  @property({ type: Boolean, default: false, reflect: true })
  checked!: boolean;

  @property({ type: Boolean, default: false, reflect: true })
  disabled!: boolean;

  static styles: any = css`
    :host { display: block; }

    .radio-wrap {
      display: inline-flex;
      align-items: center;
      gap: var(--mui-space-2, 8px);
      cursor: pointer;
      user-select: none;
    }

    :host([disabled]) .radio-wrap { cursor: not-allowed; opacity: 0.5; }

    .circle {
      width: 18px;
      height: 18px;
      border: 2px solid var(--mui-border-strong, #9ca3af);
      border-radius: 50%;
      background: var(--mui-surface, #fff);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: border-color var(--mui-duration-fast, 100ms) ease;
    }

    :host([checked]) .circle { border-color: var(--mui-primary, #3b82f6); }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--mui-primary, #3b82f6);
      transform: scale(0);
      transition: transform var(--mui-duration-fast, 100ms) ease;
    }

    :host([checked]) .dot { transform: scale(1); }

    .label { font-size: var(--mui-text-sm, 0.875rem); color: var(--mui-text, #1f2937); }
  `;

  private _select() {
    if (this.disabled || this.checked) return;
    this.emit('radio-select', { value: this.value }, { bubbles: true, composed: true });
  }

  template() {
    return html`
      <div class="radio-wrap" role="radio" aria-checked="${this.checked}" tabindex="0"
        @click=${() => this._select()}
        @keydown=${(e: KeyboardEvent) => (e.key === ' ' || e.key === 'Enter') && this._select()}
      >
        <div class="circle"><div class="dot"></div></div>
        <span class="label"><slot></slot></span>
      </div>
    `;
  }
}

/**
 * Stat Card — KPI display card (used in dashboard stories)
 *
 * <mui-stat-card label="Total Labs" value="12" change="+2 this week" positive icon="folder" accent="#ec4899">
 * </mui-stat-card>
 */
@component({ tag: 'mui-kpi-card' })
export class MuiKpiCard extends MiuraElement {
  @property({ type: String, default: '' })
  label!: string;

  @property({ type: String, default: '0' })
  value!: string;

  @property({ type: String, default: '' })
  change!: string;

  @property({ type: Boolean, default: false })
  positive!: boolean;

  @property({ type: String, default: '' })
  icon!: string;

  @property({ type: String, default: '' })
  accent!: string;

  static styles: any = css`
    :host { display: block; }

    .card {
      background: var(--mui-surface, #fff);
      border: 1px solid var(--mui-border, #e5e7eb);
      border-radius: var(--mui-radius-xl, 12px);
      padding: var(--mui-space-4, 16px) var(--mui-space-5, 20px);
      display: flex;
      flex-direction: column;
      gap: var(--mui-space-3, 12px);
      position: relative;
      overflow: hidden;
    }

    .accent-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: var(--_accent, var(--mui-primary, #3b82f6));
    }

    .top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }

    .icon-wrap {
      width: 36px;
      height: 36px;
      border-radius: var(--mui-radius-lg, 8px);
      background: color-mix(in srgb, var(--_accent, var(--mui-primary, #3b82f6)) 12%, transparent);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--_accent, var(--mui-primary, #3b82f6));
    }

    .label {
      font-size: var(--mui-text-xs, 0.75rem);
      font-weight: var(--mui-weight-medium, 500);
      color: var(--mui-text-secondary, #6b7280);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .value {
      font-size: var(--mui-text-2xl, 1.5rem);
      font-weight: var(--mui-weight-bold, 700);
      color: var(--mui-text, #1f2937);
      line-height: 1;
    }

    .change {
      font-size: var(--mui-text-xs, 0.75rem);
      color: var(--mui-text-muted, #9ca3af);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .change.up { color: var(--mui-success, #22c55e); }
    .change.down { color: var(--mui-error, #ef4444); }
  `;

  template() {
    const accentStyle = this.accent ? `--_accent: ${this.accent};` : '';
    return html`
      <div class="card" style="${accentStyle}">
        ${this.accent ? html`<div class="accent-bar"></div>` : ''}
        <div class="top">
          <div class="label">${this.label}</div>
          ${this.icon ? html`
            <div class="icon-wrap">
              <mui-icon name="${this.icon}" size="sm"></mui-icon>
            </div>
          ` : ''}
        </div>
        <div class="value">${this.value}</div>
        ${this.change ? html`
          <div class="change ${this.positive ? 'up' : ''}">
            ${this.positive ? html`<mui-icon name="trending-up" size="xs"></mui-icon>` : ''}
            ${this.change}
          </div>
        ` : ''}
      </div>
    `;
  }
}

/**
 * Persona — user display with avatar, name, and role
 *
 * <mui-persona name="John Doe" secondary="Software Engineer" avatar="/user.jpg"></mui-persona>
 */
@component({ tag: 'mui-persona' })
export class MuiPersona extends MiuraElement {
  @property({ type: String, default: '' })
  name!: string;

  @property({ type: String, default: '' })
  secondary!: string;

  @property({ type: String, default: '' })
  tertiary!: string;

  @property({ type: String, default: '' })
  avatar!: string;

  @property({ type: String, default: 'online' })
  status!: 'none' | 'online' | 'offline' | 'busy' | 'away';

  @property({ type: String, default: 'md' })
  size!: 'sm' | 'md' | 'lg';

  @property({ type: Boolean, default: false })
  clickable!: boolean;

  static styles: any = css`
    :host { display: block; }

    .persona {
      display: flex;
      align-items: center;
      gap: var(--mui-space-3, 12px);
      padding: var(--mui-space-2, 8px);
      border-radius: var(--mui-radius-lg, 8px);
      transition: background var(--mui-duration-fast, 100ms) ease;
    }

    :host([clickable]) .persona { cursor: pointer; }
    :host([clickable]) .persona:hover { background: var(--mui-surface-hover, rgba(0,0,0,0.04)); }

    .info { flex: 1; min-width: 0; }

    .name {
      font-size: var(--mui-text-sm, 0.875rem);
      font-weight: var(--mui-weight-medium, 500);
      color: var(--mui-text, #1f2937);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .secondary {
      font-size: var(--mui-text-xs, 0.75rem);
      color: var(--mui-text-secondary, #6b7280);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .tertiary {
      font-size: var(--mui-text-xs, 0.75rem);
      color: var(--mui-text-muted, #9ca3af);
    }

    .actions { display: flex; align-items: center; gap: var(--mui-space-1, 4px); flex-shrink: 0; }
  `;

  template() {
    return html`
      <div class="persona" @click=${() => this.clickable && this.emit('click')}>
        <mui-avatar
          name="${this.name}"
          src="${this.avatar}"
          size="${this.size}"
          status="${this.status !== 'none' ? this.status : ''}"
        ></mui-avatar>
        <div class="info">
          <div class="name">${this.name}</div>
          ${this.secondary ? html`<div class="secondary">${this.secondary}</div>` : ''}
          ${this.tertiary ? html`<div class="tertiary">${this.tertiary}</div>` : ''}
        </div>
        <div class="actions"><slot name="action"></slot></div>
      </div>
    `;
  }
}
