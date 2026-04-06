import { MiuraElement, html, css, component, property, state } from '@miurajs/miura-element';

export interface CalendarEvent {
    id: string;
    date: string; // YYYY-MM-DD
    [key: string]: unknown;
}

export interface CalendarCellAction {
    key: string;
    icon: string;
    label?: string;
}

/**
 * Calendar — month view with pluggable event cards and drag-drop support.
 *
 * The host provides the grid and drop infrastructure. Card rendering is
 * delegated to the `renderEvent` callback so the consumer controls markup.
 *
 * Events fired:
 *   @event-drop   — { event, fromDate, toDate }  (internal move)
 *   @external-drop — { data, toDate }             (dragged in from outside)
 *   @day-click    — { date }
 *   @action-click — { key, date }
 *
 * @example
 * <mui-calendar
 *   .events=${events}
 *   .actions=${[{ key: 'add', icon: 'plus', label: 'Add' }]}
 *   .renderEvent=${(e) => html`<my-card .data=${e}></my-card>`}
 *   @event-drop=${handleDrop}
 * ></mui-calendar>
 */
@component({ tag: 'mui-calendar' })
export class MuiCalendar extends MiuraElement {
    @property({ type: Array, default: [] })
    events: CalendarEvent[] = [];

    @property({ type: Array, default: [] })
    actions: CalendarCellAction[] = [];

    @property({ type: Object })
    renderEvent?: (event: CalendarEvent) => unknown;

    @state({ default: new Date() })
    private _viewDate!: Date;

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
      padding: 14px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--mui-border, #e5e7eb);
      background: var(--mui-surface-subtle, #fafafa);
    }

