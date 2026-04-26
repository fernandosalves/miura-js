import { MiuraElement, css, html } from '@miurajs/miura-element';

export class MuiBadge extends MiuraElement {
  static properties = {
    tone: { type: String, default: 'neutral', reflect: true },
    variant: { type: String, default: 'soft', reflect: true },
  };

  declare tone: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
  declare variant: 'soft' | 'solid' | 'outline';

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      width: max-content;
      min-height: 22px;
      padding: 0 var(--mui-space-3);
      border: 1px solid transparent;
      border-radius: var(--mui-radius-pill);
      font-family: var(--mui-font-sans);
      font-size: var(--mui-text-xs);
      font-weight: var(--mui-weight-medium);
      line-height: 1;
      color: var(--_fg, var(--mui-color-text-muted));
      background: var(--_bg, var(--mui-color-surface-muted));
    }

    :host([tone="accent"]) { --_fg: var(--mui-color-accent); --_bg: var(--mui-color-accent-muted); --_solid: var(--mui-color-accent); }
    :host([tone="success"]) { --_fg: var(--mui-color-success); --_bg: color-mix(in srgb, var(--mui-color-success) 13%, transparent); --_solid: var(--mui-color-success); }
    :host([tone="warning"]) { --_fg: var(--mui-color-warning); --_bg: color-mix(in srgb, var(--mui-color-warning) 14%, transparent); --_solid: var(--mui-color-warning); }
    :host([tone="danger"]) { --_fg: var(--mui-color-danger); --_bg: color-mix(in srgb, var(--mui-color-danger) 13%, transparent); --_solid: var(--mui-color-danger); }

    :host([variant="solid"]) {
      background: var(--_solid, var(--mui-color-text-muted));
      color: #fff;
    }

    :host([variant="outline"]) {
      background: transparent;
      border-color: currentColor;
    }
  `;

  template() {
    return html`<slot></slot>`;
  }
}

if (!customElements.get('mui-badge')) {
  customElements.define('mui-badge', MuiBadge);
}
