import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css, state } from '@miurajs/miura-element';
import '../../src/forms/forms.js';
import '../../src/data-display/display.js';
import '../../src/primitives/icon.js';
import '../../src/primitives/button.js';
import '../../src/layout/stack.js';

// ── Forms Demo ────────────────────────────────────────────────────────────────
class FormsDemo extends MiuraElement {
  static styles: any = css`
    :host { display: block; padding: 24px; font-family: system-ui; max-width: 600px; }
    h3 { font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin: 28px 0 14px; }
    h3:first-child { margin-top: 0; }
    .row { display: flex; gap: 16px; flex-wrap: wrap; align-items: flex-start; }
    .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; }
  `;

  @state({ default: true })
  declare checkbox1: boolean;

  @state({ default: false })
  declare checkbox2: boolean;

  @state({ default: false })
  declare checkbox3: boolean;

  @state({ default: true })
  declare switchOn: boolean;

  @state({ default: 'pro' })
  declare radioVal: string;

  @state({ default: '' })
  declare selectVal: string;

  template() {
    return html`
      <h3>Field Wrapper</h3>
      <div class="card" style="display:flex; flex-direction:column; gap:16px;">
        <mui-field label="Email address" required helper="We'll never share your email">
          <input style="width:100%; box-sizing:border-box; padding:8px 12px; border:1px solid #e5e7eb; border-radius:6px; font-size:14px;" type="email" placeholder="you@example.com">
        </mui-field>
        <mui-field label="Password" error="Password must be at least 8 characters">
          <input style="width:100%; box-sizing:border-box; padding:8px 12px; border:1px solid #ef4444; border-radius:6px; font-size:14px;" type="password">
        </mui-field>
        <mui-field label="Disabled field" disabled>
          <input style="width:100%; box-sizing:border-box; padding:8px 12px; border:1px solid #e5e7eb; border-radius:6px; font-size:14px; opacity:0.5;" disabled>
        </mui-field>
      </div>

      <h3>Textarea</h3>
      <mui-textarea label="Story Description" placeholder="Describe your story..." rows="3" counter maxlength="200"></mui-textarea>

      <h3>Select</h3>
      <div class="row">
        <div style="flex:1; min-width:200px;">
          <mui-select label="Category" placeholder="Choose a category...">
            <mui-option value="frontend">Frontend Labs</mui-option>
            <mui-option value="backend">Backend Labs</mui-option>
            <mui-option value="ai">AI Labs</mui-option>
            <mui-option value="design">Design System</mui-option>
          </mui-select>
        </div>
        <div style="flex:1; min-width:200px;">
          <mui-select label="Status" placeholder="Select status...">
            <mui-option value="draft">Draft</mui-option>
            <mui-option value="review">In Review</mui-option>
            <mui-option value="published">Published</mui-option>
            <mui-option value="archived" disabled>Archived</mui-option>
          </mui-select>
        </div>
      </div>

      <h3>Checkbox</h3>
      <div style="display:flex; flex-direction:column; gap:8px;">
        <mui-checkbox ?checked=${this.checkbox1} @change=${(e: any) => { this.checkbox1 = e.detail.checked; }}>
          Accept terms and conditions
        </mui-checkbox>
        <mui-checkbox ?checked=${this.checkbox2} @change=${(e: any) => { this.checkbox2 = e.detail.checked; }}>
          Subscribe to newsletter
        </mui-checkbox>
        <mui-checkbox indeterminate>Select all (indeterminate)</mui-checkbox>
        <mui-checkbox disabled>Disabled checkbox</mui-checkbox>
      </div>

      <h3>Switch</h3>
      <div style="display:flex; flex-direction:column; gap:10px;">
        <mui-switch ?checked=${this.switchOn} @change=${(e: any) => { this.switchOn = e.detail.checked; }}>
          Dark Mode ${this.switchOn ? '(On)' : '(Off)'}
        </mui-switch>
        <mui-switch checked size="sm">Compact switch</mui-switch>
        <mui-switch disabled>Disabled</mui-switch>
      </div>

      <h3>Radio Group</h3>
      <mui-radio-group label="Subscription Plan" value="${this.radioVal}" @change=${(e: any) => { this.radioVal = e.detail.value; }}>
        <mui-radio value="free">Free — Up to 3 labs</mui-radio>
        <mui-radio value="pro">Pro — $9/mo, unlimited labs</mui-radio>
        <mui-radio value="enterprise">Enterprise — Custom pricing</mui-radio>
        <mui-radio value="legacy" disabled>Legacy (discontinued)</mui-radio>
      </mui-radio-group>

      <h3>Horizontal Radio Group</h3>
      <mui-radio-group label="Size" value="md" direction="horizontal">
        <mui-radio value="sm">Small</mui-radio>
        <mui-radio value="md">Medium</mui-radio>
        <mui-radio value="lg">Large</mui-radio>
      </mui-radio-group>
    `;
  }
}
customElements.define('forms-demo', FormsDemo);

