import { MiuraElement, html, css, component, property } from '@miurajs/miura-element';

/**
 * Typography component
 * <mui-text variant="h1">Heading</mui-text>
 * <mui-text variant="body" color="secondary">Paragraph text</mui-text>
 * <mui-text variant="caption" truncate>Long text...</mui-text>
 */
@component({ tag: 'mui-text' })
export class MuiText extends MiuraElement {
  @property({ type: String, default: 'body', reflect: true })
  variant!: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'body-sm' | 'caption' | 'code' | 'label' | 'overline';

  @property({ type: String, default: 'inherit', reflect: true })
  color!: 'inherit' | 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error' | 'info';

  @property({ type: String, default: 'inherit', reflect: true })
  weight!: 'inherit' | 'normal' | 'medium' | 'semibold' | 'bold';

  @property({ type: String, default: 'left', reflect: true })
  align!: 'left' | 'center' | 'right';

  @property({ type: Boolean, default: false, reflect: true })
  truncate!: boolean;

  @property({ type: Number, default: 0 })
  lines!: number;

  static styles: any = css`
    :host { display: block; }

    .text {
      margin: 0;
      font-family: inherit;
    }

    /* Variants */
    :host([variant="h1"]) .text { font-size: var(--mui-text-4xl, 2.25rem); font-weight: var(--mui-weight-bold, 700); line-height: 1.2; letter-spacing: -0.02em; }
    :host([variant="h2"]) .text { font-size: var(--mui-text-3xl, 1.875rem); font-weight: var(--mui-weight-bold, 700); line-height: 1.25; letter-spacing: -0.015em; }
    :host([variant="h3"]) .text { font-size: var(--mui-text-2xl, 1.5rem); font-weight: var(--mui-weight-semibold, 600); line-height: 1.3; }
    :host([variant="h4"]) .text { font-size: var(--mui-text-xl, 1.25rem); font-weight: var(--mui-weight-semibold, 600); line-height: 1.35; }
    :host([variant="h5"]) .text { font-size: var(--mui-text-lg, 1.125rem); font-weight: var(--mui-weight-semibold, 600); line-height: 1.4; }
    :host([variant="h6"]) .text { font-size: var(--mui-text-md, 1rem); font-weight: var(--mui-weight-semibold, 600); line-height: 1.5; }
    :host([variant="body"]) .text { font-size: var(--mui-text-md, 1rem); font-weight: inherit; line-height: 1.6; }
    :host([variant="body-sm"]) .text { font-size: var(--mui-text-sm, 0.875rem); font-weight: inherit; line-height: 1.5; }
    :host([variant="caption"]) .text { font-size: var(--mui-text-xs, 0.75rem); font-weight: inherit; line-height: 1.4; }
    :host([variant="label"]) .text { font-size: var(--mui-text-sm, 0.875rem); font-weight: var(--mui-weight-medium, 500); line-height: 1.4; }
    :host([variant="overline"]) .text { font-size: var(--mui-text-xs, 0.75rem); font-weight: var(--mui-weight-semibold, 600); letter-spacing: 0.08em; text-transform: uppercase; line-height: 1.4; }
    :host([variant="code"]) .text { font-family: ui-monospace, 'Cascadia Code', monospace; font-size: var(--mui-text-sm, 0.875rem); background: var(--mui-surface-subtle, rgba(0,0,0,0.04)); padding: 1px 4px; border-radius: 4px; }

    /* Colors */
    :host([color="primary"]) .text { color: var(--mui-primary, #3b82f6); }
    :host([color="secondary"]) .text { color: var(--mui-text-secondary, #6b7280); }
    :host([color="muted"]) .text { color: var(--mui-text-muted, #9ca3af); }
    :host([color="success"]) .text { color: var(--mui-success, #22c55e); }
    :host([color="warning"]) .text { color: var(--mui-warning, #f59e0b); }
    :host([color="error"]) .text { color: var(--mui-error, #ef4444); }
    :host([color="info"]) .text { color: var(--mui-info, #3b82f6); }

    /* Weight overrides */
    :host([weight="normal"]) .text { font-weight: 400; }
    :host([weight="medium"]) .text { font-weight: 500; }
    :host([weight="semibold"]) .text { font-weight: 600; }
    :host([weight="bold"]) .text { font-weight: 700; }

    /* Align */
    :host([align="center"]) .text { text-align: center; }
    :host([align="right"]) .text { text-align: right; }

    /* Truncation */
    :host([truncate]) .text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `;

