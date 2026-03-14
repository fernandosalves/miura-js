import { html, css } from '@miura/miura-element';
import { MuiBase } from '../base/mui-base.js';

type LinkVariant = 'default' | 'subtle' | 'plain';
type LinkTone = 'primary' | 'secondary' | 'accent' | 'success' | 'danger' | 'warning';

/**
 * Tokenized link with variant/tone and proper attribute forwarding.
 */
export class MuiLink extends MuiBase {
    static tagName = 'mui-link';

    static properties = {
        href: { type: String },
        target: { type: String },
        variant: { type: String, reflect: true },
        tone: { type: String, reflect: true },
    };

    href = '';
    target = '';
    variant: LinkVariant = 'default';
    tone: LinkTone = 'primary';

    static styles = css`
        :host {
            display: inline;
        }

        .link {
            color: var(--mui-link-color, var(--mui-color-primary));
            text-decoration: var(--mui-link-decoration, underline);
            cursor: pointer;
            transition: color 0.15s ease, text-decoration 0.15s ease;
            font-weight: var(--mui-link-weight, var(--mui-type-font-weight-normal));
            border-radius: var(--mui-radius-xs);
            padding: var(--mui-link-padding, 0);
            margin: var(--mui-link-margin, 0);
            background: transparent;
            border: none;
            font-size: inherit;
            font-family: inherit;
        }

        .link:hover {
            color: var(--mui-link-hover-color, var(--mui-color-primary-hover));
            text-decoration: var(--mui-link-hover-decoration, underline);
        }

        .link:focus-visible {
            outline: 2px solid color-mix(in srgb, var(--mui-color-primary) 40%, transparent);
            outline-offset: 2px;
        }

        :host([variant='subtle']) {
            --mui-link-decoration: none;
            --mui-link-hover-decoration: underline;
        }

        :host([variant='plain']) {
            --mui-link-decoration: none;
            --mui-link-hover-decoration: none;
            --mui-link-hover-color: var(--mui-link-color);
        }

        :host([tone='primary']) {
            --mui-link-color: var(--mui-color-primary);
            --mui-link-hover-color: var(--mui-color-primary-hover);
        }

        :host([tone='secondary']) {
            --mui-link-color: var(--mui-color-text-muted);
            --mui-link-hover-color: var(--mui-color-text);
        }

        :host([tone='accent']) {
            --mui-link-color: var(--mui-color-accent);
            --mui-link-hover-color: var(--mui-color-accent-hover);
        }

        :host([tone='success']) {
            --mui-link-color: var(--mui-color-success);
            --mui-link-hover-color: var(--mui-color-success-hover);
        }

        :host([tone='danger']) {
            --mui-link-color: var(--mui-color-danger);
            --mui-link-hover-color: var(--mui-color-danger-hover);
        }

        :host([tone='warning']) {
            --mui-link-color: var(--mui-color-warning);
            --mui-link-hover-color: var(--mui-color-warning-hover);
        }
    `;

    template() {
        return html`
            <a
                class="link"
                part="link"
                href=${this.href}
                target=${this.target || null}
                rel=${this.target === '_blank' ? 'noopener noreferrer' : null}
            >
                <slot></slot>
            </a>
        `;
    }
}

export function registerMuiLink() {
    if (!customElements.get(MuiLink.tagName)) {
        customElements.define(MuiLink.tagName, MuiLink);
    }
}

registerMuiLink(); 