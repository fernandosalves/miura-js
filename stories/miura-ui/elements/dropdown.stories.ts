import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiDropdownStory extends MiuraElement {
  static properties = {
    selected: { type: String, default: 'None yet' },
    open: { type: Boolean, default: false },
  };

  declare selected: string;
  declare open: boolean;

  private items = [
    { id: 'duplicate', label: 'Duplicate', icon: 'plus' },
    { id: 'archive', label: 'Archive', icon: 'folder' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
    { id: 'delete', label: 'Delete', icon: 'plus', danger: true },
  ];

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 440px; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
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
            <h1>mui-dropdown</h1>
            <p>Button-triggered menu with outside click and Escape close.</p>
          </section>
          <section class="section">
            <mui-dropdown
              .items=${this.items}
              .open=${this.open}
              label="Page actions"
              @open-change=${(event: CustomEvent) => this.open = event.detail.open}
              @item-select=${(event: CustomEvent) => this.selected = event.detail.label}
            ></mui-dropdown>
            <p>Open: ${String(this.open)} · selected: ${this.selected}</p>
          </section>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('mui-dropdown-story')) customElements.define('mui-dropdown-story', MuiDropdownStory);

const meta: Meta<MuiDropdownStory> = {
  title: 'Miura UI Next/Elements/Dropdown',
  component: 'mui-dropdown-story',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<MuiDropdownStory>;
export const Documentation: Story = { args: { selected: 'None yet', open: false } };