  template() {
    const isHeading = this.variant?.startsWith('h');
    const style = this.lines > 1
      ? `display: -webkit-box; -webkit-line-clamp: ${this.lines}; -webkit-box-orient: vertical; overflow: hidden;`
      : '';
    
    return html`
      <div 
        class="text" 
        style="${style}" 
        role="${isHeading ? 'heading' : 'paragraph'}"
        aria-level="${isHeading ? this.variant?.substring(1) : ''}"
      >
        <slot></slot>
      </div>
    `;
  }
}

/**
 * Empty State — shown when there's no content
 *
 * <mui-empty-state icon="inbox" title="No stories" description="Create one to get started">
 *   <mui-button variant="primary">Create Story</mui-button>
 * </mui-empty-state>
 */
@component({ tag: 'mui-empty-state' })
export class MuiEmptyState extends MiuraElement {
  @property({ type: String, default: 'inbox' })
  icon!: string;

  @property({ type: String, default: '' })
  title!: string;

  @property({ type: String, default: '' })
  description!: string;

  @property({ type: String, default: 'md' })
  size!: 'sm' | 'md' | 'lg';

  static styles: any = css`
    :host { display: block; }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: var(--mui-space-10, 40px) var(--mui-space-6, 24px);
    }

    .icon-wrap {
      width: 56px;
      height: 56px;
      background: var(--mui-surface-subtle, #f9fafb);
      border-radius: var(--mui-radius-full, 9999px);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--mui-space-4, 16px);
    }

    .title {
      font-size: var(--mui-text-lg, 1.125rem);
      font-weight: var(--mui-weight-semibold, 600);
      color: var(--mui-text, #1f2937);
      margin: 0 0 var(--mui-space-2, 8px);
    }

    .description {
      font-size: var(--mui-text-sm, 0.875rem);
      color: var(--mui-text-secondary, #6b7280);
      line-height: 1.5;
      margin: 0 0 var(--mui-space-5, 20px);
      max-width: 32ch;
    }

    .actions { display: flex; gap: var(--mui-space-2, 8px); }

    :host([size="sm"]) .empty-state { padding: var(--mui-space-6, 24px); }
    :host([size="sm"]) .icon-wrap { width: 40px; height: 40px; }
    :host([size="sm"]) .title { font-size: var(--mui-text-md, 1rem); }
    :host([size="lg"]) .icon-wrap { width: 72px; height: 72px; }
    :host([size="lg"]) .title { font-size: var(--mui-text-xl, 1.25rem); }
  `;

  template() {
    return html`
      <div class="empty-state">
        <div class="icon-wrap">
          <mui-icon name="${this.icon}" size="lg" color="secondary"></mui-icon>
        </div>
        ${this.title ? html`<h3 class="title">${this.title}</h3>` : ''}
        ${this.description ? html`<p class="description">${this.description}</p>` : ''}
        <div class="actions"><slot></slot></div>
      </div>
    `;
  }
}

/**
 * Progress Bar — linear and indeterminate
 *
 * <mui-progress value="65"></mui-progress>
 * <mui-progress indeterminate></mui-progress>
 */
@component({ tag: 'mui-progress' })
export class MuiProgress extends MiuraElement {
  @property({ type: Number, default: 0 })
  value!: number;

  @property({ type: Number, default: 100 })
  max!: number;

  @property({ type: Boolean, default: false, reflect: true })
  indeterminate!: boolean;

  @property({ type: String, default: 'md' })
  size!: 'xs' | 'sm' | 'md' | 'lg';

