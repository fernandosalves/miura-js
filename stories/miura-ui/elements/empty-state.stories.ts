import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiEmptyStateStory extends MiuraElement {
  static properties = { created: { type: Number, default: 0 } };
  declare created: number;

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 480px; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .frame { max-width: 760px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); box-shadow: var(--mui-shadow-sm); }
  `;

  template() {
    this.dataset.muiTheme = 'light';
    this.dataset.muiDensity = 'compact';
    return html`
      <div class="page">
        <div class="frame">
          <mui-empty-state icon="folder" heading="No pages yet" description="Create the first page in this notebook to start building a workspace.">
            <mui-button slot="actions" @click=${() => this.created++}>
              <mui-icon slot="icon-start" name="plus"></mui-icon>
              Create page
            </mui-button>
            <mui-button slot="actions" variant="secondary">Import</mui-button>
          </mui-empty-state>
        </div>
        <p>Created clicks: ${this.created}</p>
      </div>
    `;
  }
}

if (!customElements.get('mui-empty-state-story')) customElements.define('mui-empty-state-story', MuiEmptyStateStory);
const meta: Meta<MuiEmptyStateStory> = { title: 'Miura UI Next/Elements/Empty State', component: 'mui-empty-state-story', tags: ['autodocs'] };
export default meta;
type Story = StoryObj<MuiEmptyStateStory>;
export const Documentation: Story = { args: { created: 0 } };
