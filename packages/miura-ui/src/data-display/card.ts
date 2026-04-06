/**
 * MUI Card Components
 * 
 * A flexible card system with header, content, footer, and media slots.
 * Supports stat cards, media cards, and interactive states.
 * 
 * @example
 * ```html
 * <mui-card>
 *   <mui-card-header>
 *     <mui-icon slot="icon" name="folder"></mui-icon>
 *     <span slot="title">Card Title</span>
 *     <span slot="subtitle">Subtitle</span>
 *     <mui-icon-button slot="action" icon="more-vertical"></mui-icon-button>
 *   </mui-card-header>
 *   <mui-card-content>
 *     Content goes here
 *   </mui-card-content>
 *   <mui-card-footer>
 *     <mui-button>Action</mui-button>
 *   </mui-card-footer>
 * </mui-card>
 * ```
 */

import { MiuraElement, html, css, component, property } from '@miurajs/miura-element';

/**
 * Main Card Container
 */
@component({ tag: 'mui-card' })
export class MuiCard extends MiuraElement {
  /**
   * Card variant
   */
  @property({ type: String })
  variant: 'default' | 'outlined' | 'elevated' | 'ghost' = 'default';

  /**
   * Padding size
   */
  @property({ type: String })
  padding: 'none' | 'sm' | 'md' | 'lg' = 'md';

  /**
   * Make card clickable with hover effect
   */
  @property({ type: Boolean })
  clickable = false;

  /**
   * Selected state (for selectable cards)
   */
  @property({ type: Boolean })
  selected = false;

  /**
   * Layout direction for media cards
   */
  @property({ type: String })
  direction: 'vertical' | 'horizontal' = 'vertical';

  /**
   * Accent color (shows colored top border)
   */
  @property({ type: String })
  accent = '';

  /**
   * Border radius size
   */
  @property({ type: String })
  radius: 'none' | 'sm' | 'md' | 'lg' | 'xl' = 'lg';

  static styles = css`
    :host {
      display: block;
    }

    .card {
      background: var(--mui-surface, white);
      border-radius: var(--card-radius);
      overflow: hidden;
      position: relative;
      transition: all var(--mui-duration-fast, 100ms) var(--mui-easing-standard, ease);
    }

    /* Radius */
    .card.radius-none { --card-radius: 0; }
    .card.radius-sm { --card-radius: var(--mui-radius-sm, 4px); }
    .card.radius-md { --card-radius: var(--mui-radius-md, 8px); }
    .card.radius-lg { --card-radius: var(--mui-radius-lg, 12px); }
    .card.radius-xl { --card-radius: var(--mui-radius-xl, 16px); }

    /* Variants */
    .card.variant-default {
      border: 1px solid var(--mui-border, #e5e7eb);
    }

    .card.variant-outlined {
      border: 1px solid var(--mui-border, #e5e7eb);
      background: transparent;
    }

    .card.variant-elevated {
      border: none;
      box-shadow: 
        0 1px 3px rgba(0, 0, 0, 0.08),
        0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .card.variant-ghost {
      border: none;
      background: transparent;
    }

    /* Accent line */
    .card.has-accent::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: var(--accent-color);
    }

    /* Clickable */
    .card.clickable {
      cursor: pointer;
    }

    .card.clickable:hover {
      border-color: var(--mui-primary, #3b82f6);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .card.clickable:active {
      transform: scale(0.99);
    }

    /* Selected */
    .card.selected {
      border-color: var(--mui-primary, #3b82f6);
      box-shadow: 0 0 0 1px var(--mui-primary, #3b82f6);
    }

    /* Direction */
    .card.direction-vertical {
      display: flex;
      flex-direction: column;
    }

    .card.direction-horizontal {
      display: flex;
      flex-direction: row;
    }

    /* Padding - applied to content and footer, not header or media */
    .card.padding-none { --card-padding: 0; }
    .card.padding-sm { --card-padding: var(--mui-space-3, 12px); }
    .card.padding-md { --card-padding: var(--mui-space-4, 16px); }
    .card.padding-lg { --card-padding: var(--mui-space-6, 24px); }

    /* Media slot */
    ::slotted([slot="media"]) {
      display: block;
      width: 100%;
      object-fit: cover;
    }

    .card.direction-horizontal ::slotted([slot="media"]) {
      width: 120px;
      min-width: 120px;
      height: 100%;
      object-fit: cover;
    }

    .content-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    /* Focus visible for accessibility */
    .card:focus-visible {
      outline: 2px solid var(--mui-primary, #3b82f6);
      outline-offset: 2px;
    }
  `;

