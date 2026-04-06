// miura-ui: layout/stack.ts
// Mobile-first flexbox stack primitive for MiuraJS
import { MiuraElement, html, css } from '@miurajs/miura-element';

export class MuiStack extends MiuraElement {
  static tagName = 'mui-stack';

  static properties = {
    direction: { type: String, reflect: true, default: 'column' },
    gap: { type: String, reflect: true, default: 'md' },
    align: { type: String, reflect: true, default: 'stretch' },
    justify: { type: String, reflect: true, default: 'start' },
    wrap: { type: Boolean, reflect: true, default: false },
    inline: { type: Boolean, reflect: true, default: false },
  };

  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: var(--mui-stack-direction, column);
        gap: var(--mui-stack-gap, var(--mui-spacing-md));
        align-items: var(--mui-stack-align, stretch);
        justify-content: var(--mui-stack-justify, flex-start);
        flex-wrap: var(--mui-stack-wrap, nowrap);
        width: 100%;
      }
      :host([inline]) { display: inline-flex; width: auto; }
      :host([direction='row']) { --mui-stack-direction: row; }
      :host([direction='row-reverse']) { --mui-stack-direction: row-reverse; }
      :host([direction='column']) { --mui-stack-direction: column; }
      :host([direction='column-reverse']) { --mui-stack-direction: column-reverse; }
      :host([align='start']) { --mui-stack-align: flex-start; }
      :host([align='center']) { --mui-stack-align: center; }
      :host([align='end']) { --mui-stack-align: flex-end; }
      :host([align='stretch']) { --mui-stack-align: stretch; }
      :host([align='baseline']) { --mui-stack-align: baseline; }
      :host([justify='start']) { --mui-stack-justify: flex-start; }
      :host([justify='center']) { --mui-stack-justify: center; }
      :host([justify='end']) { --mui-stack-justify: flex-end; }
      :host([justify='between']) { --mui-stack-justify: space-between; }
      :host([justify='around']) { --mui-stack-justify: space-around; }
      :host([justify='evenly']) { --mui-stack-justify: space-evenly; }
      :host([wrap]) { --mui-stack-wrap: wrap; }
      :host([gap='none']) { --mui-stack-gap: 0; }
      :host([gap='xs']) { --mui-stack-gap: var(--mui-spacing-xs); }
      :host([gap='sm']) { --mui-stack-gap: var(--mui-spacing-sm); }
      :host([gap='md']) { --mui-stack-gap: var(--mui-spacing-md); }
      :host([gap='lg']) { --mui-stack-gap: var(--mui-spacing-lg); }
      :host([gap='xl']) { --mui-stack-gap: var(--mui-spacing-xl); }
    `;
  }

  template() {
    return html`<slot></slot>`;
  }
}

if (!customElements.get(MuiStack.tagName)) {
  customElements.define(MuiStack.tagName, MuiStack);
}
