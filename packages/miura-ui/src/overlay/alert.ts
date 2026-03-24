import { html, css } from '@miurajs/miura-element';
import { MuiBase } from '../base/mui-base.js';

type AlertTone = 'success' | 'danger' | 'warning' | 'info';

/**
 * Tokenized alert with tone variants and dismissible option.
 */
export class MuiAlert extends MuiBase {
    static tagName = 'mui-alert';

    static properties = {
        tone: { type: String, reflect: true },
        dismissible: { type: Boolean, reflect: true },
    };

    tone: AlertTone = 'info';
    dismissible = false;

    static styles = css`
        :host {
            display: block;
        }

        .alert {
            padding: var(--mui-spacing-md) var(--mui-spacing-lg);
            border-radius: var(--mui-radius-md);
            margin: var(--mui-spacing-sm) 0;
            font-weight: var(--mui-type-font-weight-medium);
            display: flex;
            align-items: flex-start;
            gap: var(--mui-spacing-sm);
            border: 1px solid;
            background: var(--mui-alert-bg, var(--mui-surface));
            color: var(--mui-alert-text, var(--mui-color-text));
            border-color: var(--mui-alert-border, var(--mui-color-border));
        }

        :host([tone='success']) {
            --mui-alert-bg: color-mix(in srgb, var(--mui-color-success) 8%, transparent);
            --mui-alert-text: color-mix(in srgb, var(--mui-color-success) 90%, var(--mui-color-text));
            --mui-alert-border: color-mix(in srgb, var(--mui-color-success) 40%, transparent);
        }

        :host([tone='danger']) {
            --mui-alert-bg: color-mix(in srgb, var(--mui-color-danger) 8%, transparent);
            --mui-alert-text: color-mix(in srgb, var(--mui-color-danger) 90%, var(--mui-color-text));
            --mui-alert-border: color-mix(in srgb, var(--mui-color-danger) 40%, transparent);
        }

        :host([tone='warning']) {
            --mui-alert-bg: color-mix(in srgb, var(--mui-color-warning) 8%, transparent);
            --mui-alert-text: color-mix(in srgb, var(--mui-color-warning) 90%, var(--mui-color-text));
            --mui-alert-border: color-mix(in srgb, var(--mui-color-warning) 40%, transparent);
        }

        :host([tone='info']) {
            --mui-alert-bg: color-mix(in srgb, var(--mui-color-info) 8%, transparent);
            --mui-alert-text: color-mix(in srgb, var(--mui-color-info) 90%, var(--mui-color-text));
            --mui-alert-border: color-mix(in srgb, var(--mui-color-info) 40%, transparent);
        }

        .icon {
            flex-shrink: 0;
            margin-top: 2px;
        }

        .content {
            flex: 1;
            min-width: 0;
        }

        .close {
            flex-shrink: 0;
            background: none;
            border: none;
            padding: 0;
            cursor: pointer;
            font-size: 1.2em;
            line-height: 1;
            opacity: 0.6;
            transition: opacity 0.15s ease;
        }

        .close:hover {
            opacity: 1;
        }
    `;

    private handleDismiss = () => {
        this.emit('mui-alert-dismiss', {});
    };

    template() {
        return html`
            <div class="alert" part="alert" role="alert">
                <div class="icon" part="icon">
                    <slot name="icon"></slot>
                </div>
                <div class="content" part="content">
                    <slot></slot>
                </div>
                ${this.dismissible ? html`
                    <button class="close" part="close" @click=${this.handleDismiss} aria-label="Dismiss alert">
                        ×
                    </button>
                ` : null}
            </div>
        `;
    }
}

export function registerMuiAlert() {
    if (!customElements.get(MuiAlert.tagName)) {
        customElements.define(MuiAlert.tagName, MuiAlert);
    }
}

registerMuiAlert(); 