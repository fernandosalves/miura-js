import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiToastStory extends MiuraElement {
  static properties = {
    open: { type: Boolean, default: false },
    tone: { type: String, default: 'success' },
    shows: { type: Number, default: 0 },
  };

  declare open: boolean;
  declare tone: 'neutral' | 'success' | 'warning' | 'danger';
  declare shows: number;

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 520px; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .docs { max-width: 820px; display: grid; gap: 18px; }
    .section { display: grid; gap: 14px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); box-shadow: var(--mui-shadow-sm); padding: 18px; }
    .row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .toast-area { min-height: 96px; display: flex; align-items: flex-end; }
    h1, p { margin: 0; }
    p { color: var(--mui-color-text-muted); line-height: 1.5; }
  `;

  private show(tone: 'neutral' | 'success' | 'warning' | 'danger') {
    this.tone = tone;
    this.open = true;
    this.shows++;
  }

  template() {
    this.dataset.muiTheme = 'light';
    this.dataset.muiDensity = 'compact';

    return html`
      <div class="page">
        <div class="docs">
          <section class="section">
            <h1>mui-toast</h1>
            <p>Toast is a transient status surface with tone variants and dismiss behavior.</p>
          </section>
          <section class="section">
            <div class="row">
              <mui-button size="sm" @click=${() => this.show('success')}>Success</mui-button>
              <mui-button size="sm" variant="secondary" @click=${() => this.show('warning')}>Warning</mui-button>
              <mui-button size="sm" variant="danger" @click=${() => this.show('danger')}>Danger</mui-button>
              <mui-button size="sm" variant="ghost" @click=${() => this.show('neutral')}>Neutral</mui-button>
            </div>
            <p>Shown ${this.shows} times.</p>
            <div class="toast-area">
              <mui-toast .open=${this.open} .tone=${this.tone} @open-change=${(event: CustomEvent) => this.open = event.detail.open}>
                ${this.tone} notification from Miura UI.
              </mui-toast>
            </div>
          </section>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('mui-toast-story')) customElements.define('mui-toast-story', MuiToastStory);

const meta: Meta<MuiToastStory> = {
  title: 'Miura UI Next/Elements/Toast',
  component: 'mui-toast-story',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<MuiToastStory>;
export const Documentation: Story = { args: { open: false, tone: 'success', shows: 0 } };
