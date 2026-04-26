import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import '../../../packages/miura-ui/src/forms/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiInputStory extends MiuraElement {
  static properties = {
    value: { type: String, default: 'Miura workspace' },
    type: { type: String, default: 'text' },
    touched: { type: Number, default: 0 },
  };

  declare value: string;
  declare type: string;
  declare touched: number;

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 620px; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .docs { max-width: 860px; display: grid; gap: 18px; }
    .section { display: grid; gap: 14px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); box-shadow: var(--mui-shadow-sm); padding: 18px; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
    h1, h2, p { margin: 0; }
    p { color: var(--mui-color-text-muted); line-height: 1.5; }
    .state { border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-md); background: var(--mui-color-surface-muted); padding: 10px; font-family: var(--mui-font-mono); font-size: var(--mui-text-sm); }
  `;

  private update(event: CustomEvent) {
    this.value = event.detail.value;
    this.touched++;
  }

  template() {
    this.dataset.muiTheme = "light";
    this.dataset.muiDensity = "compact";

    return html`
      <div class="page" data-mui-theme="light" data-mui-density="compact">
        <div class="docs">
          <section class="section">
            <h1>mui-input</h1>
            <p>Text input with native input semantics, invalid state, disabled state, and bubbling composed input/change events.</p>
          </section>
          <section class="section">
            <h2>Examples</h2>
            <div class="grid">
              <mui-field label="Default input" help="Change events update the state panel.">
                <mui-input .value=${this.value} placeholder="Workspace name" @change=${(event: CustomEvent) => this.update(event)}></mui-input>
              </mui-field>
              <mui-field label="Search input">
                <mui-input type="search" placeholder="Search workspace"></mui-input>
              </mui-field>
              <mui-field label="Invalid input" error="Use invalid for validation feedback.">
                <mui-input invalid value="Invalid value"></mui-input>
              </mui-field>
              <mui-field label="Disabled input">
                <mui-input disabled value="Read only for now"></mui-input>
              </mui-field>
            </div>
          </section>
          <section class="section">
            <h2>State</h2>
            <div class="state">value="${this.value}" changes=${this.touched}</div>
          </section>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('mui-input-story')) customElements.define('mui-input-story', MuiInputStory);

const meta: Meta<MuiInputStory> = {
  title: 'Miura UI Next/Elements/Input',
  component: 'mui-input-story',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<MuiInputStory>;

export const Documentation: Story = {
  args: { value: 'Miura workspace', type: 'text', touched: 0 },
};
