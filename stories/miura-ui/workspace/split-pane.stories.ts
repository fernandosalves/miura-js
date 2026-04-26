import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import '../../../packages/miura-ui/src/workspace/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiSplitPaneStory extends MiuraElement {
  static properties = {
    direction: { type: String, default: 'horizontal' },
    size: { type: Number, default: 320 },
  };

  declare direction: 'horizontal' | 'vertical';
  declare size: number;

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { height: 680px; padding: 28px; box-sizing: border-box; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .docs { height: 100%; display: grid; grid-template-rows: auto minmax(0, 1fr); gap: 18px; }
    .section { display: grid; gap: 14px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); box-shadow: var(--mui-shadow-sm); padding: 18px; }
    .pane { height: 100%; box-sizing: border-box; padding: 16px; background: var(--mui-color-surface); color: var(--mui-color-text); }
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
            <h1>mui-split-pane</h1>
            <p>Resizable two-pane layout. Drag the divider; resize events update the state below.</p>
            <p>direction=${this.direction} size=${this.size}px</p>
            <mui-button size="sm" variant="secondary" @click=${() => this.direction = this.direction === 'horizontal' ? 'vertical' : 'horizontal'}>Toggle direction</mui-button>
          </section>
          <mui-split-pane
            .direction=${this.direction}
            .size=${this.size}
            min="180"
            max="560"
            @resize=${(event: CustomEvent) => this.size = Math.round(event.detail.size)}
          >
            <div slot="primary" class="pane"><h2>Primary</h2><p>Navigation, outline, list, or tools.</p></div>
            <div slot="secondary" class="pane"><h2>Secondary</h2><p>Main canvas, detail view, editor, or board.</p></div>
          </mui-split-pane>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('mui-split-pane-story')) customElements.define('mui-split-pane-story', MuiSplitPaneStory);

const meta: Meta<MuiSplitPaneStory> = {
  title: 'Miura UI Next/Workspace/Split Pane',
  component: 'mui-split-pane-story',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<MuiSplitPaneStory>;

export const Documentation: Story = {
  args: { direction: 'horizontal', size: 320 },
};
