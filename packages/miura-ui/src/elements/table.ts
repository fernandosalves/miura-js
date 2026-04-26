import { MiuraElement, css, html } from '@miurajs/miura-element';

export interface TableColumn {
  key: string;
  label: string;
}

export class MuiTable extends MiuraElement {
  static properties = {
    columns: { type: Array, default: () => [] },
    rows: { type: Array, default: () => [] },
    selected: { type: String, default: '' },
  };

  declare columns: TableColumn[];
  declare rows: Array<Record<string, unknown>>;
  declare selected: string;

  static styles = css`
    :host {
      display: block;
      overflow: auto;
      border: 1px solid var(--mui-color-border);
      border-radius: var(--mui-radius-lg);
      background: var(--mui-color-surface);
      color: var(--mui-color-text);
      font-family: var(--mui-font-sans);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--mui-text-sm);
    }

    th,
    td {
      padding: var(--mui-space-4);
      border-bottom: 1px solid var(--mui-color-border);
      text-align: left;
      white-space: nowrap;
    }

    th {
      background: var(--mui-color-surface-muted);
      color: var(--mui-color-text-muted);
      font-weight: var(--mui-weight-semibold);
    }

    tr {
      cursor: pointer;
    }

    tbody tr:hover {
      background: var(--mui-color-surface-hover);
    }

    tbody tr.selected {
      background: var(--mui-color-accent-muted);
    }

    tbody tr:last-child td {
      border-bottom: 0;
    }
  `;

  private rowId(row: Record<string, unknown>, index: number): string {
    return String(row.id ?? index);
  }

  private select(row: Record<string, unknown>, index: number): void {
    const id = this.rowId(row, index);
    this.selected = id;
    this.emit('row-select', { row, id }, { bubbles: true, composed: true });
  }

  template() {
    const columns = this.columns ?? [];
    const rows = this.rows ?? [];

    return html`
      <table part="table">
        <thead>
          <tr>${columns.map((column) => html`<th>${column.label}</th>`)}</tr>
        </thead>
        <tbody>
          ${rows.map((row, index) => html`
            <tr class=${this.rowId(row, index) === this.selected ? 'selected' : ''} @click=${() => this.select(row, index)}>
              ${columns.map((column) => html`<td>${String(row[column.key] ?? '')}</td>`)}
            </tr>
          `)}
        </tbody>
      </table>
    `;
  }
}

if (!customElements.get('mui-table')) {
  customElements.define('mui-table', MuiTable);
}
