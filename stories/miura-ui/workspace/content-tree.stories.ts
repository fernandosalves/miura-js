import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import '../../../packages/miura-ui/src/workspace/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiContentTreeStory extends MiuraElement {
  static properties = {
    active: { type: String, default: 'page-1' },
    expanded: { type: Array, default: () => ['board-1'] },
    lastEvent: { type: String, default: 'None yet' },
  };

  declare active: string;
  declare expanded: string[];
  declare lastEvent: string;

  private items = [
    { id: 'board-1', label: 'Design system', icon: 'folder', children: [
      { id: 'page-1', label: 'Tokens', icon: 'file' },
      { id: 'page-2', label: 'Elements', icon: 'file' },
    ] },
    { id: 'board-2', label: 'Workspace', icon: 'folder', children: [
      { id: 'page-3', label: 'App shell', icon: 'file' },
      { id: 'page-4', label: 'Panels', icon: 'file' },
    ] },
  ];

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 620px; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .docs { max-width: 780px; display: grid; gap: 18px; }
    .section { display: grid; gap: 14px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); box-shadow: var(--mui-shadow-sm); padding: 18px; }
    h1, h2, p { margin: 0; }
    p { color: var(--mui-color-text-muted); line-height: 1.5; }
    .state { border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-md); background: var(--mui-color-surface-muted); padding: 10px; font-family: var(--mui-font-mono); font-size: var(--mui-text-sm); }
  `;

  template() {
    this.dataset.muiTheme = "light";
    this.dataset.muiDensity = "compact";

    return html`
      <div class="page" data-mui-theme="light" data-mui-density="compact">
        <div class="docs">
          <section class="section">
            <h1>mui-content-tree</h1>
            <p>Generic tree surface for notebooks, content explorers, sidebars, and nested workspace navigation.</p>
          </section>
          <section class="section">
            <mui-content-tree
              .items=${this.items}
              .active=${this.active}
              .expanded=${this.expanded}
              @item-select=${(event: CustomEvent) => {
                this.active = event.detail.id;
                this.lastEvent = `item-select ${event.detail.id}`;
              }}
              @expanded-change=${(event: CustomEvent) => {
                this.expanded = event.detail.expanded;
                this.lastEvent = `expanded ${this.expanded.join(',') || 'none'}`;
              }}
            ></mui-content-tree>
          </section>
          <section class="section">
            <h2>State</h2>
            <div class="state">active=${this.active} expanded=${this.expanded.join(',')} last=${this.lastEvent}</div>
          </section>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('mui-content-tree-story')) customElements.define('mui-content-tree-story', MuiContentTreeStory);

const meta: Meta<MuiContentTreeStory> = {
  title: 'Miura UI Next/Workspace/Content Tree',
  component: 'mui-content-tree-story',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<MuiContentTreeStory>;

export const Documentation: Story = {
  args: { active: 'page-1', expanded: ['board-1'], lastEvent: 'None yet' },
};
