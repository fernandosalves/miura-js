import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiCardStory extends MiuraElement {
  static properties = {
    selected: { type: String, default: 'tokens' },
  };

  declare selected: string;

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 560px; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .docs { max-width: 900px; display: grid; gap: 18px; }
    .section { display: grid; gap: 14px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); box-shadow: var(--mui-shadow-sm); padding: 18px; }
    .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
    h1, h2, h3, p { margin: 0; }
    p { color: var(--mui-color-text-muted); line-height: 1.5; }
  `;

  template() {
    this.dataset.muiTheme = 'light';
    this.dataset.muiDensity = 'compact';
    const cards = [
      ['tokens', 'Tokens', 'Theme, density, motion, and layout variables.'],
      ['forms', 'Forms', 'Field, input, validation, and form controller integration.'],
      ['workspace', 'Workspace', 'Shells, panels, trees, and split panes.'],
    ];

    return html`
      <div class="page">
        <div class="docs">
          <section class="section">
            <h1>mui-card</h1>
            <p>Contained content surface. Interactive cards can be selected and styled through the selected attribute.</p>
          </section>
          <section class="section">
            <div class="grid">
              ${cards.map(([id, title, text]) => html`
                <mui-card interactive .selected=${this.selected === id} @click=${() => this.selected = id}>
                  <h3>${title}</h3>
                  <p>${text}</p>
                  <mui-badge tone=${this.selected === id ? 'accent' : 'neutral'}>${this.selected === id ? 'Selected' : 'Ready'}</mui-badge>
                </mui-card>
              `)}
            </div>
            <p>Selected: ${this.selected}</p>
          </section>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('mui-card-story')) customElements.define('mui-card-story', MuiCardStory);

const meta: Meta<MuiCardStory> = {
  title: 'Miura UI Next/Elements/Card',
  component: 'mui-card-story',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<MuiCardStory>;
export const Documentation: Story = { args: { selected: 'tokens' } };