  @property({ type: String, default: 'primary' })
  color!: 'primary' | 'success' | 'warning' | 'error';

  @property({ type: Boolean, default: false })
  showValue!: boolean;

  @property({ type: String, default: '' })
  label!: string;

  static styles: any = css`
    :host { display: block; width: 100%; }

    .wrapper { display: flex; flex-direction: column; gap: var(--mui-space-1, 4px); }

    .top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: var(--mui-text-sm, 0.875rem);
      color: var(--mui-text-secondary, #6b7280);
    }

    .track {
      width: 100%;
      height: var(--_track-h, 6px);
      background: var(--mui-surface-subtle, #f3f4f6);
      border-radius: var(--mui-radius-full, 9999px);
      overflow: hidden;
    }

    :host([size="xs"]) { --_track-h: 2px; }
    :host([size="sm"]) { --_track-h: 4px; }
    :host([size="md"]) { --_track-h: 6px; }
    :host([size="lg"]) { --_track-h: 10px; }

    .fill {
      height: 100%;
      border-radius: var(--mui-radius-full, 9999px);
      background: var(--_fill-color, var(--mui-primary, #3b82f6));
      transition: width 0.3s ease;
    }

    :host([color="success"]) { --_fill-color: var(--mui-success, #22c55e); }
    :host([color="warning"]) { --_fill-color: var(--mui-warning, #f59e0b); }
    :host([color="error"]) { --_fill-color: var(--mui-error, #ef4444); }

    /* Indeterminate animation */
    :host([indeterminate]) .fill {
      width: 40% !important;
      animation: indeterminate 1.5s ease-in-out infinite;
    }

    @keyframes indeterminate {
      0% { margin-left: -40%; }
      100% { margin-left: 110%; }
    }
  `;

  template() {
    const val = Number(this.value) || 0;
    const maxVal = Number(this.max) || 100;
    const pct = Math.min(100, Math.max(0, (val / maxVal) * 100));
    return html`
      <div class="wrapper">
        ${(this.label || this.showValue) ? html`
          <div class="top-row">
            <span>${this.label}</span>
            ${this.showValue ? html`<span>${Math.round(pct)}%</span>` : ''}
          </div>
        ` : ''}
        <div class="track" role="progressbar" aria-valuenow="${val}" aria-valuemin="0" aria-valuemax="${maxVal}">
          <div class="fill" style="${this.indeterminate ? '' : `width: ${pct}%`}"></div>
        </div>
      </div>
    `;
  }
}

/**
 * Skeleton — loading placeholder
 *
 * <mui-skeleton variant="text" width="200px"></mui-skeleton>
 * <mui-skeleton variant="circular" size="40px"></mui-skeleton>
 * <mui-skeleton variant="rectangular" width="100%" height="200px"></mui-skeleton>
 */
@component({ tag: 'mui-skeleton' })
export class MuiSkeleton extends MiuraElement {
  @property({ type: String, default: 'text', reflect: true })
  variant!: 'text' | 'circular' | 'rectangular';

  @property({ type: String, default: '' })
  width!: string;

  @property({ type: String, default: '' })
  height!: string;

  @property({ type: String, default: '' })
  size!: string; // shorthand for circular

  @property({ type: Number, default: 1 })
  lines!: number;

  static styles: any = css`
    :host { display: block; }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    .skeleton {
      background: linear-gradient(90deg,
        var(--mui-surface-subtle, #f3f4f6) 25%,
        var(--mui-border, #e5e7eb) 50%,
        var(--mui-surface-subtle, #f3f4f6) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
    }

    :host([variant="text"]) .skeleton {
      height: 1em;
      border-radius: var(--mui-radius-sm, 4px);
      margin-bottom: 4px;
    }

    :host([variant="text"]) .skeleton:last-child {
      width: 70%;
    }

    :host([variant="circular"]) .skeleton {
      border-radius: 50%;
    }

    :host([variant="rectangular"]) .skeleton {
      border-radius: var(--mui-radius-md, 6px);
    }
  `;

