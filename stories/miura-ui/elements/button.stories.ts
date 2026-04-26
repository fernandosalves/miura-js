import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiButtonStory extends MiuraElement {
  static properties = {
    theme: { type: String, default: 'light' },
    loading: { type: Boolean, default: false },
    clicks: { type: Number, default: 0 },
    lastAction: { type: String, default: 'None yet' },
  };

  declare theme: 'light' | 'dark';
  declare loading: boolean;
  declare clicks: number;
  declare lastAction: string;

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 720px; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .docs { max-width: 980px; display: grid; gap: 18px; }
    .hero, .section { border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); box-shadow: var(--mui-shadow-sm); padding: 18px; }
    .hero { display: grid; gap: 8px; }
    .section { display: grid; gap: 14px; }
    .row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    h1, h2, p { margin: 0; }
    h1 { font-size: 1.5rem; }
    h2 { font-size: var(--mui-text-lg); }
    p { color: var(--mui-color-text-muted); font-size: var(--mui-text-md); line-height: 1.5; }
    code { font-family: var(--mui-font-mono); font-size: var(--mui-text-sm); background: var(--mui-color-surface-muted); padding: 2px 5px; border-radius: var(--mui-radius-sm); }
    .state { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
    .metric { background: var(--mui-color-surface-muted); border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-md); padding: 10px; }
    .metric span { display: block; color: var(--mui-color-text-muted); font-size: var(--mui-text-xs); margin-bottom: 4px; }
  `;

  private log(action: string) {
    this.clicks++;
    this.lastAction = action;
  }

  private runLoading() {
    this.loading = true;
    this.log('Primary loading action');
    window.setTimeout(() => {
      this.loading = false;
      this.lastAction = 'Loading action finished';
    }, 800);
  }

  template() {
    this.dataset.muiTheme = this.theme;
    this.dataset.muiDensity = "compact";

    return html`
      <div class="page" data-mui-theme=${this.theme} data-mui-density="compact">
        <div class="docs">
          <section class="hero">
            <div class="row">
              <h1>mui-button</h1>
              <mui-button size="sm" variant="secondary" @click=${() => this.theme = this.theme === 'light' ? 'dark' : 'light'}>Toggle theme</mui-button>
            </div>
            <p>Use buttons for explicit commands. The component supports variants, sizes, icon slots, loading state, disabled state, and block layout.</p>
            <p>Typical use: <code>&lt;mui-button variant="secondary"&gt;Save&lt;/mui-button&gt;</code></p>
          </section>

          <section class="section">
            <h2>Variants</h2>
            <div class="row">
              <mui-button @click=${() => this.runLoading()} .loading=${this.loading}>
                <mui-icon slot="icon-start" name="spark"></mui-icon>
                Primary
              </mui-button>
              <mui-button variant="secondary" @click=${() => this.log('Secondary')}>Secondary</mui-button>
              <mui-button variant="ghost" @click=${() => this.log('Ghost')}>Ghost</mui-button>
              <mui-button variant="danger" @click=${() => this.log('Danger')}>Danger</mui-button>
            </div>
          </section>

          <section class="section">
            <h2>Sizes and States</h2>
            <div class="row">
              <mui-button size="sm" @click=${() => this.log('Small')}>Small</mui-button>
              <mui-button size="md" @click=${() => this.log('Medium')}>Medium</mui-button>
              <mui-button size="lg" @click=${() => this.log('Large')}>Large</mui-button>
              <mui-button disabled>Disabled</mui-button>
            </div>
            <mui-button block variant="secondary" @click=${() => this.log('Block')}>Block button</mui-button>
          </section>

          <section class="section">
            <h2>Interaction State</h2>
            <div class="state">
              <div class="metric"><span>Clicks</span><strong>${this.clicks}</strong></div>
              <div class="metric"><span>Last action</span><strong>${this.lastAction}</strong></div>
              <div class="metric"><span>Loading</span><strong>${this.loading ? 'yes' : 'no'}</strong></div>
            </div>
          </section>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('mui-button-story')) customElements.define('mui-button-story', MuiButtonStory);

const meta: Meta<MuiButtonStory> = {
  title: 'Miura UI Next/Elements/Button',
  component: 'mui-button-story',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Command button with variants, sizes, icon slots, disabled state, loading state, focus-visible styling, and block layout.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<MuiButtonStory>;

export const Documentation: Story = {
  args: { theme: 'light', loading: false, clicks: 0, lastAction: 'None yet' },
};
