import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import '../../../packages/miura-ui/src/workspace/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiIconRailStory extends MiuraElement {
  static properties = {
    active: { type: String, default: 'notebook' },
    events: { type: Array, default: () => [] },
  };

  declare active: string;
  declare events: string[];

  private items = [
    { id: 'notebook', label: 'Notebook', icon: 'folder' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar' },
    { id: 'boards', label: 'Boards', icon: 'columns', badge: '4' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 620px; display: grid; grid-template-columns: auto minmax(0, 1fr); background: var(--mui-color-bg); color: var(--mui-color-text); border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); overflow: hidden; }
    .content { padding: 24px; display: grid; align-content: start; gap: 16px; }
    .section { display: grid; gap: 12px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); box-shadow: var(--mui-shadow-sm); padding: 18px; }
    h1, h2, p { margin: 0; }
    p { color: var(--mui-color-text-muted); line-height: 1.5; }
    .log { display: grid; gap: 6px; font-family: var(--mui-font-mono); font-size: var(--mui-text-xs); color: var(--mui-color-text-muted); }
  `;

  private select(event: CustomEvent) {
    this.active = event.detail.id;
    this.events = [`selected ${event.detail.label}`, ...this.events].slice(0, 5);
  }

  template() {
    this.dataset.muiTheme = "light";
    this.dataset.muiDensity = "compact";

    return html`
      <div class="page" data-mui-theme="light" data-mui-density="compact">
        <mui-icon-rail .items=${this.items} .active=${this.active} @item-select=${(event: CustomEvent) => this.select(event)}>
          <mui-icon slot="brand" name="spark"></mui-icon>
        </mui-icon-rail>
        <main class="content">
          <section class="section">
            <h1>mui-icon-rail</h1>
            <p>Compact primary navigation for workspace shells. It emits item-select and uses aria-current for active state.</p>
            <p>Active item: <strong>${this.active}</strong></p>
          </section>
          <section class="section">
            <h2>Events</h2>
            <div class="log">${(this.events.length ? this.events : ['Click rail items.']).map((event) => html`<div>${event}</div>`)}</div>
          </section>
        </main>
      </div>
    `;
  }
}

if (!customElements.get('mui-icon-rail-story')) customElements.define('mui-icon-rail-story', MuiIconRailStory);

const meta: Meta<MuiIconRailStory> = {
  title: 'Miura UI Next/Workspace/Icon Rail',
  component: 'mui-icon-rail-story',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<MuiIconRailStory>;

export const Documentation: Story = {
  args: { active: 'notebook', events: [] },
};
