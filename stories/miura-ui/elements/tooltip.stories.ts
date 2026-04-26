import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiTooltipStory extends MiuraElement {
  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 420px; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .docs { max-width: 760px; display: grid; gap: 18px; }
    .section { display: grid; gap: 14px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); box-shadow: var(--mui-shadow-sm); padding: 18px; }
    .row { display: flex; align-items: center; gap: 20px; min-height: 120px; }
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
            <h1>mui-tooltip</h1>
            <p>Hover/focus helper text for icon-only or unfamiliar controls.</p>
          </section>
          <section class="section">
            <div class="row">
              <mui-tooltip text="Create a new item">
                <mui-button variant="secondary">
                  <mui-icon slot="icon-start" name="plus"></mui-icon>
                  New
                </mui-button>
              </mui-tooltip>
              <mui-tooltip text="Open workspace settings">
                <mui-button variant="ghost">
                  <mui-icon slot="icon-start" name="settings"></mui-icon>
                  Settings
                </mui-button>
              </mui-tooltip>
            </div>
          </section>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('mui-tooltip-story')) customElements.define('mui-tooltip-story', MuiTooltipStory);

const meta: Meta<MuiTooltipStory> = {
  title: 'Miura UI Next/Elements/Tooltip',
  component: 'mui-tooltip-story',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<MuiTooltipStory>;
export const Documentation: Story = {};
