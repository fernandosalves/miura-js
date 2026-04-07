import { MiuraElement, html, css, property } from '@miurajs/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';

import '../../src/layout/layout.js';
import '../../src/layout/panel.js';
import '../../src/navigation/icon-rail.js';
import '../../src/primitives/icon.js';

class CascadingNavDemo extends MiuraElement {
  @property({ type: Boolean })
  _railCollapsed = true;

  @property({ type: Boolean })
  _panelsOpen = true;

  @property({ type: String })
  _activeItem = 'Threads';

  @property({ type: Boolean })
  _showUserPopup = false;

  static styles = css`
    :host {
      display: block;
      height: 100vh;
      --mui-sidebar-bg: #ffffff;
      --mui-sidebar-border: #f1f5f9;
      --mui-active-pill: #1e293b;
      --mui-active-pill-text: #ffffff;
    }

    .layout-wrapper {
      height: 100%;
      background: #f8fafc;
    }

    /* Level 2 & 3 Panel Container */
    .nav-container {
      display: flex;
      height: 100%;
      background: white;
      border-right: 1px solid var(--mui-sidebar-border);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
    }

    .main-menu {
      width: 240px;
      border-right: 1px solid var(--mui-sidebar-border);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }

    .context-panel {
      width: 260px;
      background: #fcfcfc;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      transition: transform 0.3s ease, opacity 0.3s ease, width 0.3s ease;
    }

    .context-panel.hidden {
      width: 0;
      opacity: 0;
      transform: translateX(-20px);
      pointer-events: none;
      border-right: none;
    }

    /* Header styling */
    .panel-header {
      padding: 24px 20px 12px;
      font-size: 18px;
      font-weight: 600;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* List items */
    .nav-list {
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 10px;
      color: #64748b;
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
      user-select: none;
    }

    .nav-item:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    .nav-item.active {
      background: var(--mui-active-pill);
      color: var(--mui-active-pill-text);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }

    .nav-item mui-icon {
      width: 18px;
      height: 18px;
    }

    /* Tree View / Sub-items */
    .sub-list {
      margin-left: 20px;
      padding-left: 14px;
      padding-top: 4px;
      border-left: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .sub-item {
      padding: 8px 12px;
      font-size: 13px;
      color: #64748b;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.2s;
      position: relative;
    }

    .sub-item::before {
      content: '';
      position: absolute;
      left: -14px;
      top: 50%;
      width: 8px;
      height: 1px;
      background: #e2e8f0;
    }

    .sub-item:hover {
      background: #f1f5f9;
      color: #0f172a;
    }
    
    .sub-item.active {
       background: white;
       color: #0f172a;
       box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
       border: 1px solid #f1f5f9;
    }

    /* Badge */
    .badge {
      margin-left: auto;
      background: #ef4444; 
      color: white;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 10px;
      font-weight: bold;
    }

    /* Context Section Headers */
    .section-header {
      padding: 24px 20px 8px;
      font-size: 12px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    /* Content Area */
    .dashboard-content {
      padding: 40px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 24px;
    }

    .card {
      background: white;
      border-radius: 16px;
      padding: 28px;
      border: 1px solid #f1f5f9;
      box-shadow: var(--mui-shadow-sm);
    }

    .logo-box {
      width: 34px;
      height: 34px;
      background: #1e293b;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    /* User Profile & Popup */
    .user-profile {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #3b82f6;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      position: relative;
    }

    .user-popup {
      position: absolute;
      bottom: 20px;
      left: 60px;
      width: 200px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: var(--mui-shadow-lg);
      padding: 8px;
      z-index: 1000;
      animation: popup-slide 0.2s ease-out;
    }

    @keyframes popup-slide {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .popup-item {
      padding: 8px 12px;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 10px;
      color: #64748b;
      border-radius: 6px;
      cursor: pointer;
    }

    .popup-item:hover {
      background: #f8fafc;
      color: #0f172a;
    }

    /* Overlay styles for Level 3 on mobile or tight spaces */
    @media (max-width: 1024px) {
      .context-panel {
        position: fixed;
        left: 296px; /* Rail + Menu width approx */
        top: 0;
        bottom: 0;
        z-index: 50;
        box-shadow: var(--mui-shadow-lg);
        background: white;
      }
    }
  `;

  private _onRailToggle(e: any) {
    this._railCollapsed = e.detail.collapsed;
    this.requestUpdate();
  }

