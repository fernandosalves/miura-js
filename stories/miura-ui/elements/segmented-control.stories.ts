import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiSegmentedControlStory extends MiuraElement {
  static properties = { theme: { type: String, default: 'light' }, value: { type: String, default: 'list' } };
  declare theme: 'light' | 'dark';
  declare value: string;

  private items = [
    { id: 'list', label: 'List', icon: 'list' },
    { id: 'board', label: 'Board', icon: 'panel' },
    { id: 'graph', label: 'Graph', icon: 'spark' },
    { id: 'archived', label: 'Archived', disabled: true },
  ];

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 380px; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .section { max-width: 780px; display: grid; gap: 16px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); padding: 18px; box-shadow: var(--mui-shadow-sm); }
    .row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    .metric { width: max-content; padding: 10px 12px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-md); background: var(--mui-color-surface-muted); }
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
            <h1>mui-segmented-control</h1>
            <mui-button size="sm" variant="secondary" @click=${() => this.theme = this.theme === 'light' ? 'dark' : 'light'}>Toggle theme</mui-button>
          </div>
          <p>Segmented controls switch between close alternatives, such as list, board, and graph views.</p>
          <mui-segmented-control
            .items=${this.items}
            .value=${this.value}
            @change=${(event: CustomEvent) => this.value = event.detail.value}
          ></mui-segmented-control>
          <mui-segmented-control size="sm" .items=${this.items} .value=${this.value}></mui-segmented-control>
          <div class="metric">Selected view: <strong>${this.value}</strong></div>
        </section>
      </div>
    `;
  }
}

if (!customElements.get('mui-segmented-control-story')) customElements.define('mui-segmented-control-story', MuiSegmentedControlStory);
const meta: Meta<MuiSegmentedControlStory> = { title: 'Miura UI Next/Elements/Segmented Control', component: 'mui-segmented-control-story', tags: ['autodocs'] };
export default meta;
type Story = StoryObj<MuiSegmentedControlStory>;
export const Documentation: Story = { args: { theme: 'light', value: 'list' } };
