import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css, state } from '@miurajs/miura-element';
import '../../src/overlays/popover.js';
import '../../src/overlays/dialog.js';
import '../../src/primitives/button.js';
import '../../src/primitives/icon.js';
import '../../src/primitives/icon-button.js';
import '../../src/data-display/card.js';
import '../../src/layout/stack.js';

// ── Dropdown Menu Demo ─────────────────────────────────────────────────────
class DropdownMenuDemo extends MiuraElement {
    static styles: any = css`
    :host { display: block; padding: 24px; font-family: system-ui; }
    h3 { font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin: 24px 0 12px; }
    h3:first-child { margin-top: 0; }
    .row { display: flex; gap: 16px; align-items: flex-start; flex-wrap: wrap; }
    .box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; display: flex; align-items: center; justify-content: center; gap: 12px; }
  `;

    template() {
        return html`
      <h3>Basic Dropdown (3-dots pattern)</h3>
      <div class="box">
        <mui-dropdown-menu>
          <mui-icon-button slot="trigger" icon="more-vertical" label="Actions" variant="ghost"></mui-icon-button>
          <mui-dropdown-item icon="edit">Edit</mui-dropdown-item>
          <mui-dropdown-item icon="copy">Duplicate</mui-dropdown-item>
          <mui-dropdown-item icon="share">Share</mui-dropdown-item>
          <mui-dropdown-divider></mui-dropdown-divider>
          <mui-dropdown-item icon="trash-2" variant="danger">Delete</mui-dropdown-item>
        </mui-dropdown-menu>

        <mui-dropdown-menu>
          <mui-button slot="trigger" variant="outline">Options <mui-icon name="chevron-down" size="sm"></mui-icon></mui-button>
          <mui-dropdown-item icon="file-text">New Document</mui-dropdown-item>
          <mui-dropdown-item icon="folder">New Folder</mui-dropdown-item>
          <mui-dropdown-divider></mui-dropdown-divider>
          <mui-dropdown-item icon="upload">Import</mui-dropdown-item>
        </mui-dropdown-menu>
      </div>

      <h3>On Cards</h3>
      <div class="row">
        <mui-card style="width: 280px">
          <mui-card-header>
            <mui-icon slot="icon" name="file-text" size="md"></mui-icon>
            <span slot="title">React Fundamentals</span>
            <span slot="subtitle">Updated 2h ago</span>
            <mui-dropdown-menu slot="action">
              <mui-icon-button slot="trigger" icon="more-vertical" size="sm" label="Actions" variant="ghost"></mui-icon-button>
              <mui-dropdown-item icon="edit">Edit</mui-dropdown-item>
              <mui-dropdown-item icon="eye">Preview</mui-dropdown-item>
              <mui-dropdown-divider></mui-dropdown-divider>
              <mui-dropdown-item icon="trash-2" variant="danger">Delete</mui-dropdown-item>
            </mui-dropdown-menu>
          </mui-card-header>
          <mui-card-content>A guide to React fundamentals and patterns.</mui-card-content>
        </mui-card>
      </div>

      <h3>Placements</h3>
      <div class="box" style="gap: 24px;">
        <mui-dropdown-menu placement="bottom-start">
          <mui-button slot="trigger" variant="outline" size="sm">Bottom Start ↓</mui-button>
          <mui-dropdown-item icon="check">Option 1</mui-dropdown-item>
          <mui-dropdown-item icon="check">Option 2</mui-dropdown-item>
        </mui-dropdown-menu>

        <mui-dropdown-menu placement="bottom-end">
          <mui-button slot="trigger" variant="outline" size="sm">Bottom End ↓</mui-button>
          <mui-dropdown-item icon="check">Option 1</mui-dropdown-item>
          <mui-dropdown-item icon="check">Option 2</mui-dropdown-item>
        </mui-dropdown-menu>
      </div>
    `;
    }
}
customElements.define('dropdown-menu-demo', DropdownMenuDemo);

