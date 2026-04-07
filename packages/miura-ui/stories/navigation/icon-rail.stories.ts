import { MiuraElement, html, css } from '@miurajs/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../../src/navigation/icon-rail.js';
import '../../src/primitives/icon.js';

class IconRailDemo extends MiuraElement {
  private _collapsed = false;

  static styles = css`
    :host {
      display: block;
      padding: 0;
      font-family: var(--mui-font-family, system-ui, sans-serif);
      height: 600px;
    }
    .demo-wrapper {
      padding: 40px;
      height: 100%;
      background: var(--mui-surface-alt, #f8fafc);
      overflow-y: auto;
    }
    .demo-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
      gap: 40px;
      padding-bottom: 40px;
    }
    .demo-section {
      background: white;
      border: 1px solid var(--mui-border, #e5e7eb);
      border-radius: var(--mui-radius-lg, 12px);
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-shadow: var(--mui-shadow-sm);
    }
    .rail-preview {
      height: 480px;
      border: 1px solid var(--mui-border, #e5e7eb);
      border-radius: var(--mui-radius-md, 8px);
      overflow: visible; /* Changed to visible for the floating toggle */
      background: white;
      display: flex;
      position: relative;
    }
    .content-area {
      flex: 1;
      padding: 24px;
      background: #fafafa;
      font-size: var(--mui-text-sm, 14px);
    }
    .logo-box {
      width: 32px;
      height: 32px;
      background: var(--mui-primary, #3b82f6);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
    }
    h3 {
      margin: 0;
      font-size: var(--mui-text-lg, 18px);
      font-weight: 600;
    }
    p {
      margin: 0;
      color: var(--mui-text-secondary, #64748b);
      font-size: var(--mui-text-sm, 14px);
      line-height: 1.5;
    }
    .placeholder-content {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: #94a3b8;
      text-align: center;
      gap: 8px;
    }
  `;

  private _onToggle(e: any) {
    this._collapsed = e.detail.collapsed;
    this.requestUpdate();
  }

  template() {
    const logo = html`<div class="logo-box" slot="logo">M</div>`;

    return html`
      <div class="demo-wrapper">
        <div class="demo-container">
          <!-- Standard Icon Rail Example -->
          <div class="demo-section">
            <h3>Standard Icon Rail</h3>
            <p>Full-featured vertical navigation with collapsible state and badges.</p>
            
            <div class="rail-preview">
              <mui-icon-rail ?collapsed=${this._collapsed} @toggle=${this._onToggle.bind(this)}>
                ${logo}
                <span slot="title">Miura Admin</span>
                
                <mui-rail-item icon="layout-dashboard" label="Dashboard" active></mui-rail-item>
                <mui-rail-item icon="file-text" label="Stories" badge="12"></mui-rail-item>
                <mui-rail-item icon="book-open" label="Series"></mui-rail-item>
                <mui-rail-item icon="flask-conical" label="Labs"></mui-rail-item>
                
                <mui-rail-divider></mui-rail-divider>
                
                <mui-rail-item icon="image" label="Media"></mui-rail-item>
                <mui-rail-item icon="settings" label="Settings"></mui-rail-item>

                <mui-rail-item slot="footer" icon="help-circle" label="Help & Support"></mui-rail-item>
                <mui-rail-item slot="footer" icon="log-out" label="Sign Out"></mui-rail-item>
              </mui-icon-rail>
              
              <div class="content-area">
                <div class="placeholder-content">
                   <mui-icon name="monitor" size="xl" style="opacity: 0.2; margin-bottom: 12px;"></mui-icon>
                  <strong>Main Content Area</strong>
                  <p>Current State: ${this._collapsed ? 'Collapsed' : 'Expanded'}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Collapsed Mode Example -->
          <div class="demo-section">
            <h3>Collapsed Mode</h3>
            <p>The "right size" for minimal sidebars, focusing on icons.</p>
            
            <div class="rail-preview">
              <mui-icon-rail collapsed .collapsible=${false}>
                <div class="logo-box" slot="logo">M</div>
                <mui-rail-item icon="home" label="Home" active></mui-rail-item>
                <mui-rail-item icon="search" label="Search"></mui-rail-item>
                <mui-rail-item icon="bell" label="Alerts" badge="3"></mui-rail-item>
                <mui-rail-item icon="mail" label="Chat"></mui-rail-item>
                
                <mui-rail-divider></mui-rail-divider>
                <mui-rail-item icon="user" label="Account"></mui-rail-item>
              </mui-icon-rail>
              
              <div class="content-area">
                <div class="placeholder-content">
                  <p>Fixed collapsed sidebar.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Placement Example -->
          <div class="demo-section">
            <h3>Right Side Placement</h3>
            <p>Secondary navigation or utility rails on the right side.</p>
            
            <div class="rail-preview">
              <div class="content-area">
                 <div class="placeholder-content">
                  <p>Primary content area on the left.</p>
                </div>
              </div>
              
              <mui-icon-rail placement="right">
                <div class="logo-box" slot="logo">T</div>
                <span slot="title">Tools</span>
                <mui-rail-item icon="pie-chart" label="Stats"></mui-rail-item>
                <mui-rail-item icon="users" label="Team"></mui-rail-item>
                <mui-rail-item icon="activity" label="History"></mui-rail-item>
              </mui-icon-rail>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('icon-rail-demo', IconRailDemo);

const meta: Meta<IconRailDemo> = {
  title: 'MiuraUI/Navigation/IconRail',
  component: 'icon-rail-demo',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  }
};

export default meta;
type Story = StoryObj<IconRailDemo>;

export const Default: Story = {
  args: {}
};
