import { MiuraElement, css, html } from '@miurajs/miura-element';
import '@miurajs/miura-ui/elements';
import type { ArchitectureCardItem, ArchitectureCardSection, GraphData, NodeCanvasConnector, NodeCanvasNode } from '../types.js';

type Point = { x: number; y: number };
type AnchorSide = 'left' | 'right';
type DragState =
  | { kind: 'pan'; start: Point; origin: Point }
  | { kind: 'node'; id: string; start: Point; origin: Point };

export class MiuraArchitectSpatialGraph extends MiuraElement {
  static properties = {
    graphData: { type: Object, default: () => ({ nodes: [], connectors: [] }) },
    selectedNodeId: { type: String, default: '' },
  };

  declare graphData: GraphData;
  declare selectedNodeId: string;

  static state() {
    return {
      zoom: { type: Number, default: 0.85 },
      panX: { type: Number, default: 0 },
      panY: { type: Number, default: 0 },
      movedNodes: { type: Object, default: () => ({}) },
      collapsedSections: { type: Object, default: () => ({}) },
      anchorPoints: { type: Object, default: () => ({}) },
    };
  }

  declare zoom: number;
  declare panX: number;
  declare panY: number;
  declare movedNodes: Record<string, Point>;
  declare collapsedSections: Record<string, boolean>;
  declare anchorPoints: Record<string, Point>;

  private dragState: DragState | null = null;
  private anchorRefreshHandle = 0;

  static styles = css`
    :host {
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      height: 100%;
      min-height: 0;
      background: #161719;
      color: #e6e8eb;
      --card-bg: #25272a;
      --card-border: #3a3d42;
      --card-section: #202225;
      --tone-app: #6bb7ff;
      --tone-component: #9ca3af;
      --tone-store: #a78bfa;
      --tone-context: #f59e0b;
      --tone-signal: #65c466;
      --tone-api: #22d3ee;
      --tone-external: #fb7185;
    }

    .toolbar {
      display: flex;
      align-items: center;
      gap: var(--mui-space-2);
      min-height: 40px;
      padding: 0 var(--mui-space-3);
      background: #222326;
      border-bottom: 1px solid #33363b;
      color: #a7adb7;
      font-size: var(--mui-text-sm);
    }

    .toolbar .title {
      font-weight: var(--mui-weight-semibold);
    }

    .spacer {
      flex: 1;
    }

    .viewport {
      position: relative;
      min-height: 420px;
      overflow: hidden;
      cursor: grab;
      background:
        radial-gradient(color-mix(in srgb, #47505a, transparent 74%) 1px, transparent 1px),
        #17181a;
      background-size: 24px 24px;
      border: 1px solid #33363b;
      border-radius: var(--mui-radius-md);
    }

    .viewport.dragging {
      cursor: grabbing;
    }

    .world {
      position: absolute;
      inset: 0;
      transform-origin: 0 0;
      will-change: transform;
    }

    svg {
      position: absolute;
      inset: 0;
      width: 5000px;
      height: 3200px;
      overflow: visible;
      pointer-events: none;
    }

    path {
      fill: none;
      stroke: #5a5f67;
      stroke-width: 2;
      opacity: 0.72;
    }

    path[data-tone="accent"] { stroke: #4ea1ff; }
    path[data-tone="success"] { stroke: #65c466; }
    path[data-tone="warning"] { stroke: #f59e0b; }
    path[data-tone="danger"] { stroke: #fb7185; }
    path[data-tone="store"] { stroke: var(--tone-store); }
    path[data-tone="context"] { stroke: var(--tone-context); }
    path[data-tone="signal"] { stroke: var(--tone-signal); }
    path[data-tone="api"] { stroke: var(--tone-api); }
    path[data-style="dashed"] { stroke-dasharray: 8 8; }
    path[data-style="dotted"] { stroke-dasharray: 2 8; stroke-linecap: round; }
    path[data-active="true"] {
      stroke-width: 3;
      opacity: 1;
      filter: drop-shadow(0 0 5px rgba(167, 139, 250, 0.4));
    }

    .node {
      position: absolute;
      width: var(--node-width);
      border: 1px solid var(--card-border);
      border-top: 3px solid var(--tone-component);
      border-radius: 8px;
      background: var(--card-bg);
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.32);
      overflow: hidden;
      cursor: grab;
      user-select: none;
    }

    .node.selected {
      border-color: #79b7ff;
      box-shadow: 0 0 0 2px rgba(79, 161, 255, 0.35), 0 10px 28px rgba(0, 0, 0, 0.42);
    }

    .node[data-tone="app"] { border-top-color: var(--tone-app); background: #202b34; }
    .node[data-tone="component"] { border-top-color: var(--tone-component); }
    .node[data-tone="store"] { border-top-color: var(--tone-store); background: #292538; }
    .node[data-tone="context"] { border-top-color: var(--tone-context); background: #332817; }
    .node[data-tone="signal"] { border-top-color: var(--tone-signal); background: #203020; }
    .node[data-tone="api"] { border-top-color: var(--tone-api); background: #173037; }
    .node[data-tone="external"] { border-top-color: var(--tone-external); background: #361f27; }

    .node-header {
      display: flex;
      align-items: center;
      gap: var(--mui-space-2);
      padding: var(--mui-space-3);
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      background: rgba(255, 255, 255, 0.04);
      font-weight: var(--mui-weight-semibold);
      min-width: 0;
    }

    .node-title {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .node-subtitle {
      margin-left: auto;
      color: #a7adb7;
      font-size: var(--mui-text-xs);
      font-weight: var(--mui-weight-medium);
      white-space: nowrap;
    }

    .section {
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      background: rgba(255, 255, 255, 0.015);
    }

    .section:first-of-type {
      border-top: 0;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: var(--mui-space-2);
      width: 100%;
      border: 0;
      padding: var(--mui-space-2) var(--mui-space-3);
      background: transparent;
      color: #c8ccd2;
      font-size: var(--mui-text-sm);
      font-weight: var(--mui-weight-medium);
      font-family: inherit;
      text-align: left;
      cursor: pointer;
    }

    .section-title:hover {
      background: rgba(255, 255, 255, 0.035);
    }

    .section-count {
      margin-left: auto;
      color: #808895;
      font-size: var(--mui-text-xs);
    }

    .section-empty,
    .section-item {
      display: flex;
      justify-content: space-between;
      gap: var(--mui-space-2);
      position: relative;
      padding: 0 var(--mui-space-3) var(--mui-space-2) calc(var(--mui-space-3) + 22px);
      color: #aeb4bd;
      font-size: var(--mui-text-xs);
    }

    .section-item[data-hot="true"] {
      color: #e8eef6;
    }

    .item-anchor {
      position: absolute;
      top: 50%;
      width: 7px;
      height: 7px;
      border: 1px solid rgba(139, 190, 255, 0.72);
      border-radius: 999px;
      background: #1b2733;
      transform: translateY(-50%);
      opacity: 0;
      pointer-events: none;
    }

    .section-item:hover .item-anchor,
    .section-item[data-hot="true"] .item-anchor {
      opacity: 1;
    }

    .item-anchor-left {
      left: 7px;
    }

    .item-anchor-right {
      right: 7px;
    }

    .section-empty {
      color: #717984;
      font-style: italic;
    }

    .item-name,
    .item-value {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .item-value {
      color: #8f98a5;
      text-align: right;
      max-width: 45%;
    }

    .item-activity {
      color: #79b7ff;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
  `;

