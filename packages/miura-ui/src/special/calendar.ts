import { MiuraElement, html, css, component, property, state } from '@miurajs/miura-element';

/**
 * Calendar — month view with events and drag-drop support
 * 
 * <mui-calendar .events=${events}></mui-calendar>
 */
@component({ tag: 'mui-calendar' })
export class MuiCalendar extends MiuraElement {
    @property({ type: Array, default: [] })
    events: any[] = [];

    @state({ default: new Date() })
    private _viewDate!: Date;

    @property({ type: String, default: 'plus' })
    dayActionIcon = 'plus';

    static styles = css`
    :host {
      display: block;
      background: var(--mui-surface, #fff);
      border: 1px solid var(--mui-border, #e5e7eb);
      border-radius: 12px;
      overflow: hidden;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .header {
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--mui-border, #e5e7eb);
      background: var(--mui-surface-subtle, #fafafa);
    }

    .month-nav {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .month-label {
      font-weight: 600;
      font-size: 16px;
      color: var(--mui-text, #1f2937);
      min-width: 160px;
      text-align: center;
    }

    .nav-btn {
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--mui-text-secondary, #6b7280);
      transition: background 150ms, color 150ms;
    }

    .nav-btn:hover {
      background: var(--mui-surface-hover, #f3f4f6);
      color: var(--mui-primary, #3b82f6);
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
    }

    .dow {
      padding: 10px 4px;
      text-align: center;
      font-size: 11px;
      font-weight: 600;
      color: var(--mui-text-muted, #9ca3af);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: var(--mui-surface-subtle, #f9fafb);
      border-bottom: 1px solid var(--mui-border, #e5e7eb);
    }

    .day {
      min-height: 90px;
      padding: 8px;
      border-right: 1px solid var(--mui-border-light, #f3f4f6);
      border-bottom: 1px solid var(--mui-border-light, #f3f4f6);
      background: var(--mui-surface, #fff);
      cursor: pointer;
      transition: background 150ms;
      position: relative;
    }

    .day:nth-child(7n) {
      border-right: none;
    }

    .day:hover {
      background: var(--mui-surface-hover, #f9fafb);
    }

    .day.other-month {
      background: var(--mui-surface-subtle, #fafafa);
    }

    .day.other-month .date-num {
      color: var(--mui-text-muted, #d1d5db);
    }

    .day.today {
      background: var(--mui-primary-subtle, rgba(59, 130, 246, 0.04));
    }

    .day.today .date-num {
      background: var(--mui-primary, #3b82f6);
      color: #fff;
    }

    .date-num {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 500;
      color: var(--mui-text, #374151);
      border-radius: 50%;
      margin-bottom: 4px;
    }

    .events-list {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .event-pill {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      background: var(--mui-primary-subtle, rgba(59, 130, 246, 0.1));
      color: var(--mui-primary, #3b82f6);
      border-left: 2px solid var(--mui-primary, #3b82f6);
    }

    .event-pill.secondary {
      background: rgba(34, 197, 94, 0.1);
      color: #16a34a;
      border-left-color: #16a34a;
    }

    .event-pill.tertiary {
      background: rgba(249, 115, 22, 0.1);
      color: #ea580c;
      border-left-color: #ea580c;
    }

    .day.drag-over {
      background: var(--mui-primary-subtle, rgba(59, 130, 246, 0.08));
      outline: 2px dashed var(--mui-primary, #3b82f6);
      outline-offset: -2px;
    }

    .action-btn {
      position: absolute;
      bottom: 4px;
      right: 4px;
      width: 20px;
      height: 20px;
      border: none;
      background: transparent;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--mui-text-muted, #9ca3af);
      opacity: 0;
      transition: opacity 150ms, background 150ms, color 150ms;
    }

    .day:hover .action-btn {
      opacity: 1;
    }

    .action-btn:hover {
      background: var(--mui-surface-hover, #f3f4f6);
      color: var(--mui-primary, #3b82f6);
    }
  `;

    private _onDragOver(e: DragEvent) {
        e.preventDefault();
        (e.currentTarget as HTMLElement).classList.add('drag-over');
    }

    private _onDragLeave(e: DragEvent) {
        (e.currentTarget as HTMLElement).classList.remove('drag-over');
    }

