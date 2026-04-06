import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css, state } from '@miurajs/miura-element';
import type { CalendarEvent } from '../src/special/calendar.js';
import '../src/data-display/table.js';
import '../src/forms/slider.js';
import '../src/forms/date-picker.js';
import '../src/forms/color-picker.js';
import '../src/forms/file-upload.js';
import '../src/overlays/command.js';
import '../src/overlays/popover.js';
import '../src/special/kanban.js';
import '../src/special/calendar.js';
import '../src/layout/stack.js';

// ── Advanced Demo ───────────────────────────────────────────────────────────
class AdvancedDemo extends MiuraElement {
    static styles: any = css`
    :host { display: block; padding: 24px; font-family: system-ui; }
    h3 { font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin: 28px 0 14px; }
    section { margin-bottom: 40px; }
  `;

    @state({ default: false })
    declare commandOpen: boolean;

    template() {
        const cols = [
            { key: 'title', label: 'Title', sortable: true },
            { key: 'status', label: 'Status', render: (s: any) => html`<mui-badge variant="soft" color="${s === 'Published' ? 'success' : 'warning'}">${s}</mui-badge>` },
            { key: 'author', label: 'Author' },
            { key: 'date', label: 'Date', sortable: true, align: 'right' as const },
        ];

        const data = [
            { title: 'The Future of AI', status: 'Published', author: 'John Doe', date: '2026-04-01' },
            { title: 'Designing for Scale', status: 'Draft', author: 'Jane Smith', date: '2026-04-03' },
            { title: 'Web Components 101', status: 'Published', author: 'Bob Wilson', date: '2026-03-28' },
            { title: 'Micro-services Architecture', status: 'Published', author: 'Alice Brown', date: '2026-04-05' },
            { title: 'Advanced CSS Tricks', status: 'Draft', author: 'John Doe', date: '2026-04-02' },
        ];

        return html`
      <section>
        <h3>Data Table</h3>
        <mui-data-table 
          .columns=${cols} 
          .data=${data} 
          selectable 
          paginated 
          pageSize="3"
        ></mui-data-table>
      </section>

      <section>
        <h3>Advanced Form Controls</h3>
        <mui-stack gap="6">
          <mui-slider label="Volume Control" value="45" min="0" max="100"></mui-slider>
          <mui-date-picker label="Scheduled Date" value="2026-04-10"></mui-date-picker>
          <mui-color-picker label="Theme Accent" value="#ec4899"></mui-color-picker>
          <mui-file-upload accept="image/*" multiple>
            <span slot="title">Drop assets here</span>
            <span slot="subtitle">Images and videos up to 50MB</span>
          </mui-file-upload>
        </mui-stack>
      </section>

      <section>
        <h3>Popover & Command Palette</h3>
        <mui-stack direction="row" gap="4" align="center" justify="center" style="padding: 40px; background: #f9fafb; border-radius: 12px; border: 1px dashed #ddd;">
          <mui-popover>
            <mui-button slot="trigger">Open Popover</mui-button>
            <div slot="content" style="padding: 16px; min-width: 200px">
              <mui-text variant="h4">Contextual Info</mui-text>
              <mui-text variant="body-sm" color="secondary">This popover can contain any rich HTML content including other components.</mui-text>
            </div>
          </mui-popover>

          <mui-button variant="outline" @click=${() => this.commandOpen = true}>
            Open Command Palette (Cmd+K)
          </mui-button>

          <mui-command-palette ?open=${this.commandOpen} @close=${() => this.commandOpen = false}>
            <mui-command-group label="Suggestions">
              <mui-command-item icon="file-text" shortcut="G S">Go to Stories</mui-command-item>
              <mui-command-item icon="folder" shortcut="G L">Go to Labs</mui-command-item>
            </mui-command-group>
            <mui-command-group label="Settings">
              <mui-command-item icon="user">Profile Settings</mui-command-item>
              <mui-command-item icon="settings">System Preferences</mui-command-item>
            </mui-command-group>
          </mui-command-palette>
        </mui-stack>
      </section>
    `;
    }
}
customElements.define('advanced-demo', AdvancedDemo);

// ── Specialized Demo ────────────────────────────────────────────────────────
class SpecializedDemo extends MiuraElement {
    static styles: any = css`
    :host { display: block; padding: 24px; font-family: system-ui; }
    h3 { font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin: 28px 0 14px; }
  `;

    @state({
        default: [
            { id: 'todo', label: 'To Do' },
            { id: 'progress', label: 'In Progress' },
            { id: 'done', label: 'Done' }
        ]
    })
    declare kanbanCols: any[];

    @state({
        default: [
            { id: 'k1', title: 'Implement login', status: 'todo', description: 'Using Firebase Auth', assignee: 'John' },
            { id: 'k2', title: 'Design components', status: 'progress', description: 'Radix inspired', assignee: 'Jane' },
            { id: 'k3', title: 'Setup Storybook', status: 'done', description: 'Core config', assignee: 'Jane' }
        ]
    })
    declare kanbanItems: any[];

