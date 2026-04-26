import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiTimelineStory extends MiuraElement {
  private items = [
    { id: '1', title: 'Created workspace shell', description: 'Rail, navigation, content, and inspector slots.', time: '09:10', tone: 'success' },
    { id: '2', title: 'Added command layer', description: 'Menu, dropdown, breadcrumb, pagination, command palette.', time: '10:25', tone: 'accent' },
    { id: '3', title: 'Planning canvas kit', description: 'Kanban, calendar, and node canvas components.', time: 'Next', tone: 'warning' },
  ];

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 520px; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .section { max-width: 760px; display: grid; gap: 16px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); box-shadow: var(--mui-shadow-sm); padding: 18px; }
    h1, p { margin: 0; }
    p { color: var(--mui-color-text-muted); }
  `;

  template() {
    this.dataset.muiTheme = 'light';
    this.dataset.muiDensity = 'compact';
    return html`
      <div class="page">
        <section class="section">
          <h1>mui-timeline</h1>
          <p>Timeline displays ordered activity and workflow history.</p>
          <mui-timeline .items=${this.items}></mui-timeline>
        </section>
      </div>
    `;
  }
}

if (!customElements.get('mui-timeline-story')) customElements.define('mui-timeline-story', MuiTimelineStory);
const meta: Meta<MuiTimelineStory> = { title: 'Miura UI Next/Elements/Timeline', component: 'mui-timeline-story', tags: ['autodocs'] };
export default meta;
type Story = StoryObj<MuiTimelineStory>;
export const Documentation: Story = {};
