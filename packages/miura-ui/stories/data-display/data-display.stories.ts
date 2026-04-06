/**
 * Data Display Components Stories
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import '../../src/data-display/avatar.js';
import '../../src/data-display/badge.js';
import '../../src/data-display/card.js';
import '../../src/data-display/list.js';
import '../../src/data-display/tree-view.js';
import '../../src/data-display/table.js';
import '../../src/data-display/display.js';
import '../../src/forms/checkbox.js';
import '../../src/primitives/button.js';
import '../../src/primitives/icon.js';
import '../../src/primitives/icon-button.js';
import { MiuraElement, html, css, state } from '@miurajs/miura-element';

// ============================================================================
// AVATAR
// ============================================================================

export default {
    title: 'MiuraUI/Data Display',
} as Meta;

class AvatarDemo extends MiuraElement {
    template() {
        return html`
      <div style="display: flex; flex-direction: column; gap: 32px;">
        <div>
          <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Image Avatars</h4>
          <div style="display: flex; gap: 12px; align-items: center;">
            <mui-avatar src="https://i.pravatar.cc/150?u=a" alt="User"></mui-avatar>
            <mui-avatar src="https://i.pravatar.cc/150?u=b" alt="User"></mui-avatar>
            <mui-avatar src="https://i.pravatar.cc/150?u=c" alt="User"></mui-avatar>
          </div>
        </div>
        
        <div>
          <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Initials (auto-color)</h4>
          <div style="display: flex; gap: 12px; align-items: center;">
            <mui-avatar name="John Doe"></mui-avatar>
            <mui-avatar name="Jane Smith"></mui-avatar>
            <mui-avatar name="Bob Wilson"></mui-avatar>
            <mui-avatar name="Alice Brown"></mui-avatar>
            <mui-avatar name="Charlie Davis"></mui-avatar>
          </div>
        </div>
        
        <div>
          <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Sizes</h4>
          <div style="display: flex; gap: 12px; align-items: center;">
            <mui-avatar name="John" size="xs"></mui-avatar>
            <mui-avatar name="John" size="sm"></mui-avatar>
            <mui-avatar name="John" size="md"></mui-avatar>
            <mui-avatar name="John" size="lg"></mui-avatar>
            <mui-avatar name="John" size="xl"></mui-avatar>
            <mui-avatar name="John" size="2xl"></mui-avatar>
          </div>
        </div>
        
        <div>
          <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">With Status</h4>
          <div style="display: flex; gap: 16px; align-items: center;">
            <mui-avatar name="Online User" status="online" size="lg"></mui-avatar>
            <mui-avatar name="Busy User" status="busy" size="lg"></mui-avatar>
            <mui-avatar name="Away User" status="away" size="lg"></mui-avatar>
            <mui-avatar name="Offline User" status="offline" size="lg"></mui-avatar>
          </div>
        </div>
        
        <div>
          <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Shapes</h4>
          <div style="display: flex; gap: 12px; align-items: center;">
            <mui-avatar name="Circle" shape="circle" size="lg"></mui-avatar>
            <mui-avatar name="Square" shape="square" size="lg"></mui-avatar>
          </div>
        </div>
        
        <div>
          <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Icon Fallback</h4>
          <div style="display: flex; gap: 12px; align-items: center;">
            <mui-avatar icon="user"></mui-avatar>
            <mui-avatar icon="building"></mui-avatar>
            <mui-avatar icon="bot"></mui-avatar>
          </div>
        </div>
      </div>
    `;
    }
}
customElements.define('avatar-demo', AvatarDemo);

export const Avatars: StoryObj = {
    name: 'Avatar',
    render: () => document.createElement('avatar-demo'),
};

// ============================================================================
// BADGE
// ============================================================================

class BadgeDemo extends MiuraElement {
    template() {
        return html`
      <div style="display: flex; flex-direction: column; gap: 32px;">
        <div>
          <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Variants</h4>
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <mui-badge variant="soft">Soft</mui-badge>
            <mui-badge variant="solid">Solid</mui-badge>
            <mui-badge variant="outline">Outline</mui-badge>
          </div>
        </div>
        
        <div>
          <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Colors</h4>
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <mui-badge color="default">Default</mui-badge>
            <mui-badge color="primary">Primary</mui-badge>
            <mui-badge color="success">Success</mui-badge>
            <mui-badge color="warning">Warning</mui-badge>
            <mui-badge color="error">Error</mui-badge>
            <mui-badge color="info">Info</mui-badge>
          </div>
        </div>
        
        <div>
          <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Solid Colors</h4>
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <mui-badge variant="solid" color="default">Default</mui-badge>
            <mui-badge variant="solid" color="primary">Primary</mui-badge>
            <mui-badge variant="solid" color="success">Success</mui-badge>
            <mui-badge variant="solid" color="warning">Warning</mui-badge>
            <mui-badge variant="solid" color="error">Error</mui-badge>
          </div>
        </div>
        
        <div>
          <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">With Icons</h4>
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <mui-badge icon="check" color="success">Verified</mui-badge>
            <mui-badge icon="clock" color="warning">Pending</mui-badge>
            <mui-badge icon="x" color="error">Failed</mui-badge>
            <mui-badge icon="star" color="primary">Featured</mui-badge>
          </div>
        </div>
        
        <div>
          <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Sizes</h4>
          <div style="display: flex; gap: 12px; align-items: center;">
            <mui-badge size="sm">Small</mui-badge>
            <mui-badge size="md">Medium</mui-badge>
            <mui-badge size="lg">Large</mui-badge>
          </div>
        </div>
        
        <div>
          <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Dot Badges</h4>
          <div style="display: flex; gap: 16px; align-items: center;">
            <mui-badge dot color="success"></mui-badge>
            <mui-badge dot color="warning"></mui-badge>
            <mui-badge dot color="error"></mui-badge>
            <mui-badge dot color="primary"></mui-badge>
          </div>
        </div>
        
        <div>
          <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Count Badges</h4>
          <div style="display: flex; gap: 12px; align-items: center;">
            <mui-badge .count=${5} color="error" variant="solid"></mui-badge>
            <mui-badge .count=${42} color="primary" variant="solid"></mui-badge>
            <mui-badge .count=${99} color="error" variant="solid"></mui-badge>
            <mui-badge .count=${150} color="error" variant="solid"></mui-badge>
          </div>
        </div>
        
        <div>
          <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Use Cases</h4>
          <div style="display: flex; gap: 24px; align-items: center;">
            <span>Status: <mui-badge color="success">Published</mui-badge></span>
            <span>Status: <mui-badge color="warning">Draft</mui-badge></span>
            <span>Status: <mui-badge color="primary">Scheduled</mui-badge></span>
            <span>Priority: <mui-badge variant="solid" color="error">High</mui-badge></span>
          </div>
        </div>
      </div>
    `;
    }
}
customElements.define('badge-demo', BadgeDemo);

export const Badges: StoryObj = {
    name: 'Badge',
    render: () => document.createElement('badge-demo'),
};

// ============================================================================
// CARD
// ============================================================================

class CardDemo extends MiuraElement {
    template() {
        return html`
      <div style="display: flex; flex-direction: column; gap: 32px; max-width: 800px;">
        <div>
          <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Basic Card</h4>
          <mui-card>
            <mui-card-content>
              This is a basic card with just content.
            </mui-card-content>
          </mui-card>
        </div>
        
        <div>
          <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Card with Header</h4>
          <mui-card>
            <mui-card-header>
              <mui-icon slot="icon" name="folder" size="md"></mui-icon>
              <span slot="title">Frontend Labs</span>
              <span slot="subtitle">12 stories · 3 series</span>
              <mui-icon-button slot="action" icon="more-vertical" size="sm"></mui-icon-button>
            </mui-card-header>
            <mui-card-content>
              A collection of frontend development tutorials covering React, Vue, and modern CSS techniques.
            </mui-card-content>
            <mui-card-footer>
              <mui-badge color="success">Active</mui-badge>
            </mui-card-footer>
          </mui-card>
        </div>
        
        <div>
          <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Card Variants</h4>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
            <mui-card variant="default">
              <mui-card-header>
                <span slot="title">Default</span>
              </mui-card-header>
              <mui-card-content>With border</mui-card-content>
            </mui-card>
            
            <mui-card variant="outlined">
              <mui-card-header>
                <span slot="title">Outlined</span>
              </mui-card-header>
              <mui-card-content>Transparent background</mui-card-content>
            </mui-card>
            
            <mui-card variant="elevated">
              <mui-card-header>
                <span slot="title">Elevated</span>
              </mui-card-header>
              <mui-card-content>With shadow</mui-card-content>
            </mui-card>
            
            <mui-card variant="ghost">
              <mui-card-header>
                <span slot="title">Ghost</span>
              </mui-card-header>
              <mui-card-content>No border or background</mui-card-content>
            </mui-card>
          </div>
        </div>
        
        <div>
          <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Clickable Card</h4>
          <mui-card clickable @click=${() => console.log('Card clicked!')}>
            <mui-card-header>
              <mui-icon slot="icon" name="file-text"></mui-icon>
              <span slot="title">React Fundamentals</span>
              <span slot="subtitle">Click me!</span>
            </mui-card-header>
            <mui-card-content>
              This card is clickable and will show hover effects.
            </mui-card-content>
          </mui-card>
        </div>
        
        <div>
          <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Card with Accent</h4>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
            <mui-card accent="#ec4899">
              <mui-card-content>Pink accent</mui-card-content>
            </mui-card>
            <mui-card accent="#3b82f6">
              <mui-card-content>Blue accent</mui-card-content>
            </mui-card>
            <mui-card accent="#22c55e">
              <mui-card-content>Green accent</mui-card-content>
            </mui-card>
          </div>
        </div>
        
        <div>
          <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Stat Cards</h4>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
            <mui-stat-card
              label="Total Users"
              value="1,234"
              change="+12%"
              positive
              icon="users"
              accent="#3b82f6"
            ></mui-stat-card>
            <mui-stat-card
              label="Revenue"
              value="$45,231"
              change="+8.2%"
              positive
              icon="dollar-sign"
              accent="#22c55e"
            ></mui-stat-card>
            <mui-stat-card
              label="Orders"
              value="573"
              change="-3%"
              icon="shopping-cart"
              accent="#f59e0b"
            ></mui-stat-card>
            <mui-stat-card
              label="Conversion"
              value="2.4%"
              icon="trending-up"
              accent="#ec4899"
            ></mui-stat-card>
          </div>
        </div>
      </div>
    `;
    }
}
customElements.define('card-demo', CardDemo);

export const Cards: StoryObj = {
    name: 'Card',
    render: () => document.createElement('card-demo'),
};

// ============================================================================
// LIST
// ============================================================================

class ListDemo extends MiuraElement {
    template() {
        return html`
      <div style="display: flex; flex-direction: column; gap: 32px; max-width: 500px;">
        <div>
          <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Basic List</h4>
          <mui-card>
            <mui-list>
              <mui-list-item>
                <span slot="primary">First item</span>
              </mui-list-item>
              <mui-list-item>
                <span slot="primary">Second item</span>
              </mui-list-item>
              <mui-list-item>
                <span slot="primary">Third item</span>
              </mui-list-item>
            </mui-list>
          </mui-card>
        </div>
        
        <div>
          <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">List with Icons & Secondary Text</h4>
          <mui-card>
            <mui-list>
              <mui-list-item icon="file">
                <span slot="primary">Document.pdf</span>
                <span slot="secondary">2.4 MB · Modified yesterday</span>
              </mui-list-item>
              <mui-list-item icon="image">
                <span slot="primary">Photo.jpg</span>
                <span slot="secondary">1.2 MB · Modified 2 days ago</span>
              </mui-list-item>
              <mui-list-item icon="file-text">
                <span slot="primary">Notes.txt</span>
                <span slot="secondary">0.5 KB · Modified last week</span>
              </mui-list-item>
            </mui-list>
          </mui-card>
        </div>
        
        <div>
          <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">List with Actions</h4>
          <mui-card>
            <mui-list>
              <mui-list-item icon="mail">
                <span slot="primary">Inbox</span>
                <span slot="secondary">12 unread</span>
                <mui-badge slot="end" .count=${12} variant="solid" color="primary"></mui-badge>
              </mui-list-item>
              <mui-list-item icon="send">
                <span slot="primary">Sent</span>
                <span slot="secondary">Last sent 2h ago</span>
              </mui-list-item>
              <mui-list-item icon="archive">
                <span slot="primary">Archive</span>
                <span slot="secondary">324 items</span>
              </mui-list-item>
            </mui-list>
          </mui-card>
        </div>
        
        <div>
          <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Navigation List</h4>
          <mui-card>
            <mui-list variant="nav">
              <mui-list-item icon="home" active>
                <span slot="primary">Dashboard</span>
              </mui-list-item>
              <mui-list-item icon="folder">
                <span slot="primary">Projects</span>
              </mui-list-item>
              <mui-list-item icon="users">
                <span slot="primary">Team</span>
              </mui-list-item>
              <mui-list-item icon="settings">
                <span slot="primary">Settings</span>
              </mui-list-item>
            </mui-list>
          </mui-card>
        </div>
        
        <div>
          <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">List with Headers & Dividers</h4>
          <mui-card>
            <mui-list>
              <mui-list-header>Main</mui-list-header>
              <mui-list-item icon="home">
                <span slot="primary">Dashboard</span>
              </mui-list-item>
              <mui-list-item icon="search">
                <span slot="primary">Search</span>
              </mui-list-item>
              <mui-list-header>Content</mui-list-header>
              <mui-list-item icon="file">
                <span slot="primary">Documents</span>
              </mui-list-item>
              <mui-list-item icon="image">
                <span slot="primary">Media</span>
              </mui-list-item>
            </mui-list>
          </mui-card>
        </div>
      </div>
    `;
    }
}
customElements.define('list-demo', ListDemo);

export const Lists: StoryObj = {
    name: 'List',
    render: () => document.createElement('list-demo'),
};

// ============================================================================
// TREE VIEW
// ============================================================================

class TreeViewDemo extends MiuraElement {
    static styles: any = css`
    :host { display: block; padding: 24px; font-family: system-ui; }
    h4 { margin: 0 0 12px; font-size: 14px; color: #666; }
    .row { display: flex; gap: 24px; flex-wrap: wrap; align-items: flex-start; }
  `;

    template() {
        return html`
      <div class="row">
        <div style="width:280px;">
          <h4>File Tree</h4>
          <mui-card>
            <mui-tree-view selectable expandable>
              <mui-tree-item id="src" label="src" icon="folder" expanded>
                <mui-tree-item id="components" label="components" icon="folder">
                  <mui-tree-item id="btn" label="button.ts" icon="file-code"></mui-tree-item>
                  <mui-tree-item id="inp" label="input.ts" icon="file-code"></mui-tree-item>
                </mui-tree-item>
                <mui-tree-item id="styles" label="styles" icon="folder">
                  <mui-tree-item id="tokens" label="tokens.css" icon="file"></mui-tree-item>
                </mui-tree-item>
                <mui-tree-item id="idx" label="index.ts" icon="file-code"></mui-tree-item>
              </mui-tree-item>
              <mui-tree-item id="pkg" label="package.json" icon="file-json"></mui-tree-item>
              <mui-tree-item id="readme" label="README.md" icon="file-text"></mui-tree-item>
            </mui-tree-view>
          </mui-card>
        </div>

        <div style="width:280px;">
          <h4>Content Tree (with meta)</h4>
          <mui-card>
            <mui-tree-view selectable expandable>
              <mui-tree-item id="blog" label="Blog" icon="folder" expanded>
                <mui-tree-item id="p1" label="Getting Started" icon="file-text" meta="Published"></mui-tree-item>
                <mui-tree-item id="p2" label="Advanced Usage" icon="file-text" meta="Draft"></mui-tree-item>
                <mui-tree-item id="p3" label="API Reference" icon="file-text" meta="Review"></mui-tree-item>
              </mui-tree-item>
              <mui-tree-item id="docs" label="Docs" icon="folder">
                <mui-tree-item id="d1" label="Installation" icon="file-text" meta="Published"></mui-tree-item>
              </mui-tree-item>
            </mui-tree-view>
          </mui-card>
        </div>
      </div>
    `;
    }
}
customElements.define('tree-view-demo', TreeViewDemo);

export const TreeView: StoryObj = {
    name: 'Tree View',
    render: () => document.createElement('tree-view-demo'),
};

// ============================================================================
// DATA TABLE
// ============================================================================

class DataTableDemo extends MiuraElement {
    static styles: any = css`
    :host { display: block; padding: 24px; font-family: system-ui; }
    h4 { margin: 0 0 12px; font-size: 14px; color: #666; }
  `;

    private _columns = [
        { key: 'title', label: 'Title', sortable: true },
        {
            key: 'status', label: 'Status', render: (v: string) => {
                const colors: Record<string, string> = { Published: '#22c55e', Draft: '#f59e0b', Review: '#3b82f6', Archived: '#9ca3af' };
                return html`<mui-badge color="${v === 'Published' ? 'success' : v === 'Draft' ? 'warning' : v === 'Review' ? 'primary' : 'default'}">${v}</mui-badge>`;
            }
        },
        { key: 'author', label: 'Author', sortable: true },
        { key: 'date', label: 'Date', sortable: true },
    ];

    private _data = [
        { title: 'Getting Started with MiuraUI', status: 'Published', author: 'Jane Smith', date: '2026-04-01' },
        { title: 'Advanced Component Patterns', status: 'Draft', author: 'John Doe', date: '2026-04-03' },
        { title: 'Theme Customisation Guide', status: 'Review', author: 'Alice Brown', date: '2026-04-05' },
        { title: 'Accessibility Best Practices', status: 'Published', author: 'Bob Wilson', date: '2026-03-28' },
        { title: 'Performance Optimisation', status: 'Draft', author: 'Jane Smith', date: '2026-04-07' },
        { title: 'Migration from v1', status: 'Archived', author: 'John Doe', date: '2026-02-15' },
        { title: 'Component Composition', status: 'Review', author: 'Alice Brown', date: '2026-04-06' },
        { title: 'State Management Patterns', status: 'Published', author: 'Bob Wilson', date: '2026-04-02' },
    ];

    template() {
        return html`
      <h4>Sortable + Selectable Table</h4>
      <mui-data-table
        .columns=${this._columns}
        .data=${this._data}
        selectable
        paginated
        page-size="5"
        @row-click=${(e: any) => console.log('row click', e.detail)}
        @selection-change=${(e: any) => console.log('selection', e.detail.selected)}
      ></mui-data-table>
    `;
    }
}
customElements.define('data-table-demo', DataTableDemo);

export const DataTable: StoryObj = {
    name: 'Data Table',
    render: () => document.createElement('data-table-demo'),
};
