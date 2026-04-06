import { MiuraElement, html, css, component, property } from '@miurajs/miura-element';

/**
 * Alert banner component for inline notifications
 * Usage:
 * <mui-alert tone="info">This is an informational message</mui-alert>
 * <mui-alert tone="success" closeable>Changes saved successfully</mui-alert>
 */
@component({ tag: 'mui-alert' })
export class MuiAlert extends MiuraElement {
  @property({ type: String, default: 'info' })
  tone!: 'neutral' | 'success' | 'warning' | 'error' | 'info';

  @property({ type: String, default: 'subtle' })
  variant!: 'subtle' | 'filled' | 'outline';

  @property({ type: Boolean, default: false })
  closeable!: boolean;

  @property({ type: Boolean, default: false })
  closed!: boolean;

  static get styles() {
    return css`
      :host {
        display: block;
      }

      :host([closed]) {
        display: none;
      }

      .alert {
        display: flex;
        align-items: flex-start;
        gap: var(--mui-space-3);
        padding: var(--mui-space-4);
        border-radius: var(--mui-radius-lg);
        font-size: var(--mui-text-sm);
        line-height: 1.6;
      }

      /* Tone: Neutral */
      :host([tone="neutral"][variant="subtle"]) .alert {
        background: var(--mui-surface-subtle);
        color: var(--mui-text);
      }
      :host([tone="neutral"][variant="filled"]) .alert {
        background: var(--mui-text-secondary);
        color: white;
      }
      :host([tone="neutral"][variant="outline"]) .alert {
        background: transparent;
        border: 1px solid var(--mui-border);
        color: var(--mui-text);
      }

      /* Tone: Success */
      :host([tone="success"][variant="subtle"]) .alert {
        background: color-mix(in srgb, var(--mui-success) 15%, transparent);
        color: var(--mui-success);
      }
      :host([tone="success"][variant="filled"]) .alert {
        background: var(--mui-success);
        color: white;
      }
      :host([tone="success"][variant="outline"]) .alert {
        background: transparent;
        border: 1px solid var(--mui-success);
        color: var(--mui-success);
      }

      /* Tone: Warning */
      :host([tone="warning"][variant="subtle"]) .alert {
        background: color-mix(in srgb, var(--mui-warning) 20%, transparent);
        color: color-mix(in srgb, var(--mui-warning) 100%, #1a1a1a 40%);
      }
      :host([tone="warning"][variant="filled"]) .alert {
        background: var(--mui-warning);
        color: #1a1a1a;
      }
      :host([tone="warning"][variant="outline"]) .alert {
        background: transparent;
        border: 1px solid var(--mui-warning);
        color: color-mix(in srgb, var(--mui-warning) 100%, #1a1a1a 40%);
      }

      /* Tone: Error */
      :host([tone="error"][variant="subtle"]) .alert {
        background: color-mix(in srgb, var(--mui-error) 15%, transparent);
        color: var(--mui-error);
      }
      :host([tone="error"][variant="filled"]) .alert {
        background: var(--mui-error);
        color: white;
      }
      :host([tone="error"][variant="outline"]) .alert {
        background: transparent;
        border: 1px solid var(--mui-error);
        color: var(--mui-error);
      }

      /* Tone: Info */
      :host([tone="info"][variant="subtle"]) .alert {
        background: color-mix(in srgb, var(--mui-info) 15%, transparent);
        color: var(--mui-info);
      }
      :host([tone="info"][variant="filled"]) .alert {
        background: var(--mui-info);
        color: white;
      }
      :host([tone="info"][variant="outline"]) .alert {
        background: transparent;
        border: 1px solid var(--mui-info);
        color: var(--mui-info);
      }

      .alert-icon {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        margin-top: 2px;
      }

      .alert-content {
        flex: 1;
      }

      .alert-title {
        font-weight: var(--mui-weight-semibold);
        margin-bottom: var(--mui-space-1);
      }

      .close-button {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        padding: 0;
        background: transparent;
        border: none;
        border-radius: var(--mui-radius-sm);
        color: currentColor;
        cursor: pointer;
        opacity: 0.7;
        transition: opacity var(--mui-duration-fast) var(--mui-easing-standard),
                    background var(--mui-duration-fast) var(--mui-easing-standard);
      }

      .close-button:hover {
        opacity: 1;
        background: rgba(0, 0, 0, 0.1);
      }

      .close-button:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 2px;
      }

      .close-icon {
        width: 14px;
        height: 14px;
      }
    `;
  }

  private _handleClose() {
    this.closed = true;
    this.emit('close');
  }

  template() {
    const icons = {
      success: html`
        <svg class="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      `,
      warning: html`
        <svg class="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      `,
      error: html`
        <svg class="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      `,
      info: html`
        <svg class="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      `,
      neutral: html`
        <svg class="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      `,
    };

    const closeIcon = html`
      <svg class="close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
    `;

    return html`
      <div class="alert" role="alert">
        ${icons[this.tone]}
        <div class="alert-content">
          <div class="alert-title" #if=${this.hasSlot('title')}>
            <slot name="title"></slot>
          </div>
          <slot></slot>
        </div>
        <button 
          class="close-button" 
          aria-label="Close alert"
          @click=${this._handleClose.bind(this)}
          #if=${this.closeable}
        >
          ${closeIcon}
        </button>
      </div>
    `;
  }
}
