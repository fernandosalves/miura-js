import { MiuraElement, html, css, component, property } from '@miurajs/miura-element';

/**
 * Color Picker — choose a color from a palette or hex
 */
@component({ tag: 'mui-color-picker' })
export class MuiColorPicker extends MiuraElement {
  @property({ type: String, default: '#3b82f6' })
  value!: string;

  @property({ type: String, default: '' })
  label = '';

  static styles: any = css`
    :host { display: inline-block; }
    .field { display: flex; flex-direction: column; gap: var(--mui-space-1, 4px); }
    .label { font-size: var(--mui-text-sm, 0.875rem); font-weight: var(--mui-weight-medium, 500); color: var(--mui-text, #1f2937); }
    .row { display: flex; align-items: center; gap: 8px; }
    input { width: 36px; height: 36px; padding: 0; border: 1px solid var(--mui-border, #e5e7eb); border-radius: 6px; cursor: pointer; background: none; }
    .hex { font-size: var(--mui-text-xs, 0.75rem); color: var(--mui-text-secondary, #6b7280); font-family: monospace; }
  `;

  private _onChange(e: any) {
    this.value = e.target.value;
    this.emit('change', { value: this.value });
  }

  template() {
    return html`
      <div class="field">
        ${this.label ? html`<div class="label">${this.label}</div>` : ''}
        <div class="row">
          <input type="color" .value="${this.value}" @input=${(e: any) => this._onChange(e)}>
          <span class="hex">${this.value.toUpperCase()}</span>
        </div>
      </div>
    `;
  }
}
