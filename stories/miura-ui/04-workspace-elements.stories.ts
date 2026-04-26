import '../../packages/miura-ui/src/tokens/tokens.css';
import '../../packages/miura-ui/src/elements/index';
import '../../packages/miura-ui/src/forms/index';
import '../../packages/miura-ui/src/workspace/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../packages/miura-element';

class MiuraUiWorkspaceElementsDemo extends MiuraElement {
  static properties = {
    theme: { type: String, default: 'light' },
    activeRail: { type: String, default: 'boards' },
    activeTree: { type: String, default: 'page-4' },
    expanded: { type: Array, default: () => ['board-1', 'board-2'] },
    inspector: { type: Boolean, default: true },
    selected: { type: String, default: 'card-2' },
    eventLog: { type: Array, default: () => [] },
    kanbanColumns: { type: Array, default: () => [
      {
        id: 'todo',
        title: 'Todo',
        cards: [
          { id: 'card-1', title: 'Token audit', description: 'Map old variables to the new token surface.', tags: ['tokens'], tone: 'accent' },
          { id: 'card-2', title: 'Calendar density', description: 'Validate compact events in narrow panels.', tags: ['calendar'], tone: 'warning' },
        ],
      },
      { id: 'doing', title: 'Doing', cards: [{ id: 'card-3', title: 'Node canvas', description: 'Drag connected cards with custom slots.', tags: ['canvas'], tone: 'success' }] },
      { id: 'done', title: 'Done', cards: [{ id: 'card-4', title: 'Button story', description: 'Interactive docs are complete.', tags: ['docs'] }] },
    ] },
    nodeItems: { type: Array, default: () => [
      { id: 'brief', x: 76, y: 78, width: 230, title: 'Brief', subtitle: 'Inputs and constraints', icon: 'file', tone: 'accent' },
      { id: 'research', x: 380, y: 58, width: 250, title: 'Research', subtitle: 'Evidence and notes', icon: 'search', tone: 'warning' },
      { id: 'board', x: 380, y: 280, width: 250, title: 'Board', subtitle: 'Execution queue', icon: 'columns', tone: 'success' },
      { id: 'decision', x: 730, y: 170, width: 240, title: 'Decision', subtitle: 'Final recommendation', icon: 'spark' },
    ] },
  };

  declare theme: 'light' | 'dark';
  declare activeRail: string;
  declare activeTree: string;
  declare expanded: string[];
  declare inspector: boolean;
  declare selected: string;
  declare eventLog: string[];
  declare kanbanColumns: any[];
  declare nodeItems: any[];

