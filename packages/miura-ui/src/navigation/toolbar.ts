/**
 * MUI Toolbar Component
 * 
 * A flexible toolbar for page headers, action bars, and filter bars.
 * 
 * @example
 * ```html
 * <mui-toolbar>
 *   <span slot="start">Page Title</span>
 *   <mui-button slot="end">Action</mui-button>
 * </mui-toolbar>
 * ```
 */

import { MiuraElement, html, css, component, property } from '@miurajs/miura-element';

@component({ tag: 'mui-toolbar' })
export default class MuiToolbar extends MiuraElement {
  /**
   * Toolbar size
   */
  @property({ type: String })
  size: 'sm' | 'md' | 'lg' = 'md';

  /**
   * Border position
   */
  @property({ type: String })
  border: 'none' | 'top' | 'bottom' | 'both' = 'none';

  /**
   * Background variant
   */
  @property({ type: String })
  bg: 'transparent' | 'surface' | 'surface-subtle' = 'transparent';

  /**
   * Make toolbar sticky
   */
  @property({ type: Boolean })
  sticky = false;

  /**
   * Horizontal padding
   */
  @property({ type: String })
  padding: 'none' | 'sm' | 'md' | 'lg' = 'md';

  /**
   * Gap between items
   */
  @property({ type: String })
  gap: 'sm' | 'md' | 'lg' = 'md';

  /**
   * Vertical alignment
   */
  @property({ type: String })
  align: 'start' | 'center' | 'end' | 'stretch' = 'center';

  static styles = css`
    :host {
      display: block;
    }

    .toolbar {
      display: flex;
      align-items: var(--toolbar-align, center);
      justify-content: space-between;
      width: 100%;
    }

    /* Sizes */
    .toolbar.size-sm {
      min-height: 44px;
    }

    .toolbar.size-md {
      min-height: 56px;
    }

    .toolbar.size-lg {
      min-height: 72px;
    }

    /* Padding */
    .toolbar.padding-none { padding-left: 0; padding-right: 0; }
    .toolbar.padding-sm { padding-left: var(--mui-space-3, 12px); padding-right: var(--mui-space-3, 12px); }
    .toolbar.padding-md { padding-left: var(--mui-space-4, 16px); padding-right: var(--mui-space-4, 16px); }
    .toolbar.padding-lg { padding-left: var(--mui-space-6, 24px); padding-right: var(--mui-space-6, 24px); }

    /* Background */
    .toolbar.bg-transparent { background: transparent; }
    .toolbar.bg-surface { background: var(--mui-surface, white); }
    .toolbar.bg-surface-subtle { background: var(--mui-surface-subtle, #f9fafb); }

    /* Border */
    .toolbar.border-top { border-top: 1px solid var(--mui-border, #e5e7eb); }
    .toolbar.border-bottom { border-bottom: 1px solid var(--mui-border, #e5e7eb); }
    .toolbar.border-both { 
      border-top: 1px solid var(--mui-border, #e5e7eb);
      border-bottom: 1px solid var(--mui-border, #e5e7eb);
    }

    /* Sticky */
    .toolbar.sticky {
      position: sticky;
      top: 0;
      z-index: var(--mui-z-sticky, 100);
      backdrop-filter: blur(8px);
    }

    /* Alignment */
    .toolbar.align-start { --toolbar-align: flex-start; }
    .toolbar.align-center { --toolbar-align: center; }
    .toolbar.align-end { --toolbar-align: flex-end; }
    .toolbar.align-stretch { --toolbar-align: stretch; }

    /* Slots */
    .start, .center, .end {
      display: flex;
      align-items: center;
    }

    .start {
      flex: 1;
      min-width: 0;
      justify-content: flex-start;
    }

    .center {
      flex: 0 0 auto;
      justify-content: center;
    }

    .end {
      flex: 1;
      min-width: 0;
      justify-content: flex-end;
    }

    /* Gap */
    .start.gap-sm, .center.gap-sm, .end.gap-sm { gap: var(--mui-space-2, 8px); }
    .start.gap-md, .center.gap-md, .end.gap-md { gap: var(--mui-space-3, 12px); }
    .start.gap-lg, .center.gap-lg, .end.gap-lg { gap: var(--mui-space-4, 16px); }
  `;

