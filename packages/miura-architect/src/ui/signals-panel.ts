import { MiuraElement, css, html } from '@miurajs/miura-element';
import type { SignalInfo } from '../types.js';

export class MiuraArchitectSignalsPanel extends MiuraElement {
  static properties = {
    signals: { type: Array, default: () => [] },
    selectedId: { type: String, default: '' },
  };

  declare signals: SignalInfo[];
  declare selectedId: string;

  static styles = css`
    :host { display: block; padding: var(--mui-space-3); }
    .list { display: grid; gap: var(--mui-space-2); }
    .row {
      border: 1px solid var(--mui-color-border);
      border-radius: var(--mui-radius-md);
      padding: var(--mui-space-2) var(--mui-space-3);
      font-size: var(--mui-text-sm);
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--mui-color-surface);
    }
    .row.active { border-color: var(--mui-color-accent); background: var(--mui-color-accent-muted); }
    .muted { color: var(--mui-color-text-muted); }
  `;

  private formatValue(value: unknown): string {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    if (typeof value === 'object') return '{...}';
    return String(value);
  }

  template() {
    return html`
      <div class="list">
        ${this.signals.map((signal) => html`
          <button class="row ${this.selectedId === signal.id ? 'active' : ''}" @click=${() =>
            this.emit('select', { id: signal.id }, { bubbles: true, composed: true })}>
            <span>${signal.label ?? signal.id}</span>
            <span class="muted">${this.formatValue(signal.value)}</span>
          </button>
        `)}
      </div>
    `;
  }
}

if (!customElements.get('miura-architect-signals-panel')) {
  customElements.define('miura-architect-signals-panel', MiuraArchitectSignalsPanel);
}