  protected updated(): void {
    this.queueAnchorRefresh();
  }

  disconnectedCallback(): void {
    if (this.anchorRefreshHandle) window.cancelAnimationFrame(this.anchorRefreshHandle);
    super.disconnectedCallback();
  }

  private nodes(): NodeCanvasNode[] {
    const moved = this.movedNodes ?? {};
    return (this.graphData?.nodes ?? []).map((node) => {
      const override = moved[node.id];
      return override ? { ...node, x: override.x, y: override.y } : node;
    });
  }

  private nodeById(id: string): NodeCanvasNode | undefined {
    return this.nodes().find((node) => node.id === id);
  }

  private center(node: NodeCanvasNode): Point {
    return {
      x: Number(node.x ?? 0) + Number(node.width ?? 280) / 2,
      y: Number(node.y ?? 0) + 72,
    };
  }

  private sidePoint(node: NodeCanvasNode, side: AnchorSide): Point {
    const width = Number(node.width ?? 280);
    const x = Number(node.x ?? 0) + (side === 'right' ? width : 0);
    return { x, y: Number(node.y ?? 0) + 72 };
  }

  private anchorKey(nodeId: string, itemId: string, side: AnchorSide): string {
    return `${nodeId}::${itemId}::${side}`;
  }

  private connectorPoint(node: NodeCanvasNode, itemId: string | undefined, side: AnchorSide): Point {
    if (itemId) {
      const anchored = this.anchorPoints?.[this.anchorKey(node.id, itemId, side)];
      if (anchored) return anchored;
    }
    return this.sidePoint(node, side);
  }

  private connectorPath(connector: NodeCanvasConnector): string {
    const from = this.nodeById(connector.from);
    const to = this.nodeById(connector.to);
    if (!from || !to) return '';
    const fromCenter = this.center(from);
    const toCenter = this.center(to);
    const forward = toCenter.x >= fromCenter.x;
    const start = this.connectorPoint(from, connector.fromItemId, forward ? 'right' : 'left');
    const end = this.connectorPoint(to, connector.toItemId, forward ? 'left' : 'right');
    const dx = Math.max(72, Math.abs(end.x - start.x) * 0.42);
    const direction = forward ? 1 : -1;
    return `M ${start.x} ${start.y} C ${start.x + dx * direction} ${start.y}, ${end.x - dx * direction} ${end.y}, ${end.x} ${end.y}`;
  }

