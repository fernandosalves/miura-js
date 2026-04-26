import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import '../../../packages/miura-ui/src/forms/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiSelectStory extends MiuraElement {
  static properties = {
    value: { type: String, default: 'compact' },
    changes: { type: Number, default: 0 },
  };

  declare value: string;
  declare changes: number;

  private options = [
    { value: 'compact', label: 'Compact' },
    { value: 'cozy', label: 'Cozy' },
    { value: 'comfortable', label: 'Comfortable' },
    { value: 'disabled', label: 'Disabled option', disabled: true },
  ];

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 520px; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .docs { max-width: 760px; display: grid; gap: 18px; }
    .section { display: grid; gap: 14px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); box-shadow: var(--mui-shadow-sm); padding: 18px; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
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
            <h1>mui-select</h1>
            <p>Native select wrapper with token styling, invalid/disabled states, and typed option data.</p>
          </section>
          <section class="section">
            <div class="grid">
              <mui-field label="Density">
                <mui-select .options=${this.options} .value=${this.value} @change=${(event: CustomEvent) => {
                  this.value = event.detail.value;
                  this.changes++;
                }}></mui-select>
              </mui-field>
              <mui-field label="Invalid select" error="Please choose a valid value.">
                <mui-select invalid .options=${this.options} value=""></mui-select>
              </mui-field>
              <mui-field label="Disabled select">
                <mui-select disabled .options=${this.options} value="compact"></mui-select>
              </mui-field>
            </div>
            <p>value=${this.value} changes=${this.changes}</p>
          </section>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('mui-select-story')) customElements.define('mui-select-story', MuiSelectStory);

const meta: Meta<MuiSelectStory> = {
  title: 'Miura UI Next/Elements/Select',
  component: 'mui-select-story',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<MuiSelectStory>;
export const Documentation: Story = { args: { value: 'compact', changes: 0 } };
