import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiBadgeStory extends MiuraElement {
  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 420px; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .docs { max-width: 760px; display: grid; gap: 18px; }
    .section { display: grid; gap: 14px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); box-shadow: var(--mui-shadow-sm); padding: 18px; }
    .row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    h1, h2, p { margin: 0; }
    p { color: var(--mui-color-text-muted); line-height: 1.5; }
  `;

  template() {
    this.dataset.muiTheme = 'light';
    this.dataset.muiDensity = 'compact';
    const tones = ['neutral', 'accent', 'success', 'warning', 'danger'];

    return html`
      <div class="page">
        <div class="docs">
          <section class="section">
            <h1>mui-badge</h1>
            <p>Small status label for metadata, state, counts, and workflow markers.</p>
          </section>
          <section class="section">
            <h2>Soft</h2>
            <div class="row">${tones.map((tone) => html`<mui-badge tone=${tone}>${tone}</mui-badge>`)}</div>
          </section>
          <section class="section">
            <h2>Solid and Outline</h2>
            <div class="row">
              ${tones.map((tone) => html`<mui-badge tone=${tone} variant="solid">${tone}</mui-badge>`)}
              ${tones.map((tone) => html`<mui-badge tone=${tone} variant="outline">${tone}</mui-badge>`)}
            </div>
          </section>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('mui-badge-story')) customElements.define('mui-badge-story', MuiBadgeStory);

const meta: Meta<MuiBadgeStory> = {
  title: 'Miura UI Next/Elements/Badge',
  component: 'mui-badge-story',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<MuiBadgeStory>;
export const Documentation: Story = {};
