import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiToolbarStory extends MiuraElement {
  static properties = {
    lastAction: { type: String, default: 'None yet' },
  };

  declare lastAction: string;

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 460px; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .docs { max-width: 820px; display: grid; gap: 18px; }
    .section { display: grid; gap: 14px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); box-shadow: var(--mui-shadow-sm); padding: 18px; }
    h1, p { margin: 0; }
    p { color: var(--mui-color-text-muted); line-height: 1.5; }
  `;

  private action(name: string) {
    this.lastAction = name;
  }

  template() {
    this.dataset.muiTheme = 'light';
    this.dataset.muiDensity = 'compact';

    return html`
      <div class="page">
        <div class="docs">
          <section class="section">
            <h1>mui-toolbar</h1>
            <p>Toolbar groups related commands and exposes role=toolbar.</p>
          </section>
          <section class="section">
            <mui-toolbar label="Editor actions">
              <mui-button size="sm" variant="ghost" @click=${() => this.action('Search')}>
                <mui-icon slot="icon-start" name="search"></mui-icon>
                Search
              </mui-button>
              <mui-button size="sm" variant="ghost" @click=${() => this.action('Add')}>
                <mui-icon slot="icon-start" name="plus"></mui-icon>
                Add
              </mui-button>
              <mui-button size="sm" variant="secondary" @click=${() => this.action('Settings')}>
                <mui-icon slot="icon-start" name="settings"></mui-icon>
                Settings
              </mui-button>
            </mui-toolbar>
            <p>Last action: ${this.lastAction}</p>
          </section>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('mui-toolbar-story')) customElements.define('mui-toolbar-story', MuiToolbarStory);

const meta: Meta<MuiToolbarStory> = {
  title: 'Miura UI Next/Elements/Toolbar',
  component: 'mui-toolbar-story',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<MuiToolbarStory>;
export const Documentation: Story = { args: { lastAction: 'None yet' } };
