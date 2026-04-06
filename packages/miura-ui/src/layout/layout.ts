/**
 * MUI Layout System
 * 
 * A flexible multi-panel layout system with:
 * - Icon rail (fixed primary navigation)
 * - Collapsible/resizable navigation panel
 * - Main content area
 * - Optional side panels that can dock left/right
 * 
 * @example
 * ```html
 * <mui-layout>
 *   <mui-layout-rail slot="rail">
 *     <mui-rail-item icon="home" active></mui-rail-item>
 *   </mui-layout-rail>
 *   
 *   <mui-layout-panel slot="nav" collapsible resizable>
 *     Navigation content
 *   </mui-layout-panel>
 *   
 *   <mui-layout-main>
 *     Main content
 *   </mui-layout-main>
 *   
 *   <mui-layout-panel slot="end" collapsible>
 *     Properties panel
 *   </mui-layout-panel>
 * </mui-layout>
 * ```
 */

import { MiuraElement, html, css, component, property, state } from '@miurajs/miura-element';

/**
 * Main Layout Container
 * Orchestrates rail, panels, and main content in a flexbox row.
 */
@component({ tag: 'mui-layout' })
export default class MuiLayout extends MiuraElement {
  /**
   * Full viewport height
   */
  @property({ type: Boolean, attribute: 'full-height' })
  fullHeight = true;

  static styles = css`
    :host {
      display: flex;
      flex-direction: row;
      width: 100%;
      background: var(--mui-background, #fafafa);
    }

    :host([full-height]) {
      height: 100vh;
      height: 100dvh;
    }

    .layout {
      display: flex;
      flex-direction: row;
      flex: 1;
      min-width: 0;
      overflow: hidden;
    }

    /* Rail slot */
    ::slotted([slot="rail"]) {
      flex-shrink: 0;
    }

    /* Nav slot (start panel) */
    ::slotted([slot="nav"]) {
      flex-shrink: 0;
    }

    /* End slot (end panel) */
    ::slotted([slot="end"]) {
      flex-shrink: 0;
    }

    /* Main content fills remaining space */
    .main-wrapper {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
  `;

  template() {
    return html`
      <div class="layout">
        <slot name="rail"></slot>
        <slot name="nav"></slot>
        <div class="main-wrapper">
          <slot></slot>
        </div>
        <slot name="end"></slot>
      </div>
    `;
  }
}

/**
 * Layout Rail (Icon Navigation)
 * Fixed-width vertical icon navigation bar.
 */
@component({ tag: 'mui-layout-rail' })
export class MuiLayoutRail extends MiuraElement {
  /**
   * Rail width in pixels
   */
  @property({ type: Number })
  width = 56;

  /**
   * Show app logo slot
   */
  @property({ type: Boolean })
  logo = true;

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      background: var(--mui-surface, white);
      border-right: 1px solid var(--mui-border, #e5e7eb);
      flex-shrink: 0;
    }

    .rail {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--mui-space-3, 12px) var(--mui-space-2, 8px);
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .logo {
      margin-bottom: var(--mui-space-4, 16px);
      flex-shrink: 0;
    }

    .nav-items {
      display: flex;
      flex-direction: column;
      gap: var(--mui-space-1, 4px);
      flex: 1;
    }

    .bottom-items {
      display: flex;
      flex-direction: column;
      gap: var(--mui-space-1, 4px);
      margin-top: auto;
      padding-top: var(--mui-space-4, 16px);
    }
  `;

  template() {
    const style = `width: ${this.width}px;`;

    return html`
      <nav class="rail" style="${style}" aria-label="Main navigation">
        ${this.logo ? html`
          <div class="logo">
            <slot name="logo"></slot>
          </div>
        ` : ''}
        <div class="nav-items">
          <slot></slot>
        </div>
        <div class="bottom-items">
          <slot name="bottom"></slot>
        </div>
      </nav>
    `;
  }
}


import { MuiPanel } from './panel.js';

/**
 * Layout Panel
 * An extension of the standalone MuiPanel, specialized for use with the layout system slots (nav/end).
 */
@component({ tag: 'mui-layout-panel' })
export class MuiLayoutPanel extends MuiPanel {
  @property({ type: String })
  override title = '';

  @property({ type: Number, attribute: 'min-width' })
  minWidth = 200;

  @property({ type: Number, attribute: 'max-width' })
  maxWidth = 400;

  @property({ type: Number, attribute: 'default-width' })
  defaultWidth = 280;

  @property({ type: String })
  border: 'none' | 'start' | 'end' = 'end';

  constructor() {
    super();
    this.collapsible = true;
    this.placement = 'left';
    this.open = true;
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (this.defaultWidth) {
      this.customSize = `${this.defaultWidth}px`;
      this.size = 'custom';
      this.style.setProperty('--custom-size', this.customSize);
    }
    
    if (this.slot === 'end') {
      this.placement = 'right';
    }
  }

  static override get styles() {
    return [
      super.styles,
      css`
        :host {
          height: 100%;
        }
        .panel.border-start {
          border-left: 1px solid var(--mui-border, #e5e7eb);
        }
        .panel.border-end {
          border-right: 1px solid var(--mui-border, #e5e7eb);
        }
      `
    ];
  }

  template() {
    const original = super.template();
    // Re-bind the border class to the internal panel
    if (original && original.values) {
      const panelClassIndex = original.strings.findIndex(s => s.includes('class="panel"'));
      if (panelClassIndex !== -1) {
         // We can't easily modify the strings of a TemplateResult, 
         // so we rely on the host border being passed down via CSS instead.
      }
    }
    return original;
  }
}

/**
 * Main Content Area
 */
@component({ tag: 'mui-layout-main' })
export class MuiLayoutMain extends MiuraElement {
  @property({ type: String })
  padding: 'none' | 'sm' | 'md' | 'lg' = 'none';

  @property({ type: String })
  bg: 'transparent' | 'surface' | 'subtle' = 'surface';

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
      overflow: hidden;
    }
    .main {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      overflow: auto;
    }
    .main.bg-transparent { background: transparent; }
    .main.bg-surface { background: var(--mui-surface, white); }
    .main.bg-subtle { background: var(--mui-surface-subtle, #f9fafb); }
    .main.padding-none { padding: 0; }
    .main.padding-sm { padding: var(--mui-space-3, 12px); }
    .main.padding-md { padding: var(--mui-space-4, 16px); }
    .main.padding-lg { padding: var(--mui-space-6, 24px); }
    ::slotted([slot="header"]) { flex-shrink: 0; }
  `;

  template() {
    const classes = ['main', `bg-${this.bg}`, `padding-${this.padding}`].join(' ');
    return html`
      <slot name="header"></slot>
      <div class="${classes}">
        <slot></slot>
      </div>
    `;
  }
}