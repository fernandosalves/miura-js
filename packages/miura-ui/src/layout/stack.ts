import { html, css } from '@miura/miura-element';
import { MuiBase } from '../base/mui-base.js';

type StackDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
type StackGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export class MuiStack extends MuiBase {
    static tagName = 'mui-stack';

    static properties = {
        direction: { type: String, reflect: true },
        gap: { type: String, reflect: true },
        align: { type: String, reflect: true },
        justify: { type: String, reflect: true },
        wrap: { type: Boolean, reflect: true },
        inline: { type: Boolean, reflect: true },
    };

    direction: StackDirection = 'column';
    gap: StackGap = 'md';
    align: StackAlign = 'stretch';
    justify: StackJustify = 'start';
    wrap = false;
    inline = false;

    static styles = css`
        :host {
            display: flex;
            flex-direction: var(--mui-stack-direction, column);
            gap: var(--mui-stack-gap, var(--mui-spacing-md));
            align-items: var(--mui-stack-align, stretch);
            justify-content: var(--mui-stack-justify, flex-start);
            flex-wrap: var(--mui-stack-wrap, nowrap);
            width: 100%;
        }

        :host([inline]) {
            display: inline-flex;
            width: auto;
        }

        :host([direction='row']) {
            --mui-stack-direction: row;
        }

        :host([direction='row-reverse']) {
            --mui-stack-direction: row-reverse;
        }

        :host([direction='column']) {
            --mui-stack-direction: column;
        }

        :host([direction='column-reverse']) {
            --mui-stack-direction: column-reverse;
        }

        :host([align='start']) {
            --mui-stack-align: flex-start;
        }

        :host([align='center']) {
            --mui-stack-align: center;
        }

        :host([align='end']) {
            --mui-stack-align: flex-end;
        }

        :host([align='stretch']) {
            --mui-stack-align: stretch;
        }

        :host([align='baseline']) {
            --mui-stack-align: baseline;
        }

        :host([justify='start']) {
            --mui-stack-justify: flex-start;
        }

        :host([justify='center']) {
            --mui-stack-justify: center;
        }

        :host([justify='end']) {
            --mui-stack-justify: flex-end;
        }

        :host([justify='between']) {
            --mui-stack-justify: space-between;
        }

        :host([justify='around']) {
            --mui-stack-justify: space-around;
        }

        :host([justify='evenly']) {
            --mui-stack-justify: space-evenly;
        }

        :host([wrap]) {
            --mui-stack-wrap: wrap;
        }

        :host([gap='none']) {
            --mui-stack-gap: 0;
        }

        :host([gap='xs']) {
            --mui-stack-gap: var(--mui-spacing-xs);
        }

        :host([gap='sm']) {
            --mui-stack-gap: var(--mui-spacing-sm);
        }

        :host([gap='md']) {
            --mui-stack-gap: var(--mui-spacing-md);
        }

        :host([gap='lg']) {
            --mui-stack-gap: var(--mui-spacing-lg);
        }

        :host([gap='xl']) {
            --mui-stack-gap: var(--mui-spacing-xl);
        }
    `;

    template() {
        return html`<slot></slot>`;
    }
}

export function registerMuiStack() {
    if (!customElements.get(MuiStack.tagName)) {
        customElements.define(MuiStack.tagName, MuiStack);
    }
}

registerMuiStack();