  template() {
    const classes = [
      'toolbar',
      `size-${this.size}`,
      `padding-${this.padding}`,
      `bg-${this.bg}`,
      `border-${this.border}`,
      `align-${this.align}`,
      this.sticky ? 'sticky' : '',
    ].filter(Boolean).join(' ');

    return html`
      <div class="${classes}" role="toolbar">
        <div class="start gap-${this.gap}">
          <slot name="start"></slot>
        </div>
        <div class="center gap-${this.gap}">
          <slot name="center"></slot>
        </div>
        <div class="end gap-${this.gap}">
          <slot name="end"></slot>
          <slot></slot>
        </div>
      </div>
    `;
  }
}

/**
 * MUI Page Header Component
 * 
 * A standardized page header with title, description, and actions.
 * 
 * @example
 * ```html
 * <mui-page-header>
 *   <mui-icon slot="icon" name="folder"></mui-icon>
 *   <span slot="title">Dashboard</span>
 *   <span slot="description">Overview of your content</span>
 *   <mui-button slot="actions">New Story</mui-button>
 * </mui-page-header>
 * ```
 */
@component({ tag: 'mui-page-header' })
export class MuiPageHeader extends MiuraElement {
  /**
   * Horizontal padding
   */
  @property({ type: String })
  padding: 'none' | 'sm' | 'md' | 'lg' = 'md';

  /**
   * Add bottom border
   */
  @property({ type: Boolean })
  bordered = false;

  /**
   * Background
   */
  @property({ type: String })
  bg: 'transparent' | 'surface' | 'surface-subtle' = 'transparent';

  static styles = css`
    :host {
      display: block;
    }

    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--mui-space-4, 16px);
      padding: var(--mui-space-6, 24px) 0;
    }

    .header.padding-none { padding-left: 0; padding-right: 0; }
    .header.padding-sm { padding-left: var(--mui-space-3, 12px); padding-right: var(--mui-space-3, 12px); }
    .header.padding-md { padding-left: var(--mui-space-4, 16px); padding-right: var(--mui-space-4, 16px); }
    .header.padding-lg { padding-left: var(--mui-space-6, 24px); padding-right: var(--mui-space-6, 24px); }

    .header.bordered {
      border-bottom: 1px solid var(--mui-border, #e5e7eb);
    }

    .header.bg-transparent { background: transparent; }
    .header.bg-surface { background: var(--mui-surface, white); }
    .header.bg-surface-subtle { background: var(--mui-surface-subtle, #f9fafb); }

    .content {
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: flex-start;
      gap: var(--mui-space-4, 16px);
    }

    .icon {
      flex-shrink: 0;
      color: var(--mui-primary, #3b82f6);
    }

    .text {
      flex: 1;
      min-width: 0;
    }

    ::slotted([slot="title"]) {
      display: block;
      font-size: var(--mui-text-2xl, 1.5rem);
      font-weight: 700;
      color: var(--mui-text, #1f2937);
      line-height: 1.3;
      margin: 0;
      letter-spacing: -0.02em;
    }

    ::slotted([slot="description"]) {
      display: block;
      font-size: var(--mui-text-sm, 0.875rem);
      color: var(--mui-text-secondary, #6b7280);
      line-height: 1.5;
      margin-top: var(--mui-space-1, 4px);
    }

    .actions {
      display: flex;
      align-items: center;
      gap: var(--mui-space-2, 8px);
      flex-shrink: 0;
    }

    /* Responsive */
    @media (max-width: 640px) {
      .header {
        flex-direction: column;
        align-items: stretch;
      }

      .actions {
        justify-content: flex-end;
      }
    }
  `;

  template() {
    const classes = [
      'header',
      `padding-${this.padding}`,
      `bg-${this.bg}`,
      this.bordered ? 'bordered' : '',
    ].filter(Boolean).join(' ');

    return html`
      <div class="${classes}">
        <div class="content">
          <span class="icon">
            <slot name="icon"></slot>
          </span>
          <div class="text">
            <slot name="title"></slot>
            <slot name="description"></slot>
          </div>
        </div>
        <div class="actions">
          <slot name="actions"></slot>
          <slot></slot>
        </div>
      </div>
    `;
  }
}