  template() {
    const classes = [
      'card',
      `variant-${this.variant}`,
      `padding-${this.padding}`,
      `radius-${this.radius}`,
      `direction-${this.direction}`,
      this.clickable ? 'clickable' : '',
      this.selected ? 'selected' : '',
      this.accent ? 'has-accent' : '',
    ].filter(Boolean).join(' ');

    const style = this.accent ? `--accent-color: ${this.accent}` : '';

    return html`
      <div 
        class="${classes}" 
        style="${style}"
        tabindex="${this.clickable ? 0 : -1}"
        role="${this.clickable ? 'button' : ''}"
      >
        <slot name="media"></slot>
        <div class="content-wrapper">
          <slot name="header"></slot>
          <slot></slot>
          <slot name="footer"></slot>
        </div>
      </div>
    `;
  }
}

/**
 * Card Header Component
 */
@component({ tag: 'mui-card-header' })
export class MuiCardHeader extends MiuraElement {
  /**
   * Header padding
   */
  @property({ type: String })
  padding: 'sm' | 'md' | 'lg' = 'md';

  /**
   * Add bottom border
   */
  @property({ type: Boolean })
  bordered = false;

  static styles = css`
    :host {
      display: block;
    }

    .header {
      display: flex;
      align-items: flex-start;
      gap: var(--mui-space-3, 12px);
    }

    .header.padding-sm { padding: var(--mui-space-3, 12px); }
    .header.padding-md { padding: var(--mui-space-4, 16px); }
    .header.padding-lg { padding: var(--mui-space-6, 24px); }

    .header.bordered {
      border-bottom: 1px solid var(--mui-border, #e5e7eb);
    }

    .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    ::slotted([slot="icon"]) {
      color: var(--mui-primary, #3b82f6);
    }

    .content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    ::slotted([slot="title"]) {
      font-size: var(--mui-text-md, 1rem);
      font-weight: 600;
      color: var(--mui-text, #1f2937);
      line-height: 1.4;
      margin: 0;
    }

    ::slotted([slot="subtitle"]) {
      font-size: var(--mui-text-sm, 0.875rem);
      color: var(--mui-text-secondary, #6b7280);
      line-height: 1.4;
      margin: 0;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: var(--mui-space-1, 4px);
      flex-shrink: 0;
    }
  `;

  template() {
    const classes = [
      'header',
      `padding-${this.padding}`,
      this.bordered ? 'bordered' : '',
    ].filter(Boolean).join(' ');

    return html`
      <div class="${classes}">
        <span class="icon">
          <slot name="icon"></slot>
        </span>
        <div class="content">
          <slot name="title"></slot>
          <slot name="subtitle"></slot>
        </div>
        <div class="actions">
          <slot name="action"></slot>
        </div>
      </div>
    `;
  }
}

/**
 * Card Content Component
 */
@component({ tag: 'mui-card-content' })
export class MuiCardContent extends MiuraElement {
  /**
   * Content padding (inherits from card if not set)
   */
  @property({ type: String })
  padding: 'none' | 'sm' | 'md' | 'lg' | '' = '';

  static styles = css`
    :host {
      display: block;
      flex: 1;
    }

    .content {
      color: var(--mui-text, #1f2937);
      font-size: var(--mui-text-sm, 0.875rem);
      line-height: 1.6;
    }

    .content:not(.padding-none) {
      padding: var(--card-padding, var(--mui-space-4, 16px));
    }

    .content.padding-none { padding: 0; }
    .content.padding-sm { padding: var(--mui-space-3, 12px); }
    .content.padding-md { padding: var(--mui-space-4, 16px); }
    .content.padding-lg { padding: var(--mui-space-6, 24px); }

    /* Remove top padding if following header */
    :host(:not(:first-child)) .content {
      padding-top: 0;
    }
  `;

  template() {
    const classes = [
      'content',
      this.padding ? `padding-${this.padding}` : '',
    ].filter(Boolean).join(' ');

    return html`
      <div class="${classes}">
        <slot></slot>
      </div>
    `;
  }
}

/**
 * Card Footer Component
 */
