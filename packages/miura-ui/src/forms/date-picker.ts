import { MiuraElement, html, css, component, property } from '@miurajs/miura-element';

/**
 * Date Picker — choose a date using a calendar interface
 */
@component({ tag: 'mui-date-picker' })
export class MuiDatePicker extends MiuraElement {
  @property({ type: String, default: '' })
  value!: string;

  @property({ type: String, default: '' })
  label = '';

  @property({ type: Boolean, default: false, reflect: true })
  disabled = false;

  static styles: any = css`
    :host { display: block; width: 100%; }
    .field { display: flex; flex-direction: column; gap: var(--mui-space-1, 4px); }
    .label { font-size: var(--mui-text-sm, 0.875rem); font-weight: var(--mui-weight-medium, 500); color: var(--mui-text, #1f2937); }
    input { 
      padding: var(--mui-space-2, 8px) var(--mui-space-3, 12px);
      background: var(--mui-surface, #fff);
      border: 1px solid var(--mui-border, #e5e7eb);
      border-radius: var(--mui-radius-md, 6px);
      font-family: inherit;
      font-size: var(--mui-text-sm, 0.875rem);
      color: var(--mui-text, #1f2937);
      width: 100%;
      box-sizing: border-box;
      outline: none;
    }
    input:focus { border-color: var(--mui-primary, #3b82f6); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15); }
  `;

  private _onChange(e: any) {
    this.value = e.target.value;
    this.emit('change', { value: this.value });
  }

  template() {
    return html`
      <div class="field">
        ${this.label ? html`<div class="label">${this.label}</div>` : ''}
        <input 
          type="date" 
          .value="${this.value || ''}" 
          ?disabled=${this.disabled}
          @change=${(e: any) => this._onChange(e)}
        >
      </div>
    `;
  }
}
