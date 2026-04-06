// miura-ui: layout/grid.ts
// Mobile-first CSS grid primitive for MiuraJS
import { MiuraElement, html, css } from '@miurajs/miura-element';

export class MuiGrid extends MiuraElement {
  static tagName = 'mui-grid';

  static properties = {
    columns: { type: Number, default: 2 },
    minWidth: { type: String, default: '240px' },
    gap: { type: String, reflect: true, default: 'md' },
    columnGap: { type: String, default: null },
    rowGap: { type: String, default: null },
    autoFit: { type: Boolean, reflect: true, default: false },
  };

  columns!: number;
  minWidth!: string;
  gap!: string;
  columnGap!: string | null;
  rowGap!: string | null;
  autoFit!: boolean;

  static get styles() {
    return css`
      :host { 
        display: block; 
        width: 100%; 
        box-sizing: border-box; 
        --mui-grid-gap: var(--mui-spacing-md); 
      }
      :host([gap='none']) { --mui-grid-gap: 0; }
      :host([gap='xs']) { --mui-grid-gap: var(--mui-spacing-xs); }
      :host([gap='sm']) { --mui-grid-gap: var(--mui-spacing-sm); }
      :host([gap='md']) { --mui-grid-gap: var(--mui-spacing-md); }
      :host([gap='lg']) { --mui-grid-gap: var(--mui-spacing-lg); }
      :host([gap='xl']) { --mui-grid-gap: var(--mui-spacing-xl); }
      .grid { 
        display: grid; 
        width: 100%; 
        gap: var(--mui-grid-gap); 
      }
    `;
  }

  getGridTemplate() {
    return this.autoFit
      ? `repeat(auto-fit, minmax(${this.minWidth}, 1fr))`
      : `repeat(${this.columns}, minmax(0, 1fr))`;
  }

  template() {
    const styleMap = {
      'grid-template-columns': this.getGridTemplate(),
      ...(this.columnGap && { 'column-gap': `var(--mui-spacing-${this.columnGap})` }),
      ...(this.rowGap && { 'row-gap': `var(--mui-spacing-${this.rowGap})` })
    };
    
    const styleString = Object.entries(styleMap)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ');

    return html`
      <div class="grid" part="grid" style="${styleString}">
        <slot></slot>
      </div>
    `;
  }
}

if (!customElements.get(MuiGrid.tagName)) {
  customElements.define(MuiGrid.tagName, MuiGrid);
}
