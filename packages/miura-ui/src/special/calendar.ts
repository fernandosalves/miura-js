import { MiuraElement, html, css, component, property, state } from '@miurajs/miura-element';

/**
 * Calendar — simple month view for events
 * 
 * <mui-calendar .events=${events}></mui-calendar>
 */
@component({ tag: 'mui-calendar' })
export class MuiCalendar extends MiuraElement {
  @property({ type: Array, default: [] })
  events: any[] = [];

  @state({ type: Object, default: new Date() })
  private _viewDate = new Date();

  @property({ type: String, default: 'plus' })
  dayActionIcon = 'plus';

  private _cells: any[] = [];

  static styles: any = css`
    :host { display: block; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; --mui-calendar-cell: 120px; }
    .header { padding: 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e5e7eb; }
    .month { font-weight: 600; font-size: 16px; }
    .grid { display: grid; grid-template-columns: repeat(7, 1fr); border-bottom: 1px solid #f3f4f6; }
    .dow { padding: 8px; text-align: center; font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; background: #f9fafb; border-bottom: 1px solid #f3f4f6; }
    .day { min-height: var(--mui-calendar-cell); padding: 6px; border-right: 1px solid #f3f4f6; border-bottom: 1px solid #f3f4f6; position: relative; transition: background 150ms; }
    .day:nth-child(7n) { border-right: none; }
    .day:hover { background: var(--mui-surface-subtle, #f9fafb); }
    .day.drag-over { background: var(--mui-primary-subtle, rgba(59,130,246,0.04)); outline: 2px dashed var(--mui-primary, #3b82f6); outline-offset: -2px; z-index: 10; }
    
    .date-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
    .date { font-size: 12px; color: #4b5563; font-weight: 500; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: background 150ms, color 150ms; }
    .day.today .date { background: var(--mui-primary, #3b82f6); color: #fff; font-weight: 600; }
    .day.muted .date { color: #d1d5db; }

    .plus-btn { opacity: 0; transform: scale(0.8); transition: opacity 150ms, transform 150ms; color: var(--mui-text-muted, #9ca3af); cursor: pointer; display: flex; align-items: center; justify-content: center; width: 20px; height: 20px; }
    .plus-btn:hover { color: var(--mui-primary, #3b82f6); background: rgba(0,0,0,0.05); border-radius: 4px; }
    .day:hover .plus-btn { opacity: 1; transform: scale(1); }

    .events-container { display: flex; flex-direction: column; gap: 2px; }
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
    const dateValue = (this._viewDate instanceof Date) ? this._viewDate : new Date(this._viewDate);
    const next = new Date(dateValue.getFullYear(), dateValue.getMonth() + delta, 1);
    this._viewDate = next;
  }

  template() {
    const dv = (this._viewDate instanceof Date) ? this._viewDate : new Date(this._viewDate);
    const year = dv.getFullYear();
    const month = dv.getMonth();
    
    // Grid Setup
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    const dayOffset = start.getDay();
    const cells = [];
    
    // Padding
    for(let i=0; i<dayOffset; i++) {
       cells.push({ date: '', muted: true, str: '' });
    }
    // Days
    const today = new Date();
    for(let d=1; d<=end.getDate(); d++) {
       const dateStr = `${year}-${(month+1).toString().padStart(2,'0')}-${d.toString().padStart(2,'0')}`;
       cells.push({ 
         date: d, 
         str: dateStr, 
         muted: false,
         today: d === today.getDate() && month === today.getMonth() && year === today.getFullYear() 
       });
    }

    const monthLabel = dv.toLocaleString('default', { month: 'long', year: 'numeric' });
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return html`
      <div class="header">
        <mui-button variant="ghost" size="sm" @click=${() => this._navigate(-1)}>
          <mui-icon name="chevron-left" size="sm"></mui-icon> Prev
        </mui-button>
        <div class="month">${monthLabel} <small style="color:#9ca3af; font-weight:normal; font-size:11px;">(${cells.length} cells)</small></div>
        <mui-button variant="ghost" size="sm" @click=${() => this._navigate(1)}>
          Next <mui-icon name="chevron-right" size="sm"></mui-icon>
        </mui-button>
      </div>
      <div class="grid" style="min-height: 400px; width: 100%;">
        ${days.map(d => html`<div class="dow">${d}</div>`)}
        ${cells.map(cell => html`
          <div style="border: 1px solid #eee; padding: 10px; background: ${cell.muted ? '#f9fafb' : '#fff'}; color: ${cell.muted ? '#ccc' : '#000'};">
            ${cell.date || '-'}
          </div>
        `)}
      </div>
      <!-- Render Check: Date ${dv.toISOString()} Cells ${cells.length} -->
    `;
  }
}