  template() {
    if (this.variant === 'text' && this.lines > 1) {
      const lineEls = Array.from({ length: this.lines }, () =>
        html`<div class="skeleton" style="width: ${this.width || '100%'};"></div>`
      );
      return html`<div>${lineEls}</div>`;
    }

    const w = this.size || this.width || (this.variant === 'circular' ? '40px' : '100%');
    const h = this.size || this.height || (this.variant === 'text' ? '' : this.variant === 'circular' ? '40px' : '120px');
    return html`
      <div class="skeleton" style="width: ${w}; ${h ? `height: ${h};` : ''}"></div>
    `;
  }
}

/**
 * Timeline — vertical event history
 *
 * <mui-timeline>
 *   <mui-timeline-item icon="check" color="success">
 *     <span slot="title">Published</span>
 *     <span slot="time">2 hours ago</span>
 *   </mui-timeline-item>
 * </mui-timeline>
 */
@component({ tag: 'mui-timeline' })
export class MuiTimeline extends MiuraElement {
  static styles: any = css`
    :host { display: block; }
    .timeline { display: flex; flex-direction: column; gap: 0; }
  `;
  template() {
    return html`<div class="timeline"><slot></slot></div>`;
  }
}

@component({ tag: 'mui-timeline-item' })
export class MuiTimelineItem extends MiuraElement {
  @property({ type: String, default: 'circle' })
  icon!: string;

  @property({ type: String, default: 'default' })
  color!: 'default' | 'primary' | 'success' | 'warning' | 'error';

  @property({ type: Boolean, default: false })
  last!: boolean;

  static styles: any = css`
    :host { display: block; }

    .item {
      display: flex;
      gap: var(--mui-space-3, 12px);
      padding-bottom: var(--mui-space-4, 16px);
      position: relative;
    }

    .connector {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-shrink: 0;
    }

    .dot {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--_dot-bg, var(--mui-surface-subtle, #f3f4f6));
      color: var(--_dot-color, var(--mui-text-secondary, #6b7280));
      border: 2px solid var(--_dot-border, var(--mui-border, #e5e7eb));
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      z-index: 1;
    }

    :host([color="primary"]) { --_dot-bg: rgba(59,130,246,0.1); --_dot-color: var(--mui-primary, #3b82f6); --_dot-border: var(--mui-primary, #3b82f6); }
    :host([color="success"]) { --_dot-bg: rgba(34,197,94,0.1); --_dot-color: var(--mui-success, #22c55e); --_dot-border: var(--mui-success, #22c55e); }
    :host([color="warning"]) { --_dot-bg: rgba(245,158,11,0.1); --_dot-color: var(--mui-warning, #f59e0b); --_dot-border: var(--mui-warning, #f59e0b); }
    :host([color="error"]) { --_dot-bg: rgba(239,68,68,0.1); --_dot-color: var(--mui-error, #ef4444); --_dot-border: var(--mui-error, #ef4444); }

    .line {
      width: 2px;
      flex: 1;
      background: var(--mui-border, #e5e7eb);
      min-height: 16px;
      margin-top: 2px;
    }

    .content {
      flex: 1;
      padding-top: 4px;
    }

    .title {
      font-size: var(--mui-text-sm, 0.875rem);
      font-weight: var(--mui-weight-medium, 500);
      color: var(--mui-text, #1f2937);
      margin-bottom: 2px;
    }

    .time {
      font-size: var(--mui-text-xs, 0.75rem);
      color: var(--mui-text-muted, #9ca3af);
    }
  `;

  template() {
    return html`
      <div class="item">
        <div class="connector">
          <div class="dot">
            <mui-icon name="${this.icon}" size="xs"></mui-icon>
          </div>
          <div class="line"></div>
        </div>
        <div class="content">
          <div class="title"><slot name="title"></slot></div>
          <div class="time"><slot name="time"></slot></div>
          <slot></slot>
        </div>
      </div>
    `;
  }
}
