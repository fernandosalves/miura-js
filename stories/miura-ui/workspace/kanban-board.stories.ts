import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import '../../../packages/miura-ui/src/workspace/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiKanbanBoardStory extends MiuraElement {
  static properties = {
    theme: { type: String, default: 'light' },
    selected: { type: String, default: 'card-2' },
    columns: { type: Array, default: () => [
      {
        id: 'todo',
        title: 'Todo',
        cards: [
          { id: 'card-1', title: 'Token audit', description: 'Map old variables to the new Miura token surface.', tags: ['ui', 'tokens'], tone: 'accent' },
          { id: 'card-2', title: 'Calendar density', description: 'Validate compact event rendering in narrow panels.', tags: ['calendar'], tone: 'warning' },
        ],
      },
      {
        id: 'doing',
        title: 'Doing',
        limit: 3,
        cards: [
          { id: 'card-3', title: 'Node canvas', description: 'Drag cards, connectors, and slotted node content.', tags: ['canvas'], tone: 'success' },
        ],
      },
      {
        id: 'done',
        title: 'Done',
        cards: [
          { id: 'card-4', title: 'Button story', description: 'Interactive docs with loading state and theme toggle.', tags: ['docs'] },
        ],
      },
    ] },
    log: { type: Array, default: () => [] },
  };

  declare theme: 'light' | 'dark';
  declare selected: string;
  declare columns: any[];
  declare log: string[];

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { height: 720px; box-sizing: border-box; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .docs { height: 100%; display: grid; grid-template-rows: auto minmax(0, 1fr); gap: 18px; }
    .section { display: grid; gap: 14px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); padding: 18px; box-shadow: var(--mui-shadow-sm); }
    .row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .log { display: flex; gap: 8px; flex-wrap: wrap; color: var(--mui-color-text-muted); font-size: var(--mui-text-sm); }
    h1, p { margin: 0; }
    p { color: var(--mui-color-text-muted); line-height: 1.5; }
  `;

  private note(message: string) {
    this.log = [message, ...this.log].slice(0, 4);
  }

  private moveCard(detail: any) {
    const next = this.columns.map((column) => ({
      ...column,
      cards: column.cards.filter((card: any) => card.id !== detail.card.id),
    }));
    const target = next.find((column) => column.id === detail.toColumn);
    target?.cards.push(detail.card);
    this.columns = next;
    this.note(`${detail.card.title} moved to ${detail.toColumn}`);
  }

  template() {
    this.dataset.muiTheme = this.theme;
    this.dataset.muiDensity = 'compact';
    return html`
      <div class="page">
        <div class="docs">
          <section class="section">
            <div class="row">
              <h1>mui-kanban-board</h1>
              <mui-button size="sm" variant="secondary" @click=${() => this.theme = this.theme === 'light' ? 'dark' : 'light'}>Toggle theme</mui-button>
            </div>
            <p>Kanban board is a workspace surface for task cards, editorial pipelines, project boards, and queue triage. Drag cards between columns or select a card.</p>
            <div class="log">${(this.log.length ? this.log : ['Select or drag a card.']).map((line) => html`<mui-badge>${line}</mui-badge>`)}</div>
          </section>
          <mui-kanban-board
            .columns=${this.columns}
            .selected=${this.selected}
            @card-select=${(event: CustomEvent) => {
              this.selected = event.detail.card.id;
              this.note(`${event.detail.card.title} selected`);
            }}
            @card-move=${(event: CustomEvent) => this.moveCard(event.detail)}
          ></mui-kanban-board>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('mui-kanban-board-story')) customElements.define('mui-kanban-board-story', MuiKanbanBoardStory);
const meta: Meta<MuiKanbanBoardStory> = { title: 'Miura UI Next/Workspace/Kanban Board', component: 'mui-kanban-board-story', tags: ['autodocs'] };
export default meta;
type Story = StoryObj<MuiKanbanBoardStory>;
export const Documentation: Story = { args: { theme: 'light', selected: 'card-2' } };
