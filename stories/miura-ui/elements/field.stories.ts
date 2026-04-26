import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import '../../../packages/miura-ui/src/forms/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiFieldStory extends MiuraElement {
  static properties = {
    title: { type: String, default: '' },
  };

  declare title: string;

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 560px; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .docs { max-width: 780px; display: grid; gap: 18px; }
    .section { display: grid; gap: 14px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); box-shadow: var(--mui-shadow-sm); padding: 18px; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
    h1, h2, p { margin: 0; }
    p { color: var(--mui-color-text-muted); line-height: 1.5; }
  `;

  template() {
    this.dataset.muiTheme = "light";
    this.dataset.muiDensity = "compact";

    return html`
      <div class="page" data-mui-theme="light" data-mui-density="compact">
        <div class="docs">
          <section class="section">
            <h1>mui-field</h1>
            <p>Field is the label/help/error wrapper for form controls. It keeps form composition consistent without inventing a second form model.</p>
          </section>
          <section class="section">
            <h2>Examples</h2>
            <div class="grid">
              <mui-field label="Title" help="Short, clear workspace names work best." required>
                <mui-input .value=${this.title} placeholder="Enter title" @change=${(event: CustomEvent) => this.title = event.detail.value}></mui-input>
              </mui-field>
              <mui-field label="Slug" error="This slug is already in use.">
                <mui-input invalid value="miura-ui"></mui-input>
              </mui-field>
              <mui-field label="Feature flag" help="Slots can contain any compatible control.">
                <mui-switch checked>Enabled</mui-switch>
              </mui-field>
            </div>
          </section>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('mui-field-story')) customElements.define('mui-field-story', MuiFieldStory);

const meta: Meta<MuiFieldStory> = {
  title: 'Miura UI Next/Elements/Field',
  component: 'mui-field-story',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<MuiFieldStory>;

export const Documentation: Story = {
  args: { title: '' },
};
