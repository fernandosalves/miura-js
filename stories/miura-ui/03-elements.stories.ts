import '../../packages/miura-ui/src/tokens/tokens.css';
import '../../packages/miura-ui/src/elements/index';
import '../../packages/miura-ui/src/forms/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../packages/miura-element';

class MiuraUiElementsDemo extends MiuraElement {
  static properties = {
    theme: { type: String, default: 'light' },
    density: { type: String, default: 'compact' },
    inputValue: { type: String, default: 'Miura workspace' },
    enabled: { type: Boolean, default: true },
    loading: { type: Boolean, default: false },
    eventLog: { type: Array, default: () => [] },
  };

  declare theme: 'light' | 'dark';
  declare density: 'compact' | 'cozy' | 'comfortable';
  declare inputValue: string;
  declare enabled: boolean;
  declare loading: boolean;
  declare eventLog: string[];

  static styles = css`
    :host {
      display: block;
      font-family: var(--mui-font-sans);
    }

    .surface {
      min-height: 720px;
      padding: 24px;
      background: var(--mui-color-bg);
      color: var(--mui-color-text);
    }

    .header,
    .row {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .header {
      justify-content: space-between;
      margin-bottom: 18px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }

    .panel {
      display: grid;
      gap: 14px;
      padding: 16px;
      border: 1px solid var(--mui-color-border);
      border-radius: var(--mui-radius-lg);
      background: var(--mui-color-surface);
      box-shadow: var(--mui-shadow-sm);
    }

    h2,
    h3 {
      margin: 0;
    }

    h2 {
      font-size: var(--mui-text-xl);
    }

    h3 {
      font-size: var(--mui-text-lg);
    }

    p {
      margin: 0;
      color: var(--mui-color-text-muted);
      font-size: var(--mui-text-sm);
    }

    .icon-grid {
      display: grid;
      grid-template-columns: repeat(8, 40px);
      gap: 8px;
    }

    .icon-cell {
      height: 40px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--mui-color-border);
      border-radius: var(--mui-radius-md);
      background: var(--mui-color-surface-muted);
      color: var(--mui-color-text-muted);
    }

    .event-log {
      display: grid;
      gap: 6px;
      min-height: 86px;
      padding: 10px;
      border: 1px solid var(--mui-color-border);
      border-radius: var(--mui-radius-md);
      background: var(--mui-color-surface-muted);
    }

    .event-log div {
      font-family: var(--mui-font-mono);
      font-size: var(--mui-text-xs);
      color: var(--mui-color-text-muted);
    }
  `;

  private log(message: string) {
    this.eventLog = [`${new Date().toLocaleTimeString()} ${message}`, ...this.eventLog].slice(0, 6);
  }

  private runLoadingAction() {
    this.loading = true;
    this.log('primary button loading');
    window.setTimeout(() => {
      this.loading = false;
      this.log('primary button resolved');
    }, 800);
  }

