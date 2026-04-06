import { MiuraElement, html, css, component, property } from '@miurajs/miura-element';

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
    .radio-wrap { display: inline-flex; align-items: center; gap: var(--mui-space-2, 8px); cursor: pointer; user-select: none; }
    :host([disabled]) .radio-wrap { cursor: not-allowed; opacity: 0.5; }
    .circle { width: 18px; height: 18px; border: 2px solid var(--mui-border-strong, #9ca3af); border-radius: 50%; background: var(--mui-surface, #fff); display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: border-color 100ms; }
    :host([checked]) .circle { border-color: var(--mui-primary, #3b82f6); }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--mui-primary, #3b82f6); transform: scale(0); transition: transform 100ms; }
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
