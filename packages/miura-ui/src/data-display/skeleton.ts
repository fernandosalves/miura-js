import { html, css } from '@miura/miura-element';
import { MuiBase } from '../base/mui-base.js';

/**
 * Tokenized skeleton placeholder.
 */
export class MuiSkeleton extends MuiBase {
    static tagName = 'mui-skeleton';

    static properties = {
        width: { type: String },
        height: { type: String },
        radius: { type: String },
        animated: { type: Boolean, reflect: true },
    };

    width = '100%';
    height = '1rem';
    radius = 'var(--mui-radius-md)';
    animated = true;

    static styles = css`
        :host {
            display: inline-block;
            width: var(--mui-skeleton-width, 100%);
            height: var(--mui-skeleton-height, 1rem);
        }

        .skeleton {
            display: block;
            width: 100%;
            height: 100%;
            border-radius: var(--mui-skeleton-radius, var(--mui-radius-md));
            background: linear-gradient(
                90deg,
                color-mix(in srgb, var(--mui-color-border) 20%, transparent) 25%,
                color-mix(in srgb, var(--mui-surface) 97%, transparent) 50%,
                color-mix(in srgb, var(--mui-color-border) 20%, transparent) 75%
            );
            background-size: 200% 100%;
        }

        :host([animated]) .skeleton {
            animation: shimmer 1.4s ease infinite;
        }

        @keyframes shimmer {
            0% {
                background-position: 200% 0;
            }
            100% {
                background-position: -200% 0;
            }
        }
    `;

    updated(): void {
        this.style.setProperty('--mui-skeleton-width', this.width);
        this.style.setProperty('--mui-skeleton-height', this.height);
        this.style.setProperty('--mui-skeleton-radius', this.radius);
    }

    template() {
        return html`<span class="skeleton" part="skeleton"></span>`;
    }
}

export function registerMuiSkeleton() {
    if (!customElements.get(MuiSkeleton.tagName)) {
        customElements.define(MuiSkeleton.tagName, MuiSkeleton);
    }
}

registerMuiSkeleton();