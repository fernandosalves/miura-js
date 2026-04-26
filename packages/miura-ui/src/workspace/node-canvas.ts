import { MiuraElement, css, html } from '@miurajs/miura-element';
import '../elements/icon.js';

export interface NodeCanvasNode {
  id: string;
  x: number;
  y: number;
  width?: number;
  title?: string;
  subtitle?: string;
  icon?: string;
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
}

export interface NodeCanvasConnector {
  id: string;
  from: string;
  to: string;
  label?: string;
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
}

export class MuiNodeCard extends MiuraElement {
  static properties = {
    nodeId: { type: String, default: '', attribute: 'node-id' },
    selected: { type: Boolean, default: false, reflect: true },
    tone: { type: String, default: 'neutral', reflect: true },
  };

  declare nodeId: string;
  declare selected: boolean;
  declare tone: string;

  static styles = css`
    :host {
      display: block;
      min-width: 180px;
      border: 1px solid var(--mui-color-border);
      border-left: 3px solid var(--mui-color-border-strong);
      border-radius: var(--mui-radius-lg);
      background: var(--mui-color-surface);
      color: var(--mui-color-text);
      box-shadow: var(--mui-shadow-md);
      font-family: var(--mui-font-sans);
      overflow: hidden;
    }

    :host([selected]) {
      border-color: var(--mui-color-accent);
      box-shadow: var(--mui-focus-ring), var(--mui-shadow-md);
    }

    :host([tone="accent"]) { border-left-color: var(--mui-color-accent); }
    :host([tone="success"]) { border-left-color: var(--mui-color-success); }
    :host([tone="warning"]) { border-left-color: var(--mui-color-warning); }
    :host([tone="danger"]) { border-left-color: var(--mui-color-danger); }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--mui-space-3);
      padding: var(--mui-space-4);
      border-bottom: 1px solid var(--mui-color-border);
      background: var(--mui-color-surface-raised);
    }

    .title {
      min-width: 0;
      display: flex;
      align-items: center;
      gap: var(--mui-space-2);
      font-weight: var(--mui-weight-semibold);
    }

    .title ::slotted(*) {
      min-width: 0;
    }

    .body,
    .footer {
      padding: var(--mui-space-4);
    }

    .footer {
      border-top: 1px solid var(--mui-color-border);
      color: var(--mui-color-text-muted);
      font-size: var(--mui-text-sm);
    }
  `;

  template() {
    return html`
      <article part="card">
        <header class="header" part="header">
          <span class="title"><slot name="icon"></slot><slot name="header"></slot></span>
          <slot name="actions"></slot>
        </header>
        <div class="body" part="body"><slot></slot></div>
        <slot name="footer"></slot>
      </article>
    `;
  }
}

export class MuiNodeCanvas extends MiuraElement {
  static properties = {
    nodes: { type: Array, default: () => [] },
    connectors: { type: Array, default: () => [] },
    selected: { type: String, default: '' },
    zoom: { type: Number, default: 1 },
    grid: { type: Boolean, default: true, reflect: true },
  };

  declare nodes: NodeCanvasNode[];
  declare connectors: NodeCanvasConnector[];
  declare selected: string;
  declare zoom: number;
  declare grid: boolean;

  private dragging?: { id: string; startX: number; startY: number; nodeX: number; nodeY: number };

  static styles = css`
    :host {
      display: block;
      min-width: 0;
      min-height: 360px;
      color: var(--mui-color-text);
      font-family: var(--mui-font-sans);
      --_zoom: 1;
    }

    .viewport {
      position: relative;
      min-height: inherit;
      height: 100%;
      overflow: auto;
      border: 1px solid var(--mui-color-border);
      border-radius: var(--mui-radius-lg);
      background-color: var(--mui-color-bg);
      box-shadow: var(--mui-shadow-sm);
    }

    :host([grid]) .viewport {
      background-image: radial-gradient(color-mix(in srgb, var(--mui-color-border-strong), transparent 70%) 1px, transparent 1px);
      background-size: 24px 24px;
    }

    .space {
      position: relative;
      width: 1200px;
      height: 720px;
      transform: scale(var(--_zoom));
      transform-origin: 0 0;
    }

    svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      overflow: visible;
      pointer-events: none;
    }

    path {
      fill: none;
      stroke: var(--mui-color-border-strong);
      stroke-width: 2;
    }

    path[data-tone="accent"] { stroke: var(--mui-color-accent); }
    path[data-tone="success"] { stroke: var(--mui-color-success); }
    path[data-tone="warning"] { stroke: var(--mui-color-warning); }
    path[data-tone="danger"] { stroke: var(--mui-color-danger); }

    .node {
      position: absolute;
      width: var(--_node-width, 220px);
      cursor: grab;
      touch-action: none;
    }

    .node.dragging {
      cursor: grabbing;
      z-index: 2;
    }
  `;

