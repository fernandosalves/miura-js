import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import '../../../packages/miura-ui/src/workspace/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiCalendarGridStory extends MiuraElement {
  static properties = {
    theme: { type: String, default: 'light' },
    month: { type: String, default: '2026-04' },
    selected: { type: String, default: '2026-04-16' },
  };

  declare theme: 'light' | 'dark';
  declare month: string;
  declare selected: string;

  private events = [
    { id: 'e1', date: '2026-04-06', title: 'Sprint planning', tone: 'accent' },
    { id: 'e2', date: '2026-04-08', title: 'Design review', tone: 'warning' },
    { id: 'e3', date: '2026-04-16', title: 'Release notes', tone: 'success' },
    { id: 'e4', date: '2026-04-16', title: 'Docs pass' },
    { id: 'e5', date: '2026-04-24', title: 'Roadmap sync', tone: 'danger' },
  ];

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 760px; box-sizing: border-box; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .docs { display: grid; gap: 18px; }
    .section { display: grid; gap: 14px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); padding: 18px; box-shadow: var(--mui-shadow-sm); }
    .row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    h1, p { margin: 0; }
    p { color: var(--mui-color-text-muted); line-height: 1.5; }
  `;

  private shiftMonth(delta: number) {
    const date = new Date(`${this.month}-01T00:00:00`);
    date.setMonth(date.getMonth() + delta);
    this.month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  template() {
    this.dataset.muiTheme = this.theme;
    this.dataset.muiDensity = 'compact';
    return html`
      <div class="page">
        <div class="docs">
          <section class="section">
            <div class="row">
              <h1>mui-calendar-grid</h1>
              <mui-button size="sm" variant="secondary" @click=${() => this.theme = this.theme === 'light' ? 'dark' : 'light'}>Toggle theme</mui-button>
              <mui-button size="sm" variant="ghost" @click=${() => this.shiftMonth(-1)}>Previous</mui-button>
              <mui-button size="sm" variant="ghost" @click=${() => this.shiftMonth(1)}>Next</mui-button>
            </div>
            <p>Calendar grid renders month views for scheduling, publishing, planning, and availability. Selected date: ${this.selected}.</p>
          </section>
          <mui-calendar-grid
            .month=${this.month}
            .events=${this.events}
            .selected=${this.selected}
            @day-select=${(event: CustomEvent) => this.selected = event.detail.date}
          ></mui-calendar-grid>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('mui-calendar-grid-story')) customElements.define('mui-calendar-grid-story', MuiCalendarGridStory);
const meta: Meta<MuiCalendarGridStory> = { title: 'Miura UI Next/Workspace/Calendar Grid', component: 'mui-calendar-grid-story', tags: ['autodocs'] };
export default meta;
type Story = StoryObj<MuiCalendarGridStory>;
export const Documentation: Story = { args: { theme: 'light', month: '2026-04', selected: '2026-04-16' } };