// ── Typography Demo ────────────────────────────────────────────────────────
class TypographyDemo extends MiuraElement {
  static styles: any = css`
    :host { display: block; padding: 24px; font-family: system-ui; }
    h3 { font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin: 28px 0 14px; }
    h3:first-child { margin-top: 0; }
    .palette { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
  `;

  template() {
    return html`
      <h3>Variants</h3>
      <div style="display:flex; flex-direction:column; gap:8px;">
        <mui-text variant="h1">Heading 1 — The quick brown fox</mui-text>
        <mui-text variant="h2">Heading 2 — The quick brown fox</mui-text>
        <mui-text variant="h3">Heading 3 — The quick brown fox</mui-text>
        <mui-text variant="h4">Heading 4 — The quick brown fox</mui-text>
        <mui-text variant="h5">Heading 5 — The quick brown fox</mui-text>
        <mui-text variant="h6">Heading 6 — The quick brown fox</mui-text>
        <mui-text variant="body">Body — The quick brown fox jumps over the lazy dog. This is standard body text used for paragraphs.</mui-text>
        <mui-text variant="body-sm">Body SM — The quick brown fox jumps over the lazy dog.</mui-text>
        <mui-text variant="caption" color="secondary">Caption — Additional supporting information</mui-text>
        <mui-text variant="label">Label — FORM LABELS AND TAGS</mui-text>
        <mui-text variant="overline">Overline — Section Dividers</mui-text>
        <mui-text variant="code">const greeting = 'Hello, MiuraUI!';</mui-text>
      </div>

      <h3>Colors</h3>
      <div class="palette">
        <mui-text variant="body" color="primary">Primary</mui-text>
        <mui-text variant="body" color="secondary">Secondary</mui-text>
        <mui-text variant="body" color="muted">Muted</mui-text>
        <mui-text variant="body" color="success">Success</mui-text>
        <mui-text variant="body" color="warning">Warning</mui-text>
        <mui-text variant="body" color="error">Error</mui-text>
      </div>

      <h3>Truncation</h3>
      <div style="max-width: 300px; border:1px solid #e5e7eb; border-radius:8px; padding:12px;">
        <mui-text variant="body" truncate>
          This is a really long text that will be truncated with an ellipsis when it overflows its container boundary.
        </mui-text>
      </div>
    `;
  }
}
customElements.define('typography-demo', TypographyDemo);

// ── Data Display Demo ───────────────────────────────────────────────────────
class DataDisplayDemo extends MiuraElement {
  static styles: any = css`
    :host { display: block; padding: 24px; font-family: system-ui; }
    h3 { font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin: 28px 0 14px; }
    h3:first-child { margin-top: 0; }
    .row { display: flex; gap: 16px; flex-wrap: wrap; align-items: flex-start; }
  `;

