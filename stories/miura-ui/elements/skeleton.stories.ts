import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiSkeletonStory extends MiuraElement {
  static properties = { theme: { type: String, default: 'light' }, animated: { type: Boolean, default: true } };
  declare theme: 'light' | 'dark';
  declare animated: boolean;

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 420px; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .section { max-width: 760px; display: grid; gap: 16px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); padding: 18px; box-shadow: var(--mui-shadow-sm); }
    .row { display: flex; gap: 12px; align-items: center; }
    .card { display: grid; grid-template-columns: auto 1fr; gap: 14px; align-items: start; max-width: 520px; padding: 14px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-md); }
    .stack { display: grid; gap: 10px; }
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
            <h1>mui-skeleton</h1>
            <mui-button size="sm" variant="secondary" @click=${() => this.theme = this.theme === 'light' ? 'dark' : 'light'}>Toggle theme</mui-button>
            <mui-switch .checked=${this.animated} @change=${(event: CustomEvent) => this.animated = event.detail.checked}>Animated</mui-switch>
          </div>
          <p>Skeleton preserves layout while data is being fetched, reducing jumpy workspace screens.</p>
          <div class="card">
            <mui-skeleton variant="circle" ?animated=${this.animated}></mui-skeleton>
            <div class="stack">
              <mui-skeleton ?animated=${this.animated} style="width: 42%"></mui-skeleton>
              <mui-skeleton ?animated=${this.animated} style="width: 78%"></mui-skeleton>
              <mui-skeleton ?animated=${this.animated} style="width: 64%"></mui-skeleton>
            </div>
          </div>
          <mui-skeleton variant="block" ?animated=${this.animated}></mui-skeleton>
        </section>
      </div>
    `;
  }
}

if (!customElements.get('mui-skeleton-story')) customElements.define('mui-skeleton-story', MuiSkeletonStory);
const meta: Meta<MuiSkeletonStory> = { title: 'Miura UI Next/Elements/Skeleton', component: 'mui-skeleton-story', tags: ['autodocs'] };
export default meta;
type Story = StoryObj<MuiSkeletonStory>;
export const Documentation: Story = { args: { theme: 'light', animated: true } };
