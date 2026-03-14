import { html, css } from '@miura/miura-element';
import { MuiBase } from '../base/mui-base.js';

/**
 * Tokenized inline code element.
 */
export class MuiCode extends MuiBase {
    static tagName = 'mui-code';

    static styles = css`
        :host {
            display: inline;
        }

        code {
            font-family: var(--mui-font-family-mono, ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace);
            background: var(--mui-color-neutral-100, #f8fafc);
            color: var(--mui-color-neutral-900, #0f172a);
            border-radius: var(--mui-radius-sm);
            padding: 0.125em 0.375em;
            font-size: 0.875em;
            line-height: 1.4;
            border: 1px solid var(--mui-color-neutral-200, #e2e8f0);
        }
    `;

    template() {
        return html`<code part="code"><slot></slot></code>`;
    }
}

/**
 * Tokenized keyboard input element.
 */
export class MuiKbd extends MuiBase {
    static tagName = 'mui-kbd';

    static styles = css`
        :host {
            display: inline;
        }

        kbd {
            font-family: var(--mui-font-family-mono, ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace);
            background: var(--mui-surface);
            color: var(--mui-color-text);
            border-radius: var(--mui-radius-sm);
            padding: 0.2em 0.5em;
            font-size: 0.875em;
            line-height: 1.4;
            border: 1px solid var(--mui-color-border);
            box-shadow: var(--mui-shadow-xs);
        }
    `;

    template() {
        return html`<kbd part="kbd"><slot></slot></kbd>`;
    }
}

export function registerMuiCode() {
    if (!customElements.get(MuiCode.tagName)) {
        customElements.define(MuiCode.tagName, MuiCode);
    }
}

export function registerMuiKbd() {
    if (!customElements.get(MuiKbd.tagName)) {
        customElements.define(MuiKbd.tagName, MuiKbd);
    }
}

registerMuiCode();
registerMuiKbd(); 