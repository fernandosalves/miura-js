import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import '../../../packages/miura-ui/src/forms/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiTextareaStory extends MiuraElement {
  static properties = {
    value: { type: String, default: 'Write notes for the workspace...' },
    changes: { type: Number, default: 0 },
  };

  declare value: string;
  declare changes: number;

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 580px; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .docs { max-width: 820px; display: grid; gap: 18px; }
    .section { display: grid; gap: 14px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); box-shadow: var(--mui-shadow-sm); padding: 18px; }
    h1, h2, p { margin: 0; }
    p { color: var(--mui-color-text-muted); line-height: 1.5; }
    .state { font-family: var(--mui-font-mono); color: var(--mui-color-text-muted); }
  `;

  template() {
    this.dataset.muiTheme = 'light';
    this.dataset.muiDensity = 'compact';

    return html`
      <div class="page">
        <div class="docs">
          <section class="section">
            <h1>mui-textarea</h1>
            <p>Multi-line text control with invalid and disabled states, resize support, and bubbling composed input/change events.</p>
          </section>
          <section class="section">
            <mui-field label="Workspace notes" help="Type to update state.">
              <mui-textarea .value=${this.value} rows="5" @change=${(event: CustomEvent) => {
                this.value = event.detail.value;
                this.changes++;
              }}></mui-textarea>
            </mui-field>
            <mui-field label="Invalid note" error="Notes must be at least 12 characters.">
              <mui-textarea invalid value="Too short"></mui-textarea>
            </mui-field>
            <div class="state">characters=${this.value.length} changes=${this.changes}</div>
          </section>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('mui-textarea-story')) customElements.define('mui-textarea-story', MuiTextareaStory);

const meta: Meta<MuiTextareaStory> = {
  title: 'Miura UI Next/Elements/Textarea',
  component: 'mui-textarea-story',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<MuiTextareaStory>;
export const Documentation: Story = { args: { value: 'Write notes for the workspace...', changes: 0 } };