  private railItems = [
    { id: 'nodes', label: 'Nodes', icon: 'node' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar' },
    { id: 'boards', label: 'Boards', icon: 'columns', badge: '4' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  private treeItems = [
    {
      id: 'board-1',
      label: 'Design system',
      icon: 'folder',
      children: [
        { id: 'page-1', label: 'Tokens', icon: 'file' },
        { id: 'page-2', label: 'Elements', icon: 'file' },
        { id: 'page-3', label: 'Workspace shell', icon: 'panel' },
      ],
    },
    {
      id: 'board-2',
      label: 'Workspace surfaces',
      icon: 'folder',
      children: [
        { id: 'page-4', label: 'Kanban board', icon: 'columns' },
        { id: 'page-5', label: 'Node canvas', icon: 'node' },
        { id: 'page-6', label: 'Calendar grid', icon: 'calendar' },
      ],
    },
  ];

  private calendarEvents = [
    { id: 'e1', date: '2026-04-06', title: 'Sprint planning', tone: 'accent' },
    { id: 'e2', date: '2026-04-16', title: 'Release notes', tone: 'success' },
    { id: 'e3', date: '2026-04-24', title: 'Roadmap sync', tone: 'warning' },
  ];

  private nodeConnectors = [
    { id: 'c1', from: 'brief', to: 'research', tone: 'accent' },
    { id: 'c2', from: 'brief', to: 'board' },
    { id: 'c3', from: 'research', to: 'decision', tone: 'warning' },
    { id: 'c4', from: 'board', to: 'decision', tone: 'success' },
  ];

  private notifications = [
    { id: 'n1', title: 'Storybook build passed', description: 'Workspace elements compiled successfully.', time: 'now', tone: 'success' },
    { id: 'n2', title: 'Review node API', description: 'Connector and port abstractions are ready for the next pass.', time: '4m', tone: 'warning' },
  ];

  static styles = css`
    :host {
      display: block;
      height: 820px;
      border: 1px solid var(--mui-color-border);
      border-radius: var(--mui-radius-lg);
      overflow: hidden;
      font-family: var(--mui-font-sans);
    }

    .nav,
    .inspector {
      height: 100%;
      box-sizing: border-box;
      background: var(--mui-color-surface);
    }

    .nav {
      padding: 14px;
    }

    .workspace {
      height: 100%;
      min-height: 0;
      box-sizing: border-box;
      padding: 18px;
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      gap: 14px;
      background: var(--mui-color-bg);
    }

    .nav-stack,
    .event-log {
      display: grid;
      gap: 10px;
    }

    .event-log {
      padding: 10px;
      border: 1px solid var(--mui-color-border);
      border-radius: var(--mui-radius-md);
      background: var(--mui-color-surface-muted);
    }

    .event-log div {
      color: var(--mui-color-text-muted);
      font-family: var(--mui-font-mono);
      font-size: var(--mui-text-xs);
    }

    .surface {
      min-height: 0;
      overflow: hidden;
    }

    .node-surface,
    .calendar-surface,
    .settings {
      height: 100%;
      min-height: 0;
    }

    .settings {
      display: grid;
      align-content: start;
      gap: 14px;
      padding: 18px;
      border: 1px solid var(--mui-color-border);
      border-radius: var(--mui-radius-lg);
      background: var(--mui-color-surface);
      box-shadow: var(--mui-shadow-sm);
    }

    h3,
    p {
      margin: 0;
    }

    h3 {
      color: var(--mui-color-text);
    }

    p {
      color: var(--mui-color-text-muted);
      font-size: var(--mui-text-sm);
      line-height: 1.5;
    }
  `;

  private log(message: string) {
    this.eventLog = [`${new Date().toLocaleTimeString()} ${message}`, ...this.eventLog].slice(0, 6);
  }

  private moveCard(detail: any) {
    const next = this.kanbanColumns.map((column) => ({
      ...column,
      cards: column.cards.filter((card: any) => card.id !== detail.card.id),
    }));
    next.find((column) => column.id === detail.toColumn)?.cards.push(detail.card);
    this.kanbanColumns = next;
    this.log(`${detail.card.title} -> ${detail.toColumn}`);
  }

  private get inspectorItems() {
    return [
      { label: 'View', value: this.activeRail },
      { label: 'Tree item', value: this.activeTree },
      { label: 'Selection', value: this.selected || 'None', tone: this.selected ? 'accent' : 'neutral' },
      { label: 'Theme', value: this.theme },
    ];
  }

  private renderSurface() {
    if (this.activeRail === 'calendar') {
      return html`
        <mui-calendar-grid
          class="calendar-surface"
          month="2026-04"
          .events=${this.calendarEvents}
          .selected=${this.selected}
          @day-select=${(event: CustomEvent) => {
            this.selected = event.detail.date;
            this.log(`calendar day -> ${event.detail.date}`);
          }}
        ></mui-calendar-grid>
      `;
    }

    if (this.activeRail === 'nodes') {
      return html`
        <mui-node-canvas
          class="node-surface"
          .nodes=${this.nodeItems}
          .connectors=${this.nodeConnectors}
          .selected=${this.selected}
          @node-select=${(event: CustomEvent) => {
            this.selected = event.detail.node.id;
            this.log(`node-select -> ${event.detail.node.id}`);
          }}
          @node-move=${(event: CustomEvent) => {
            this.nodeItems = this.nodeItems.map((node) => node.id === event.detail.node.id ? event.detail.node : node);
            this.log(`node-move -> ${event.detail.node.id}`);
          }}
        ></mui-node-canvas>
      `;
    }

    if (this.activeRail === 'settings') {
      return html`
        <section class="settings">
          <h3>Workspace settings</h3>
          <p>Settings uses ordinary form components inside the same workspace shell.</p>
          <mui-field label="Workspace name"><mui-input value="Miura UI Next"></mui-input></mui-field>
          <mui-field label="Compact mode"><mui-switch checked>Enabled</mui-switch></mui-field>
        </section>
      `;
    }

    return html`
      <mui-kanban-board
        .columns=${this.kanbanColumns}
        .selected=${this.selected}
        @card-select=${(event: CustomEvent) => {
          this.selected = event.detail.card.id;
          this.log(`card-select -> ${event.detail.card.id}`);
        }}
        @card-move=${(event: CustomEvent) => this.moveCard(event.detail)}
      ></mui-kanban-board>
    `;
  }

  template() {
    this.dataset.muiTheme = this.theme;
    this.dataset.muiDensity = 'compact';

    return html`
      <mui-app-shell data-mui-theme=${this.theme} data-mui-density="compact" .inspector=${this.inspector}>
        <mui-icon-rail
          slot="rail"
          .items=${this.railItems}
          .active=${this.activeRail}
          @item-select=${(event: CustomEvent) => {
            this.activeRail = event.detail.id;
            this.log(`rail -> ${event.detail.id}`);
          }}
        ></mui-icon-rail>

        <div slot="nav" class="nav">
          <div class="nav-stack">
            <mui-content-tree
              .items=${this.treeItems}
              .active=${this.activeTree}
              .expanded=${this.expanded}
              @item-select=${(event: CustomEvent) => {
                this.activeTree = event.detail.id;
                this.log(`tree -> ${event.detail.id}`);
              }}
              @expanded-change=${(event: CustomEvent) => {
                this.expanded = event.detail.expanded;
              }}
            ></mui-content-tree>
            <div class="event-log" aria-live="polite">
              ${(this.eventLog.length ? this.eventLog : ['Interact with the rail, tree, board, calendar, or node canvas.']).map((line) => html`<div>${line}</div>`)}
            </div>
          </div>
        </div>

        <main class="workspace">
          <mui-command-bar
            title="Miura UI workspace"
            subtitle="Composable surfaces for apps, tools, notebooks, boards, and connected knowledge."
            .actions=${[
              { id: 'theme', label: this.theme === 'light' ? 'Dark' : 'Light', icon: 'spark' },
              { id: 'inspector', label: this.inspector ? 'Hide inspector' : 'Show inspector', icon: 'panel' },
              { id: 'new', label: 'New', icon: 'plus', variant: 'primary' },
            ]}
            @action=${(event: CustomEvent) => {
              const id = event.detail.action.id;
              if (id === 'theme') this.theme = this.theme === 'light' ? 'dark' : 'light';
              if (id === 'inspector') this.inspector = !this.inspector;
              this.log(`command -> ${id}`);
            }}
          >
            <mui-icon slot="icon" name="spark"></mui-icon>
            <mui-notification-center
              slot="actions"
              .items=${this.notifications}
              @notification-select=${(event: CustomEvent) => this.log(`notification -> ${event.detail.item.id}`)}
            ></mui-notification-center>
          </mui-command-bar>
          <section class="surface">${this.renderSurface()}</section>
        </main>

        <aside slot="inspector" class="inspector">
          <mui-property-panel
            heading="Inspector"
            description="Selection and workspace metadata from the active surface."
            .items=${this.inspectorItems}
          >
            <mui-field label="Selected"><mui-input .value=${this.selected}></mui-input></mui-field>
            <mui-field label="Notes"><mui-textarea value="This panel stays generic and receives app-specific controls through slots."></mui-textarea></mui-field>
          </mui-property-panel>
        </aside>
      </mui-app-shell>
    `;
  }
}

if (!customElements.get('miura-ui-workspace-elements-demo')) {
  customElements.define('miura-ui-workspace-elements-demo', MiuraUiWorkspaceElementsDemo);
}

const meta: Meta<MiuraUiWorkspaceElementsDemo> = {
  title: 'Miura UI Next/04. Workspace Elements',
  component: 'miura-ui-workspace-elements-demo',
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<MiuraUiWorkspaceElementsDemo>;

export const AllWorkspaceElements: Story = {
  args: {
    theme: 'light',
    activeRail: 'boards',
    activeTree: 'page-4',
    expanded: ['board-1', 'board-2'],
    inspector: true,
    selected: 'card-2',
    eventLog: [],
  },
};
