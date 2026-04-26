import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';
import { registerIcon } from '../../../packages/miura-ui/src/elements/icon';

registerIcon('diamond', { paths: ['M12 3 21 12 12 21 3 12z'] });

class MuiIconStory extends MiuraElement {
  static properties = {
    selected: { type: String, default: 'spark' },
    size: { type: Number, default: 24 },
  };

  declare selected: string;
  declare size: number;

  private icons = ['menu', 'search', 'panel-left', 'chevron-left', 'chevron-right', 'plus', 'folder', 'file', 'settings', 'calendar', 'columns', 'spark', 'diamond'];

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 620px; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .docs { max-width: 900px; display: grid; gap: 18px; }
    .section { display: grid; gap: 14px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); box-shadow: var(--mui-shadow-sm); padding: 18px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 10px; }
    button { min-height: 74px; display: grid; place-items: center; gap: 6px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-md); background: var(--mui-color-surface-muted); color: var(--mui-color-text-muted); cursor: pointer; font: inherit; font-size: var(--mui-text-xs); }
    button.active { color: var(--mui-color-accent); border-color: var(--mui-color-accent); background: var(--mui-color-accent-muted); }
    button:focus-visible { outline: none; box-shadow: var(--mui-focus-ring); }
    h1, h2, p { margin: 0; }
    p { color: var(--mui-color-text-muted); line-height: 1.5; }
    .preview { display: flex; align-items: center; gap: 16px; }
    .preview-box { width: 88px; height: 88px; display: grid; place-items: center; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface-muted); color: var(--mui-color-accent); }
  `;

  template() {
    this.dataset.muiTheme = "light";
    this.dataset.muiDensity = "compact";

    return html`
      <div class="page" data-mui-theme="light" data-mui-density="compact">
        <div class="docs">
          <section class="section">
            <h1>mui-icon</h1>
            <p>Registry-backed SVG icon element built on the nano base. Icons inherit text color and support accessible labels.</p>
            <p>Custom icons can be registered with <code>registerIcon(name, definition)</code>.</p>
          </section>
          <section class="section">
            <h2>Interactive Gallery</h2>
            <div class="grid">
              ${this.icons.map((icon) => html`
                <button class=${this.selected === icon ? 'active' : ''} @click=${() => this.selected = icon}>
                  <mui-icon name=${icon} size="24"></mui-icon>
                  ${icon}
                </button>
              `)}
            </div>
          </section>
          <section class="section">
            <h2>Selected Icon</h2>
            <div class="preview">
              <div class="preview-box"><mui-icon name=${this.selected} .size=${String(this.size)} label=${this.selected}></mui-icon></div>
              <div>
                <p>Name: <strong>${this.selected}</strong></p>
                <p>Example: <code>&lt;mui-icon name="${this.selected}"&gt;&lt;/mui-icon&gt;</code></p>
              </div>
            </div>
          </section>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('mui-icon-story')) customElements.define('mui-icon-story', MuiIconStory);

const meta: Meta<MuiIconStory> = {
  title: 'Miura UI Next/Elements/Icon',
  component: 'mui-icon-story',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<MuiIconStory>;

export const Documentation: Story = {
  args: { selected: 'spark', size: 24 },
};
