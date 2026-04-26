import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiCommandPaletteStory extends MiuraElement {
  static properties = {
    open: { type: Boolean, default: false },
    selected: { type: String, default: 'None yet' },
  };

  declare open: boolean;
  declare selected: string;

  private commands = [
    { id: 'new-page', label: 'Create new page', icon: 'plus', shortcut: 'N' },
    { id: 'search', label: 'Search workspace', icon: 'search', shortcut: '/' },
    { id: 'calendar', label: 'Open calendar', icon: 'calendar' },
    { id: 'settings', label: 'Open settings', icon: 'settings' },
  ];

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 460px; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .docs { max-width: 760px; display: grid; gap: 18px; }
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
            <h1>mui-command-palette</h1>
            <p>Dialog-based command palette with filterable menu actions.</p>
          </section>
          <section class="section">
            <mui-button @click=${() => this.open = true}>
              <mui-icon slot="icon-start" name="search"></mui-icon>
              Open command palette
            </mui-button>
            <p>Selected command: ${this.selected}</p>
          </section>
        </div>
        <mui-command-palette
          .open=${this.open}
          .commands=${this.commands}
          @open-change=${(event: CustomEvent) => this.open = event.detail.open}
          @command-select=${(event: CustomEvent) => this.selected = event.detail.label}
        ></mui-command-palette>
      </div>
    `;
  }
}

if (!customElements.get('mui-command-palette-story')) customElements.define('mui-command-palette-story', MuiCommandPaletteStory);

const meta: Meta<MuiCommandPaletteStory> = {
  title: 'Miura UI Next/Elements/Command Palette',
  component: 'mui-command-palette-story',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<MuiCommandPaletteStory>;
export const Documentation: Story = { args: { open: false, selected: 'None yet' } };
