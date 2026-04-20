import type { Meta, StoryObj } from '@storybook/web-components';
import {
  MiuraElement,
  component,
  css,
  debug,
  html,
} from '../../packages/miura-element';
import { createRouter } from '../../packages/miura-router';
import type { RouterInstance, RouteRenderContext } from '../../packages/miura-router';
import {
  clearDebugLayers,
  clearDiagnostics,
  clearTimelineEvents,
  enableMiuraDebugger,
} from '@miurajs/miura-debugger';

const timelineTag = 'debugger-timeline-demo';

@component({ tag: timelineTag })
@debug({
  label: 'TimelineDemo',
  color: '168, 85, 247',
  showRenderTime: true,
})
class DebuggerTimelineDemo extends MiuraElement {
  static styles = css`
    :host {
      display: block;
      font-family: 'Space Grotesk', system-ui, sans-serif;
      color: #f8fafc;
    }

    .shell {
      display: grid;
      gap: 18px;
      padding: 28px;
      border-radius: 28px;
      background:
        radial-gradient(circle at top right, rgba(45, 212, 191, 0.18), transparent 30%),
        linear-gradient(160deg, #0f172a, #111827 58%, #1e1b4b);
      box-shadow: 0 28px 90px rgba(15, 23, 42, 0.35);
    }

    h2 {
      margin: 0;
      font-size: 28px;
      letter-spacing: -0.04em;
    }

    p {
      margin: 0;
      color: rgba(226, 232, 240, 0.8);
      line-height: 1.6;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    button {
      all: unset;
      padding: 10px 16px;
      border-radius: 999px;
      cursor: pointer;
      font-weight: 700;
      font-size: 14px;
      background: linear-gradient(120deg, #8b5cf6, #06b6d4);
      color: white;
      box-shadow: 0 12px 26px rgba(6, 182, 212, 0.18);
    }

    button.secondary {
      background: rgba(255, 255, 255, 0.08);
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
    }

    .grid {
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    }

    .card {
      border-radius: 20px;
      padding: 18px;
      background: rgba(255, 255, 255, 0.06);
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
    }

    .eyebrow {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: rgba(226, 232, 240, 0.6);
      margin-bottom: 8px;
    }

    .value {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.05em;
    }
  `;

  route = this.$signal('/');
  profile = this.$resource(
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 25));
      return {
        name: this.route() === '/settings' ? 'Leona Reyes' : 'Kai Morgan',
        route: this.route(),
      };
    },
    { auto: false, key: ['story-profile'] },
  );
  form = this.$form(
    { title: '', featured: false },
    {
      validateAsync: async (values) => ({
        title: values.title.trim() ? undefined : 'Title is required',
      }),
    },
  );

  private router?: RouterInstance;

  connectedCallback(): void {
    super.connectedCallback();
    void this.setupRouter();
  }

  disconnectedCallback(): void {
    this.router?.destroy();
    super.disconnectedCallback();
  }

  private async setupRouter() {
    if (this.router) return;

    this.router = createRouter({
      routes: [
        { path: '/', component: 'timeline-home', loaders: [async () => ({ section: 'home' })] },
        { path: '/settings', component: 'timeline-settings', loaders: [async () => ({ section: 'settings' })] },
      ],
      mode: 'memory',
      render: (context: RouteRenderContext) => {
        this.route(context.route.path);
      },
    });

    this.$route(this.router);
    this.$routeData(this.router, 'section');
    await this.router.start();
    await this.profile.refresh();
  }

  openRoute = (path: string) => async () => {
    if (!this.router) return;
    await this.router.navigate(path);
    await this.profile.refresh();
  };

  submitDraft = async () => {
    this.form.set('title', this.route() === '/settings' ? 'Settings draft' : 'Homepage draft');
    await this.form.validateAsync();
    await this.form.submit(async (values) => values.title);
  };

  protected override template() {
    return html`
      <div class="shell">
        <div>
          <h2>Debugger timeline playground</h2>
          <p>
            This story exercises resource refreshes, async form validation and submission, and
            in-memory router navigation. The debugger panel should stay visible as runtime events
            accumulate, even without an active error.
          </p>
        </div>

        <div class="actions">
          <button @click=${this.openRoute('/')}>Go Home</button>
          <button @click=${this.openRoute('/settings')}>Go Settings</button>
          <button @click=${() => this.profile.refresh()}>Refresh Resource</button>
          <button class="secondary" @click=${this.submitDraft}>Validate + Submit</button>
        </div>

        <div class="grid">
          <div class="card">
            <div class="eyebrow">Current Route</div>
            <div class="value">${this.route()}</div>
          </div>
          <div class="card">
            <div class="eyebrow">Resource State</div>
            <div class="value">${this.profile.state}</div>
          </div>
          <div class="card">
            <div class="eyebrow">Draft Title</div>
            <div class="value">${this.form.values.title || 'Empty'}</div>
          </div>
        </div>

        <div class="card">
          <div class="eyebrow">Resource View</div>
          ${this.profile.view({
            idle: () => html`<p>Idle</p>`,
            pending: () => html`<p>Loading profile…</p>`,
            ok: (value) => html`<p>${value.name} on ${value.route}</p>`,
            error: (error) => html`<p>${String(error)}</p>`,
          })}
        </div>
      </div>
    `;
  }
}

const meta: Meta = {
  title: 'Miura/Debugger/02. Timeline Playground',
  tags: ['!autodocs'],
  parameters: {
    miuraDebugger: {
      enabled: true,
    },
    docs: {
      disable: true,
    },
  },
  render: () => {
    clearDiagnostics();
    clearDebugLayers();
    clearTimelineEvents();
    enableMiuraDebugger({
      overlay: true,
      layers: true,
      performance: true,
      openOnError: true,
      openOnTimeline: true,
    });
    return document.createElement(timelineTag);
  },
};

export default meta;

type Story = StoryObj;

export const Playground: Story = {};