@component({ tag: 'mui-card-footer' })
export class MuiCardFooter extends MiuraElement {
  /**
   * Footer padding
   */
  @property({ type: String })
  padding: 'sm' | 'md' | 'lg' = 'md';

  /**
   * Add top border
   */
  @property({ type: Boolean })
  bordered = false;

  /**
   * Alignment
   */
  @property({ type: String })
  align: 'start' | 'center' | 'end' | 'between' = 'end';

  static styles = css`
    :host {
      display: block;
      margin-top: auto;
    }

    .footer {
      display: flex;
      align-items: center;
      gap: var(--mui-space-2, 8px);
    }

    .footer.padding-sm { padding: var(--mui-space-3, 12px); }
    .footer.padding-md { padding: var(--mui-space-4, 16px); }
    .footer.padding-lg { padding: var(--mui-space-6, 24px); }

    /* Remove top padding */
    .footer {
      padding-top: 0;
    }

    .footer.bordered {
      border-top: 1px solid var(--mui-border, #e5e7eb);
      padding-top: var(--mui-space-4, 16px);
      margin-top: var(--mui-space-4, 16px);
    }

    .footer.align-start { justify-content: flex-start; }
    .footer.align-center { justify-content: center; }
    .footer.align-end { justify-content: flex-end; }
    .footer.align-between { justify-content: space-between; }
  `;

  template() {
    const classes = [
      'footer',
      `padding-${this.padding}`,
      `align-${this.align}`,
      this.bordered ? 'bordered' : '',
    ].filter(Boolean).join(' ');

    return html`
      <div class="${classes}">
        <slot></slot>
      </div>
    `;
  }
}

/**
 * Stat Card Component (specialized card for metrics)
 */
@component({ tag: 'mui-stat-card' })
export class MuiStatCard extends MiuraElement {
  /**
   * Stat label
   */
  @property({ type: String })
  label = '';

  /**
   * Stat value
   */
  @property({ type: String })
  value = '';

  /**
   * Change text (e.g., "+12%")
   */
  @property({ type: String })
  change = '';

  /**
   * Whether change is positive
   */
  @property({ type: Boolean })
  positive = false;

  /**
   * Accent color for icon background
   */
  @property({ type: String })
  accent = '';

  /**
   * Icon name
   */
  @property({ type: String })
  icon = '';

  static styles = css`
    :host {
      display: block;
    }

    .stat-card {
      background: var(--mui-surface, white);
      border: 1px solid var(--mui-border, #e5e7eb);
      border-radius: var(--mui-radius-lg, 12px);
      padding: var(--mui-space-4, 16px);
      display: flex;
      flex-direction: column;
      gap: var(--mui-space-3, 12px);
    }

    .header {
      display: flex;
      align-items: center;
      gap: var(--mui-space-3, 12px);
    }

    .icon-wrapper {
      width: 40px;
      height: 40px;
      border-radius: var(--mui-radius-md, 8px);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--icon-bg, var(--mui-surface-subtle, #f3f4f6));
      color: var(--icon-color, var(--mui-primary, #3b82f6));
    }

    .label {
      font-size: var(--mui-text-sm, 0.875rem);
      font-weight: 500;
      color: var(--mui-text-secondary, #6b7280);
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .value {
      font-size: var(--mui-text-3xl, 1.875rem);
      font-weight: 700;
      color: var(--mui-text, #1f2937);
      line-height: 1.2;
    }

    .change {
      font-size: var(--mui-text-sm, 0.875rem);
      font-weight: 500;
    }

    .change.positive {
      color: var(--mui-success, #22c55e);
    }

    .change.negative {
      color: var(--mui-error, #ef4444);
    }

    .footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  `;

  template() {
    const iconStyle = this.accent ? `
      --icon-bg: ${this.accent}15;
      --icon-color: ${this.accent};
    ` : '';

    return html`
      <div class="stat-card">
        <div class="header">
          ${this.icon ? html`
            <div class="icon-wrapper" style="${iconStyle}">
              <mui-icon name="${this.icon}" size="md"></mui-icon>
            </div>
          ` : ''}
          <span class="label">${this.label}</span>
        </div>
        <div class="footer">
          <span class="value">${this.value}</span>
          ${this.change ? html`
            <span class="change ${this.positive ? 'positive' : 'negative'}">
              ${this.change}
            </span>
          ` : ''}
        </div>
      </div>
    `;
  }
}

export default MuiCard;
