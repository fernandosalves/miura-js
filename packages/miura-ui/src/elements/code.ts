import { MiuraElement, css, html } from '@miurajs/miura-element';

export class MuiCode extends MiuraElement {
  static properties = {
    block: { type: Boolean, default: false, reflect: true },
    tone: { type: String, default: 'neutral', reflect: true },
  };

  declare block: boolean;
  declare tone: 'neutral' | 'accent' | 'danger';

  static styles = css`
    :host {
      display: inline;
      font-family: var(--mui-font-mono);
      font-size: var(--mui-text-sm);
      color: var(--mui-color-text);
    }

    :host([block]) {
      display: block;
    }

    code,
    pre {
      margin: 0;
      border: 1px solid var(--mui-color-border);
      border-radius: var(--mui-radius-sm);
      background: var(--mui-color-surface-muted);
      color: inherit;
      font: inherit;
    }

    code {
      padding: 0.12rem 0.35rem;
    }

    pre {
      overflow: auto;
      padding: var(--mui-space-4);
      line-height: 1.55;
      white-space: pre-wrap;
    }

    :host([tone="accent"]) code,
    :host([tone="accent"]) pre {
      border-color: color-mix(in srgb, var(--mui-color-accent) 34%, var(--mui-color-border));
      background: var(--mui-color-accent-muted);
    }

    :host([tone="danger"]) code,
    :host([tone="danger"]) pre {
      border-color: color-mix(in srgb, var(--mui-color-danger) 38%, var(--mui-color-border));
      color: var(--mui-color-danger);
    }
  `;

  template() {
    return this.block
      ? html`<pre part="block"><slot></slot></pre>`
      : html`<code part="inline"><slot></slot></code>`;
  }
}

if (!customElements.get('mui-code')) {
  customElements.define('mui-code', MuiCode);
}
