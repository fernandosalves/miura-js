import { MiuraElement, css, html } from '@miurajs/miura-element';
import '../elements/badge.js';

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
}

export class MuiCalendarGrid extends MiuraElement {
  static properties = {
    month: { type: String, default: '' },
    events: { type: Array, default: () => [] },
    selected: { type: String, default: '' },
    weekStartsOn: { type: Number, default: 1, attribute: 'week-starts-on' },
  };

  declare month: string;
  declare events: CalendarEvent[];
  declare selected: string;
  declare weekStartsOn: number;

  static styles = css`
    :host {
      display: block;
      color: var(--mui-color-text);
      font-family: var(--mui-font-sans);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      border: 1px solid var(--mui-color-border);
      border-radius: var(--mui-radius-lg);
      overflow: hidden;
      background: var(--mui-color-surface);
      box-shadow: var(--mui-shadow-sm);
    }

    .weekday {
      padding: var(--mui-space-3);
      border-bottom: 1px solid var(--mui-color-border);
      background: var(--mui-color-surface-muted);
      color: var(--mui-color-text-muted);
      font-size: var(--mui-text-xs);
      font-weight: var(--mui-weight-semibold);
      text-transform: uppercase;
    }

    .day {
      min-height: 116px;
      padding: var(--mui-space-3);
      border: 0;
      border-right: 1px solid var(--mui-color-border);
      border-bottom: 1px solid var(--mui-color-border);
      background: var(--mui-color-surface);
      color: var(--mui-color-text);
      display: grid;
      align-content: start;
      gap: var(--mui-space-2);
      font: inherit;
      text-align: left;
      cursor: pointer;
    }

    .day:nth-child(7n) {
      border-right: 0;
    }

    .day:hover {
      background: var(--mui-color-surface-hover);
    }

    .day:focus-visible {
      outline: none;
      box-shadow: var(--mui-focus-ring);
      z-index: 1;
    }

    .day.outside {
      background: color-mix(in srgb, var(--mui-color-surface-muted) 62%, transparent);
      color: var(--mui-color-text-muted);
    }

    .day.selected {
      box-shadow: inset 0 0 0 2px var(--mui-color-accent);
    }

    .number {
      font-size: var(--mui-text-sm);
      font-weight: var(--mui-weight-semibold);
    }

    .events {
      display: grid;
      gap: var(--mui-space-1);
    }

    .event {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding: 3px 6px;
      border-radius: var(--mui-radius-sm);
      background: var(--mui-color-surface-muted);
      color: var(--mui-color-text-muted);
      font-size: var(--mui-text-xs);
    }

    .event[data-tone="accent"] { background: var(--mui-color-accent-muted); color: var(--mui-color-accent); }
    .event[data-tone="success"] { color: var(--mui-color-success); }
    .event[data-tone="warning"] { color: var(--mui-color-warning); }
    .event[data-tone="danger"] { color: var(--mui-color-danger); }
  `;

  private getMonthDate(): Date {
    if (this.month) {
      const parsed = new Date(`${this.month}-01T00:00:00`);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  private toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getDays(): Date[] {
    const first = this.getMonthDate();
    const start = new Date(first);
    const offset = (first.getDay() - Number(this.weekStartsOn) + 7) % 7;
    start.setDate(first.getDate() - offset);
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }

  private selectDay(date: Date, events: CalendarEvent[]): void {
    const selected = this.toDateKey(date);
    this.selected = selected;
    this.emit('day-select', { date: selected, events }, { bubbles: true, composed: true });
  }

  template() {
    const monthDate = this.getMonthDate();
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const orderedWeekdays = [...weekdays.slice(this.weekStartsOn), ...weekdays.slice(0, this.weekStartsOn)];
    const eventMap = new Map<string, CalendarEvent[]>();
    for (const event of this.events ?? []) {
      eventMap.set(event.date, [...(eventMap.get(event.date) ?? []), event]);
    }

    return html`
      <div class="grid" part="grid">
        ${orderedWeekdays.map((day) => html`<div class="weekday">${day}</div>`)}
        ${this.getDays().map((date) => {
          const key = this.toDateKey(date);
          const events = eventMap.get(key) ?? [];
          const outside = date.getMonth() !== monthDate.getMonth();
          const selected = this.selected === key;
          return html`
            <button
              class=${`day${outside ? ' outside' : ''}${selected ? ' selected' : ''}`}
              @click=${() => this.selectDay(date, events)}
            >
              <span class="number">${date.getDate()}</span>
              <span class="events">
                ${events.slice(0, 3).map((event) => html`<span class="event" data-tone=${event.tone ?? 'neutral'}>${event.title}</span>`)}
                ${events.length > 3 ? html`<mui-badge>+${events.length - 3}</mui-badge>` : ''}
              </span>
            </button>
          `;
        })}
      </div>
    `;
  }
}

if (!customElements.get('mui-calendar-grid')) {
  customElements.define('mui-calendar-grid', MuiCalendarGrid);
}