  template() {
    this.dataset.muiTheme = this.theme;
    this.dataset.muiDensity = this.density;

    const icons = ['menu', 'search', 'panel-left', 'chevron-left', 'chevron-right', 'plus', 'folder', 'file', 'settings', 'calendar', 'columns', 'spark'];

    return html`
      <div class="surface" data-mui-theme=${this.theme} data-mui-density=${this.density}>
        <div class="header">
          <div>
            <h2>Elements</h2>
            <p>Focused playground for the current base elements and form field wrapper.</p>
          </div>
          <div class="row">
            <mui-button size="sm" variant=${this.theme === 'light' ? 'primary' : 'secondary'} @click=${() => {
              this.theme = 'light';
              this.log('theme -> light');
            }}>Light</mui-button>
            <mui-button size="sm" variant=${this.theme === 'dark' ? 'primary' : 'secondary'} @click=${() => {
              this.theme = 'dark';
              this.log('theme -> dark');
            }}>Dark</mui-button>
            <mui-button size="sm" variant=${this.density === 'compact' ? 'primary' : 'secondary'} @click=${() => {
              this.density = 'compact';
              this.log('density -> compact');
            }}>Compact</mui-button>
            <mui-button size="sm" variant=${this.density === 'comfortable' ? 'primary' : 'secondary'} @click=${() => {
              this.density = 'comfortable';
              this.log('density -> comfortable');
            }}>Comfortable</mui-button>
          </div>
        </div>

        <div class="grid">
          <section class="panel">
            <h3>mui-button</h3>
            <p>Variants, sizes, icon slots, loading, disabled, and block layout.</p>
            <div class="row">
              <mui-button .loading=${this.loading} @click=${() => this.runLoadingAction()}>
                <mui-icon slot="icon-start" name="spark"></mui-icon>
                Primary
              </mui-button>
              <mui-button variant="secondary" @click=${() => this.log('secondary button clicked')}>Secondary</mui-button>
              <mui-button variant="ghost" @click=${() => this.log('ghost button clicked')}>Ghost</mui-button>
              <mui-button variant="danger" @click=${() => this.log('danger button clicked')}>Danger</mui-button>
            </div>
            <div class="row">
              <mui-button size="sm">Small</mui-button>
              <mui-button size="md">Medium</mui-button>
              <mui-button size="lg">Large</mui-button>
              <mui-button disabled>Disabled</mui-button>
            </div>
            <mui-button block variant="secondary">Block button</mui-button>
          </section>

          <section class="panel">
            <h3>mui-input + mui-field</h3>
            <p>Value, invalid state, help text, error text, and bubbling change events.</p>
            <mui-field label="Workspace name" help="Type here and watch the event log.">
              <mui-input
                .value=${this.inputValue}
                placeholder="Workspace name"
                @change=${(event: CustomEvent) => {
                  this.inputValue = event.detail.value;
                  this.log(`input -> ${this.inputValue || '(empty)'}`);
                }}
              ></mui-input>
            </mui-field>
            <mui-field label="Invalid field" error="This field shows the error state.">
              <mui-input invalid value="Broken state"></mui-input>
            </mui-field>
          </section>

          <section class="panel">
            <h3>mui-switch</h3>
            <p>Switch state updates the label and emits composed change events.</p>
            <div class="row">
              <mui-switch
                .checked=${this.enabled}
                @change=${(event: CustomEvent) => {
                  this.enabled = event.detail.checked;
                  this.log(`switch -> ${this.enabled ? 'on' : 'off'}`);
                }}
              >${this.enabled ? 'Enabled' : 'Disabled'}</mui-switch>
              <mui-switch checked disabled>Locked on</mui-switch>
              <mui-switch disabled>Locked off</mui-switch>
            </div>
          </section>

          <section class="panel">
            <h3>mui-icon</h3>
            <p>Registry-backed SVG icon element using the nano base.</p>
            <div class="icon-grid">
              ${icons.map((icon) => html`
                <button class="icon-cell" title=${icon} @click=${() => this.log(`icon -> ${icon}`)}>
                  <mui-icon name=${icon} size="20"></mui-icon>
                </button>
              `)}
            </div>
          </section>

          <section class="panel">
            <h3>Event log</h3>
            <p>Every control here should visibly do something.</p>
            <div class="event-log" aria-live="polite">
              ${(this.eventLog.length ? this.eventLog : ['Interact with any element to populate this log.']).map((line) => html`<div>${line}</div>`)}
            </div>
          </section>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('miura-ui-elements-demo')) {
  customElements.define('miura-ui-elements-demo', MiuraUiElementsDemo);
}

const meta: Meta<MiuraUiElementsDemo> = {
  title: 'Miura UI Next/03. Elements',
  component: 'miura-ui-elements-demo',
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<MiuraUiElementsDemo>;

export const AllElements: Story = {
  args: {
    theme: 'light',
    density: 'compact',
    inputValue: 'Miura workspace',
    enabled: true,
    loading: false,
    eventLog: [],
  },
};
