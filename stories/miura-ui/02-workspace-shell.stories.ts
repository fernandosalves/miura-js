import '../../packages/miura-ui/src/tokens/tokens.css';
import '../../packages/miura-ui/src/elements/index';
import '../../packages/miura-ui/src/forms/index';
import '../../packages/miura-ui/src/workspace/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../packages/miura-element';

class MiuraUiWorkspaceShellDemo extends MiuraElement {
  static properties = {
    activeRail: { type: String, default: 'notebook' },
    activeItem: { type: String, default: 'page-1' },
    theme: { type: String, default: 'light' },
    inspector: { type: Boolean, default: true },
    paneSize: { type: Number, default: 360 },
    movedCards: { type: Number, default: 0 },
    events: { type: Array, default: () => [] },
  };

  declare activeRail: string;
  declare activeItem: string;
  declare theme: 'light' | 'dark';
  declare inspector: boolean;
  declare paneSize: number;
  declare movedCards: number;
  declare events: string[];

  private railItems = [
    { id: 'notebook', label: 'Notebook', icon: 'folder' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar' },
    { id: 'boards', label: 'Boards', icon: 'columns', badge: '3' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  private treeItems = [
    {
      id: 'board-1',
      label: 'Product system',
      icon: 'folder',
      children: [
        { id: 'page-1', label: 'Design-system architecture', icon: 'file' },
        { id: 'page-2', label: 'Workspace shell notes', icon: 'file' },
      ],
    },
    {
      id: 'board-2',
      label: 'Release planning',
      icon: 'folder',
      children: [
        { id: 'page-3', label: 'Kanban extraction', icon: 'columns' },
        { id: 'page-4', label: 'Calendar interactions', icon: 'calendar' },
      ],
    },
  ];

  static styles = css`
    :host {
      display: block;
      height: 680px;
      border: 1px solid var(--mui-color-border);
      border-radius: var(--mui-radius-lg);
      overflow: hidden;
      font-family: var(--mui-font-sans);
    }

    .nav-panel {
      height: 100%;
      padding: 16px 12px;
      box-sizing: border-box;
      background: var(--mui-color-surface);
    }

    .nav-header,
    .inspector-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 14px;
    }

    h2,
    h3 {
      margin: 0;
      color: var(--mui-color-text);
    }

    h2 {
      font-size: var(--mui-text-lg);
    }

    h3 {
      font-size: var(--mui-text-md);
    }

    .canvas {
      min-height: 100%;
      padding: 22px;
      box-sizing: border-box;
      background-color: var(--mui-color-bg);
      background-image: radial-gradient(color-mix(in srgb, var(--mui-color-border-strong), transparent 72%) 1px, transparent 1px);
      background-size: 22px 22px;
    }

    .board {
      display: grid;
      grid-template-columns: repeat(3, minmax(220px, 1fr));
      gap: 16px;
    }

    .column,
    .inspector {
      border: 1px solid var(--mui-color-border);
      border-radius: var(--mui-radius-lg);
      background: var(--mui-color-surface);
      box-shadow: var(--mui-shadow-sm);
    }

    .column {
      min-height: 460px;
      padding: 12px;
    }

    .card {
      margin-top: 10px;
      padding: 12px;
      border: 1px solid var(--mui-color-border);
      border-radius: var(--mui-radius-md);
      background: var(--mui-color-surface-raised);
      color: var(--mui-color-text);
    }

    .card p,
    .muted {
      margin: 6px 0 0;
      color: var(--mui-color-text-muted);
      font-size: var(--mui-text-sm);
    }

    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 16px;
    }

    .topbar-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .workspace-title {
      display: grid;
      gap: 3px;
    }

    .workspace-title strong {
      color: var(--mui-color-text);
      font-size: var(--mui-text-lg);
    }

    .workspace-title span {
      color: var(--mui-color-text-muted);
      font-size: var(--mui-text-sm);
    }

    .card button {
      margin-top: 10px;
    }

    .activity {
      margin-top: 16px;
      display: grid;
      gap: 6px;
      padding: 10px;
      border: 1px solid var(--mui-color-border);
      border-radius: var(--mui-radius-md);
      background: var(--mui-color-surface-muted);
    }

    .activity div {
      color: var(--mui-color-text-muted);
      font-family: var(--mui-font-mono);
      font-size: var(--mui-text-xs);
    }

    .inspector {
      height: 100%;
      box-sizing: border-box;
      padding: 16px;
      border: 0;
      border-radius: 0;
    }
  `;

  private pushEvent(message: string) {
    this.events = [`${new Date().toLocaleTimeString()} ${message}`, ...this.events].slice(0, 6);
  }

  private selectRail(event: CustomEvent) {
    this.activeRail = event.detail.id;
    this.pushEvent(`rail -> ${event.detail.label}`);
  }

  private selectItem(event: CustomEvent) {
    this.activeItem = event.detail.id;
    this.pushEvent(`tree -> ${event.detail.label}`);
  }

  private moveCard(label: string) {
    this.movedCards++;
    this.pushEvent(`${label} moved to next lane`);
  }

  private updatePane(event: CustomEvent) {
    this.paneSize = Math.round(event.detail.size);
  }

  template() {
    this.dataset.muiTheme = this.theme;
    this.dataset.muiDensity = "compact";

    return html`
      <mui-app-shell data-mui-theme=${this.theme} data-mui-density="compact" .inspector=${this.inspector}>
        <mui-icon-rail
          slot="rail"
          .items=${this.railItems}
          .active=${this.activeRail}
          @item-select=${(event: CustomEvent) => this.selectRail(event)}
        ></mui-icon-rail>

        <div slot="nav" class="nav-panel">
          <div class="nav-header">
            <h2>${this.activeRail}</h2>
            <mui-button size="sm" variant="ghost" @click=${() => this.theme = this.theme === 'light' ? 'dark' : 'light'}>
              <mui-icon slot="icon-start" name="spark"></mui-icon>
              Theme
            </mui-button>
          </div>
          <mui-content-tree
            .items=${this.treeItems}
            .active=${this.activeItem}
            .expanded=${['board-1', 'board-2']}
            @item-select=${(event: CustomEvent) => this.selectItem(event)}
          ></mui-content-tree>
          <div class="activity" aria-live="polite">
            ${(this.events.length ? this.events : ['Click rails, tree items, cards, theme, or drag the divider.']).map((event) => html`
              <div>${event}</div>
            `)}
          </div>
        </div>

        <div class="canvas">
          <div class="topbar">
            <div class="workspace-title">
              <strong>${this.activeRail} workspace</strong>
              <span>Selected: ${this.activeItem} · pane ${this.paneSize}px · moved cards ${this.movedCards}</span>
            </div>
            <div class="topbar-actions">
              <mui-button size="sm" variant="secondary" @click=${() => {
                this.inspector = !this.inspector;
                this.pushEvent(`inspector -> ${this.inspector ? 'open' : 'closed'}`);
              }}>
                <mui-icon slot="icon-start" name="panel-left"></mui-icon>
                Inspector
              </mui-button>
            </div>
          </div>

          <mui-split-pane .size=${this.paneSize} min="260" max="620" @resize=${(event: CustomEvent) => this.updatePane(event)}>
            <div slot="primary" class="column">
              <h3>Notebook outline</h3>
              <div class="card">
                <strong>Mind nodes</strong>
                <p>Node canvas primitives will grow from the blog mindmap prototype.</p>
                <mui-button size="sm" variant="ghost" @click=${() => this.pushEvent('mind node opened')}>Open node</mui-button>
              </div>
              <div class="card">
                <strong>Calendar lane</strong>
                <p>Calendar cells become data-aware workspace surfaces.</p>
                <mui-button size="sm" variant="ghost" @click=${() => this.pushEvent('calendar lane focused')}>Focus lane</mui-button>
              </div>
            </div>
            <div slot="secondary" class="board">
              <div class="column">
                <h3>Backlog</h3>
                <div class="card"><strong>Extract primitives</strong><p>Disclosure, roving focus, tree, pane resize.</p><mui-button size="sm" variant="secondary" @click=${() => this.moveCard('Extract primitives')}>Move</mui-button></div>
              </div>
              <div class="column">
                <h3>Building</h3>
                <div class="card"><strong>Workspace shell</strong><p>Rail, tree, split pane, inspector.</p><mui-button size="sm" variant="secondary" @click=${() => this.moveCard('Workspace shell')}>Move</mui-button></div>
              </div>
              <div class="column">
                <h3>Next</h3>
                <div class="card"><strong>Canvas kit</strong><p>Kanban, calendar, and node graph.</p><mui-button size="sm" variant="secondary" @click=${() => this.moveCard('Canvas kit')}>Move</mui-button></div>
              </div>
            </div>
          </mui-split-pane>
        </div>

        <aside slot="inspector" class="inspector">
          <div class="inspector-header">
            <h3>Inspector</h3>
            <mui-icon name="panel-left"></mui-icon>
          </div>
          <p class="muted">Selected item</p>
          <h2>${this.activeItem}</h2>
          <mui-field label="Title" help="Inspector forms use the same field/control contract.">
            <mui-input value="Design-system architecture"></mui-input>
          </mui-field>
        </aside>
      </mui-app-shell>
    `;
  }
}

if (!customElements.get('miura-ui-workspace-shell-demo')) {
  customElements.define('miura-ui-workspace-shell-demo', MiuraUiWorkspaceShellDemo);
}

const meta: Meta<MiuraUiWorkspaceShellDemo> = {
  title: 'Miura UI Next/02. Workspace Shell',
  component: 'miura-ui-workspace-shell-demo',
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<MiuraUiWorkspaceShellDemo>;

export const WorkspaceShell: Story = {
  args: {
    activeRail: 'notebook',
    activeItem: 'page-1',
    theme: 'light',
    inspector: true,
    paneSize: 360,
    movedCards: 0,
    events: [],
  },
};