    private _onDrop(e: DragEvent, dateStr: string) {
        e.preventDefault();
        (e.currentTarget as HTMLElement).classList.remove('drag-over');
        try {
            const item = JSON.parse(e.dataTransfer?.getData('application/json') || '{}');
            if (item.title) {
                this.emit('event-moved', { item, to: dateStr });
            }
        } catch (err) { }
    }

    private _navigate(delta: number) {
        const current = this._viewDate instanceof Date ? this._viewDate : new Date();
        const next = new Date(current.getFullYear(), current.getMonth() + delta, 1);
        this._viewDate = next;
    }

    private _generateCells() {
        const viewDate = this._viewDate instanceof Date ? this._viewDate : new Date();
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startOffset = firstDay.getDay(); // 0 = Sunday

        const today = new Date();
        const cells = [];

        // Previous month days (padding)
        const prevMonthLast = new Date(year, month, 0).getDate();
        for (let i = startOffset - 1; i >= 0; i--) {
            const d = prevMonthLast - i;
            const prevMonth = month === 0 ? 11 : month - 1;
            const prevYear = month === 0 ? year - 1 : year;
            const dateStr = `${prevYear}-${(prevMonth + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
            cells.push({
                date: d,
                dateStr,
                otherMonth: true,
                today: false
            });
        }

        // Current month days
        for (let d = 1; d <= lastDay.getDate(); d++) {
            const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
            cells.push({
                date: d,
                dateStr,
                otherMonth: false,
                today: d === today.getDate() && month === today.getMonth() && year === today.getFullYear()
            });
        }

        // Next month days (padding to complete 42 cells = 6 rows)
        const remaining = 42 - cells.length;
        const nextMonth = month === 11 ? 0 : month + 1;
        const nextYear = month === 11 ? year + 1 : year;
        for (let d = 1; d <= remaining; d++) {
            const dateStr = `${nextYear}-${(nextMonth + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
            cells.push({
                date: d,
                dateStr,
                otherMonth: true,
                today: false
            });
        }

        return cells;
    }

    template() {
        const viewDate = this._viewDate instanceof Date ? this._viewDate : new Date();
        const monthLabel = viewDate.toLocaleDateString('default', { month: 'long', year: 'numeric' });
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const cells = this._generateCells();
        const events = this.events ?? [];

        return html`
      <div class="header">
        <button class="nav-btn" @click=${() => this._navigate(-1)} aria-label="Previous month">
          <mui-icon name="chevron-left" size="sm"></mui-icon>
        </button>
        <div class="month-label">${monthLabel}</div>
        <button class="nav-btn" @click=${() => this._navigate(1)} aria-label="Next month">
          <mui-icon name="chevron-right" size="sm"></mui-icon>
        </button>
      </div>
      <div class="calendar-grid">
        ${days.map(d => html`<div class="dow">${d}</div>`)}
        ${cells.map(cell => {
            const dayEvents = events.filter(e => e.date === cell.dateStr);
            return html`
            <div 
              class="day ${cell.otherMonth ? 'other-month' : ''} ${cell.today ? 'today' : ''}"
              @dragover=${(e: DragEvent) => this._onDragOver(e)}
              @dragleave=${(e: DragEvent) => this._onDragLeave(e)}
              @drop=${(e: DragEvent) => this._onDrop(e, cell.dateStr)}
              @click=${() => this.emit('day-click', { date: cell.dateStr })}
            >
              <div class="date-num">${cell.date}</div>
              ${dayEvents.length > 0 ? html`
                <div class="events-list">
                  ${dayEvents.slice(0, 3).map((e, i) => html`
                    <div class="event-pill ${i === 1 ? 'secondary' : i === 2 ? 'tertiary' : ''}">${e.title}</div>
                  `)}
                  ${dayEvents.length > 3 ? html`<div style="font-size: 9px; color: #9ca3af;">+${dayEvents.length - 3} more</div>` : ''}
                </div>
              ` : ''}
              <button class="action-btn" @click=${(e: Event) => { e.stopPropagation(); this.emit('add-event', { date: cell.dateStr }); }}>
                <mui-icon name=${this.dayActionIcon} size="xs"></mui-icon>
              </button>
            </div>
          `;
        })}
      </div>
    `;
    }
}
