import { MiuraElement, html, css } from '@miurajs/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../../src/navigation/menu.js';

class MenuDemo extends MiuraElement {
  static get styles() {
    return css`
      :host {
        display: block;
        padding: 20px;
        font-family: system-ui;
      }
      .demo-section {
        margin-bottom: 3rem;
      }
      h3 {
        margin-top: 0;
        margin-bottom: 1rem;
      }
      .trigger-button {
        padding: 0.5rem 1rem;
        background: var(--mui-primary);
        color: white;
        border: none;
        border-radius: var(--mui-radius-sm);
        cursor: pointer;
        font-size: var(--mui-text-sm);
      }
      .icon-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        padding: 0;
        background: var(--mui-surface);
        border: 1px solid var(--mui-border);
        border-radius: var(--mui-radius-sm);
        cursor: pointer;
        font-size: 20px;
      }
      .demo-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 2rem;
      }
    `;
  }

  template() {
    return html`
      <div>
        <div class="demo-section">
          <h3>Basic Menu</h3>
          <mui-menu>
            <button class="trigger-button" slot="trigger">Open Menu</button>
            <mui-menu-item label="Edit" icon="✏️"></mui-menu-item>
            <mui-menu-item label="Duplicate" icon="📋"></mui-menu-item>
            <mui-menu-item label="Archive" icon="📦"></mui-menu-item>
            <mui-menu-item divider></mui-menu-item>
            <mui-menu-item label="Delete" icon="🗑️" danger></mui-menu-item>
          </mui-menu>
        </div>

        <div class="demo-section">
          <h3>Menu with Shortcuts</h3>
          <mui-menu>
            <button class="trigger-button" slot="trigger">Actions</button>
            <mui-menu-item label="New File" icon="📄" shortcut="⌘N"></mui-menu-item>
            <mui-menu-item label="Open" icon="📂" shortcut="⌘O"></mui-menu-item>
            <mui-menu-item label="Save" icon="💾" shortcut="⌘S"></mui-menu-item>
            <mui-menu-item divider></mui-menu-item>
            <mui-menu-item label="Copy" icon="📋" shortcut="⌘C"></mui-menu-item>
            <mui-menu-item label="Paste" icon="📌" shortcut="⌘V"></mui-menu-item>
            <mui-menu-item label="Cut" icon="✂️" shortcut="⌘X"></mui-menu-item>
          </mui-menu>
        </div>

        <div class="demo-section">
          <h3>Icon Button Menu</h3>
          <mui-menu placement="bottom-end">
            <button class="icon-button" slot="trigger">⋮</button>
            <mui-menu-item label="Profile" icon="👤"></mui-menu-item>
            <mui-menu-item label="Settings" icon="⚙️"></mui-menu-item>
            <mui-menu-item label="Help" icon="❓"></mui-menu-item>
            <mui-menu-item divider></mui-menu-item>
            <mui-menu-item label="Logout" icon="🚪"></mui-menu-item>
          </mui-menu>
        </div>

        <div class="demo-section">
          <h3>Placement Variants</h3>
          <div class="demo-grid">
            <div>
              <p><strong>Bottom Start</strong></p>
              <mui-menu placement="bottom-start">
                <button class="trigger-button" slot="trigger">Bottom Start</button>
                <mui-menu-item label="Option 1"></mui-menu-item>
                <mui-menu-item label="Option 2"></mui-menu-item>
                <mui-menu-item label="Option 3"></mui-menu-item>
              </mui-menu>
            </div>
            
            <div>
              <p><strong>Bottom End</strong></p>
              <mui-menu placement="bottom-end">
                <button class="trigger-button" slot="trigger">Bottom End</button>
                <mui-menu-item label="Option 1"></mui-menu-item>
                <mui-menu-item label="Option 2"></mui-menu-item>
                <mui-menu-item label="Option 3"></mui-menu-item>
              </mui-menu>
            </div>

            <div>
              <p><strong>Top Start</strong></p>
              <mui-menu placement="top-start">
                <button class="trigger-button" slot="trigger">Top Start</button>
                <mui-menu-item label="Option 1"></mui-menu-item>
                <mui-menu-item label="Option 2"></mui-menu-item>
                <mui-menu-item label="Option 3"></mui-menu-item>
              </mui-menu>
            </div>
            
            <div>
              <p><strong>Top End</strong></p>
              <mui-menu placement="top-end">
                <button class="trigger-button" slot="trigger">Top End</button>
                <mui-menu-item label="Option 1"></mui-menu-item>
                <mui-menu-item label="Option 2"></mui-menu-item>
                <mui-menu-item label="Option 3"></mui-menu-item>
              </mui-menu>
            </div>
          </div>
        </div>

        <div class="demo-section">
          <h3>Disabled Items</h3>
          <mui-menu>
            <button class="trigger-button" slot="trigger">Menu</button>
            <mui-menu-item label="Available Option" icon="✅"></mui-menu-item>
            <mui-menu-item label="Disabled Option" icon="🚫" disabled></mui-menu-item>
            <mui-menu-item label="Another Available" icon="✅"></mui-menu-item>
            <mui-menu-item label="Also Disabled" icon="🚫" disabled></mui-menu-item>
          </mui-menu>
        </div>

        <div class="demo-section">
          <h3>Menu with Links</h3>
          <mui-menu>
            <button class="trigger-button" slot="trigger">Resources</button>
            <mui-menu-item label="Documentation" icon="📚" href="#docs"></mui-menu-item>
            <mui-menu-item label="API Reference" icon="🔧" href="#api"></mui-menu-item>
            <mui-menu-item label="Examples" icon="💡" href="#examples"></mui-menu-item>
            <mui-menu-item divider></mui-menu-item>
            <mui-menu-item label="GitHub" icon="🐙" href="https://github.com" target="_blank"></mui-menu-item>
          </mui-menu>
        </div>
      </div>
    `;
  }
}

customElements.define('menu-demo', MenuDemo);

const meta: Meta<MenuDemo> = {
  title: 'MiuraUI/Navigation/Menu',
  component: 'menu-demo',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
# Menu

Dropdown menu component for contextual actions and navigation.

## Features

- **Placements**: 8 placement options (top/bottom/left/right × start/end)
- **Keyboard Navigation**: Arrow keys, Home, End, Escape
- **Click Outside**: Auto-close on outside click
- **Close on Select**: Configurable auto-close behavior
- **Icons & Shortcuts**: Support for icons and keyboard shortcuts
- **Dividers**: Visual separation between menu sections
- **Danger Actions**: Highlighted destructive actions
- **Link Support**: Menu items can be anchors or buttons
- **Disabled State**: Individual items can be disabled

## Usage

\`\`\`html
<mui-menu>
  <button slot="trigger">Actions</button>
  <mui-menu-item label="Edit" icon="✏️"></mui-menu-item>
  <mui-menu-item label="Delete" icon="🗑️" danger></mui-menu-item>
</mui-menu>
\`\`\`

## Events

- **open** - Emitted when menu opens
- **close** - Emitted when menu closes
- **select** - Emitted when item is selected (with detail payload)
        `
      }
    }
  }
};

export default meta;
type Story = StoryObj<MenuDemo>;

export const Default: Story = {
  args: {}
};
