import { MiuraElement, css, html } from '@miurajs/miura-element';
import '../elements/badge.js';
import '../elements/button.js';
import '../elements/icon.js';

export interface NotificationItem {
  id: string;
  title: string;
  description?: string;
  time?: string;
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
  read?: boolean;
}

export class MuiNotificationCenter extends MiuraElement {
  static properties = {
    items: { type: Array, default: () => [] },
    open: { type: Boolean, default: false, reflect: true },
  };

  declare items: NotificationItem[];
  declare open: boolean;

  static styles = css`
    :host {
      display: inline-block;
      position: relative;
      color: var(--mui-color-text);
      font-family: var(--mui-font-sans);
    }

    .trigger {
      position: relative;
    }

    .count {
      position: absolute;
      top: -6px;
      right: -6px;
      min-width: 16px;
      height: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--mui-radius-pill);
      background: var(--mui-color-danger);
      color: white;
      font-size: 10px;
      font-weight: var(--mui-weight-semibold);
      line-height: 1;
    }

    .panel {
      display: none;
      position: absolute;
      top: calc(100% + var(--mui-space-2));
      right: 0;
      z-index: 20;
      width: min(360px, calc(100vw - 32px));
      border: 1px solid var(--mui-color-border);
      border-radius: var(--mui-radius-lg);
      background: var(--mui-color-surface);
      box-shadow: var(--mui-shadow-lg);
      overflow: hidden;
    }

    :host([open]) .panel {
      display: block;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--mui-space-3);
      padding: var(--mui-space-4);
      border-bottom: 1px solid var(--mui-color-border);
    }

    h3,
    p {
      margin: 0;
    }

    h3 {
      font-size: var(--mui-text-md);
      font-weight: var(--mui-weight-semibold);
    }

    .list {
      max-height: 360px;
      overflow: auto;
    }

    .item {
      display: grid;
      gap: var(--mui-space-2);
      width: 100%;
      padding: var(--mui-space-4);
      border: 0;
      border-bottom: 1px solid var(--mui-color-border);
      border-left: 3px solid transparent;
      background: var(--mui-color-surface);
      color: var(--mui-color-text);
      cursor: pointer;
      font: inherit;
      text-align: left;
    }

    .item:hover {
      background: var(--mui-color-surface-hover);
    }

    .item.unread {
      border-left-color: var(--mui-color-accent);
      background: color-mix(in srgb, var(--mui-color-accent-muted) 38%, var(--mui-color-surface));
    }

    .item[data-tone="success"] { border-left-color: var(--mui-color-success); }
    .item[data-tone="warning"] { border-left-color: var(--mui-color-warning); }
    .item[data-tone="danger"] { border-left-color: var(--mui-color-danger); }

    .meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--mui-space-2);
    }

    .description,
    .time,
    .empty {
      color: var(--mui-color-text-muted);
      font-size: var(--mui-text-sm);
      line-height: 1.45;
    }

    .empty {
      padding: var(--mui-space-5);
    }
  `;

  private get unread(): number {
    return (this.items ?? []).filter((item) => !item.read).length;
  }

  private toggle(): void {
    this.open = !this.open;
    this.emit('open-change', { open: this.open }, { bubbles: true, composed: true });
  }

  private select(item: NotificationItem): void {
    this.emit('notification-select', { item }, { bubbles: true, composed: true });
  }

  private markAllRead(): void {
    this.items = (this.items ?? []).map((item) => ({ ...item, read: true }));
    this.emit('mark-all-read', { items: this.items }, { bubbles: true, composed: true });
  }

  template() {
    return html`
      <div class="trigger">
        <mui-button size="sm" variant="secondary" @click=${() => this.toggle()} aria-label="Notifications">
          <mui-icon slot="icon-start" name="spark"></mui-icon>
          Alerts
        </mui-button>
        ${this.unread ? html`<span class="count">${this.unread}</span>` : ''}
      </div>
      <section class="panel" part="panel">
        <header class="header">
          <h3>Notifications</h3>
          <mui-button size="sm" variant="ghost" @click=${() => this.markAllRead()}>Mark read</mui-button>
        </header>
        <div class="list">
          ${(this.items ?? []).length ? this.items.map((item) => html`
            <button
              class=${item.read ? 'item' : 'item unread'}
              data-tone=${item.tone ?? 'neutral'}
              @click=${() => this.select(item)}
            >
              <span class="meta">
                <strong>${item.title}</strong>
                ${item.time ? html`<span class="time">${item.time}</span>` : ''}
              </span>
              ${item.description ? html`<p class="description">${item.description}</p>` : ''}
            </button>
          `) : html`<p class="empty">No notifications.</p>`}
        </div>
      </section>
    `;
  }
}

if (!customElements.get('mui-notification-center')) {
  customElements.define('mui-notification-center', MuiNotificationCenter);
}
