import { MiuraElement, html, css } from '@miura/miura-element';
import { component } from '@miura/miura-element';
import './primitives-demo';
import './user-table';
import './overlay-demo';
import './navigation-demo';
import './form-demo';
import './layout-typography-demo';

@component({ tag: 'miura-example-dashboard' })
export class miuraExampleDashboard extends MiuraElement {
  theme: 'light' | 'dark' = 'light';

  static get styles() {
    return css`
      :host {
        --dashboard-bg: var(--mui-bg, #fafbfc);
        --dashboard-container-bg: var(--mui-surface, #fff);
        --dashboard-radius: var(--mui-radius, 12px);
        --dashboard-shadow: 0 2px 8px rgba(0,0,0,0.04);
        --dashboard-divider: #e5e7eb;
        --dashboard-heading: #1a202c;
        --dashboard-subtitle: #4b5563;
        --dashboard-gap: 2em;
        display: block;
        background: var(--dashboard-bg);
        min-height: 100vh;
        color: var(--dashboard-heading);
        font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
        transition: background 0.3s;
      }
      :host([theme="dark"]) {
        --dashboard-bg: #181a1b;
        --dashboard-container-bg: #23272e;
        --dashboard-heading: #f3f4f6;
        --dashboard-subtitle: #a1a1aa;
        --dashboard-divider: #33353b;
      }
      .dashboard-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: var(--dashboard-container-bg);
        box-shadow: var(--dashboard-shadow);
        padding: 1em 2em;
        position: sticky;
        top: 0;
        z-index: 100;
        border-radius: 0 0 12px 12px;
        margin-bottom: 2em;
      }
      .logo {
        font-size: 1.5em;
        font-weight: bold;
        letter-spacing: 0.05em;
        display: flex;
        align-items: center;
        gap: 0.5em;
      }
      .theme-toggle {
        background: none;
        border: none;
        font-size: 1.5em;
        cursor: pointer;
        color: var(--dashboard-heading);
        transition: color 0.2s;
      }
      .dashboard-main {
        display: flex;
        justify-content: center;
        width: 100%;
      }
      .dashboard-content {
        width: 100%;
        max-width: 900px;
        background: var(--dashboard-container-bg);
        border-radius: var(--dashboard-radius);
        box-shadow: var(--dashboard-shadow);
        padding: 2em;
        margin: 0 auto;
        display: block;
      }
      @media (max-width: 700px) {
        .dashboard-content {
          padding: 1em;
        }
        .dashboard-header {
          padding: 1em;
        }
      }
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('theme', this.theme);
  }

  private toggleTheme = () => {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.setAttribute('theme', this.theme);
  };

  protected override template() {
    return html`
      <header class="dashboard-header">
        <span class="logo">🌺 miura UI</span>
        <button class="theme-toggle" @click=${this.toggleTheme}>
          ${this.theme === 'light' ? '🌙' : '☀️'}
        </button>
      </header>
      <main class="dashboard-main">
        <div class="dashboard-content">
          <primitives-demo></primitives-demo>
          <user-table></user-table>
          <overlay-demo></overlay-demo>
          <navigation-demo></navigation-demo>
          <form-demo></form-demo>
          <layout-typography-demo></layout-typography-demo>
        </div>
      </main>
    `;
  }
} 