  private getNode(id: string): NodeCanvasNode | undefined {
    return (this.nodes ?? []).find((node) => node.id === id);
  }

  private center(node: NodeCanvasNode): { x: number; y: number } {
    return {
      x: node.x + (node.width ?? 220) / 2,
      y: node.y + 54,
    };
  }

  private connectorPath(connector: NodeCanvasConnector): string {
    const from = this.getNode(connector.from);
    const to = this.getNode(connector.to);
    if (!from || !to) return '';
    const a = this.center(from);
    const b = this.center(to);
    const dx = Math.max(64, Math.abs(b.x - a.x) * 0.45);
    return `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`;
  }

  private selectNode(node: NodeCanvasNode): void {
    this.selected = node.id;
    this.emit('node-select', { node }, { bubbles: true, composed: true });
  }

  private onPointerDown(node: NodeCanvasNode, event: PointerEvent): void {
    this.selectNode(node);
    this.dragging = { id: node.id, startX: event.clientX, startY: event.clientY, nodeX: node.x, nodeY: node.y };
    (event.currentTarget as HTMLElement).classList.add('dragging');
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  private onPointerMove(node: NodeCanvasNode, event: PointerEvent): void {
    if (!this.dragging || this.dragging.id !== node.id) return;
    const next = {
      ...node,
      x: Math.round(this.dragging.nodeX + (event.clientX - this.dragging.startX) / Number(this.zoom || 1)),
      y: Math.round(this.dragging.nodeY + (event.clientY - this.dragging.startY) / Number(this.zoom || 1)),
    };
    this.nodes = (this.nodes ?? []).map((item) => item.id === node.id ? next : item);
    this.emit('node-move', { node: next }, { bubbles: true, composed: true });
  }

  private onPointerUp(node: NodeCanvasNode, event: PointerEvent): void {
    if (!this.dragging || this.dragging.id !== node.id) return;
    (event.currentTarget as HTMLElement).classList.remove('dragging');
    this.dragging = undefined;
  }

  private renderNode(node: NodeCanvasNode) {
    const width = node.width ?? 220;
    return html`
      <div
        class="node"
        style=${`left: ${node.x}px; top: ${node.y}px; --_node-width: ${width}px;`}
        @pointerdown=${(event: PointerEvent) => this.onPointerDown(node, event)}
        @pointermove=${(event: PointerEvent) => this.onPointerMove(node, event)}
        @pointerup=${(event: PointerEvent) => this.onPointerUp(node, event)}
      >
        <slot name=${`node-${node.id}`}>
          <mui-node-card node-id=${node.id} tone=${node.tone ?? 'neutral'} .selected=${this.selected === node.id}>
            ${node.icon ? html`<mui-icon slot="icon" name=${node.icon}></mui-icon>` : ''}
            <span slot="header">${node.title ?? node.id}</span>
            ${node.subtitle ? html`<span>${node.subtitle}</span>` : ''}
          </mui-node-card>
        </slot>
      </div>
    `;
  }

  template() {
    this.style.setProperty('--_zoom', String(this.zoom || 1));
    return html`
      <div class="viewport" part="viewport">
        <div class="space" part="space">
          <svg part="connectors" aria-hidden="true">
            ${(this.connectors ?? []).map((connector) => html`
              <path data-tone=${connector.tone ?? 'neutral'} d=${this.connectorPath(connector)}></path>
            `)}
          </svg>
          ${(this.nodes ?? []).map((node) => this.renderNode(node))}
        </div>
      </div>
    `;
  }
}

if (!customElements.get('mui-node-card')) {
  customElements.define('mui-node-card', MuiNodeCard);
}

if (!customElements.get('mui-node-canvas')) {
  customElements.define('mui-node-canvas', MuiNodeCanvas);
}
