import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiSpinnerStory extends MiuraElement {
  static properties = { theme: { type: String, default: 'light' }, loading: { type: Boolean, default: true } };
  declare theme: 'light' | 'dark';
  declare loading: boolean;

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 360px; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .section { max-width: 760px; display: grid; gap: 16px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); padding: 18px; box-shadow: var(--mui-shadow-sm); }
    .row { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
    .status { display: flex; align-items: center; gap: 10px; color: var(--mui-color-text-muted); }
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
            <h1>mui-spinner</h1>
            <mui-button size="sm" variant="secondary" @click=${() => this.theme = this.theme === 'light' ? 'dark' : 'light'}>Toggle theme</mui-button>
          </div>
          <p>Spinner is for indeterminate work, usually paired with a status label or inside an actionable control.</p>
          <div class="row">
            <mui-spinner size="sm"></mui-spinner>
            <mui-spinner></mui-spinner>
            <mui-spinner size="lg"></mui-spinner>
            <mui-button .loading=${this.loading} @click=${() => this.loading = !this.loading}>Button loading</mui-button>
          </div>
          <div class="status"><mui-spinner label="Syncing"></mui-spinner><span>Syncing workspace state</span></div>
        </section>
      </div>
    `;
  }
}

if (!customElements.get('mui-spinner-story')) customElements.define('mui-spinner-story', MuiSpinnerStory);
const meta: Meta<MuiSpinnerStory> = { title: 'Miura UI Next/Elements/Spinner', component: 'mui-spinner-story', tags: ['autodocs'] };
export default meta;
type Story = StoryObj<MuiSpinnerStory>;
export const Documentation: Story = { args: { theme: 'light', loading: true } };
