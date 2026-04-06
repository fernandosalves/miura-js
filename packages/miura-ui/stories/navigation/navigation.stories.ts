/**
 * Navigation Components Stories
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from '@miurajs/miura-render';
import '../../src/navigation/toolbar.js';
import '../../src/navigation/breadcrumb.js';
import '../../src/navigation/tabs.js';
import '../../src/primitives/icon.js';
import '../../src/primitives/icon-button.js';
import '../../src/primitives/button.js';
import '../../src/primitives/input.js';
import '../../src/data-display/badge.js';

export default {
  title: 'MiuraUI/Navigation',
} as Meta;

// ============================================================================
// TOOLBAR
// ============================================================================

export const Toolbars: StoryObj = {
  name: 'Toolbar',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 32px;">
      <div>
        <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Basic Toolbar</h4>
        <mui-toolbar border="bottom" bg="surface">
          <span slot="start" style="font-weight: 600;">Page Title</span>
          <mui-button slot="end" variant="primary">Action</mui-button>
        </mui-toolbar>
      </div>
      
      <div>
        <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Toolbar Sizes</h4>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <mui-toolbar size="sm" border="bottom" bg="surface">
            <span slot="start" style="font-size: 14px;">Small Toolbar</span>
            <mui-icon-button slot="end" icon="settings" size="sm"></mui-icon-button>
          </mui-toolbar>
          
          <mui-toolbar size="md" border="bottom" bg="surface">
            <span slot="start" style="font-weight: 500;">Medium Toolbar</span>
            <mui-button slot="end" size="sm">Action</mui-button>
          </mui-toolbar>
          
          <mui-toolbar size="lg" border="bottom" bg="surface">
            <span slot="start" style="font-size: 20px; font-weight: 600;">Large Toolbar</span>
            <mui-button slot="end" variant="primary">Primary Action</mui-button>
          </mui-toolbar>
        </div>
      </div>
      
      <div>
        <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Toolbar with Search & Filters</h4>
        <mui-toolbar bg="surface-subtle" border="bottom" size="sm">
          <div slot="start" style="display: flex; gap: 12px; align-items: center;">
            <mui-button variant="ghost" size="sm">
              <mui-icon name="list" size="sm"></mui-icon>
              All
            </mui-button>
            <mui-button variant="ghost" size="sm">Published</mui-button>
            <mui-button variant="ghost" size="sm">Drafts</mui-button>
          </div>
          <div slot="end" style="display: flex; gap: 8px; align-items: center;">
            <mui-input type="search" placeholder="Search..." size="sm" style="width: 200px;"></mui-input>
            <mui-icon-button icon="filter" size="sm"></mui-icon-button>
          </div>
        </mui-toolbar>
      </div>
      
      <div>
        <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Page Header</h4>
        <mui-page-header bordered bg="surface">
          <mui-icon slot="icon" name="folder" size="lg"></mui-icon>
          <span slot="title">Content Library</span>
          <span slot="description">Manage your stories, series, and labs in one place.</span>
          <mui-icon-button slot="actions" icon="refresh"></mui-icon-button>
          <mui-button slot="actions" variant="primary">
            <mui-icon name="plus" size="sm"></mui-icon>
            New Story
          </mui-button>
        </mui-page-header>
      </div>
    </div>
  `,
};

// ============================================================================
// BREADCRUMB
// ============================================================================

export const Breadcrumbs: StoryObj = {
  name: 'Breadcrumb',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 32px;">
      <div>
        <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Basic Breadcrumb</h4>
        <mui-breadcrumb>
          <mui-breadcrumb-item href="/">Home</mui-breadcrumb-item>
          <mui-breadcrumb-item href="/content">Content</mui-breadcrumb-item>
          <mui-breadcrumb-item active>Dashboard</mui-breadcrumb-item>
        </mui-breadcrumb>
      </div>
      
      <div>
        <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">With Icons</h4>
        <mui-breadcrumb>
          <mui-breadcrumb-item href="/" icon="home">Home</mui-breadcrumb-item>
          <mui-breadcrumb-item href="/settings" icon="settings">Settings</mui-breadcrumb-item>
          <mui-breadcrumb-item active icon="user">Profile</mui-breadcrumb-item>
        </mui-breadcrumb>
      </div>
      
      <div>
        <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Long Path</h4>
        <mui-breadcrumb>
          <mui-breadcrumb-item href="/">Home</mui-breadcrumb-item>
          <mui-breadcrumb-item href="/content">Content</mui-breadcrumb-item>
          <mui-breadcrumb-item href="/content/labs">Labs</mui-breadcrumb-item>
          <mui-breadcrumb-item href="/content/labs/frontend">Frontend</mui-breadcrumb-item>
          <mui-breadcrumb-item active>React Fundamentals</mui-breadcrumb-item>
        </mui-breadcrumb>
      </div>
      
      <div>
        <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Small Size</h4>
        <mui-breadcrumb size="sm">
          <mui-breadcrumb-item href="/">Home</mui-breadcrumb-item>
          <mui-breadcrumb-item href="/docs">Docs</mui-breadcrumb-item>
          <mui-breadcrumb-item active>Getting Started</mui-breadcrumb-item>
        </mui-breadcrumb>
      </div>
    </div>
  `,
};

// ============================================================================
// TABS
// ============================================================================

export const Tabs: StoryObj = {
  name: 'Tabs',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 32px;">
      <div>
        <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Line Tabs (Default)</h4>
        <mui-tabs value="tab1">
          <mui-tab value="tab1" selected>Overview</mui-tab>
          <mui-tab value="tab2">Analytics</mui-tab>
          <mui-tab value="tab3">Reports</mui-tab>
          <mui-tab value="tab4" disabled>Settings</mui-tab>
        </mui-tabs>
      </div>
      
      <div>
        <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Contained Tabs</h4>
        <mui-tabs value="tab1" variant="contained">
          <mui-tab value="tab1" selected>Overview</mui-tab>
          <mui-tab value="tab2">Analytics</mui-tab>
          <mui-tab value="tab3">Reports</mui-tab>
        </mui-tabs>
      </div>
      
      <div>
        <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Pill Tabs</h4>
        <mui-tabs value="tab1" variant="pills">
          <mui-tab value="tab1" selected>All</mui-tab>
          <mui-tab value="tab2">Published</mui-tab>
          <mui-tab value="tab3">Drafts</mui-tab>
          <mui-tab value="tab4">Scheduled</mui-tab>
        </mui-tabs>
      </div>
      
      <div>
        <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Tabs with Icons</h4>
        <mui-tabs value="tab1">
          <mui-tab value="tab1" icon="file" selected>Documents</mui-tab>
          <mui-tab value="tab2" icon="image">Media</mui-tab>
          <mui-tab value="tab3" icon="link">Links</mui-tab>
        </mui-tabs>
      </div>
      
      <div>
        <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Tabs with Badges</h4>
        <mui-tabs value="tab1">
          <mui-tab value="tab1" selected .badge=${12}>Inbox</mui-tab>
          <mui-tab value="tab2" .badge=${3}>Drafts</mui-tab>
          <mui-tab value="tab3">Sent</mui-tab>
        </mui-tabs>
      </div>
      
      <div>
        <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Tab Sizes</h4>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <mui-tabs value="tab1" size="sm">
            <mui-tab value="tab1" selected>Small</mui-tab>
            <mui-tab value="tab2">Tabs</mui-tab>
          </mui-tabs>
          
          <mui-tabs value="tab1" size="md">
            <mui-tab value="tab1" selected>Medium</mui-tab>
            <mui-tab value="tab2">Tabs</mui-tab>
          </mui-tabs>
          
          <mui-tabs value="tab1" size="lg">
            <mui-tab value="tab1" selected>Large</mui-tab>
            <mui-tab value="tab2">Tabs</mui-tab>
          </mui-tabs>
        </div>
      </div>
      
      <div>
        <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Stretched Tabs</h4>
        <div style="max-width: 400px;">
          <mui-tabs value="tab1" variant="contained" stretch>
            <mui-tab value="tab1" selected>Day</mui-tab>
            <mui-tab value="tab2">Week</mui-tab>
            <mui-tab value="tab3">Month</mui-tab>
          </mui-tabs>
        </div>
      </div>
    </div>
  `,
};
