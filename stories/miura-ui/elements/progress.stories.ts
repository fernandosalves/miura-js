import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiProgressStory extends MiuraElement {
  static properties = { value: { type: Number, default: 48 } };
  declare value: number;

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 360px; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .section { max-width: 760px; display: grid; gap: 16px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); box-shadow: var(--mui-shadow-sm); padding: 18px; }
    .row { display: flex; gap: 10px; }
    h1, p { margin: 0; }
    p { color: var(--mui-color-text-muted); }
  `;

  template() {
    this.dataset.muiTheme = 'light';
    this.dataset.muiDensity = 'compact';
    return html`
      <div class="page">
        <section class="section">
          <h1>mui-progress</h1>
          <p>Progress indicates completion for uploads, async tasks, and setup flows.</p>
          <mui-progress label="Migration progress" .value=${this.value}></mui-progress>
          <div class="row">
            <mui-button size="sm" variant="secondary" @click=${() => this.value = Math.max(0, this.value - 10)}>Less</mui-button>
            <mui-button size="sm" @click=${() => this.value = Math.min(100, this.value + 10)}>More</mui-button>
          </div>
        </section>
      </div>
    `;
  }
}

if (!customElements.get('mui-progress-story')) customElements.define('mui-progress-story', MuiProgressStory);
const meta: Meta<MuiProgressStory> = { title: 'Miura UI Next/Elements/Progress', component: 'mui-progress-story', tags: ['autodocs'] };
export default meta;
type Story = StoryObj<MuiProgressStory>;
export const Documentation: Story = { args: { value: 48 } };
