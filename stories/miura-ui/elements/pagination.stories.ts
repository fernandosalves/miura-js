import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiPaginationStory extends MiuraElement {
  static properties = {
    page: { type: Number, default: 2 },
    total: { type: Number, default: 6 },
  };

  declare page: number;
  declare total: number;

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 360px; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .docs { max-width: 760px; display: grid; gap: 18px; }
    .section { display: grid; gap: 14px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); box-shadow: var(--mui-shadow-sm); padding: 18px; }
    h1, p { margin: 0; }
    p { color: var(--mui-color-text-muted); line-height: 1.5; }
  `;

  template() {
    this.dataset.muiTheme = 'light';
    this.dataset.muiDensity = 'compact';
    return html`
      <div class="page">
        <div class="docs">
          <section class="section">
            <h1>mui-pagination</h1>
            <p>Pagination for compact page-based data sets.</p>
          </section>
          <section class="section">
            <mui-pagination .page=${this.page} .total=${this.total} @change=${(event: CustomEvent) => this.page = event.detail.page}></mui-pagination>
            <p>Current page: ${this.page} of ${this.total}</p>
          </section>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('mui-pagination-story')) customElements.define('mui-pagination-story', MuiPaginationStory);

const meta: Meta<MuiPaginationStory> = {
  title: 'Miura UI Next/Elements/Pagination',
  component: 'mui-pagination-story',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<MuiPaginationStory>;
export const Documentation: Story = { args: { page: 2, total: 6 } };
