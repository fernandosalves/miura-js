import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css, state } from '@miurajs/miura-element';
import '../src/data-display/table.js';
import '../src/forms/slider.js';
import '../src/forms/date-picker.js';
import '../src/forms/color-picker.js';
import '../src/forms/file-upload.js';
import '../src/overlays/command.js';
import '../src/overlays/popover.js';
import '../src/special/kanban.js';
import '../src/special/calendar.js';
import '../src/special/calendar-event.js';
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

  @state({ default: [
    { id: 'todo', label: 'To Do' },
    { id: 'progress', label: 'In Progress' },
    { id: 'done', label: 'Done' }
  ]})
  declare kanbanCols: any[];

  @state({ default: [
    { title: 'Implement login', status: 'todo', description: 'Using Firebase Auth', assignee: 'John' },
    { title: 'Design components', status: 'progress', description: 'Radix inspired', assignee: 'Jane' },
    { title: 'Setup Storybook', status: 'done', description: 'Core config', assignee: 'Jane' }
  ]})
  declare kanbanItems: any[];

  @state({ default: [
    { date: '2026-04-01', title: 'Product Launch', color: 'success' },
    { date: '2026-04-15', title: 'Sprint Review', color: 'primary' }
  ]})
  declare calendarEvents: any[];

  private _onItemMoved(e: any) {
    const { item, to } = e.detail;
    this.kanbanItems = this.kanbanItems.map(it => it.title === item.title ? { ...it, status: to } : it);
  }

  private _onEventMoved(e: any) {
    const { item, to } = e.detail;
    this.calendarEvents = this.calendarEvents.map(ev => ev.title === item.title ? { ...ev, date: to } : ev);
    this.requestUpdate();
  }

  private _addCalendarEvent(dateStr?: string) {
    const date = dateStr || prompt('Date (YYYY-MM-DD):');
    const title = prompt('Event Title:');
    if (date && title) {
      this.calendarEvents = [...this.calendarEvents, { date, title, color: 'primary' }];
      this.requestUpdate();
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

      <div style="display:flex; justify-content: space-between; align-items: center; margin-top: 40px; margin-bottom: 14px;">
        <h3 style="margin:0;">Calendar</h3>
        <mui-button size="sm" @click=${() => this._addCalendarEvent()}>Add Event</mui-button>
      </div>

      <mui-calendar 
        .events=${this.calendarEvents}
        @date-click=${(e: any) => this._addCalendarEvent(e.detail.date)}
        @event-moved=${(e: any) => this._onEventMoved(e)}
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