    @state({
        default: [
            { id: '1', date: '2026-04-01', title: 'Product Launch', color: 'success', avatar: 'JD', time: '9:00 AM' },
            { id: '2', date: '2026-04-03', title: 'Design Review', color: 'primary', avatar: 'JS' },
            { id: '3', date: '2026-04-06', title: 'Team Standup', color: 'warning', avatar: 'TB', time: '10:00 AM' },
            { id: '4', date: '2026-04-15', title: 'Sprint Review', color: 'primary', avatar: 'AB', time: '2:00 PM' },
            { id: '5', date: '2026-04-15', title: 'Team Lunch', color: 'success', avatar: 'CK' },
            { id: '6', date: '2026-04-22', title: 'Quarterly Plan', color: 'error', avatar: 'JD', time: '10:00 AM' },
            { id: '7', date: '2026-04-28', title: 'Perf Review', color: 'warning', avatar: 'TS', time: '3:00 PM' },
        ] as CalendarEvent[]
    })
    declare calendarEvents: CalendarEvent[];

    private _calendarActions = [
        { key: 'add', icon: 'plus', label: 'Add event' }
    ];

    private _renderCalendarEvent = (ev: CalendarEvent) => {
        const colorMap: Record<string, { bg: string; border: string; text: string; dot: string }> = {
            primary: { bg: 'rgba(59,130,246,0.10)', border: '#3b82f6', text: '#1d4ed8', dot: '#3b82f6' },
            success: { bg: 'rgba(34,197,94,0.10)', border: '#22c55e', text: '#166534', dot: '#22c55e' },
            warning: { bg: 'rgba(245,158,11,0.10)', border: '#f59e0b', text: '#92400e', dot: '#f59e0b' },
            error: { bg: 'rgba(239,68,68,0.10)', border: '#ef4444', text: '#991b1b', dot: '#ef4444' },
        };
        const c = colorMap[ev.color as string] ?? colorMap['primary'];
        const src = ev.avatar as string ?? ev.title as string;
        const initials = src.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
        return html`
            <div style="
                display: flex; align-items: center; gap: 7px;
                padding: 5px 8px; border-radius: 7px;
                background: ${c.bg}; border-left: 3px solid ${c.border};
            ">
                <div style="
                    flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%;
                    background: ${c.dot}; color: #fff;
                    font-size: 8px; font-weight: 700;
                    display: flex; align-items: center; justify-content: center;
                ">${initials}</div>
                <div style="flex: 1; min-width: 0;">
                    <div style="
                        font-size: 11px; font-weight: 600; color: ${c.text};
                        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                    ">${ev.title as string}</div>
                    ${(ev.time as string) ? html`<div style="font-size: 10px; color: #9ca3af; margin-top: 1px;">${ev.time as string}</div>` : ''}
                </div>
            </div>
        `;
    };

    private _onItemMoved(e: any) {
        const { item, to } = e.detail;
        this.kanbanItems = this.kanbanItems.map((it: any) => it.id === item.id ? { ...it, status: to } : it);
    }

    private _onEventDrop(e: any) {
        const { event, toDate } = e.detail;
        this.calendarEvents = this.calendarEvents.map(ev =>
            ev.id === event.id ? { ...ev, date: toDate } : ev
        );
    }

    private _onActionClick(e: any) {
        const { key, date } = e.detail;
        if (key === 'add') {
            const title = prompt(`New event on ${date}:`);
            if (title) {
                this.calendarEvents = [...this.calendarEvents, {
                    id: `ev-${Date.now()}`, date, title, color: 'primary', avatar: title
                }];
            }
        }
    }

    private _addColumn() {
        const label = prompt('Column Name:');
        if (label) {
            this.kanbanCols = [...this.kanbanCols, { id: label.toLowerCase(), label }];
        }
    }

    template() {
        return html`
            <h3>Kanban Board (Drag & Drop)</h3>
            <mui-kanban
                .columns=${this.kanbanCols}
                .items=${this.kanbanItems}
                @item-moved=${(e: any) => this._onItemMoved(e)}
                @column-add=${() => this._addColumn()}
            ></mui-kanban>

            <h3 style="margin-top: 40px;">Calendar</h3>
            <mui-calendar
                .events=${this.calendarEvents}
                .actions=${this._calendarActions}
                .renderEvent=${this._renderCalendarEvent}
                @event-drop=${(e: any) => this._onEventDrop(e)}
                @action-click=${(e: any) => this._onActionClick(e)}
                @day-click=${(e: any) => this._onActionClick({ detail: { key: 'add', date: e.detail.date } })}
            ></mui-calendar>
        `;
    }
}
customElements.define('specialized-demo', SpecializedDemo);

// ── Meta & Exports ──────────────────────────────────────────────────────────
const meta: Meta = {
    title: 'MiuraUI/Advanced/All Components',
    component: 'advanced-demo',
    parameters: { layout: 'padded' },
};
export default meta;

export const DataTableAndForms: StoryObj = {
    name: 'Data Table & Advanced Forms',
};

export const SpecializedComponents: StoryObj = {
    render: () => document.createElement('specialized-demo'),
    name: 'Specialized (Kanban & Calendar)',
};
