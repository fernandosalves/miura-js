import { MiuraElement, html, css, component, property, state } from '@miurajs/miura-element';

export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (val: any, row: any) => any;
}

/**
 * Data Table — robust table with sorting, pagination, and selection
 *
 * <mui-data-table 
 *   .columns=${cols} 
 *   .data=${items} 
 *   selectable 
 *   paginated 
 *   @selection-change=${onSelect}
 * ></mui-data-table>
 */
@component({ tag: 'mui-data-table' })
export class MuiDataTable extends MiuraElement {
  @property({ type: Array, default: [] })
  columns: Column[] = [];

  @property({ type: Array, default: [] })
  data: any[] = [];

  @property({ type: Boolean, default: false, reflect: true })
  selectable = false;

  @property({ type: Boolean, default: false, reflect: true })
  paginated = false;

  @property({ type: Number, default: 10 })
  pageSize = 10;

  @property({ type: String, default: '' })
  sortKey = '';

  @property({ type: String, default: 'asc' })
  sortOrder: 'asc' | 'desc' = 'asc';

  @state({ default: 0 })
  private _currentPage = 0;

  @state()
  private _selectedIds: Set<any> = new Set();

  static styles: any = css`
    :host { display: block; width: 100%; overflow-x: auto; background: var(--mui-surface, #fff); border: 1px solid var(--mui-border, #e5e7eb); border-radius: var(--mui-radius-lg, 8px); }

    .table-container { width: 100%; }

    table { width: 100%; border-collapse: collapse; text-align: left; font-size: var(--mui-text-sm, 0.875rem); }

    thead { background: var(--mui-surface-subtle, #f9fafb); border-bottom: 1px solid var(--mui-border, #e5e7eb); }

    th { 
      padding: var(--mui-space-3, 12px) var(--mui-space-4, 16px);
      font-weight: var(--mui-weight-semibold, 600);
      color: var(--mui-text-secondary, #6b7280);
      white-space: nowrap;
      user-select: none;
    }

    th.sortable { cursor: pointer; }
    th.sortable:hover { color: var(--mui-text, #1f2937); }

    .sort-icon { display: inline-flex; align-items: center; margin-left: 4px; opacity: 0.3; transition: opacity 200ms; }
    th.active .sort-icon { opacity: 1; color: var(--mui-primary, #3b82f6); }

    td { 
      padding: var(--mui-space-3, 12px) var(--mui-space-4, 16px);
      border-bottom: 1px solid var(--mui-border, #f3f4f6);
      color: var(--mui-text, #1f2937);
      vertical-align: middle;
    }

    tr:last-child td { border-bottom: none; }
    tr:hover td { background: var(--mui-surface-subtle, #f9fafb); }
    tr.selected td { background: var(--mui-primary-subtle, rgba(59,130,246,0.04)); }

    .checkbox-col { width: 40px; padding-right: 0; }

    .pagination { 
      display: flex; 
      align-items: center; 
      justify-content: space-between; 
      padding: var(--mui-space-3, 12px) var(--mui-space-4, 16px);
      border-top: 1px solid var(--mui-border, #e5e7eb);
      background: var(--mui-surface-subtle, #f9fafb);
      font-size: var(--mui-text-xs, 0.75rem);
      color: var(--mui-text-secondary, #6b7280);
    }

    .page-controls { display: flex; align-items: center; gap: 8px; }

    .empty { padding: 48px; text-align: center; color: var(--mui-text-muted, #9ca3af); }
  `;

  private _toggleSelectAll(e: any) {
    const checked = e.detail.checked;
    if (checked) {
      this._selectedIds = new Set(this.data.map((_, i) => i)); // Simplified: use index as ID for now
    } else {
      this._selectedIds = new Set();
    }
    this._emitSelection();
  }

  private _toggleSelect(index: number) {
    if (this._selectedIds.has(index)) {
      this._selectedIds.delete(index);
    } else {
      this._selectedIds.add(index);
    }
    this._selectedIds = new Set(this._selectedIds); // Trigger update
    this._emitSelection();
  }

  private _emitSelection() {
    const selectedData = Array.from(this._selectedIds).map(idx => this.data[idx]);
    this.emit('selection-change', { selected: selectedData });
  }

  private _handleSort(key: string) {
    if (this.sortKey === key) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortOrder = 'asc';
    }
    this.requestUpdate();
  }

  private _getProcessedData() {
    let result = [...this.data];

    // Sorting
    if (this.sortKey) {
      result.sort((a, b) => {
        const valA = a[this.sortKey];
        const valB = b[this.sortKey];
        if (valA < valB) return this.sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Pagination
    if (this.paginated) {
      const start = this._currentPage * this.pageSize;
      result = result.slice(start, start + this.pageSize);
    }

    return result;
  }

  template() {
    const processed = this._getProcessedData();
    const totalPages = Math.ceil(this.data.length / this.pageSize);
    const allSelected = this.data.length > 0 && this._selectedIds.size === this.data.length;

    return html`
      <div class="table-container">
        <table>
          <thead>
            <tr>
              ${this.selectable ? html`
                <th class="checkbox-col">
                  <mui-checkbox .checked=${allSelected} @change=${(e: any) => this._toggleSelectAll(e)}></mui-checkbox>
                </th>
              ` : ''}
              ${this.columns.map(col => html`
                <th 
                  class="${col.sortable ? 'sortable' : ''} ${this.sortKey === col.key ? 'active' : ''}"
                  style="width: ${col.width || 'auto'}; text-align: ${col.align || 'left'};"
                  @click=${() => col.sortable && this._handleSort(col.key)}
                >
                  ${col.label}
                  ${col.sortable ? html`
                    <span class="sort-icon">
                      <mui-icon name="${this.sortKey === col.key && this.sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'}" size="xs"></mui-icon>
                    </span>
                  ` : ''}
                </th>
              `)}
            </tr>
          </thead>
          <tbody>
            ${processed.length === 0 ? html`
              <tr>
                <td colspan="${this.columns.length + (this.selectable ? 1 : 0)}">
                  <div class="empty">No data found</div>
                </td>
              </tr>
            ` : processed.map((row, i) => {
              const globalIndex = this.paginated ? (this._currentPage * this.pageSize) + i : i;
              const isSelected = this._selectedIds.has(globalIndex);
              
              return html`
                <tr class="${isSelected ? 'selected' : ''}">
                  ${this.selectable ? html`
                    <td class="checkbox-col">
                      <mui-checkbox .checked=${isSelected} @change=${() => this._toggleSelect(globalIndex)}></mui-checkbox>
                    </td>
                  ` : ''}
                  ${this.columns.map(col => html`
                    <td style="text-align: ${col.align || 'left'};">
                      ${col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  `)}
                </tr>
              `;
            })}
          </tbody>
        </table>

        ${this.paginated ? html`
          <div class="pagination">
            <span>Showing ${this._currentPage * this.pageSize + 1} to ${Math.min((this._currentPage + 1) * this.pageSize, this.data.length)} of ${this.data.length}</span>
            <div class="page-controls">
              <mui-button 
                variant="ghost" 
                size="sm" 
                ?disabled=${this._currentPage === 0}
                @click=${() => { this._currentPage--; }}
              >Previous</mui-button>
              <span>Page ${this._currentPage + 1} of ${totalPages}</span>
              <mui-button 
                variant="ghost" 
                size="sm" 
                ?disabled=${this._currentPage >= totalPages - 1}
                @click=${() => { this._currentPage++; }}
              >Next</mui-button>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }
}
