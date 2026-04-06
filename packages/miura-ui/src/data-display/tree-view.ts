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

  private _selectedIds: Set<string> = new Set();

  static get styles() {
    return css`
      :host {
        display: block;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: var(--mui-text-sm);
        line-height: 1.5;
      }

      .tree {
        list-style: none;
        padding: var(--mui-space-1);
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: var(--mui-space-1);
      }
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('tree-item-select', this._handleItemSelect.bind(this) as EventListener);
    // Add slotchange listener to sync selection with initially rendered items
    this.addEventListener('slotchange', this._syncSelection.bind(this));
  }

  private _syncSelection() {
    if (this.selection === 'none') {
      const items = this.querySelectorAll('mui-tree-item');
      items.forEach((item: any) => item.selected = false);
      return;
    }

    const items = this.querySelectorAll('mui-tree-item');
    items.forEach((item: any) => {
      // Also pick up initially selected items into our Set
      if (item.selected) {
        if (this.selection === 'single') {
          this._selectedIds.clear();
        }
        this._selectedIds.add(item.id || item.label); // Default to label if id is missing in stories
      }
      
      const itemId = item.id || item.label;
      item.selected = this._selectedIds.has(itemId);
    });
  }

  private _handleItemSelect(e: CustomEvent) {
    const { id, multiSelect, element } = e.detail;
    
    // Fallback to reading label from element if id is missing
    const itemId = id || element?.label || '';
    
    if (this.selection === 'none') return;

    if (this.selection === 'single') {
      this._selectedIds.clear();
      this._selectedIds.add(itemId);
    } else if (multiSelect) {
      if (this._selectedIds.has(itemId)) {
        this._selectedIds.delete(itemId);
      } else {
        this._selectedIds.add(itemId);
      }
    } else {
      this._selectedIds.clear();
      this._selectedIds.add(itemId);
    }

    this._syncSelection();
    this.emit('selection-change', { selectedIds: Array.from(this._selectedIds) });
    this.requestUpdate();
  }

  template() {
    return html`
      <ul class="tree" role="tree">
        <slot @slotchange=${this._syncSelection.bind(this)}></slot>
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

  @property({ type: Boolean, default: false, reflect: true })
  expanded!: boolean;

  @property({ type: Boolean, default: false, reflect: true })
  selected!: boolean;

  @property({ type: Boolean, default: false, reflect: true })
  disabled!: boolean;

  @property({ type: Boolean, default: true })
  expandable!: boolean;

  private _isDragging: boolean = false;
  private _isDragOver: boolean = false;

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
        min-height: 36px;
        border-radius: var(--mui-radius-md);
        cursor: pointer;
        user-select: none;
        transition: background var(--mui-duration-fast) var(--mui-easing-standard),
                    color var(--mui-duration-fast) var(--mui-easing-standard),
                    transform var(--mui-duration-fast) var(--mui-easing-standard);
        position: relative;
      }

      .item:hover {
        background: var(--mui-surface-hover);
      }

      .item:active {
        transform: scale(0.98);
      }

      .item:focus-visible {
        outline: 2px solid var(--mui-primary);
        outline-offset: 2px;
      }

      :host([selected]) .item {
        background: color-mix(in srgb, var(--mui-primary) 12%, transparent);
        color: var(--mui-primary);
        font-weight: var(--mui-weight-medium);
      }

      :host([selected]) .item:hover {
        background: color-mix(in srgb, var(--mui-primary) 18%, transparent);
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
        width: 24px;
        height: 24px;
        padding: 0;
        background: transparent;
        border: none;
        border-radius: var(--mui-radius-sm);
        color: var(--mui-text-secondary);
        cursor: pointer;
        flex-shrink: 0;
        transition: transform var(--mui-duration-fast) var(--mui-easing-standard),
                    background var(--mui-duration-fast) var(--mui-easing-standard),
                    color var(--mui-duration-fast) var(--mui-easing-standard);
      }

      .expand-button:hover {
        background: var(--mui-surface-hover);
        color: var(--mui-text);
      }

      .expand-button:focus-visible {
        outline: 2px solid var(--mui-primary);
        outline-offset: 1px;
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
        margin-right: var(--mui-space-1, 4px);
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
        padding-left: calc(var(--mui-space-6) + var(--mui-space-2));
        display: none;
        margin-top: var(--mui-space-1);
      }

      :host([expanded]) .children {
        display: flex;
        flex-direction: column;
        gap: var(--mui-space-1);
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
    this.emit('tree-item-select', { id: this.id, multiSelect, element: this }, { bubbles: true, composed: true });
  }

  private _handleDragStart(e: DragEvent) {
    this._isDragging = true;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', this.id);
    }
    this.emit('drag-start', { id: this.id, element: this });
    this.requestUpdate();
  }

  private _handleDragEnd() {
    this._isDragging = false;
    this.emit('drag-end', { id: this.id });
    this.requestUpdate();
  }

  private _handleDragOver(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    this._isDragOver = true;
    this.requestUpdate();
  }

  private _handleDragLeave() {
    this._isDragOver = false;
    this.requestUpdate();
  }

  private _handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this._isDragOver = false;

    const draggedId = e.dataTransfer?.getData('text/plain');
    if (draggedId && draggedId !== this.id) {
      this.emit('drop', { draggedId, targetId: this.id }, { bubbles: true, composed: true });
    }
    this.requestUpdate();
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
            <slot name="icon"><mui-icon name="${this.icon}"></mui-icon></slot>
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