  private setZoom(value: number): void {
    this.zoom = Math.max(0.25, Math.min(1.8, value));
  }

  private fitToView(): void {
    const nodes = this.nodes();
    if (!nodes.length) return;
    const minX = Math.min(...nodes.map((node) => Number(node.x ?? 0)));
    const minY = Math.min(...nodes.map((node) => Number(node.y ?? 0)));
    this.panX = 80 - minX * this.zoom;
    this.panY = 80 - minY * this.zoom;
  }

  private centerSelected(): void {
    const node = this.selectedNodeId ? this.nodeById(this.selectedNodeId) : undefined;
    if (!node) return;
    const bounds = this.getBoundingClientRect();
    this.panX = bounds.width / 2 - (Number(node.x ?? 0) + Number(node.width ?? 280) / 2) * this.zoom;
    this.panY = bounds.height / 2 - (Number(node.y ?? 0) + 80) * this.zoom;
  }

  private onWheel(event: WheelEvent): void {
    if (!event.ctrlKey && Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
    event.preventDefault();
    this.setZoom(this.zoom - event.deltaY * 0.001);
  }

  private startPan(event: PointerEvent): void {
    if (event.button !== 0) return;
    this.dragState = {
      kind: 'pan',
      start: { x: event.clientX, y: event.clientY },
      origin: { x: this.panX, y: this.panY },
    };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  private startNodeDrag(node: NodeCanvasNode, event: PointerEvent): void {
    if (event.button !== 0) return;
    event.stopPropagation();
    this.selectedNodeId = node.id;
    this.emit('select', { id: node.id }, { bubbles: true, composed: true });
    this.dragState = {
      kind: 'node',
      id: node.id,
      start: { x: event.clientX, y: event.clientY },
      origin: { x: Number(node.x ?? 0), y: Number(node.y ?? 0) },
    };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  private onPointerMove(event: PointerEvent): void {
    if (!this.dragState) return;
    const dx = event.clientX - this.dragState.start.x;
    const dy = event.clientY - this.dragState.start.y;
    if (this.dragState.kind === 'pan') {
      this.panX = this.dragState.origin.x + dx;
      this.panY = this.dragState.origin.y + dy;
      return;
    }
    this.movedNodes = {
      ...(this.movedNodes ?? {}),
      [this.dragState.id]: {
        x: Math.round(this.dragState.origin.x + dx / this.zoom),
        y: Math.round(this.dragState.origin.y + dy / this.zoom),
      },
    };
  }

  private endDrag(): void {
    this.dragState = null;
  }

  private isSectionCollapsed(nodeId: string, section: ArchitectureCardSection): boolean {
    const key = `${nodeId}:${section.id}`;
    return this.collapsedSections?.[key] ?? Boolean(section.collapsed);
  }

  private toggleSection(nodeId: string, section: ArchitectureCardSection, event: PointerEvent): void {
    event.stopPropagation();
    const key = `${nodeId}:${section.id}`;
    this.collapsedSections = {
      ...(this.collapsedSections ?? {}),
      [key]: !this.isSectionCollapsed(nodeId, section),
    };
  }

  private itemActivityCount(item: ArchitectureCardItem): number {
    const activity = item.activity;
    return (activity?.reads ?? 0) + (activity?.writes ?? 0) + (activity?.updates ?? 0);
  }

  private isRecentlyActive(timestamp?: number): boolean {
    return Boolean(timestamp && Date.now() - timestamp < 2200);
  }

  private queueAnchorRefresh(): void {
    if (this.anchorRefreshHandle) window.cancelAnimationFrame(this.anchorRefreshHandle);
    this.anchorRefreshHandle = window.requestAnimationFrame(() => {
      this.anchorRefreshHandle = 0;
      this.refreshAnchorPoints();
    });
  }

  private refreshAnchorPoints(): void {
    const world = this.shadowRoot?.querySelector<HTMLElement>('.world');
    if (!world) return;
    const worldRect = world.getBoundingClientRect();
    const next: Record<string, Point> = {};
    for (const anchor of this.shadowRoot?.querySelectorAll<HTMLElement>('[data-anchor-key]') ?? []) {
      const key = anchor.dataset.anchorKey;
      if (!key) continue;
      const rect = anchor.getBoundingClientRect();
      next[key] = {
        x: (rect.left + rect.width / 2 - worldRect.left) / this.zoom,
        y: (rect.top + rect.height / 2 - worldRect.top) / this.zoom,
      };
    }
    if (JSON.stringify(next) !== JSON.stringify(this.anchorPoints ?? {})) {
      this.anchorPoints = next;
    }
  }

  private renderSection(nodeId: string, section: ArchitectureCardSection) {
    const visibleItems = section.items ?? [];
    const collapsed = this.isSectionCollapsed(nodeId, section);
    return html`
      <div class="section">
        <button class="section-title" type="button" @pointerdown=${(event: PointerEvent) => this.toggleSection(nodeId, section, event)}>
          <mui-icon name=${collapsed ? 'chevron-right' : 'chevron-down'}></mui-icon>
          <span>${section.title}</span>
          ${visibleItems.length ? html`<span class="section-count">${visibleItems.length}</span>` : ''}
        </button>
        ${collapsed
          ? ''
          : visibleItems.length
          ? visibleItems.map((item) => {
            const anchorId = item.id ?? `${section.id}:${item.name}`;
            const activityCount = this.itemActivityCount(item);
            const hot = this.isRecentlyActive(item.activity?.lastActiveTime);
            return html`
              <div class="section-item" data-hot=${hot ? 'true' : 'false'}>
                <span class="item-anchor item-anchor-left" data-anchor-key=${this.anchorKey(nodeId, anchorId, 'left')}></span>
                <span class="item-name">${item.name}</span>
                ${activityCount ? html`<span class="item-activity">x${activityCount}</span>` : ''}
                ${item.valuePreview ? html`<span class="item-value">${item.valuePreview}</span>` : ''}
                <span class="item-anchor item-anchor-right" data-anchor-key=${this.anchorKey(nodeId, anchorId, 'right')}></span>
              </div>
            `;
          })
          : html`<div class="section-empty">${section.emptyLabel ?? 'empty'}</div>`}
      </div>
    `;
  }

  private renderNode(node: NodeCanvasNode) {
    return html`
      <article
        class="node ${this.selectedNodeId === node.id ? 'selected' : ''}"
        data-tone=${node.tone ?? 'component'}
        style=${`left: ${node.x}px; top: ${node.y}px; --node-width: ${node.width ?? 280}px;`}
        @pointerdown=${(event: PointerEvent) => this.startNodeDrag(node, event)}
      >
        <header class="node-header">
          ${node.icon ? html`<mui-icon name=${node.icon}></mui-icon>` : ''}
          <span class="node-title">${node.title}</span>
          ${node.subtitle ? html`<span class="node-subtitle">${node.subtitle}</span>` : ''}
        </header>
        ${(node.sections ?? []).map((section) => this.renderSection(node.id, section))}
      </article>
    `;
  }

  template() {
    const nodes = this.nodes();
    return html`
      <div class="toolbar">
        <span class="title">Architecture View</span>
        <div class="spacer"></div>
        <mui-button variant="ghost" size="sm" @click=${() => this.fitToView()}>
          <mui-icon name="maximize"></mui-icon>
        </mui-button>
        <mui-button variant="ghost" size="sm" @click=${() => this.centerSelected()}>
          <mui-icon name="locate-fixed"></mui-icon>
        </mui-button>
        <mui-button variant="ghost" size="sm" @click=${() => this.setZoom(this.zoom - 0.1)}>
          <mui-icon name="minus"></mui-icon>
        </mui-button>
        <span>${Math.round(this.zoom * 100)}%</span>
        <mui-button variant="ghost" size="sm" @click=${() => this.setZoom(this.zoom + 0.1)}>
          <mui-icon name="plus"></mui-icon>
        </mui-button>
      </div>
      <div
        class="viewport ${this.dragState?.kind === 'pan' ? 'dragging' : ''}"
        @wheel=${(event: WheelEvent) => this.onWheel(event)}
        @pointerdown=${(event: PointerEvent) => this.startPan(event)}
        @pointermove=${(event: PointerEvent) => this.onPointerMove(event)}
        @pointerup=${() => this.endDrag()}
        @pointercancel=${() => this.endDrag()}
      >
        <div class="world" style=${`transform: translate(${this.panX}px, ${this.panY}px) scale(${this.zoom});`}>
          <svg aria-hidden="true">
            ${(this.graphData?.connectors ?? []).map((connector) => html`
              <path
                data-tone=${connector.tone ?? 'neutral'}
                data-style=${connector.style ?? 'solid'}
                data-active=${this.isRecentlyActive(connector.activity?.lastActiveTime) ? 'true' : 'false'}
                d=${this.connectorPath(connector)}
              ></path>
            `)}
          </svg>
          ${nodes.map((node) => this.renderNode(node))}
        </div>
      </div>
    `;
  }
}

if (!customElements.get('miura-architect-spatial-graph')) {
  customElements.define('miura-architect-spatial-graph', MiuraArchitectSpatialGraph);
}
