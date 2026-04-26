import '../../packages/miura-ui/src/tokens/tokens.css';
import '../../packages/miura-ui/src/elements/index';
import '../../packages/miura-ui/src/forms/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../packages/miura-element';

class MiuraUiFoundationsDemo extends MiuraElement {
  static properties = {
    theme: { type: String, default: 'light' },
    density: { type: String, default: 'compact' },
    title: { type: String, default: '' },
    enabled: { type: Boolean, default: true },
  };

  declare theme: 'light' | 'dark';
  declare density: 'compact' | 'cozy' | 'comfortable';
  declare title: string;
  declare enabled: boolean;

  static styles = css`
    :host {
      display: block;
      min-height: 520px;
      font-family: var(--mui-font-sans);
    }

    .surface {
      min-height: 520px;
      padding: 28px;
      color: var(--mui-color-text);
      background: var(--mui-color-bg);
    }

    .toolbar {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
    }

    .panel {
      max-width: 760px;
      display: grid;
      gap: 18px;
      padding: 20px;
      border: 1px solid var(--mui-color-border);
      border-radius: var(--mui-radius-lg);
      background: var(--mui-color-surface);
      box-shadow: var(--mui-shadow-sm);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
    }

    h2 {
      margin: 0;
      font-size: var(--mui-text-xl);
    }

    p {
      margin: 0;
      color: var(--mui-color-text-muted);
      font-size: var(--mui-text-md);
    }
  `;

  private setTheme(theme: 'light' | 'dark') {
    this.theme = theme;
  }

  private setDensity(density: 'compact' | 'cozy' | 'comfortable') {
    this.density = density;
  }

  template() {
    return html`
      <div class="surface" data-mui-theme=${this.theme} data-mui-density=${this.density}>
        <div class="toolbar">
          <mui-button size="sm" variant=${this.theme === 'light' ? 'primary' : 'secondary'} @click=${() => this.setTheme('light')}>Light</mui-button>
          <mui-button size="sm" variant=${this.theme === 'dark' ? 'primary' : 'secondary'} @click=${() => this.setTheme('dark')}>Dark</mui-button>
          <mui-button size="sm" variant=${this.density === 'compact' ? 'primary' : 'secondary'} @click=${() => this.setDensity('compact')}>Compact</mui-button>
          <mui-button size="sm" variant=${this.density === 'comfortable' ? 'primary' : 'secondary'} @click=${() => this.setDensity('comfortable')}>Comfortable</mui-button>
        </div>

        <section class="panel">
          <div>
            <h2>Miura UI foundations</h2>
            <p>Tokens, controls, form field composition, icon registry, states, theme, and density.</p>
          </div>

          <div class="grid">
            <mui-field label="Workspace title" help="Form controls are designed to bridge into Miura forms next.">
              <mui-input
                placeholder="Notebook, calendar, admin..."
                .value=${this.title}
                @change=${(event: CustomEvent) => this.title = event.detail.value}
              ></mui-input>
            </mui-field>

            <mui-field label="Publishing">
              <mui-switch
                .checked=${this.enabled}
                @change=${(event: CustomEvent) => this.enabled = event.detail.checked}
              >Enabled</mui-switch>
            </mui-field>
          </div>

          <div class="toolbar">
            <mui-button>
              <mui-icon slot="icon-start" name="spark"></mui-icon>
              Create workspace
            </mui-button>
            <mui-button variant="secondary">
              <mui-icon slot="icon-start" name="settings"></mui-icon>
              Configure
            </mui-button>
            <mui-button variant="ghost">Cancel</mui-button>
            <mui-button variant="danger">Delete</mui-button>
          </div>
        </section>
      </div>
    `;
  }
}

if (!customElements.get('miura-ui-foundations-demo')) {
  customElements.define('miura-ui-foundations-demo', MiuraUiFoundationsDemo);
}

const meta: Meta<MiuraUiFoundationsDemo> = {
  title: 'Miura UI Next/01. Foundations',
  component: 'miura-ui-foundations-demo',
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<MiuraUiFoundationsDemo>;

export const Foundations: Story = {
  args: {
    theme: 'light',
    density: 'compact',
    title: 'Editorial workspace',
    enabled: true,
  },
};
