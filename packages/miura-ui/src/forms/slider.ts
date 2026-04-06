import { MiuraElement, html, css, component, property } from '@miurajs/miura-element';

/**
 * Slider — select a numeric value or range
 */
@component({ tag: 'mui-slider' })
export class MuiSlider extends MiuraElement {
  @property({ type: Number, default: 0 })
  value!: number;

  @property({ type: Number, default: 0 })
  min = 0;

  @property({ type: Number, default: 100 })
  max = 100;

  @property({ type: Number, default: 1 })
  step = 1;

  @property({ type: String, default: '' })
  label = '';

  @property({ type: Boolean, default: false, reflect: true })
  disabled = false;

  static styles: any = css`
    :host { display: block; width: 100%; font-family: inherit; }
    .slider-wrap { display: flex; flex-direction: column; gap: var(--mui-space-1, 4px); }
    .top { display: flex; justify-content: space-between; font-size: var(--mui-text-sm, 0.875rem); color: var(--mui-text-secondary, #6b7280); }
    input { width: 100%; height: 6px; border-radius: 99px; -webkit-appearance: none; background: var(--mui-surface-subtle, #f3f4f6); outline: none; cursor: pointer; }
    input::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; background: var(--mui-primary, #3b82f6); border-radius: 50%; border: 3px solid #fff; box-shadow: var(--mui-shadow-sm, 0 1px 3px rgba(0,0,0,0.1)); cursor: pointer; }
    input:focus::-webkit-slider-thumb { box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15); }
    :host([disabled]) { opacity: 0.5; pointer-events: none; }
  `;

  private _onChange(e: any) {
    this.value = Number(e.target.value);
    this.emit('change', { value: this.value });
  }

  template() {
    return html`
      <div class="slider-wrap">
        ${this.label ? html`
          <div class="top">
            <span>${this.label}</span>
            <span>${this.value}</span>
          </div>
        ` : ''}
        <input 
          type="range" 
          .min="${this.min}" 
          .max="${this.max}" 
          .step="${this.step}" 
          .value="${this.value}" 
          ?disabled=${this.disabled}
          @input=${(e: any) => this._onChange(e)}
        >
      </div>
    `;
  }
}
