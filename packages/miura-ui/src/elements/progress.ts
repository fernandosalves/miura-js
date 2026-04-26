import { MiuraElement, css, html } from '@miurajs/miura-element';

export class MuiProgress extends MiuraElement {
  static properties = {
    value: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    label: { type: String, default: '' },
  };

  declare value: number;
  declare max: number;
  declare label: string;

  static styles = css`
    :host {
      display: block;
      font-family: var(--mui-font-sans);
      color: var(--mui-color-text);
    }

    .meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--mui-space-4);
      margin-bottom: var(--mui-space-2);
      font-size: var(--mui-text-sm);
    }

    .track {
      height: 8px;
      border-radius: var(--mui-radius-pill);
      background: var(--mui-color-surface-muted);
      overflow: hidden;
    }

    .bar {
      height: 100%;
      width: var(--_pct);
      border-radius: inherit;
      background: var(--mui-color-accent);
      transition: width var(--mui-duration-base) var(--mui-ease-standard);
    }
  `;

  template() {
    const pct = Math.max(0, Math.min(100, (this.value / Math.max(1, this.max)) * 100));
    this.style.setProperty('--_pct', `${pct}%`);

    return html`
      <div class="meta">
        <span>${this.label}</span>
        <span>${Math.round(pct)}%</span>
      </div>
      <div class="track" part="track" role="progressbar" aria-valuemin="0" aria-valuemax=${this.max} aria-valuenow=${this.value}>
        <div class="bar" part="bar"></div>
      </div>
    `;
  }
}

if (!customElements.get('mui-progress')) {
  customElements.define('mui-progress', MuiProgress);
}
