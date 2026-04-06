import { MiuraElement, html, css, component, property, state } from '@miurajs/miura-element';

/**
 * Hierarchical tree view component with drag-drop support
 * Usage:
 * <mui-tree-view>
 *   <mui-tree-item label="Root" icon="folder">
 *     <mui-tree-item label="Child 1" icon="file"></mui-tree-item>
 *     <mui-tree-item label="Child 2" icon="file"></mui-tree-item>
 *   </mui-tree-item>
 * </mui-tree-view>
 */
@component({ tag: 'mui-tree-view' })
export class MuiTreeView extends MiuraElement {
  @property({ type: Boolean, default: false})
  draggable!: boolean;

  @property({ type: String, default: 'single' })
  selection!: 'none' | 'single' | 'multiple';

  @state({ default: new Set() })
  private _selectedIds!: Set<string>;

  static get styles() {
    return css`
      :host {
        display: block;
        font-family: var(--mui-font-family);
        font-size: var(--mui-text-sm);
      }

      .tree {
        list-style: none;
        padding: 0;
        margin: 0;
      }
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('tree-item-select', this._handleItemSelect.bind(this) as EventListener);
  }

  private _handleItemSelect(e: CustomEvent) {
    const { id, multiSelect } = e.detail;
    
    if (this.selection === 'none') return;

    if (this.selection === 'single') {
      this._selectedIds.clear();
      this._selectedIds.add(id);
    } else if (multiSelect) {
      if (this._selectedIds.has(id)) {
        this._selectedIds.delete(id);
      } else {
        this._selectedIds.add(id);
      }
    } else {
      this._selectedIds.clear();
      this._selectedIds.add(id);
    }

    this.emit('selection-change', { selectedIds: Array.from(this._selectedIds) });
    this.requestUpdate();
  }

  template() {
    return html`
      <ul class="tree" role="tree">
        <slot></slot>
      </ul>
    `;
  }
}

/**
 * Tree item component
 */
@component({ tag: 'mui-tree-item' })
export class MuiTreeItem extends MiuraElement {
  @property({ type: String, default: '' })
  id!: string;

  @property({ type: String, default: '' })
  label!: string;

  @property({ type: String, default: '' })
  icon!: string;

  @property({ type: Boolean, default: false })
  expanded!: boolean;

  @property({ type: Boolean, default: false })
  selected!: boolean;

  @property({ type: Boolean, default: false })
  disabled!: boolean;

  @property({ type: Boolean, default: true })
  expandable!: boolean;

  @state({ default: false })
  private _isDragging!: boolean;

  @state({ default: false })
  private _isDragOver!: boolean;

  static get styles() {
    return css`
      :host {
        display: block;
      }

      .item {
        display: flex;
        align-items: center;
        gap: var(--mui-space-2);
        padding: var(--mui-space-2) var(--mui-space-3);
        margin: var(--mui-space-1) 0;
        border-radius: var(--mui-radius-md);
        cursor: pointer;
        user-select: none;
        transition: background var(--mui-duration-fast) var(--mui-easing-standard);
        position: relative;
      }

      .item:hover {
        background: var(--mui-surface-subtle);
      }

      :host([selected]) .item {
        background: color-mix(in srgb, var(--mui-primary) 15%, transparent);
        color: var(--mui-primary);
      }

      :host([disabled]) .item {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      .item[draggable="true"] {
        cursor: move;
      }

      .item.dragging {
        opacity: 0.5;
      }

      .item.drag-over {
        background: color-mix(in srgb, var(--mui-primary) 25%, transparent);
      }

      .expand-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        padding: 0;
        background: transparent;
        border: none;
        border-radius: var(--mui-radius-sm);
        color: var(--mui-text-secondary);
        cursor: pointer;
        flex-shrink: 0;
        transition: transform var(--mui-duration-fast) var(--mui-easing-standard),
                    background var(--mui-duration-fast) var(--mui-easing-standard);
      }

      .expand-button:hover {
        background: var(--mui-surface-subtle);
      }

      .expand-button svg {
        width: 14px;
        height: 14px;
        transition: transform var(--mui-duration-fast) var(--mui-easing-standard);
      }

      :host([expanded]) .expand-button svg {
        transform: rotate(90deg);
      }

      .expand-button.hidden {
        visibility: hidden;
      }

      .item-icon {
        width: 18px;
        height: 18px;
        flex-shrink: 0;
        color: var(--mui-text-secondary);
      }

      .item-label {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .item-actions {
        display: flex;
        align-items: center;
        gap: var(--mui-space-1);
        opacity: 0;
        transition: opacity var(--mui-duration-fast) var(--mui-easing-standard);
      }

      .item:hover .item-actions {
        opacity: 1;
      }

      .action-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        padding: 0;
        background: transparent;
        border: none;
        border-radius: var(--mui-radius-sm);
        color: var(--mui-text-secondary);
        cursor: pointer;
        transition: background var(--mui-duration-fast) var(--mui-easing-standard);
      }

      .action-button:hover {
        background: var(--mui-surface-subtle);
        color: var(--mui-text);
      }

      .action-button svg {
        width: 14px;
        height: 14px;
      }

      .children {
        padding-left: var(--mui-space-6);
        display: none;
      }

      :host([expanded]) .children {
        display: block;
      }
    `;
  }

  private get _hasChildren(): boolean {
    return this.children.length > 0;
  }

  private _handleExpandClick(e: Event) {
    e.stopPropagation();
    if (this.expandable && this._hasChildren) {
      this.expanded = !this.expanded;
      this.emit('toggle', { id: this.id, expanded: this.expanded });
    }
  }

  private _handleItemClick(e: Event) {
    if (this.disabled) return;
    
    const multiSelect = (e as MouseEvent).ctrlKey || (e as MouseEvent).metaKey;
    this.emit('tree-item-select', { id: this.id, multiSelect }, { bubbles: true, composed: true });
  }

  private _handleDragStart(e: DragEvent) {
    this._isDragging = true;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', this.id);
    }
    this.emit('drag-start', { id: this.id, element: this });
  }

  private _handleDragEnd() {
    this._isDragging = false;
    this.emit('drag-end', { id: this.id });
  }

  private _handleDragOver(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    this._isDragOver = true;
  }

  private _handleDragLeave() {
    this._isDragOver = false;
  }

  private _handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this._isDragOver = false;

    const draggedId = e.dataTransfer?.getData('text/plain');
    if (draggedId && draggedId !== this.id) {
      this.emit('drop', { draggedId, targetId: this.id }, { bubbles: true, composed: true });
    }
  }

  private _handleActionClick(e: Event) {
    e.stopPropagation();
    this.emit('action-click', { id: this.id });
  }

  template() {
    const chevronIcon = html`
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    `;

    const moreIcon = html`
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="1"/>
        <circle cx="19" cy="12" r="1"/>
        <circle cx="5" cy="12" r="1"/>
      </svg>
    `;

    const isDraggable = this.closest('mui-tree-view')?.getAttribute('draggable') === 'true';

    return html`
      <li role="treeitem" aria-expanded="${this.expanded}">
        <div 
          class="item ${this._isDragging ? 'dragging' : ''} ${this._isDragOver ? 'drag-over' : ''}"
          draggable="${isDraggable}"
          @click=${this._handleItemClick.bind(this)}
          @dragstart=${this._handleDragStart.bind(this)}
          @dragend=${this._handleDragEnd.bind(this)}
          @dragover=${this._handleDragOver.bind(this)}
          @dragleave=${this._handleDragLeave.bind(this)}
          @drop=${this._handleDrop.bind(this)}
        >
          <button 
            class="expand-button ${!this._hasChildren ? 'hidden' : ''}"
            @click=${this._handleExpandClick.bind(this)}
            aria-label="${this.expanded ? 'Collapse' : 'Expand'}"
          >
            ${chevronIcon}
          </button>

          <div class="item-icon" #if=${this.icon}>
            <slot name="icon">${this.icon}</slot>
          </div>

          <span class="item-label">${this.label}</span>

          <div class="item-actions">
            <slot name="actions">
              <button 
                class="action-button"
                @click=${this._handleActionClick.bind(this)}
                aria-label="More options"
              >
                ${moreIcon}
              </button>
            </slot>
          </div>
        </div>

        <div class="children" role="group">
          <slot></slot>
        </div>
      </li>
    `;
  }
}
