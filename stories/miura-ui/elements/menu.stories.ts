import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiMenuStory extends MiuraElement {
  static properties = {
    selected: { type: String, default: 'None yet' },
  };

  declare selected: string;

  private items = [
    { id: 'new', label: 'New page', icon: 'plus', shortcut: 'N' },
    { id: 'search', label: 'Search', icon: 'search', shortcut: '/' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
    { id: 'disabled', label: 'Disabled action', disabled: true },
    { id: 'delete', label: 'Delete', icon: 'plus', danger: true },
  ];

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 520px; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .docs { max-width: 720px; display: grid; gap: 18px; }
    .section { display: grid; gap: 14px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); box-shadow: var(--mui-shadow-sm); padding: 18px; }
    h1, p { margin: 0; }
    p { color: var(--mui-color-text-muted); line-height: 1.5; }
  `;

  template() {
    this.dataset.muiTheme = 'light';
    this.dataset.muiDensity = 'compact';

    return html`
      <div class="page">
        <div class="docs">
          <section class="section">
            <h1>mui-menu</h1>
            <p>Command list for dropdowns, palettes, and contextual menus.</p>
          </section>
          <section class="section">
            <mui-menu .items=${this.items} @item-select=${(event: CustomEvent) => this.selected = event.detail.label}></mui-menu>
            <p>Selected: ${this.selected}</p>
          </section>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('mui-menu-story')) customElements.define('mui-menu-story', MuiMenuStory);

const meta: Meta<MuiMenuStory> = {
  title: 'Miura UI Next/Elements/Menu',
  component: 'mui-menu-story',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<MuiMenuStory>;
export const Documentation: Story = { args: { selected: 'None yet' } };
