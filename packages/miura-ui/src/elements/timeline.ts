import { MiuraElement, css, html } from '@miurajs/miura-element';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  time?: string;
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
}

export class MuiTimeline extends MiuraElement {
  static properties = {
    items: { type: Array, default: () => [] },
  };

  declare items: TimelineItem[];

  static styles = css`
    :host {
      display: block;
      font-family: var(--mui-font-sans);
      color: var(--mui-color-text);
    }

    .timeline {
      display: grid;
      gap: var(--mui-space-5);
      position: relative;
    }

    .item {
      display: grid;
      grid-template-columns: 22px minmax(0, 1fr);
      gap: var(--mui-space-3);
      position: relative;
    }

    .item:not(:last-child)::before {
      content: "";
      position: absolute;
      left: 10px;
      top: 22px;
      bottom: calc(var(--mui-space-5) * -1);
      width: 1px;
      background: var(--mui-color-border);
    }

    .dot {
      width: 20px;
      height: 20px;
      border: 2px solid var(--_tone, var(--mui-color-border-strong));
      border-radius: var(--mui-radius-pill);
      background: var(--mui-color-surface);
      box-sizing: border-box;
      margin-top: 2px;
      z-index: 1;
    }

    .content {
      display: grid;
      gap: var(--mui-space-1);
    }

    .title {
      font-weight: var(--mui-weight-medium);
    }

    .description,
    .time {
      color: var(--mui-color-text-muted);
      font-size: var(--mui-text-sm);
    }
  `;

  private toneStyle(tone?: string): string {
    const token = tone === 'success'
      ? 'var(--mui-color-success)'
      : tone === 'warning'
        ? 'var(--mui-color-warning)'
        : tone === 'danger'
          ? 'var(--mui-color-danger)'
          : tone === 'accent'
            ? 'var(--mui-color-accent)'
            : 'var(--mui-color-border-strong)';

    return `--_tone: ${token}`;
  }

  template() {
    return html`
      <div class="timeline" part="timeline">
        ${(this.items ?? []).map((item) => html`
          <div class="item" part="item" style=${this.toneStyle(item.tone)}>
            <div class="dot" part="dot"></div>
            <div class="content">
              <div class="title">${item.title}</div>
              ${item.description ? html`<div class="description">${item.description}</div>` : ''}
              ${item.time ? html`<div class="time">${item.time}</div>` : ''}
            </div>
          </div>
        `)}
      </div>
    `;
  }
}

if (!customElements.get('mui-timeline')) {
  customElements.define('mui-timeline', MuiTimeline);
}
