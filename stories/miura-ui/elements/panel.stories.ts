import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiPanelStory extends MiuraElement {
  static properties = {
    subtle: { type: Boolean, default: false },
  };

  declare subtle: boolean;

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 560px; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .docs { max-width: 860px; display: grid; gap: 18px; }
    .section { display: grid; gap: 14px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); box-shadow: var(--mui-shadow-sm); padding: 18px; }
    .frame { height: 320px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); overflow: hidden; }
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
            <h1>mui-panel</h1>
            <p>Panel is a structured workspace surface with optional title and action slot.</p>
            <mui-switch .checked=${this.subtle} @change=${(event: CustomEvent) => this.subtle = event.detail.checked}>Subtle panel</mui-switch>
          </section>
          <div class="frame">
            <mui-panel title="Content Explorer" .subtle=${this.subtle}>
              <mui-button slot="actions" size="sm" variant="ghost">
                <mui-icon slot="icon-start" name="plus"></mui-icon>
                New
              </mui-button>
              <p>Panels are useful for sidebars, inspectors, context areas, and tool regions.</p>
            </mui-panel>
          </div>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('mui-panel-story')) customElements.define('mui-panel-story', MuiPanelStory);

const meta: Meta<MuiPanelStory> = {
  title: 'Miura UI Next/Elements/Panel',
  component: 'mui-panel-story',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<MuiPanelStory>;
export const Documentation: Story = { args: { subtle: false } };
