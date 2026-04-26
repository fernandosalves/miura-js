import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import '../../../packages/miura-ui/src/forms/index';
import '../../../packages/miura-ui/src/workspace/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiPropertyPanelStory extends MiuraElement {
  static properties = {
    theme: { type: String, default: 'light' },
    collapsed: { type: Boolean, default: false },
  };

  declare theme: 'light' | 'dark';
  declare collapsed: boolean;

  private items = [
    { label: 'Type', value: 'Node card' },
    { label: 'State', value: 'Selected', tone: 'accent' },
    { label: 'Owner', value: 'Design systems' },
    { label: 'Confidence', value: '72%', tone: 'success' },
  ];

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { height: 620px; padding: 28px; box-sizing: border-box; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .layout { height: 100%; display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 18px; }
    .section { display: grid; gap: 14px; align-content: start; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); padding: 18px; box-shadow: var(--mui-shadow-sm); }
    .row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    h1, p { margin: 0; }
    p { color: var(--mui-color-text-muted); line-height: 1.5; }
  `;

  template() {
    this.dataset.muiTheme = this.theme;
    this.dataset.muiDensity = 'compact';
    return html`
      <div class="page">
        <div class="layout">
          <section class="section">
            <div class="row">
              <h1>mui-property-panel</h1>
              <mui-button size="sm" variant="secondary" @click=${() => this.theme = this.theme === 'light' ? 'dark' : 'light'}>Toggle theme</mui-button>
            </div>
            <p>Property panel is the standard inspector surface for selected nodes, cards, calendar events, or document blocks.</p>
          </section>
          <mui-property-panel
            heading="Selected node"
            description="Editable metadata for the current canvas selection."
            .items=${this.items}
            .collapsed=${this.collapsed}
            @collapsed-change=${(event: CustomEvent) => this.collapsed = event.detail.collapsed}
          >
            <mui-field label="Label"><mui-input value="Decision"></mui-input></mui-field>
            <mui-field label="Notes"><mui-textarea value="Use slots for custom app content."></mui-textarea></mui-field>
          </mui-property-panel>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('mui-property-panel-story')) customElements.define('mui-property-panel-story', MuiPropertyPanelStory);
const meta: Meta<MuiPropertyPanelStory> = { title: 'Miura UI Next/Workspace/Property Panel', component: 'mui-property-panel-story', tags: ['autodocs'] };
export default meta;
type Story = StoryObj<MuiPropertyPanelStory>;
export const Documentation: Story = { args: { theme: 'light', collapsed: false } };
