import { MuiBase } from '../base/mui-base.js';
import { html, css } from '@miurajs/miura-element';
import { getIcon, listIcons, registerIcon, registerIcons } from './icon-registry.js';

export { getIcon, listIcons, registerIcon, registerIcons } from './icon-registry.js';
export type { IconDefinition } from './icon-registry.js';

export class MuiIcon extends MuiBase {
    static tagName = 'mui-icon';

    static properties = {
        name: { type: String, reflect: true },
        size: { type: Number, reflect: true },
        strokeWidth: { type: Number, attribute: 'stroke-width' },
        label: { type: String },
        decorative: { type: Boolean, reflect: true },
    };

    declare name: string;
    declare size: number;
    declare strokeWidth: number;
    declare label: string;
    declare decorative: boolean;

    static styles = css`
        :host {
            --mui-icon-size: 20px;
            --mui-icon-stroke-width: 2;
            display: inline-flex;
            width: var(--mui-icon-size);
            height: var(--mui-icon-size);
            line-height: 1;
            color: currentColor;
            vertical-align: middle;
            flex-shrink: 0;
        }

        .icon {
            display: inline-flex;
            width: 100%;
            height: 100%;
            align-items: center;
            justify-content: center;
        }

        svg {
            width: 100%;
            height: 100%;
            display: block;
            stroke: currentColor;
            fill: none;
            stroke-width: var(--mui-icon-stroke-width);
            stroke-linecap: round;
            stroke-linejoin: round;
        }
    `;

    connectedCallback(): void {
        super.connectedCallback?.();
        if (!this.hasAttribute('aria-hidden') && !this.label && this.decorative !== false) {
            this.setAttribute('aria-hidden', 'true');
        }
    }

    private _renderSvg(iconName: string) {
        const icon = getIcon(iconName);
        if (!icon) return null;

        const ariaHidden = !this.label && this.decorative !== false;
        this.style.setProperty('--mui-icon-size', `${this.size || 20}px`);
        this.style.setProperty('--mui-icon-stroke-width', String(this.strokeWidth || 2));

        if (ariaHidden) {
            this.setAttribute('aria-hidden', 'true');
            this.removeAttribute('role');
            this.removeAttribute('aria-label');
        } else {
            this.removeAttribute('aria-hidden');
            this.setAttribute('role', 'img');
            if (this.label) this.setAttribute('aria-label', this.label);
        }

        const paths = icon.paths.map((path) => `<path d="${path}"></path>`).join('');
        return `<svg viewBox="0 0 24 24" aria-hidden="${ariaHidden}">${paths}</svg>`;
    }

    template() {
        if (this.name) {
            const iconSvg = this._renderSvg(this.name);
            if (iconSvg) {
                return html`<span class="icon" part="icon" .innerHTML=${iconSvg}></span>`;
            }
        }

        return html`<span class="icon" part="icon"><slot></slot></span>`;
    }
}

export function registerMuiIcon() {
    if (!customElements.get(MuiIcon.tagName)) {
        customElements.define(MuiIcon.tagName, MuiIcon);
    }
}

registerMuiIcon();
