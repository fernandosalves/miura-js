import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiScrollAreaStory extends MiuraElement {
  static properties = { theme: { type: String, default: 'light' }, shadow: { type: Boolean, default: true } };
  declare theme: 'light' | 'dark';
  declare shadow: boolean;

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 520px; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .section { max-width: 780px; display: grid; gap: 16px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); padding: 18px; box-shadow: var(--mui-shadow-sm); }
    .row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    .item { padding: 12px; border-bottom: 1px solid var(--mui-color-border); }
    .item strong { display: block; margin-bottom: 3px; }
    h1, p { margin: 0; }
    p { color: var(--mui-color-text-muted); line-height: 1.5; }
  `;

  template() {
    this.dataset.muiTheme = this.theme;
    this.dataset.muiDensity = 'compact';
    const items = Array.from({ length: 14 }, (_, index) => index + 1);
    return html`
      <div class="page">
        <section class="section">
          <div class="row">
            <h1>mui-scroll-area</h1>
            <mui-button size="sm" variant="secondary" @click=${() => this.theme = this.theme === 'light' ? 'dark' : 'light'}>Toggle theme</mui-button>
            <mui-switch .checked=${this.shadow} @change=${(event: CustomEvent) => this.shadow = event.detail.checked}>Edge shadow</mui-switch>
          </div>
          <p>Scroll area gives long lists and notebook panes a styled viewport without changing their content model.</p>
          <mui-scroll-area max-height="260px" .shadow=${this.shadow}>
            ${items.map((item) => html`
              <div class="item">
                <strong>Notebook node ${item}</strong>
                <p>Updated evidence, linked kanban card, and follow-up note for the active workspace.</p>
              </div>
            `)}
          </mui-scroll-area>
        </section>
      </div>
    `;
  }
}

if (!customElements.get('mui-scroll-area-story')) customElements.define('mui-scroll-area-story', MuiScrollAreaStory);
const meta: Meta<MuiScrollAreaStory> = { title: 'Miura UI Next/Elements/Scroll Area', component: 'mui-scroll-area-story', tags: ['autodocs'] };
export default meta;
type Story = StoryObj<MuiScrollAreaStory>;
export const Documentation: Story = { args: { theme: 'light', shadow: true } };
