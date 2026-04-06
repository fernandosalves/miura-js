/**
 * Layout System Stories
 * 
 * Demonstrates the flexible multi-panel layout system with
 * icon rail, navigation panels, and main content area.
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html } from '@miurajs/miura-element';
import '../../src/layout/layout.js';
import '../../src/primitives/icon.js';
import '../../src/primitives/icon-button.js';
import '../../src/data-display/tree-view.js';
import '../../src/data-display/list.js';
import '../../src/navigation/toolbar.js';
import '../../src/navigation/breadcrumb.js';
import '../../src/data-display/card.js';
import '../../src/data-display/avatar.js';
import '../../src/data-display/badge.js';

/**
 * Complete Admin Layout Component
 */
class AdminLayoutDemo extends MiuraElement {
  template() {
    return html`
    <mui-layout full-height>
      <!-- Icon Rail -->
      <mui-layout-rail slot="rail" logo>
        <div slot="logo" style="
          width: 36px; 
          height: 36px; 
          background: var(--mui-primary, #3b82f6); 
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
        ">M</div>
        
        <mui-rail-item icon="home" label="Dashboard" active></mui-rail-item>
        <mui-rail-item icon="folder" label="Content" badge="3"></mui-rail-item>
        <mui-rail-item icon="image" label="Media"></mui-rail-item>
        <mui-rail-item icon="calendar" label="Calendar"></mui-rail-item>
        <mui-rail-item icon="bar-chart-2" label="Analytics"></mui-rail-item>
        
        <mui-rail-item slot="bottom" icon="settings" label="Settings"></mui-rail-item>
        <mui-rail-item slot="bottom" icon="user" label="Profile"></mui-rail-item>
      </mui-layout-rail>
      
      <!-- Navigation Panel -->
      <mui-layout-panel 
        slot="nav" 
        title="Content" 
        collapsible 
        resizable 
        default-width="280"
        min-width="220"
        max-width="400"
      >
        <mui-icon-button slot="actions" icon="plus" size="sm" label="Add"></mui-icon-button>
        
        <mui-tree-view style="padding: 8px;">
          <mui-tree-item label="Frontend Labs" icon="folder" expanded>
            <mui-tree-item label="React Fundamentals" icon="file-text"></mui-tree-item>
            <mui-tree-item label="TypeScript Deep Dive" icon="file-text"></mui-tree-item>
            <mui-tree-item label="CSS Architecture" icon="file-text"></mui-tree-item>
          </mui-tree-item>
          <mui-tree-item label="AI Labs" icon="folder">
            <mui-tree-item label="LLM Basics" icon="file-text"></mui-tree-item>
            <mui-tree-item label="Prompt Engineering" icon="file-text"></mui-tree-item>
          </mui-tree-item>
          <mui-tree-item label="Backend Labs" icon="folder">
            <mui-tree-item label="Node.js" icon="file-text"></mui-tree-item>
            <mui-tree-item label="Database Design" icon="file-text"></mui-tree-item>
          </mui-tree-item>
        </mui-tree-view>
      </mui-layout-panel>
      
      <!-- Main Content -->
      <mui-layout-main bg="subtle">
        <mui-toolbar slot="header" size="lg" border="bottom" bg="surface" padding="lg">
          <div slot="start">
            <mui-breadcrumb>
              <mui-breadcrumb-item href="/">Home</mui-breadcrumb-item>
              <mui-breadcrumb-item href="/content">Content</mui-breadcrumb-item>
              <mui-breadcrumb-item active>Dashboard</mui-breadcrumb-item>
            </mui-breadcrumb>
            <h1 style="margin: 8px 0 0; font-size: 24px; font-weight: 700;">Dashboard</h1>
          </div>
          <div slot="end" style="display: flex; gap: 8px;">
            <mui-icon-button icon="refresh-cw" label="Refresh"></mui-icon-button>
            <mui-button variant="primary">New Story</mui-button>
          </div>
        </mui-toolbar>
        
        <div style="padding: 24px;">
          <!-- Stat Cards Row -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px;">
            <mui-stat-card
              label="Total Labs"
              value="12"
              change="+2 this week"
              positive
              icon="folder"
              accent="#ec4899"
            ></mui-stat-card>
            <mui-stat-card
              label="Active Series"
              value="8"
              change="+1 this week"
              positive
              icon="book-open"
              accent="#3b82f6"
            ></mui-stat-card>
            <mui-stat-card
              label="Published"
              value="45"
              change="+5 this week"
              positive
              icon="check-circle"
              accent="#22c55e"
            ></mui-stat-card>
            <mui-stat-card
              label="Drafts"
              value="7"
              icon="edit"
              accent="#f59e0b"
            ></mui-stat-card>
          </div>
          
          <!-- Recent Activity -->
          <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 16px;">Recent Activity</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
            <mui-card>
              <mui-card-header>
                <mui-icon slot="icon" name="file-text" size="md"></mui-icon>
                <span slot="title">React Fundamentals</span>
                <span slot="subtitle">Updated 2 hours ago</span>
                <mui-icon-button slot="action" icon="more-vertical" size="sm"></mui-icon-button>
              </mui-card-header>
              <mui-card-content>
                A comprehensive guide to React fundamentals including hooks, state management, and component patterns.
              </mui-card-content>
              <mui-card-footer>
                <mui-badge color="success">Published</mui-badge>
                <mui-avatar-group>
                  <mui-avatar name="John Doe" size="sm"></mui-avatar>
                  <mui-avatar name="Jane Smith" size="sm"></mui-avatar>
                </mui-avatar-group>
              </mui-card-footer>
            </mui-card>
            
            <mui-card>
              <mui-card-header>
                <mui-icon slot="icon" name="file-text" size="md"></mui-icon>
                <span slot="title">TypeScript Deep Dive</span>
                <span slot="subtitle">Updated yesterday</span>
                <mui-icon-button slot="action" icon="more-vertical" size="sm"></mui-icon-button>
              </mui-card-header>
              <mui-card-content>
                Advanced TypeScript patterns including generics, conditional types, and utility types.
              </mui-card-content>
              <mui-card-footer>
                <mui-badge color="warning">Draft</mui-badge>
              </mui-card-footer>
            </mui-card>
          </div>
        </div>
      </mui-layout-main>
      
      <!-- Properties Panel (Optional) -->
      <mui-layout-panel 
        slot="end" 
        title="Properties" 
        collapsible
        position="end"
        border="start"
        default-width="300"
      >
        <div style="padding: 16px;">
          <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 12px; color: var(--mui-text-secondary);">Selected Item</h3>
          <mui-card variant="outlined" padding="sm">
            <mui-card-content>
              <div style="display: flex; align-items: center; gap: 12px;">
                <mui-avatar name="React Fundamentals" size="lg"></mui-avatar>
                <div>
                  <div style="font-weight: 600;">React Fundamentals</div>
                  <div style="font-size: 12px; color: var(--mui-text-secondary);">Story · Frontend Labs</div>
                </div>
              </div>
            </mui-card-content>
          </mui-card>
          
          <h3 style="font-size: 14px; font-weight: 600; margin: 20px 0 12px; color: var(--mui-text-secondary);">Details</h3>
          <mui-list dense>
            <mui-list-item>
              <span slot="primary">Status</span>
              <mui-badge slot="end" color="success">Published</mui-badge>
            </mui-list-item>
            <mui-list-item>
              <span slot="primary">Created</span>
              <span slot="end" style="font-size: 12px; color: var(--mui-text-secondary);">Jan 15, 2026</span>
            </mui-list-item>
            <mui-list-item>
              <span slot="primary">Updated</span>
              <span slot="end" style="font-size: 12px; color: var(--mui-text-secondary);">2 hours ago</span>
            </mui-list-item>
            <mui-list-item>
              <span slot="primary">Author</span>
              <mui-avatar slot="end" name="John Doe" size="xs"></mui-avatar>
            </mui-list-item>
          </mui-list>
        </div>
      </mui-layout-panel>
    </mui-layout>
    `;
  }
}