  template() {
    return html`
      <h3>Progress Bar</h3>
      <div style="display:flex; flex-direction:column; gap:16px; max-width:480px;">
        <mui-progress value="25" label="Uploading..." show-value></mui-progress>
        <mui-progress value="65" color="success" label="Complete" show-value></mui-progress>
        <mui-progress value="80" color="warning" show-value></mui-progress>
        <mui-progress value="12" color="error" label="Low storage" show-value></mui-progress>
        <mui-progress indeterminate label="Loading..."></mui-progress>

        <div style="display:flex; gap:16px; align-items:center;">
          <mui-progress value="60" size="xs" style="flex:1"></mui-progress>
          <mui-progress value="60" size="sm" style="flex:1"></mui-progress>
          <mui-progress value="60" size="md" style="flex:1"></mui-progress>
          <mui-progress value="60" size="lg" style="flex:1"></mui-progress>
        </div>
      </div>

      <h3>Skeleton Loader</h3>
      <div class="row">
        <div style="width:280px; display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:4px;">
            <mui-skeleton variant="circular" size="40px"></mui-skeleton>
            <div style="flex:1; display:flex; flex-direction:column; gap:6px;">
              <mui-skeleton variant="text" width="60%"></mui-skeleton>
              <mui-skeleton variant="text" width="40%"></mui-skeleton>
            </div>
          </div>
          <mui-skeleton variant="rectangular" height="160px"></mui-skeleton>
          <mui-skeleton variant="text" lines="3"></mui-skeleton>
        </div>
      </div>

      <h3>Empty State</h3>
      <div class="row">
        <mui-empty-state
          icon="inbox"
          title="No stories yet"
          description="Create your first story to get started building your content library."
        >
          <mui-button variant="solid" tone="primary">Create Story</mui-button>
          <mui-button variant="ghost">Import</mui-button>
        </mui-empty-state>

        <mui-empty-state
          size="sm"
          icon="search"
          title="No results"
          description="Try adjusting your search or filter."
        ></mui-empty-state>
      </div>

      <h3>KPI Stat Card</h3>
      <div class="row">
        <mui-kpi-card label="Total Labs" value="12" change="+2 this week" positive icon="folder" accent="#ec4899" style="width:240px;"></mui-kpi-card>
        <mui-kpi-card label="Active Stories" value="8" change="-5%" icon="file-text" accent="#3b82f6" style="width:240px;"></mui-kpi-card>
        <mui-kpi-card label="Server Load" value="42%" change="Optimal" positive icon="cpu" accent="#10b981" style="width:240px;"></mui-kpi-card>
      </div>

      <h3>Timeline</h3>
      <div style="max-width:360px;">
        <mui-timeline>
          <mui-timeline-item color="success" icon="check">
            <span slot="title">Published to Blog</span>
            <span slot="time">2 hours ago</span>
          </mui-timeline-item>
          <mui-timeline-item color="primary" icon="edit">
            <span slot="title">Content Updated</span>
            <span slot="time">Yesterday at 3:42 PM</span>
          </mui-timeline-item>
          <mui-timeline-item color="warning" icon="eye">
            <span slot="title">Submitted for Review</span>
            <span slot="time">2 days ago</span>
          </mui-timeline-item>
          <mui-timeline-item color="default" icon="file-plus">
            <span slot="title">Story Created</span>
            <span slot="time">Jan 15, 2026</span>
          </mui-timeline-item>
        </mui-timeline>
      </div>

      <h3>Persona</h3>
      <div class="row">
        <div style="width:260px; border:1px solid #e5e7eb; border-radius:12px; padding:8px;">
          <mui-persona name="John Doe" secondary="Software Engineer" status="online"></mui-persona>
          <mui-persona name="Jane Smith" secondary="Product Designer" status="busy"></mui-persona>
          <mui-persona name="Bob Wilson" secondary="Away since 2h" status="away"></mui-persona>
          <mui-persona name="Alice Brown" secondary="Offline" status="offline"></mui-persona>
        </div>

        <div style="width:260px; border:1px solid #e5e7eb; border-radius:12px; padding:8px;">
          <mui-persona name="John Doe" secondary="Lead Developer" tertiary="Last active 2 hours ago" size="lg" clickable>
            <mui-icon-button slot="action" icon="message-circle" size="sm" label="Message"></mui-icon-button>
            <mui-icon-button slot="action" icon="more-vertical" size="sm" label="More"></mui-icon-button>
          </mui-persona>
        </div>
      </div>
    `;
  }
}
customElements.define('data-display-demo', DataDisplayDemo);

// ─── Meta & exports ──────────────────────────────────────────────────────────

const formsMeta: Meta = {
  title: 'MiuraUI/Forms/Form Controls',
  component: 'forms-demo',
  parameters: { layout: 'padded' },
};
export default formsMeta;

export const FormControls: StoryObj = {};

export const Typography: StoryObj = {
  render: () => document.createElement('typography-demo'),
  name: 'Typography',
};

export const DataDisplay: StoryObj = {
  render: () => document.createElement('data-display-demo'),
  name: 'Data Display (Progress, Skeleton, Timeline, Persona)',
};
