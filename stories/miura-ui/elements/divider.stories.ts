import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiDividerStory extends MiuraElement {
  static properties = { theme: { type: String, default: 'light' } };
  declare theme: 'light' | 'dark';

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 380px; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .section { max-width: 780px; display: grid; gap: 18px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); padding: 18px; box-shadow: var(--mui-shadow-sm); }
    .row { display: flex; gap: 14px; align-items: center; min-height: 56px; }
    h1, p { margin: 0; }
    p { color: var(--mui-color-text-muted); line-height: 1.5; }
  `;

  template() {
    this.dataset.muiTheme = this.theme;
    this.dataset.muiDensity = 'compact';
    return html`
      <div class="page">
        <section class="section">
          <div class="row">
            <h1>mui-divider</h1>
            <mui-button size="sm" variant="secondary" @click=${() => this.theme = this.theme === 'light' ? 'dark' : 'light'}>Toggle theme</mui-button>
          </div>
          <p>Divider creates quiet separation inside panels, menus, toolbars, and dense workspace layouts.</p>
          <span>Overview</span>
          <mui-divider></mui-divider>
          <span>Recent activity</span>
          <mui-divider inset></mui-divider>
          <div class="row">
            <span>Filter</span>
            <mui-divider orientation="vertical"></mui-divider>
            <span>Sort</span>
            <mui-divider orientation="vertical"></mui-divider>
            <span>Group</span>
          </div>
        </section>
      </div>
    `;
  }
}

if (!customElements.get('mui-divider-story')) customElements.define('mui-divider-story', MuiDividerStory);
const meta: Meta<MuiDividerStory> = { title: 'Miura UI Next/Elements/Divider', component: 'mui-divider-story', tags: ['autodocs'] };
export default meta;
type Story = StoryObj<MuiDividerStory>;
export const Documentation: Story = { args: { theme: 'light' } };