    .month-label {
      font-weight: 600;
      font-size: 15px;
      color: var(--mui-text, #1f2937);
      min-width: 160px;
      text-align: center;
    }

    .nav-btn {
      width: 30px;
      height: 30px;
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
      padding: 8px 4px;
      text-align: center;
      font-size: 11px;
      font-weight: 600;
      color: var(--mui-text-muted, #9ca3af);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: var(--mui-surface-subtle, #f9fafb);
      border-bottom: 1px solid var(--mui-border, #e5e7eb);
    }

    .day {
      height: 130px;
      display: flex;
      flex-direction: column;
      border-right: 1px solid var(--mui-border-light, #f3f4f6);
      border-bottom: 1px solid var(--mui-border-light, #f3f4f6);
      background: var(--mui-surface, #fff);
      transition: background 120ms;
      overflow: hidden;
    }

    .day:nth-child(7n) { border-right: none; }

    .day.other-month { background: var(--mui-surface-subtle, #fafafa); }
    .day.other-month .date-num { color: var(--mui-text-muted, #d1d5db); }

    .day.today { background: rgba(59, 130, 246, 0.03); }
    .day.today .date-num {
      background: var(--mui-primary, #3b82f6);
      color: #fff;
    }

    .day.drag-over {
      background: rgba(59, 130, 246, 0.06);
      outline: 2px dashed var(--mui-primary, #3b82f6);
      outline-offset: -2px;
    }

    .day-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 6px 2px;
      flex-shrink: 0;
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
    }

    .cell-actions {
      display: flex;
      align-items: center;
      gap: 2px;
      opacity: 0;
      transition: opacity 150ms;
    }

    .day:hover .cell-actions { opacity: 1; }

    .cell-action-btn {
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
      transition: background 120ms, color 120ms;
    }

    .cell-action-btn:hover {
      background: var(--mui-surface-hover, #f3f4f6);
      color: var(--mui-primary, #3b82f6);
    }

    .events-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 0 4px 4px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-height: 0;
      scrollbar-width: thin;
      scrollbar-color: #e5e7eb transparent;
    }

    .events-scroll::-webkit-scrollbar { width: 4px; }
    .events-scroll::-webkit-scrollbar-track { background: transparent; }
    .events-scroll::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 2px; }

    .event-wrapper {
      flex-shrink: 0;
      cursor: grab;
      border-radius: 6px;
      transition: opacity 120ms, box-shadow 120ms;
    }

    .event-wrapper:active { cursor: grabbing; }
    .event-wrapper:hover { box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
  `;

    private _navigate(delta: number) {
        const d = this._viewDate instanceof Date ? this._viewDate : new Date();
        this._viewDate = new Date(d.getFullYear(), d.getMonth() + delta, 1);
    }

    private _generateCells() {
        const vd = this._viewDate instanceof Date ? this._viewDate : new Date();
        const year = vd.getFullYear();
        const month = vd.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startOffset = firstDay.getDay();
        const today = new Date();
        const cells: Array<{ date: number; dateStr: string; otherMonth: boolean; today: boolean }> = [];

        const prevLast = new Date(year, month, 0).getDate();
        for (let i = startOffset - 1; i >= 0; i--) {
            const d = prevLast - i;
            const pm = month === 0 ? 11 : month - 1;
            const py = month === 0 ? year - 1 : year;
            cells.push({ date: d, dateStr: `${py}-${String(pm + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, otherMonth: true, today: false });
        }

        for (let d = 1; d <= lastDay.getDate(); d++) {
            cells.push({
                date: d,
                dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
                otherMonth: false,
                today: d === today.getDate() && month === today.getMonth() && year === today.getFullYear()
            });
        }

        const remaining = 42 - cells.length;
        const nm = month === 11 ? 0 : month + 1;
        const ny = month === 11 ? year + 1 : year;
        for (let d = 1; d <= remaining; d++) {
            cells.push({ date: d, dateStr: `${ny}-${String(nm + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, otherMonth: true, today: false });
        }

        return cells;
    }

    private _onDragOver(e: DragEvent) {
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
        (e.currentTarget as HTMLElement).classList.add('drag-over');
    }

    private _onDragLeave(e: DragEvent) {
        (e.currentTarget as HTMLElement).classList.remove('drag-over');
    }

    private _onDrop(e: DragEvent, toDate: string) {
        e.preventDefault();
        (e.currentTarget as HTMLElement).classList.remove('drag-over');
        try {
            const raw = e.dataTransfer?.getData('application/json')
                || e.dataTransfer?.getData('text/plain') || '{}';
            const data = JSON.parse(raw);
            if (data?.id && data?.date !== undefined) {
                this.emit('event-drop', { event: data, fromDate: data.date, toDate });
            } else if (data && Object.keys(data).length > 0) {
                this.emit('external-drop', { data, toDate });
            }
        } catch { }
    }

    private _defaultRender(event: CalendarEvent) {
        return html`
            <div style="
                padding: 3px 7px; border-radius: 4px; font-size: 11px; font-weight: 500;
                background: rgba(59,130,246,0.12); color: #1d4ed8;
                border-left: 3px solid #3b82f6;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            ">${String(event.title ?? event.id)}</div>
        `;
    }

    template() {
        const vd = this._viewDate instanceof Date ? this._viewDate : new Date();
        const monthLabel = vd.toLocaleDateString('default', { month: 'long', year: 'numeric' });
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const cells = this._generateCells();
        const events = this.events ?? [];
        const actions = this.actions ?? [];
        const renderFn = this.renderEvent ?? ((ev: CalendarEvent) => this._defaultRender(ev));

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
            const cellEvents = events.filter(ev => ev.date === cell.dateStr);
            return html`
                        <div
                            class="day ${cell.otherMonth ? 'other-month' : ''} ${cell.today ? 'today' : ''}"
                            @dragover=${(e: DragEvent) => this._onDragOver(e)}
                            @dragleave=${(e: DragEvent) => this._onDragLeave(e)}
                            @drop=${(e: DragEvent) => this._onDrop(e, cell.dateStr)}
                            @click=${(e: MouseEvent) => {
                    if ((e.target as HTMLElement).closest('.event-wrapper, .cell-action-btn')) return;
                    this.emit('day-click', { date: cell.dateStr });
                }}
                        >
                            <div class="day-header">
                                <div class="date-num">${cell.date}</div>
                                ${actions.length ? html`
                                    <div class="cell-actions">
                                        ${actions.map(action => html`
                                            <button
                                                class="cell-action-btn"
                                                title=${action.label ?? action.key}
                                                @click=${(e: MouseEvent) => {
                        e.stopPropagation();
                        this.emit('action-click', { key: action.key, date: cell.dateStr });
                    }}
                                            ><mui-icon name=${action.icon} size="xs"></mui-icon></button>
                                        `)}
                                    </div>
                                ` : ''}
                            </div>
                            <div class="events-scroll">
                                ${cellEvents.map(ev => html`
                                    <div
                                        class="event-wrapper"
                                        draggable="true"
                                        @dragstart=${(e: DragEvent) => {
                            const payload = JSON.stringify(ev);
                            e.dataTransfer?.setData('application/json', payload);
                            e.dataTransfer?.setData('text/plain', payload);
                            e.dataTransfer!.effectAllowed = 'move';
                            (e.currentTarget as HTMLElement).style.opacity = '0.4';
                        }}
                                        @dragend=${(e: DragEvent) => {
                            (e.currentTarget as HTMLElement).style.opacity = '';
                        }}
                                        @click=${(e: MouseEvent) => {
                            e.stopPropagation();
                            this.emit('event-click', { event: ev, date: cell.dateStr });
                        }}
                                    >${renderFn(ev)}</div>
                                `)}
                            </div>
                        </div>
                    `;
        })}
            </div>
        `;
    }
}
