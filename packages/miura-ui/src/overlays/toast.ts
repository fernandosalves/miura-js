import { MiuraElement, html, css, component, property, state } from '@miurajs/miura-element';

/**
 * Toast notification component
 * Usage:
 * <mui-toast open tone="success">Item saved successfully</mui-toast>
 */
@component({ tag: 'mui-toast' })
export class MuiToast extends MiuraElement {
  @property({ type: Boolean, default: false })
  open!: boolean;

  @property({ type: String, default: 'neutral' })
  tone!: 'neutral' | 'success' | 'warning' | 'error' | 'info';

  @property({ type: String, default: 'bottom-right' })
  position!: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

  @property({ type: Number, default: 5000 })
  duration!: number;

  @property({ type: Boolean, default: true })
  closeable!: boolean;

  @state({ default: null })
  private _timer!: NodeJS.Timeout | null;

  static get styles() {
    return css`
      :host {
        display: block;
        position: fixed;
        z-index: var(--mui-z-toast, 1500);
        pointer-events: none;
      }

      /* Positioning */
      :host([position="top-left"]) { top: 16px; left: 16px; }
      :host([position="top-center"]) { top: 16px; left: 50%; transform: translateX(-50%); }
      :host([position="top-right"]) { top: 16px; right: 16px; }
      :host([position="bottom-left"]) { bottom: 16px; left: 16px; }
      :host([position="bottom-center"]) { bottom: 16px; left: 50%; transform: translateX(-50%); }
      :host([position="bottom-right"]) { bottom: 16px; right: 16px; }

      .toast {
        display: flex;
        align-items: center;
        gap: var(--mui-space-3);
        min-width: 300px;
        max-width: 500px;
        padding: var(--mui-space-4);
        background: var(--_toast-bg);
        color: var(--_toast-color);
        border-radius: var(--mui-radius-lg);
        box-shadow: var(--mui-shadow-lg);
        opacity: 0;
        transform: translateY(20px);
        pointer-events: auto;
        transition: opacity var(--mui-duration-normal) var(--mui-easing-emphasized),
                    transform var(--mui-duration-normal) var(--mui-easing-emphasized);
      }

      :host([open]) .toast {
        opacity: 1;
        transform: translateY(0);
      }

      /* Tone colors */
      :host([tone="neutral"]) {
        --_toast-bg: var(--mui-surface);
        --_toast-color: var(--mui-text);
      }

      :host([tone="success"]) {
        --_toast-bg: var(--mui-success);
        --_toast-color: white;
      }

      :host([tone="warning"]) {
        --_toast-bg: var(--mui-warning);
        --_toast-color: #1a1a1a;
      }

      :host([tone="error"]) {
        --_toast-bg: var(--mui-error);
        --_toast-color: white;
      }

      :host([tone="info"]) {
        --_toast-bg: var(--mui-info);
        --_toast-color: white;
      }

      .toast-icon {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
      }

      .toast-content {
        flex: 1;
        font-size: var(--mui-text-sm);
        line-height: 1.5;
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

      .close-icon {
        width: 14px;
        height: 14px;
      }
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.open && this.duration > 0) {
      this._startTimer();
    }
  }

  updated() {
    if (this.open && this.duration > 0) {
      this._startTimer();
    } else {
      this._clearTimer();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._clearTimer();
  }

  private _startTimer() {
    this._clearTimer();
    this._timer = setTimeout(() => {
      this._handleClose();
    }, this.duration);
  }

  private _clearTimer() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }

  private _handleClose() {
    this.open = false;
    this.emit('close');
  }

  template() {
    const icons = {
      success: html`
        <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      `,
      warning: html`
        <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      `,
      error: html`
        <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      `,
      info: html`
        <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
      <div class="toast" role="alert" aria-live="polite">
        ${this.tone !== 'neutral' ? icons[this.tone] : ''}
        <div class="toast-content">
          <slot></slot>
        </div>
        <button 
          class="close-button" 
          aria-label="Close"
          @click=${this._handleClose.bind(this)}
          #if=${this.closeable}
        >
          ${closeIcon}
        </button>
      </div>
    `;
  }
}