  private _toggleItem(name: string) {
    if (this._activeItem === name && name === 'Threads') {
       this._panelsOpen = !this._panelsOpen;
    } else {
       this._activeItem = name;
       if (name === 'Threads') this._panelsOpen = true;
       else this._panelsOpen = false;
    }
    this.requestUpdate();
  }

  template() {
    return html`
      <mui-layout full-height class="layout-wrapper" @click=${() => this._showUserPopup = false}>
        <!-- Level 1: Rail (Dynamic) -->
        <mui-icon-rail slot="rail" ?collapsed=${this._railCollapsed} @toggle=${this._onRailToggle.bind(this)}>
          <div class="logo-box" slot="logo">
             <mui-icon name="sparkles" size="sm"></mui-icon>
          </div>
          
          <mui-rail-item label="Home" ?active=${this._activeItem === 'Home'} @click=${() => this._toggleItem('Home')}>
            <mui-icon name="home" slot="icon" style="color: inherit;"></mui-icon>
          </mui-rail-item>
          
          <mui-rail-item label="Messages" badge="2" ?active=${this._activeItem === 'Messages'} @click=${() => this._toggleItem('Messages')}>
             <mui-icon name="mail" slot="icon" style="color: inherit;"></mui-icon>
          </mui-rail-item>
          
          <mui-rail-item label="Integrations" ?active=${this._activeItem === 'Integrations'} @click=${() => this._toggleItem('Integrations')}>
             <mui-icon name="plus-square" slot="icon" style="color: inherit;"></mui-icon>
          </mui-rail-item>
          
          <mui-rail-item label="Threads" ?active=${this._activeItem === 'Threads'} @click=${() => this._toggleItem('Threads')}>
             <mui-icon name="package" slot="icon" style="color: inherit;"></mui-icon>
          </mui-rail-item>
          
          <mui-rail-divider></mui-rail-divider>
          
          <mui-rail-item label="Explore">
             <mui-icon name="compass" slot="icon" style="color: inherit;"></mui-icon>
          </mui-rail-item>

          <!-- Footer with Popup -->
          <div slot="footer" style="padding: 12px; display: flex; justify-content: center; position: relative;">
            <div class="user-profile" @click=${(e: Event) => { e.stopPropagation(); this._showUserPopup = !this._showUserPopup; }}>
              FA
              ${this._showUserPopup ? html`
                <div class="user-popup">
                   <div class="popup-item"><mui-icon name="user" size="sm"></mui-icon> View Profile</div>
                   <div class="popup-item"><mui-icon name="settings" size="sm"></mui-icon> Settings</div>
                   <div class="popup-item" style="border-top: 1px solid #f1f5f9; margin-top: 4px; color: #ef4444;">
                     <mui-icon name="log-out" size="sm"></mui-icon> Sign Out
                   </div>
                </div>
              ` : ''}
            </div>
          </div>
        </mui-icon-rail>

        <!-- Level 2 & 3: Cascading Panels -->
        <div slot="nav" class="nav-container">
          <!-- Level 2: Main Menu -->
          <div class="main-menu">
            <div class="panel-header">
               <mui-icon name="layout" size="md" style="color: #6366f1;"></mui-icon>
               Menu
            </div>
            
            <div class="nav-list">
              <div class="nav-item ${this._activeItem === 'Home' ? 'active' : ''}" @click=${() => this._toggleItem('Home')}>
                <mui-icon name="home"></mui-icon> Home
              </div>
              <div class="nav-item ${this._activeItem === 'Messages' ? 'active' : ''}" @click=${() => this._toggleItem('Messages')}>
                <mui-icon name="mail"></mui-icon> Messages <span class="badge">2</span>
              </div>
              
              <div class="nav-item ${this._activeItem === 'Threads' ? 'active' : ''}" @click=${() => this._toggleItem('Threads')}>
                <mui-icon name="package"></mui-icon> Threads
                <mui-icon name="${this._panelsOpen ? 'chevron-down' : 'chevron-right'}" size="xs" style="margin-left: auto; opacity: 0.5;"></mui-icon>
              </div>
              
              ${this._activeItem === 'Threads' ? html`
                <div class="sub-list">
                  <div class="sub-item" @click=${(e: any) => e.stopPropagation()}>Fignuts</div>
                  <div class="sub-item active" @click=${(e: any) => e.stopPropagation()}>Enlarz System</div>
                  <div class="sub-item" @click=${(e: any) => e.stopPropagation()}>Hugeicons</div>
                </div>
              ` : ''}
              
              <div class="nav-item"><mui-icon name="contact"></mui-icon> Contacts</div>
              <div class="nav-item"><mui-icon name="compass"></mui-icon> Explore</div>
            </div>
          </div>

          <!-- Level 3: Sub-Panel (Context) - Animated -->
          <div class="context-panel ${this._panelsOpen ? '' : 'hidden'}">
            <div class="section-header">Archive</div>
            <div class="nav-list" style="padding-top: 0;">
              <div class="nav-item"><mui-icon name="archive" size="sm"></mui-icon> My Archive</div>
              <div class="nav-item"><mui-icon name="heart" size="sm"></mui-icon> Favourite Stories</div>
            </div>

            <div class="section-header">
              Drafts (3)
              <mui-icon name="plus" size="xs" style="cursor: pointer;"></mui-icon>
            </div>
            <div class="nav-list" style="padding-top: 0;">
              <div class="nav-item"><mui-icon name="file-text" size="sm"></mui-icon> Project Specs</div>
              <div class="nav-item"><mui-icon name="file-text" size="sm"></mui-icon> Draft: Q3 Report</div>
            </div>

            <div class="section-header">Folders (6)</div>
            <div class="nav-list" style="padding-top: 0;">
              <div class="nav-item"><mui-icon name="folder" size="sm"></mui-icon> Brand Assets</div>
              <div class="nav-item active" style="background: white; color: #0f172a; box-shadow: 0 4px 10px rgba(0,0,0,0.06); border: 1px solid #f1f5f9;">
                <mui-icon name="folder" size="sm" style="color: #6366f1;"></mui-icon> Enlarz System
              </div>
              <div class="nav-item"><mui-icon name="folder" size="sm"></mui-icon> External Docs</div>
            </div>
          </div>
        </div>

        <!-- Main Workspace Content -->
        <main class="dashboard-content">
          <header style="margin-bottom: 40px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #0f172a;">Enlarz System</h1>
                <p style="margin: 6px 0 0; color: #64748b; font-size: 15px;">Database management and real-time monitoring dashboard.</p>
              </div>
              <div style="display: flex; gap: 12px;">
                <button style="padding: 10px 18px; background: white; color: #0f172a; border: 1px solid #e2e8f0; border-radius: 10px; font-weight: 600; cursor: pointer;">
                  Export CSV
                </button>
                <button style="padding: 10px 20px; background: #1e293b; color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                  New Project
                </button>
              </div>
            </div>
          </header>

          <div class="card-grid">
            <div class="card">
              <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 20px;">
                <div style="background: #eff6ff; color: #2563eb; padding: 10px; border-radius: 12px;"><mui-icon name="activity" size="md"></mui-icon></div>
                <h3 style="margin: 0; font-size: 17px; font-weight: 600;">System Health</h3>
              </div>
              <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.6;">All systems are nominal. Average latency is <span style="color: #166534; font-weight: 600;">12ms</span> across all regions.</p>
            </div>
            
            <div class="card">
              <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 20px;">
                 <div style="background: #fef2f2; color: #dc2626; padding: 10px; border-radius: 12px;"><mui-icon name="bell" size="md"></mui-icon></div>
                <h3 style="margin: 0; font-size: 17px; font-weight: 600;">Critical Alerts</h3>
              </div>
              <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.6;">No critical alerts in the last 48 hours. <span style="font-weight: 500;">2 minor warnings</span> resolved by system auto-heal.</p>
            </div>
            
            <div class="card">
               <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 20px;">
                 <div style="background: #f0fdf4; color: #16a34a; padding: 10px; border-radius: 12px;"><mui-icon name="shield" size="md"></mui-icon></div>
                <h3 style="margin: 0; font-size: 17px; font-weight: 600;">Security Status</h3>
              </div>
              <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.6;">Database encrypted. All API endpoints secured via SSL. Firewall is actively filtering traffic.</p>
            </div>
          </div>
        </main>
      </mui-layout>
    `;
  }
}

customElements.define('cascading-nav-demo', CascadingNavDemo);

const meta: Meta<CascadingNavDemo> = {
  title: 'MiuraUI/Layout/CascadingNav',
  component: 'cascading-nav-demo',
  parameters: {
    layout: 'fullscreen',
  }
};

export default meta;
type Story = StoryObj<CascadingNavDemo>;

export const ProDashboard: Story = {
  args: {}
};
