import { MiuraElement, css, html } from '@miurajs/miura-element';
import '../elements/button.js';
import '../elements/icon.js';

export interface CommandBarAction {
  id: string;
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
}

export class MuiCommandBar extends MiuraElement {
  static properties = {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    actions: { type: Array, default: () => [] },
  };

  declare title: string;
  declare subtitle: string;
  declare actions: CommandBarAction[];

  static styles = css`
    :host {
      display: block;
      color: var(--mui-color-text);
      font-family: var(--mui-font-sans);
    }

    .bar {
      min-height: var(--mui-toolbar-height);
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: var(--mui-space-4);
      padding: var(--mui-space-3) var(--mui-space-4);
      border: 1px solid var(--mui-color-border);
      border-radius: var(--mui-radius-lg);
      background: color-mix(in srgb, var(--mui-color-surface) 92%, transparent);
      box-shadow: var(--mui-shadow-sm);
      backdrop-filter: blur(12px);
    }

    .identity {
      min-width: 0;
      display: flex;
      align-items: center;
      gap: var(--mui-space-3);
    }

    .titles {
      min-width: 0;
      display: grid;
      gap: 2px;
    }

    h2,
    p {
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    h2 {
      font-size: var(--mui-text-lg);
      font-weight: var(--mui-weight-semibold);
    }

    p {
      color: var(--mui-color-text-muted);
      font-size: var(--mui-text-sm);
    }

    .actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--mui-space-2);
      flex-wrap: wrap;
    }

    @media (max-width: 720px) {
      .bar {
        grid-template-columns: 1fr;
        align-items: start;
      }

      .actions {
        justify-content: flex-start;
      }
    }
  `;

  private run(action: CommandBarAction): void {
    if (action.disabled) return;
    this.emit('action', { action }, { bubbles: true, composed: true });
  }

  template() {
    return html`
      <header class="bar" part="bar">
        <div class="identity" part="identity">
          <slot name="icon"></slot>
          <div class="titles">
            <slot name="title"><h2>${this.title}</h2></slot>
            <slot name="subtitle">${this.subtitle ? html`<p>${this.subtitle}</p>` : ''}</slot>
          </div>
        </div>
        <div class="actions" part="actions">
          <slot name="actions">
            ${(this.actions ?? []).map((action) => html`
              <mui-button
                size="sm"
                variant=${action.variant ?? 'secondary'}
                ?disabled=${Boolean(action.disabled)}
                @click=${() => this.run(action)}
              >
                ${action.icon ? html`<mui-icon slot="icon-start" name=${action.icon}></mui-icon>` : ''}
                ${action.label}
              </mui-button>
            `)}
          </slot>
        </div>
      </header>
    `;
  }
}

if (!customElements.get('mui-command-bar')) {
  customElements.define('mui-command-bar', MuiCommandBar);
}
