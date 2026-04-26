import { MiuraElement, css, html } from '@miurajs/miura-element';
import { clampPaneSize } from '../primitives/index.js';

export class MuiSplitPane extends MiuraElement {
  static properties = {
    direction: { type: String, default: 'horizontal', reflect: true },
    size: { type: Number, default: 300 },
    min: { type: Number, default: 180 },
    max: { type: Number, default: 720 },
    persistKey: { type: String, default: '' },
  };

  declare direction: 'horizontal' | 'vertical';
  declare size: number;
  declare min: number;
  declare max: number;
  declare persistKey: string;

  private dragging = false;

  static styles = css`
    :host {
      display: grid;
      width: 100%;
      height: 100%;
      min-width: 0;
      min-height: 0;
      overflow: hidden;
      --_pane-size: 300px;
      grid-template-columns: var(--_pane-size) 1px minmax(0, 1fr);
      font-family: var(--mui-font-sans);
    }

    :host([direction="vertical"]) {
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: var(--_pane-size) 1px minmax(0, 1fr);
    }

    .pane {
      min-width: 0;
      min-height: 0;
      overflow: auto;
    }

    .divider {
      background: var(--mui-color-border);
      cursor: col-resize;
      position: relative;
      transition: background var(--mui-duration-fast);
    }

    :host([direction="vertical"]) .divider {
      cursor: row-resize;
    }

    .divider::after {
      content: "";
      position: absolute;
      inset: 0 -4px;
    }

    :host([direction="vertical"]) .divider::after {
      inset: -4px 0;
    }

    .divider:hover,
    .divider.dragging {
      background: var(--mui-color-accent);
    }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    if (this.persistKey) {
      const saved = localStorage.getItem(`mui.split-pane.${this.persistKey}`);
      if (saved) this.size = Number(saved);
    }
    this.applySize();
  }

  private applySize(): void {
    const size = clampPaneSize(Number(this.size), Number(this.min), Number(this.max));
    this.size = size;
    this.style.setProperty('--_pane-size', `${size}px`);
  }

  private onPointerDown(event: PointerEvent): void {
    event.preventDefault();
    this.dragging = true;
    (event.currentTarget as HTMLElement).classList.add('dragging');
    document.body.style.cursor = this.direction === 'vertical' ? 'row-resize' : 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
  }

  private onPointerMove = (event: PointerEvent): void => {
    if (!this.dragging) return;

    const rect = this.getBoundingClientRect();
    const rawSize = this.direction === 'vertical' ? event.clientY - rect.top : event.clientX - rect.left;
    this.size = clampPaneSize(rawSize, this.min, this.max);
    this.applySize();
    this.emit('resize', { size: this.size }, { bubbles: true, composed: true });
  };

  private onPointerUp = (): void => {
    this.dragging = false;
    this.shadowRoot.querySelector('.divider')?.classList.remove('dragging');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);

    if (this.persistKey) {
      localStorage.setItem(`mui.split-pane.${this.persistKey}`, String(this.size));
    }
  };

  template() {
    this.applySize();

    return html`
      <div class="pane" part="primary"><slot name="primary"></slot></div>
      <div class="divider" part="divider" role="separator" @pointerdown=${(event: PointerEvent) => this.onPointerDown(event)}></div>
      <div class="pane" part="secondary"><slot name="secondary"></slot></div>
    `;
  }
}

if (!customElements.get('mui-split-pane')) {
  customElements.define('mui-split-pane', MuiSplitPane);
}
