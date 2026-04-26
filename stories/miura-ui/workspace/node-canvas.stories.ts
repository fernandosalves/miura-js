import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import '../../../packages/miura-ui/src/workspace/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiNodeCanvasStory extends MiuraElement {
  static properties = {
    theme: { type: String, default: 'light' },
    selected: { type: String, default: 'brief' },
    zoom: { type: Number, default: 1 },
    nodes: { type: Array, default: () => [
      { id: 'brief', x: 96, y: 90, width: 240, title: 'Brief', subtitle: 'Inputs and constraints', icon: 'file', tone: 'accent' },
      { id: 'research', x: 430, y: 64, width: 250, title: 'Research', subtitle: 'Evidence, links, notes', icon: 'search', tone: 'warning' },
      { id: 'board', x: 430, y: 292, width: 250, title: 'Board', subtitle: 'Tasks and execution', icon: 'columns', tone: 'success' },
      { id: 'decision', x: 790, y: 178, width: 240, title: 'Decision', subtitle: 'Final recommendation', icon: 'spark' },
    ] },
    connectors: { type: Array, default: () => [
      { id: 'c1', from: 'brief', to: 'research', tone: 'accent' },
      { id: 'c2', from: 'brief', to: 'board' },
      { id: 'c3', from: 'research', to: 'decision', tone: 'warning' },
      { id: 'c4', from: 'board', to: 'decision', tone: 'success' },
    ] },
    log: { type: String, default: 'Drag a node or select a card.' },
  };

  declare theme: 'light' | 'dark';
  declare selected: string;
  declare zoom: number;
  declare nodes: any[];
  declare connectors: any[];
  declare log: string;

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { height: 760px; box-sizing: border-box; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .docs { height: 100%; display: grid; grid-template-rows: auto minmax(0, 1fr); gap: 18px; }
    .section { display: grid; gap: 14px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); padding: 18px; box-shadow: var(--mui-shadow-sm); }
    .row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .custom { display: grid; gap: 10px; }
    .custom p { margin: 0; }
    h1, p { margin: 0; }
    p { color: var(--mui-color-text-muted); line-height: 1.5; }
  `;

  template() {
    this.dataset.muiTheme = this.theme;
    this.dataset.muiDensity = 'compact';
    return html`
      <div class="page">
        <div class="docs">
          <section class="section">
            <div class="row">
              <h1>mui-node-canvas</h1>
              <mui-button size="sm" variant="secondary" @click=${() => this.theme = this.theme === 'light' ? 'dark' : 'light'}>Toggle theme</mui-button>
              <mui-button size="sm" variant="ghost" @click=${() => this.zoom = Math.max(0.75, Number((this.zoom - 0.1).toFixed(2)))}>Zoom out</mui-button>
              <mui-button size="sm" variant="ghost" @click=${() => this.zoom = Math.min(1.3, Number((this.zoom + 0.1).toFixed(2)))}>Zoom in</mui-button>
            </div>
            <p>Generic node canvas for connected cards. Developers can render custom node content through slots; this is not tied to notebooks or the blog.</p>
            <mui-badge>${this.log}</mui-badge>
          </section>
          <mui-node-canvas
            .nodes=${this.nodes}
            .connectors=${this.connectors}
            .selected=${this.selected}
            .zoom=${this.zoom}
            @node-select=${(event: CustomEvent) => {
              this.selected = event.detail.node.id;
              this.log = `${event.detail.node.title} selected`;
            }}
            @node-move=${(event: CustomEvent) => {
              this.nodes = this.nodes.map((node) => node.id === event.detail.node.id ? event.detail.node : node);
              this.log = `${event.detail.node.title} moved to ${event.detail.node.x}, ${event.detail.node.y}`;
            }}
          >
            <mui-node-card slot="node-decision" node-id="decision" tone="accent" .selected=${this.selected === 'decision'}>
              <mui-icon slot="icon" name="spark"></mui-icon>
              <span slot="header">Decision</span>
              <mui-button slot="actions" size="sm" variant="ghost">Open</mui-button>
              <div class="custom">
                <p>Use this node slot for rich app content: forms, charts, markdown, previews, or blog notebook blocks.</p>
                <mui-progress value="72" label="Confidence"></mui-progress>
              </div>
            </mui-node-card>
          </mui-node-canvas>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('mui-node-canvas-story')) customElements.define('mui-node-canvas-story', MuiNodeCanvasStory);
const meta: Meta<MuiNodeCanvasStory> = { title: 'Miura UI Next/Workspace/Node Canvas', component: 'mui-node-canvas-story', tags: ['autodocs'] };
export default meta;
type Story = StoryObj<MuiNodeCanvasStory>;
export const Documentation: Story = { args: { theme: 'light', selected: 'brief', zoom: 1 } };