// ── Tooltip Demo ─────────────────────────────────────────────────────────
class TooltipDemo extends MiuraElement {
    static styles: any = css`
    :host { display: block; padding: 24px; font-family: system-ui; }
    h3 { font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin: 24px 0 12px; }
    h3:first-child { margin-top: 0; }
    .row { display: flex; gap: 32px; align-items: center; flex-wrap: wrap; }
    .box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 48px 32px; display: flex; align-items: center; justify-content: center; gap: 32px; }
  `;

    template() {
        return html`
      <h3>Placements</h3>
      <div class="box" style="gap: 48px;">
        <mui-tooltip content="Tooltip on top" placement="top">
          <mui-button variant="outline" size="sm">Top</mui-button>
        </mui-tooltip>
        <mui-tooltip content="Tooltip on bottom" placement="bottom">
          <mui-button variant="outline" size="sm">Bottom</mui-button>
        </mui-tooltip>
        <mui-tooltip content="Left side" placement="left">
          <mui-button variant="outline" size="sm">Left</mui-button>
        </mui-tooltip>
        <mui-tooltip content="Right side" placement="right">
          <mui-button variant="outline" size="sm">Right</mui-button>
        </mui-tooltip>
      </div>

      <h3>On Icon Buttons (common pattern)</h3>
      <div class="row">
        <mui-tooltip content="Save document">
          <mui-icon-button icon="save" label="Save"></mui-icon-button>
        </mui-tooltip>
        <mui-tooltip content="Refresh data">
          <mui-icon-button icon="refresh-cw" label="Refresh"></mui-icon-button>
        </mui-tooltip>
        <mui-tooltip content="Delete item" placement="bottom">
          <mui-icon-button icon="trash-2" label="Delete" variant="ghost" color="danger"></mui-icon-button>
        </mui-tooltip>
        <mui-tooltip content="Settings & Preferences" placement="right">
          <mui-icon-button icon="settings" label="Settings"></mui-icon-button>
        </mui-tooltip>
      </div>

      <h3>Custom Delay</h3>
      <div class="row">
        <mui-tooltip content="Instant (0ms)" delay="0">
          <mui-button variant="outline" size="sm">Instant</mui-button>
        </mui-tooltip>
        <mui-tooltip content="Default (600ms)" delay="600">
          <mui-button variant="outline" size="sm">Default 600ms</mui-button>
        </mui-tooltip>
        <mui-tooltip content="Slow (1200ms)" delay="1200">
          <mui-button variant="outline" size="sm">Slow 1200ms</mui-button>
        </mui-tooltip>
      </div>
    `;
    }
}
customElements.define('tooltip-demo', TooltipDemo);

// ── Dialog Demo ─────────────────────────────────────────────────────────
class DialogDemo extends MiuraElement {
    static styles: any = css`
    :host { display: block; padding: 24px; font-family: system-ui; }
    h3 { font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin: 24px 0 12px; }
    h3:first-child { margin-top: 0; }
    .row { display: flex; gap: 12px; flex-wrap: wrap; }
  `;

    @state({ default: false })
    declare dialog1: boolean;

    @state({ default: false })
    declare dialog2: boolean;

    @state({ default: false })
    declare dialog3: boolean;

    @state({ default: false })
    declare dialog4: boolean;

