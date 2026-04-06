import { MiuraElement, html, css, component, property } from '@miurajs/miura-element';

/**
 * Checkbox — standard checkbox for forms
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
    .checkbox-wrap { display: inline-flex; align-items: center; gap: var(--mui-space-2, 8px); cursor: pointer; user-select: none; }
    :host([disabled]) .checkbox-wrap { cursor: not-allowed; opacity: 0.5; }
    .box { width: var(--_sz, 18px); height: var(--_sz, 18px); border: 2px solid var(--mui-border-strong, #9ca3af); border-radius: var(--mui-radius-sm, 4px); background: var(--mui-surface, #fff); display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: border-color 100ms, background 100ms; }
    :host([size="sm"]) { --_sz: 14px; }
    :host([checked]) .box, :host([indeterminate]) .box { background: var(--mui-primary, #3b82f6); border-color: var(--mui-primary, #3b82f6); }
    .check-icon, .indeterminate-icon { color: white; display: none; }
    :host([checked]) .check-icon { display: block; }
    :host([indeterminate]:not([checked])) .indeterminate-icon { display: block; }
    .label { font-size: var(--mui-text-sm, 0.875rem); color: var(--mui-text, #1f2937); }
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
