import { html, css } from '@miurajs/miura-element';
import { MuiBase } from '../base/mui-base.js';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type AvatarShape = 'circle' | 'rounded' | 'square';
type AvatarStatus = 'none' | 'online' | 'busy' | 'away';

export class MuiAvatar extends MuiBase {
    static tagName = 'mui-avatar';

    static properties = {
        src: { type: String },
        alt: { type: String },
        size: { type: String, reflect: true },
        shape: { type: String, reflect: true },
        status: { type: String, reflect: true },
    };

    src = '';
    alt = '';
    size: AvatarSize = 'md';
    shape: AvatarShape = 'circle';
    status: AvatarStatus = 'none';

    private imageError = false;

    static styles = css`
        :host {
            --mui-avatar-size: 2.75rem;
            display: inline-flex;
            position: relative;
            width: var(--mui-avatar-size);
            height: var(--mui-avatar-size);
            border-radius: var(--mui-avatar-radius, 50%);
            background: color-mix(in srgb, var(--mui-surface) 95%, transparent);
            color: var(--mui-color-text, #0f172a);
            font-weight: var(--mui-type-font-weight-semibold);
            font-size: calc(var(--mui-avatar-size) * 0.4);
            align-items: center;
            justify-content: center;
            overflow: hidden;
            text-transform: uppercase;
        }

        :host([size='xs']) {
            --mui-avatar-size: 1.75rem;
        }
        :host([size='sm']) {
            --mui-avatar-size: 2.25rem;
        }
        :host([size='md']) {
            --mui-avatar-size: 2.75rem;
        }
        :host([size='lg']) {
            --mui-avatar-size: 3.25rem;
        }
        :host([size='xl']) {
            --mui-avatar-size: 4rem;
        }

        :host([shape='rounded']) {
            --mui-avatar-radius: var(--mui-radius-lg);
        }

        :host([shape='square']) {
            --mui-avatar-radius: var(--mui-radius-sm);
        }

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        .status {
            position: absolute;
            bottom: 4px;
            right: 4px;
            width: 0.65rem;
            height: 0.65rem;
            border-radius: 999px;
            border: 2px solid var(--mui-surface);
            background: var(--mui-avatar-status-color, transparent);
        }

        :host([status='online']) {
            --mui-avatar-status-color: var(--mui-color-success);
        }
        :host([status='busy']) {
            --mui-avatar-status-color: var(--mui-color-danger);
        }
        :host([status='away']) {
            --mui-avatar-status-color: var(--mui-color-warning);
        }
    `;

    private handleError = () => {
        this.imageError = true;
        this.requestUpdate();
    };

    template() {
        const showImage = this.src && !this.imageError;
        return html`
            ${showImage
                ? html`<img src=${this.src} alt=${this.alt} @error=${this.handleError} />`
                : html`<slot></slot>`}
            ${this.status !== 'none' ? html`<span class="status" aria-hidden="true"></span>` : null}
        `;
    }
}

export function registerMuiAvatar() {
    if (!customElements.get(MuiAvatar.tagName)) {
        customElements.define(MuiAvatar.tagName, MuiAvatar);
    }
}

registerMuiAvatar();