    template() {
        return html`
      <h3>Basic Dialogs</h3>
      <div class="row">
        <mui-button variant="outline" @click=${() => { this.dialog1 = true; }}>Open Dialog</mui-button>
        <mui-button variant="outline" color="danger" @click=${() => { this.dialog2 = true; }}>Confirm Delete</mui-button>
        <mui-button variant="outline" @click=${() => { this.dialog3 = true; }}>Large Dialog</mui-button>
        <mui-button variant="outline" @click=${() => { this.dialog4 = true; }}>No Close Button</mui-button>
      </div>

      <!-- Basic Dialog -->
      <mui-dialog ?open=${this.dialog1} @close=${() => { this.dialog1 = false; }}>
        <span slot="title">Welcome to MiuraUI</span>
        <p>This is a standard dialog component with a title, body content, and action buttons.</p>
        <p>Click outside, press Escape, or click the close button to dismiss.</p>
        <div slot="actions">
          <mui-button variant="ghost" @click=${() => { this.dialog1 = false; }}>Cancel</mui-button>
          <mui-button variant="solid" tone="primary" @click=${() => { this.dialog1 = false; }}>Got it</mui-button>
        </div>
      </mui-dialog>

      <!-- Destructive Confirm -->
      <mui-dialog ?open=${this.dialog2} @close=${() => { this.dialog2 = false; }} size="sm">
        <span slot="title">Delete Story?</span>
        <p>Are you sure you want to delete <strong>React Fundamentals</strong>? This action cannot be undone and all related data will be permanently removed.</p>
        <div slot="actions">
          <mui-button variant="ghost" @click=${() => { this.dialog2 = false; }}>Cancel</mui-button>
          <mui-button variant="solid" tone="danger" @click=${() => { this.dialog2 = false; }}>Delete Story</mui-button>
        </div>
      </mui-dialog>

      <!-- Large Dialog -->
      <mui-dialog ?open=${this.dialog3} @close=${() => { this.dialog3 = false; }} size="lg">
        <span slot="title">Edit Story Details</span>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div>
            <label style="display:block; font-size:14px; font-weight:500; margin-bottom:6px;">Title</label>
            <input style="width:100%; box-sizing:border-box; padding:8px 12px; border:1px solid #e5e7eb; border-radius:6px; font-size:14px;" value="React Fundamentals">
          </div>
          <div>
            <label style="display:block; font-size:14px; font-weight:500; margin-bottom:6px;">Description</label>
            <textarea style="width:100%; box-sizing:border-box; padding:8px 12px; border:1px solid #e5e7eb; border-radius:6px; font-size:14px; resize:vertical; min-height:80px;">A comprehensive guide to React fundamentals...</textarea>
          </div>
          <div>
            <label style="display:block; font-size:14px; font-weight:500; margin-bottom:6px;">Status</label>
            <select style="width:100%; padding:8px 12px; border:1px solid #e5e7eb; border-radius:6px; font-size:14px;">
              <option>Draft</option>
              <option selected>Published</option>
              <option>Archived</option>
            </select>
          </div>
        </div>
        <div slot="actions">
          <mui-button variant="ghost" @click=${() => { this.dialog3 = false; }}>Cancel</mui-button>
          <mui-button variant="solid" tone="primary" @click=${() => { this.dialog3 = false; }}>Save Changes</mui-button>
        </div>
      </mui-dialog>

      <!-- No close button -->
      <mui-dialog ?open=${this.dialog4} @close=${() => { this.dialog4 = false; }} size="sm" .closeOnBackdrop=${false}>
        <span slot="title">Required Action</span>
        <p>You must complete this action before continuing. No escape!</p>
        <div slot="actions">
          <mui-button variant="solid" tone="primary" @click=${() => { this.dialog4 = false; }}>Accept & Continue</mui-button>
        </div>
      </mui-dialog>
    `;
    }
}
customElements.define('dialog-demo', DialogDemo);

// ─── Meta ────────────────────────────────────────────────────────────────────

const dropdownMeta: Meta = {
    title: 'MiuraUI/Overlays/Dropdown Menu',
    component: 'dropdown-menu-demo',
    parameters: { layout: 'padded' },
};
export default dropdownMeta;

export const DropdownMenu: StoryObj = {};

export const Tooltip: StoryObj = {
    render: () => document.createElement('tooltip-demo'),
    parameters: { component: 'tooltip-demo' },
    name: 'Tooltip',
};

export const Dialog: StoryObj = {
    render: () => document.createElement('dialog-demo'),
    parameters: { component: 'dialog-demo' },
    name: 'Dialog',
};