customElements.define('admin-layout-demo', AdminLayoutDemo);

/**
 * Minimal Layout Component
 */
class MinimalLayoutDemo extends MiuraElement {
  template() {
    return html`
    <mui-layout full-height style="height: 500px;">
      <mui-layout-rail slot="rail">
        <div slot="logo" style="
          width: 32px; 
          height: 32px; 
          background: var(--mui-primary); 
          border-radius: 6px;
        "></div>
        <mui-rail-item icon="home" label="Home" active></mui-rail-item>
        <mui-rail-item icon="search" label="Search"></mui-rail-item>
        <mui-rail-item icon="heart" label="Favorites"></mui-rail-item>
        <mui-rail-item slot="bottom" icon="settings" label="Settings"></mui-rail-item>
      </mui-layout-rail>
      
      <mui-layout-main padding="lg">
        <h1 style="margin: 0 0 16px; font-size: 24px;">Welcome</h1>
        <p style="color: var(--mui-text-secondary);">This is a minimal layout with just the icon rail and main content.</p>
      </mui-layout-main>
    </mui-layout>
    `;
  }
}

customElements.define('minimal-layout-demo', MinimalLayoutDemo);

/**
 * Three Column Layout Component
 */
class ThreeColumnLayoutDemo extends MiuraElement {
  template() {
    return html`
    <mui-layout full-height style="height: 600px;">
      <mui-layout-rail slot="rail">
        <mui-rail-item icon="mail" label="Inbox" active badge="5"></mui-rail-item>
        <mui-rail-item icon="send" label="Sent"></mui-rail-item>
        <mui-rail-item icon="archive" label="Archive"></mui-rail-item>
        <mui-rail-item icon="trash-2" label="Trash"></mui-rail-item>
      </mui-layout-rail>
      
      <mui-layout-panel slot="nav" title="Inbox" resizable default-width="260">
        <mui-list>
          <mui-list-item active>
            <span slot="primary">Meeting Notes</span>
            <span slot="secondary">John Doe · 2 min ago</span>
          </mui-list-item>
          <mui-list-item>
            <span slot="primary">Project Update</span>
            <span slot="secondary">Jane Smith · 1 hour ago</span>
          </mui-list-item>
          <mui-list-item>
            <span slot="primary">Review Request</span>
            <span slot="secondary">Bob Wilson · Yesterday</span>
          </mui-list-item>
        </mui-list>
      </mui-layout-panel>
      
      <mui-layout-main padding="lg">
        <h2 style="margin: 0 0 8px;">Meeting Notes</h2>
        <p style="color: var(--mui-text-secondary); margin-bottom: 24px;">From: John Doe · To: You · 2 minutes ago</p>
        <p>Hi team,</p>
        <p>Here are the notes from today's meeting...</p>
      </mui-layout-main>
      
      <mui-layout-panel slot="end" title="Details" position="end" border="start" default-width="240">
        <div style="padding: 16px;">
          <mui-avatar name="John Doe" size="xl" style="margin-bottom: 16px;"></mui-avatar>
          <h3 style="margin: 0 0 4px; font-size: 16px;">John Doe</h3>
          <p style="margin: 0; font-size: 14px; color: var(--mui-text-secondary);">john@example.com</p>
        </div>
      </mui-layout-panel>
    </mui-layout>
    `;
  }
}

customElements.define('three-column-layout-demo', ThreeColumnLayoutDemo);

// Storybook Meta
const meta: Meta<AdminLayoutDemo> = {
  title: 'MiuraUI/Layout/Layout System',
  component: 'admin-layout-demo',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<AdminLayoutDemo>;

/**
 * Complete Admin Layout
 * 
 * A full admin layout with icon rail, navigation panel, main content,
 * and an optional properties panel.
 */
export const AdminLayout: Story = {
  args: {},
};

/**
 * Minimal Layout (Rail + Content)
 * 
 * Simple layout with just the icon rail and main content.
 */
export const MinimalLayout: Story = {
  render: () => document.createElement('minimal-layout-demo'),
};

/**
 * Three Column Layout
 * 
 * Classic three-column layout with left nav, content, and right sidebar.
 */
export const ThreeColumnLayout: Story = {
  render: () => document.createElement('three-column-layout-demo'),
};
