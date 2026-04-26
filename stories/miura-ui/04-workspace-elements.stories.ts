import '../../packages/miura-ui/src/tokens/tokens.css';
import '../../packages/miura-ui/src/elements/index';
import '../../packages/miura-ui/src/forms/index';
import '../../packages/miura-ui/src/workspace/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../packages/miura-element';

class MiuraUiWorkspaceElementsDemo extends MiuraElement {
  static properties = {
    theme: { type: String, default: 'light' },
    activeRail: { type: String, default: 'notebook' },
    activeTree: { type: String, default: 'page-2' },
    expanded: { type: Array, default: () => ['board-1'] },
    paneSize: { type: Number, default: 300 },
    inspector: { type: Boolean, default: true },
    eventLog: { type: Array, default: () => [] },
  };

  declare theme: 'light' | 'dark';
  declare activeRail: string;
  declare activeTree: string;
  declare expanded: string[];
  declare paneSize: number;
  declare inspector: boolean;
  declare eventLog: string[];

  private railItems = [
    { id: 'notebook', label: 'Notebook', icon: 'folder' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar' },
    { id: 'boards', label: 'Boards', icon: 'columns', badge: '2' },
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
        { id: 'page-3', label: 'Workspace shell', icon: 'file' },
      ],
    },
    {
      id: 'board-2',
      label: 'Canvas kit',
      icon: 'folder',
      children: [
        { id: 'page-4', label: 'Kanban board', icon: 'columns' },
        { id: 'page-5', label: 'Mind nodes', icon: 'spark' },
      ],
    },
  ];

  static styles = css`
    :host {
      display: block;
      height: 760px;
      border: 1px solid var(--mui-color-border);
      border-radius: var(--mui-radius-lg);
      overflow: hidden;
      font-family: var(--mui-font-sans);
    }

    .nav,
    .inspector {
      height: 100%;
      box-sizing: border-box;
      padding: 14px;
      background: var(--mui-color-surface);
    }

    .canvas {
      height: 100%;
      box-sizing: border-box;
      padding: 18px;
      background-color: var(--mui-color-bg);
      background-image: radial-gradient(color-mix(in srgb, var(--mui-color-border-strong), transparent 72%) 1px, transparent 1px);
      background-size: 22px 22px;
    }

    .section {
      display: grid;
      gap: 12px;
      height: 100%;
      min-height: 0;
    }

    .header,
    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .row {
      justify-content: flex-start;
      flex-wrap: wrap;
    }

    .panel {
      display: grid;
      gap: 12px;
      padding: 14px;
      border: 1px solid var(--mui-color-border);
      border-radius: var(--mui-radius-lg);
      background: var(--mui-color-surface);
      box-shadow: var(--mui-shadow-sm);
    }

    .fill {
      height: 100%;
      min-height: 0;
    }

    .pane-content {
      height: 100%;
      box-sizing: border-box;
      padding: 14px;
      border: 1px solid var(--mui-color-border);
      border-radius: var(--mui-radius-lg);
      background: var(--mui-color-surface);
    }

    .event-log {
      display: grid;
      gap: 6px;
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

    h2,
    h3 {
      margin: 0;
      color: var(--mui-color-text);
    }

    p {
      margin: 0;
      color: var(--mui-color-text-muted);
      font-size: var(--mui-text-sm);
    }
  `;

  private log(message: string) {
    this.eventLog = [`${new Date().toLocaleTimeString()} ${message}`, ...this.eventLog].slice(0, 6);
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
          @item-select=${(event: CustomEvent) => {
            this.activeRail = event.detail.id;
            this.log(`mui-icon-rail item-select -> ${event.detail.id}`);
          }}
        ></mui-icon-rail>

        <div slot="nav" class="nav">
          <div class="section">
            <div class="header">
              <h3>mui-content-tree</h3>
              <mui-button size="sm" variant="ghost" @click=${() => {
                this.theme = this.theme === 'light' ? 'dark' : 'light';
                this.log(`theme -> ${this.theme}`);
              }}>Theme</mui-button>
            </div>
            <mui-content-tree
              .items=${this.treeItems}
              .active=${this.activeTree}
              .expanded=${this.expanded}
              @item-select=${(event: CustomEvent) => {
                this.activeTree = event.detail.id;
                this.log(`mui-content-tree item-select -> ${event.detail.id}`);
              }}
              @expanded-change=${(event: CustomEvent) => {
                this.expanded = event.detail.expanded;
                this.log(`expanded -> ${this.expanded.join(', ') || 'none'}`);
              }}
            ></mui-content-tree>
            <div class="event-log" aria-live="polite">
              ${(this.eventLog.length ? this.eventLog : ['Interact with rail, tree, pane, or shell controls.']).map((line) => html`<div>${line}</div>`)}
            </div>
          </div>
        </div>

        <div class="canvas">
          <div class="section">
            <section class="panel">
              <div class="header">
                <div>
                  <h2>mui-app-shell</h2>
                  <p>Rail, nav, content, and optional inspector slot.</p>
                </div>
                <div class="row">
                  <mui-button size="sm" variant="secondary" @click=${() => {
                    this.inspector = !this.inspector;
                    this.log(`inspector -> ${this.inspector ? 'open' : 'closed'}`);
                  }}>Toggle inspector</mui-button>
                </div>
              </div>
            </section>

            <section class="panel fill">
              <div>
                <h3>mui-split-pane</h3>
                <p>Drag the divider. Current size: ${this.paneSize}px.</p>
              </div>
              <mui-split-pane
                class="fill"
                .size=${this.paneSize}
                min="220"
                max="560"
                @resize=${(event: CustomEvent) => {
                  this.paneSize = Math.round(event.detail.size);
                  this.log(`mui-split-pane resize -> ${this.paneSize}px`);
                }}
              >
                <div slot="primary" class="pane-content">
                  <h3>Primary pane</h3>
                  <p>Selected rail: ${this.activeRail}</p>
                  <p>Selected tree item: ${this.activeTree}</p>
                </div>
                <div slot="secondary" class="pane-content">
                  <h3>Secondary pane</h3>
                  <p>This area represents the main work canvas.</p>
                  <mui-button size="sm" @click=${() => this.log('canvas action clicked')}>Canvas action</mui-button>
                </div>
              </mui-split-pane>
            </section>
          </div>
        </div>

        <aside slot="inspector" class="inspector">
          <div class="section">
            <h3>Inspector slot</h3>
            <p>Visible when mui-app-shell.inspector is true.</p>
            <mui-field label="Selected item">
              <mui-input .value=${this.activeTree}></mui-input>
            </mui-field>
          </div>
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
    activeRail: 'notebook',
    activeTree: 'page-2',
    expanded: ['board-1'],
    paneSize: 300,
    inspector: true,
    eventLog: [],
  },
};
