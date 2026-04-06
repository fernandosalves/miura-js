import { MiuraElement, html, css } from '@miurajs/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';
import './panel';
import '../data-display/tree-view';

class PanelDemo extends MiuraElement {
  static get styles() {
    return css`
      :host {
        display: block;
        padding: 20px;
        font-family: system-ui;
      }
      .demo-container {
        display: flex;
        height: 600px;
        border: 1px solid var(--mui-border);
      }
      .demo-container-vertical {
        display: flex;
        flex-direction: column;
        height: 600px;
        border: 1px solid var(--mui-border);
      }
      .main-content {
        flex: 1;
        padding: var(--mui-space-4);
        background: var(--mui-surface-subtle);
      }
      .panel-content {
        padding: var(--mui-space-2);
      }
      h2 {
        margin-top: 0;
      }
    `;
  }

  template() {
    return html`
      <div>
        <h3>Default Panel (Left Placement)</h3>
        <div class="demo-container">
          <mui-panel open placement="left" size="md" collapsible>
            <span slot="title">Files</span>
            <div class="panel-content">
              <p>Panel content goes here</p>
              <p>This can be any content: navigation, tools, settings, etc.</p>
            </div>
          </mui-panel>
          <div class="main-content">
            <h2>Main Content</h2>
            <p>This is the main content area. The panel is docked to the left.</p>
          </div>
        </div>

        <h3 style="margin-top: 2rem;">With Tree View</h3>
        <div class="demo-container">
          <mui-panel open placement="left" size="md" collapsible resizable>
            <span slot="title">Project Explorer</span>
            <mui-tree-view draggable selection="single">
              <mui-tree-item id="src" label="src" expanded>
                <span slot="icon">📁</span>
                <mui-tree-item id="components" label="components" expandable>
                  <span slot="icon">📁</span>
                </mui-tree-item>
                <mui-tree-item id="utils" label="utils" expandable>
                  <span slot="icon">📁</span>
                </mui-tree-item>
                <mui-tree-item id="index.ts" label="index.ts">
                  <span slot="icon">📄</span>
                </mui-tree-item>
              </mui-tree-item>
              <mui-tree-item id="package.json" label="package.json">
                <span slot="icon">📄</span>
              </mui-tree-item>
              <mui-tree-item id="tsconfig.json" label="tsconfig.json">
                <span slot="icon">📄</span>
              </mui-tree-item>
            </mui-tree-view>
          </mui-panel>
          <div class="main-content">
            <h2>Code Editor</h2>
            <p>Select a file from the tree to view its contents. Try resizing the panel!</p>
          </div>
        </div>

        <h3 style="margin-top: 2rem;">Right Placement</h3>
        <div class="demo-container">
          <div class="main-content">
            <h2>Main Content</h2>
            <p>The panel is docked to the right with properties and settings.</p>
          </div>
          <mui-panel open placement="right" size="lg" collapsible resizable>
            <span slot="title">Properties</span>
            <div class="panel-content">
              <h3 style="margin-top: 0;">Element Properties</h3>
              <div style="display: flex; flex-direction: column; gap: var(--mui-space-3);">
                <div>
                  <label style="display: block; font-size: var(--mui-text-sm); color: var(--mui-text-secondary); margin-bottom: 4px;">
                    Width
                  </label>
                  <input type="text" value="100%" style="width: 100%; padding: 8px; border: 1px solid var(--mui-border); border-radius: var(--mui-radius-sm);" />
                </div>
                <div>
                  <label style="display: block; font-size: var(--mui-text-sm); color: var(--mui-text-secondary); margin-bottom: 4px;">
                    Height
                  </label>
                  <input type="text" value="auto" style="width: 100%; padding: 8px; border: 1px solid var(--mui-border); border-radius: var(--mui-radius-sm);" />
                </div>
              </div>
            </div>
          </mui-panel>
        </div>

        <h3 style="margin-top: 2rem;">Top Placement</h3>
        <div class="demo-container-vertical">
          <mui-panel open placement="top" size="md" collapsible resizable>
            <span slot="title">Search Results</span>
            <div class="panel-content">
              <div style="margin-bottom: var(--mui-space-2);">
                <strong>Found 42 matches in 8 files</strong>
              </div>
              <div style="display: flex; flex-direction: column; gap: var(--mui-space-2);">
                <div style="padding: var(--mui-space-2); border-left: 2px solid var(--mui-primary); background: var(--mui-surface-subtle);">
                  <div style="font-size: var(--mui-text-sm); color: var(--mui-text-secondary);">src/index.ts:24</div>
                  <code>import { MiuraElement } from '@miurajs/miura-element';</code>
                </div>
              </div>
            </div>
          </mui-panel>
          <div class="main-content">
            <h2>Code Editor</h2>
            <p>Search results are shown in the panel above.</p>
          </div>
        </div>

        <h3 style="margin-top: 2rem;">Bottom Placement (Terminal)</h3>
        <div class="demo-container-vertical">
          <div class="main-content">
            <h2>Code Editor</h2>
            <p>Output and terminal are shown in the panel below.</p>
          </div>
          <mui-panel open placement="bottom" size="md" collapsible resizable>
            <span slot="title">Terminal</span>
            <div style="padding: var(--mui-space-2); font-family: monospace; font-size: var(--mui-text-sm); background: #1e1e1e; color: #d4d4d4;">
              <div>$ npm run dev</div>
              <div style="color: #4ec9b0;">
                VITE v5.0.0  ready in 432 ms
              </div>
              <div>
                ➜  Local:   <span style="color: #569cd6;">http://localhost:5173/</span>
              </div>
            </div>
          </mui-panel>
        </div>
      </div>
    `;
  }
}

customElements.define('panel-demo', PanelDemo);

const meta: Meta<PanelDemo> = {
  title: 'Layout/Panel',
  component: 'panel-demo',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
# Panel

Dockable panel component that can be positioned on any edge of a container.
Perfect for sidebars, properties panels, terminals, search results, etc.

## Features

- **Placements**: left, right, top, bottom
- **Sizes**: sm (200px), md (280px), lg (360px), xl (480px), custom
- **Collapsible**: Toggle open/closed with button
- **Resizable**: Drag handle to resize (200px-800px horizontal, 100px-80vh vertical)
- **Slots**: title, actions, default content
- **Events**: toggle, resize

## Usage

\`\`\`html
<mui-panel open placement="left" size="md" collapsible resizable>
  <span slot="title">Files</span>
  <mui-tree-view>...</mui-tree-view>
</mui-panel>
\`\`\`
        `
      }
    }
  }
};

export default meta;
type Story = StoryObj<PanelDemo>;

export const Default: Story = {
  args: {}
};
