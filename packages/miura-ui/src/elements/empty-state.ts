import { MiuraElement, css, html } from '@miurajs/miura-element';

export class MuiEmptyState extends MiuraElement {
  static properties = {
    icon: { type: String, default: 'spark' },
    heading: { type: String, default: '' },
    description: { type: String, default: '' },
  };

  declare icon: string;
  declare heading: string;
  declare description: string;

  static styles = css`
    :host {
      display: grid;
      place-items: center;
      min-height: 220px;
      padding: var(--mui-space-8);
      color: var(--mui-color-text);
      font-family: var(--mui-font-sans);
      text-align: center;
    }

    .content {
      max-width: 360px;
      display: grid;
      justify-items: center;
      gap: var(--mui-space-4);
    }

    .icon {
      width: 48px;
      height: 48px;
      display: grid;
      place-items: center;
      border: 1px solid var(--mui-color-border);
      border-radius: var(--mui-radius-lg);
      background: var(--mui-color-surface-muted);
      color: var(--mui-color-accent);
    }

    h2,
    p {
      margin: 0;
    }

    h2 {
      font-size: var(--mui-text-xl);
    }

    p {
      color: var(--mui-color-text-muted);
      line-height: 1.5;
    }

    .actions {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--mui-space-3);
      flex-wrap: wrap;
    }
  `;

  template() {
    return html`
      <div class="content" part="content">
        <div class="icon" part="icon"><mui-icon name=${this.icon} size="24"></mui-icon></div>
        <h2 part="heading">${this.heading}</h2>
        ${this.description ? html`<p part="description">${this.description}</p>` : ''}
        <div class="actions" part="actions"><slot name="actions"></slot></div>
      </div>
    `;
  }
}

if (!customElements.get('mui-empty-state')) {
  customElements.define('mui-empty-state', MuiEmptyState);
}
