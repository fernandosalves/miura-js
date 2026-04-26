import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiListStory extends MiuraElement {
  static properties = { active: { type: String, default: 'inbox' } };
  declare active: string;

  private items = [
    { id: 'inbox', title: 'Inbox', description: 'New work and drafts', icon: 'folder', badge: '8' },
    { id: 'calendar', title: 'Calendar', description: 'Scheduled posts and releases', icon: 'calendar' },
    { id: 'boards', title: 'Boards', description: 'Kanban planning spaces', icon: 'columns' },
  ];

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 480px; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
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
          <h1>mui-list</h1>
          <p>Selectable list for navigation, search results, and compact record lists.</p>
          <mui-list .items=${this.items} .active=${this.active} @item-select=${(event: CustomEvent) => this.active = event.detail.id}></mui-list>
          <p>Active: ${this.active}</p>
        </section>
      </div>
    `;
  }
}

if (!customElements.get('mui-list-story')) customElements.define('mui-list-story', MuiListStory);
const meta: Meta<MuiListStory> = { title: 'Miura UI Next/Elements/List', component: 'mui-list-story', tags: ['autodocs'] };
export default meta;
type Story = StoryObj<MuiListStory>;
export const Documentation: Story = { args: { active: 'inbox' } };
