import { MiuraElement, html, css, component, property } from '@miurajs/miura-element';

/**
 * KPI Card — stat/metric display card
 *
 * <mui-kpi-card 
 *   label="Total Labs" 
 *   value="12" 
 *   change="+2 this week" 
 *   positive 
 *   icon="folder" 
 *   accent="#ec4899"
 * ></mui-kpi-card>
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
    .card { background: var(--mui-surface, #fff); border: 1px solid var(--mui-border, #e5e7eb); border-radius: var(--mui-radius-xl, 12px); padding: var(--mui-space-4, 16px) var(--mui-space-5, 20px); display: flex; flex-direction: column; gap: var(--mui-space-3, 12px); position: relative; overflow: hidden; }
    .accent-bar { position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--_accent, var(--mui-primary, #3b82f6)); }
    .top { display: flex; align-items: flex-start; justify-content: space-between; }
    .icon-wrap { width: 36px; height: 36px; border-radius: var(--mui-radius-lg, 8px); background: color-mix(in srgb, var(--_accent, var(--mui-primary, #3b82f6)) 12%, transparent); display: flex; align-items: center; justify-content: center; color: var(--_accent, var(--mui-primary, #3b82f6)); }
    .label { font-size: var(--mui-text-xs, 0.75rem); font-weight: var(--mui-weight-medium, 500); color: var(--mui-text-secondary, #6b7280); text-transform: uppercase; letter-spacing: 0.05em; }
    .value { font-size: var(--mui-text-2xl, 1.5rem); font-weight: var(--mui-weight-bold, 700); color: var(--mui-text, #1f2937); margin-top: 4px; }
    .footer { display: flex; align-items: center; gap: 4px; font-size: var(--mui-text-xs, 0.75rem); }
    .change { font-weight: 600; }
    .change.positive { color: var(--mui-success, #10b981); }
    .change.negative { color: var(--mui-error, #ef4444); }
    .change-text { color: var(--mui-text-muted, #9ca3af); }
  `;

  template() {
    const style = this.accent ? `--_accent: ${this.accent}` : '';
    return html`
      <div class="card" style="${style}">
        <div class="accent-bar"></div>
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
          <div class="footer">
            <span class="change ${this.positive ? 'positive' : 'negative'}">${this.change}</span>
            <span class="change-text">from last period</span>
          </div>
        ` : ''}
      </div>
    `;
  }
}
