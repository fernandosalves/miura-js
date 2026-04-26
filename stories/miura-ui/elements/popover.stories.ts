import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiPopoverStory extends MiuraElement {
  static properties = {
    open: { type: Boolean, default: false },
    placement: { type: String, default: 'bottom-start' },
  };

  declare open: boolean;
  declare placement: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 560px; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .docs { max-width: 820px; display: grid; gap: 18px; }
    .section { display: grid; gap: 14px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); box-shadow: var(--mui-shadow-sm); padding: 18px; }
    .playground { min-height: 260px; display: grid; place-items: center; }
    .row { display: flex; gap: 10px; flex-wrap: wrap; }
    h1, h2, p { margin: 0; }
    p { color: var(--mui-color-text-muted); line-height: 1.5; }
  `;

  template() {
    this.dataset.muiTheme = 'light';
    this.dataset.muiDensity = 'compact';

    return html`
      <div class="page">
        <div class="docs">
          <section class="section">
            <h1>mui-popover</h1>
            <p>Anchored floating panel for compact contextual controls. Click outside or press Escape to close.</p>
            <div class="row">
              ${(['bottom-start', 'bottom-end', 'top-start', 'top-end'] as const).map((placement) => html`
                <mui-button size="sm" variant=${this.placement === placement ? 'primary' : 'secondary'} @click=${() => this.placement = placement}>${placement}</mui-button>
              `)}
            </div>
          </section>
          <section class="section playground">
            <mui-popover .open=${this.open} .placement=${this.placement} @open-change=${(event: CustomEvent) => this.open = event.detail.open}>
              <mui-button slot="anchor">
                <mui-icon slot="icon-start" name="settings"></mui-icon>
                Open popover
              </mui-button>
              <h2>Popover content</h2>
              <p>Use this for small controls, metadata, filters, or quick actions.</p>
              <mui-button size="sm" @click=${() => this.open = false}>Done</mui-button>
            </mui-popover>
          </section>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('mui-popover-story')) customElements.define('mui-popover-story', MuiPopoverStory);

const meta: Meta<MuiPopoverStory> = {
  title: 'Miura UI Next/Elements/Popover',
  component: 'mui-popover-story',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<MuiPopoverStory>;
export const Documentation: Story = { args: { open: false, placement: 'bottom-start' } };
