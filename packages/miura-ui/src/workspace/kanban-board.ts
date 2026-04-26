import { MiuraElement, css, html } from '@miurajs/miura-element';
import '../elements/badge.js';
import '../elements/button.js';
import '../elements/icon.js';

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  meta?: string;
  tags?: string[];
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
}

export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
  limit?: number;
}

export class MuiKanbanBoard extends MiuraElement {
  static properties = {
    columns: { type: Array, default: () => [] },
    selected: { type: String, default: '' },
    density: { type: String, default: 'comfortable', reflect: true },
  };

  declare columns: KanbanColumn[];
  declare selected: string;
  declare density: 'compact' | 'comfortable';

  private dragCard?: { card: KanbanCard; fromColumn: string };

  static styles = css`
    :host {
      display: block;
      min-width: 0;
      color: var(--mui-color-text);
      font-family: var(--mui-font-sans);
    }

    .board {
      display: grid;
      grid-auto-columns: minmax(260px, 1fr);
      grid-auto-flow: column;
      gap: var(--mui-space-4);
      min-height: 100%;
      overflow-x: auto;
      padding-bottom: var(--mui-space-2);
    }

    .column {
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      min-width: 0;
      border: 1px solid var(--mui-color-border);
      border-radius: var(--mui-radius-lg);
      background: var(--mui-color-surface-muted);
      overflow: hidden;
    }

    .column.over {
      border-color: var(--mui-color-accent);
      box-shadow: var(--mui-focus-ring);
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--mui-space-3);
      padding: var(--mui-space-4);
      border-bottom: 1px solid var(--mui-color-border);
      background: var(--mui-color-surface);
    }

    h3 {
      margin: 0;
      font-size: var(--mui-text-md);
      font-weight: var(--mui-weight-semibold);
    }

    .stack {
      display: grid;
      align-content: start;
      gap: var(--mui-space-3);
      min-height: 180px;
      padding: var(--mui-space-3);
      overflow: auto;
    }

    .card {
      display: grid;
      gap: var(--mui-space-3);
      width: 100%;
      padding: var(--mui-space-4);
      border: 1px solid var(--mui-color-border);
      border-left: 3px solid var(--mui-color-border-strong);
      border-radius: var(--mui-radius-md);
      background: var(--mui-color-surface);
      color: var(--mui-color-text);
      box-shadow: var(--mui-shadow-sm);
      text-align: left;
      cursor: grab;
      font: inherit;
      transition: border-color var(--mui-duration-fast), box-shadow var(--mui-duration-fast), transform var(--mui-duration-fast);
    }

    :host([density="compact"]) .card {
      padding: var(--mui-space-3);
      gap: var(--mui-space-2);
    }

    .card:hover {
      border-color: var(--mui-color-border-strong);
      box-shadow: var(--mui-shadow-md);
      transform: translateY(-1px);
    }

    .card:focus-visible {
      outline: none;
      box-shadow: var(--mui-focus-ring);
    }

    .card.selected {
      border-color: var(--mui-color-accent);
      box-shadow: var(--mui-focus-ring);
    }

    .card[data-tone="accent"] { border-left-color: var(--mui-color-accent); }
    .card[data-tone="success"] { border-left-color: var(--mui-color-success); }
    .card[data-tone="warning"] { border-left-color: var(--mui-color-warning); }
    .card[data-tone="danger"] { border-left-color: var(--mui-color-danger); }

    .title {
      font-weight: var(--mui-weight-semibold);
    }

    .description,
    .meta {
      margin: 0;
      color: var(--mui-color-text-muted);
      font-size: var(--mui-text-sm);
      line-height: 1.45;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: var(--mui-space-2);
    }

    slot[name^="card-"]::slotted(*) {
      display: block;
    }
  `;

  private selectCard(card: KanbanCard, column: KanbanColumn): void {
    this.selected = card.id;
    this.emit('card-select', { card, column }, { bubbles: true, composed: true });
  }

  private onDragStart(card: KanbanCard, column: KanbanColumn, event: DragEvent): void {
    this.dragCard = { card, fromColumn: column.id };
    event.dataTransfer?.setData('text/plain', card.id);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  private onDragOver(event: DragEvent): void {
    event.preventDefault();
    (event.currentTarget as HTMLElement).classList.add('over');
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  }

  private onDragLeave(event: DragEvent): void {
    (event.currentTarget as HTMLElement).classList.remove('over');
  }

  private onDrop(column: KanbanColumn, event: DragEvent): void {
    event.preventDefault();
    (event.currentTarget as HTMLElement).classList.remove('over');
    if (!this.dragCard || this.dragCard.fromColumn === column.id) return;

    this.emit('card-move', {
      card: this.dragCard.card,
      fromColumn: this.dragCard.fromColumn,
      toColumn: column.id,
    }, { bubbles: true, composed: true });

    this.dragCard = undefined;
  }

  private renderCard(card: KanbanCard, column: KanbanColumn) {
    const slotName = `card-${card.id}`;
    return html`
      <button
        class=${card.id === this.selected ? 'card selected' : 'card'}
        data-tone=${card.tone ?? 'neutral'}
        draggable="true"
        @click=${() => this.selectCard(card, column)}
        @dragstart=${(event: DragEvent) => this.onDragStart(card, column, event)}
      >
        <slot name=${slotName}>
          <span class="title">${card.title}</span>
          ${card.description ? html`<p class="description">${card.description}</p>` : ''}
          ${card.tags?.length ? html`<span class="tags">${card.tags.map((tag) => html`<mui-badge>${tag}</mui-badge>`)}</span>` : ''}
          ${card.meta ? html`<p class="meta">${card.meta}</p>` : ''}
        </slot>
      </button>
    `;
  }

  template() {
    const columns = (this.columns ?? []).map((column) => ({
      ...column,
      cards: Array.isArray(column.cards) ? column.cards : [],
    }));

    return html`
      <div class="board" part="board">
        ${columns.map((column) => html`
          <section
            class="column"
            part="column"
            @dragover=${(event: DragEvent) => this.onDragOver(event)}
            @dragleave=${(event: DragEvent) => this.onDragLeave(event)}
            @drop=${(event: DragEvent) => this.onDrop(column, event)}
          >
            <header class="header" part="column-header">
              <h3>${column.title}</h3>
              <mui-badge>${column.cards.length}${column.limit ? ` / ${column.limit}` : ''}</mui-badge>
            </header>
            <div class="stack" part="column-cards">
              ${column.cards.map((card) => this.renderCard(card, column))}
            </div>
          </section>
        `)}
      </div>
    `;
  }
}

if (!customElements.get('mui-kanban-board')) {
  customElements.define('mui-kanban-board', MuiKanbanBoard);
}
