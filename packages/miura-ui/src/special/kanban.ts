import { MiuraElement, html, css, component, property } from '@miurajs/miura-element';

/**
 * Kanban Board — column-based item tracking
 * 
 * <mui-kanban .columns=${cols} .items=${items}></mui-kanban>
 */
@component({ tag: 'mui-kanban' })
export class MuiKanban extends MiuraElement {
    @property({ type: Array, default: [] })
    columns: any[] = [];

    @property({ type: Array, default: [] })
    items: any[] = [];

    static styles: any = css`
    :host { display: block; height: 100%; overflow-x: auto; background: var(--mui-surface-subtle, #f9fafb); border-radius: 12px; }
    .board { display: flex; gap: 16px; padding: 16px; height: 100%; min-height: 400px; align-items: flex-start; }
    .column { 
      background: #f3f4f6; 
      border-radius: 10px; 
      width: 300px; 
      flex-shrink: 0; 
      display: flex; 
      flex-direction: column; 
      max-height: 100%;
      border: 1px solid #e5e7eb;
      transition: background 200ms, border-color 200ms;
    }
    .column.drag-over { background: var(--mui-primary-subtle, rgba(59,130,246,0.08)); border-color: var(--mui-primary, #3b82f6); border-style: dashed; }
    .header { padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; font-weight: 600; font-size: 14px; }
    .items { flex: 1; overflow-y: auto; padding: 8px; display: flex; flex-direction: column; gap: 8px; min-height: 100px; }
    .card { background: #fff; padding: 12px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; cursor: grab; transition: transform 200ms, box-shadow 200ms; user-select: none; }
    .card:active { cursor: grabbing; }
    .card:hover { transform: translateY(-2px); box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .counter { font-size: 11px; background: #ddd; padding: 2px 6px; border-radius: 10px; color: #666; }
    .column-add { 
      background: none; 
      border: 2px dashed #d1d5db; 
      border-radius: 10px; 
      width: 200px; 
      height: 100px; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      color: #9ca3af; 
      cursor: pointer; 
      font-size: 13px; 
      gap: 8px;
    }
    .column-add:hover { border-color: #9ca3af; color: #6b7280; background: #f3f4f6; }
  `;

    private _handleDragStart(e: DragEvent, item: any) {
        if (e.dataTransfer) {
            e.dataTransfer.setData('application/json', JSON.stringify(item));
            e.dataTransfer.effectAllowed = 'move';
        }
    }

    private _handleDragOver(e: DragEvent) {
        e.preventDefault();
        const col = e.currentTarget as HTMLElement;
        col.classList.add('drag-over');
    }

    private _handleDragLeave(e: DragEvent) {
        const col = e.currentTarget as HTMLElement;
        if (col.contains(e.relatedTarget as Node)) return;
        col.classList.remove('drag-over');
    }

    private _handleDrop(e: DragEvent, columnId: string) {
        e.preventDefault();
        const col = e.currentTarget as HTMLElement;
        col.classList.remove('drag-over');

        try {
            const item = JSON.parse(e.dataTransfer?.getData('application/json') || '{}');
            if ((item.id || item.title) && item.status !== columnId) {
                this.emit('item-moved', { item, from: item.status, to: columnId });
            }
        } catch (err) { }
    }

    template() {
        const columns = this.columns ?? [];
        const items = this.items ?? [];

        return html`
      <div class="board">
        ${columns.map(col => {
            const colItems = items.filter(item => item.status === col.id);
            return html`
            <div 
              class="column" 
              @dragover=${(e: DragEvent) => this._handleDragOver(e)}
              @dragleave=${(e: DragEvent) => this._handleDragLeave(e)}
              @drop=${(e: DragEvent) => this._handleDrop(e, col.id)}
            >
              <div class="header">
                <span>${col.label}</span>
                <span class="counter">${colItems.length}</span>
              </div>
              <div class="items">
                ${colItems.map(item => html`
                  <div 
                    class="card" 
                    draggable="true"
                    @dragstart=${(e: DragEvent) => this._handleDragStart(e, item)}
                  >
                    <div style="font-weight: 500; font-size: 13px; margin-bottom: 4px;">${item.title}</div>
                    <div style="font-size: 11px; color: #6b7280; margin-bottom: 8px;">${item.description || 'No description'}</div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                      <mui-avatar size="xs" name="${item.assignee || 'User'}"></mui-avatar>
                      <mui-badge variant="soft" size="sm">${item.priority || 'Normal'}</mui-badge>
                    </div>
                  </div>
                `)}
              </div>
            </div>
          `;
        })}
        <!-- Configurable: add new column placeholder -->
        <button class="column-add" @click=${() => this.emit('column-add')}>
          <mui-icon name="plus" size="sm"></mui-icon>
          Add Column
        </button>
      </div>
    `;
    }
}
