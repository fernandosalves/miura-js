import type { Meta, StoryObj } from '@storybook/web-components';
import {
  MiuraElement,
  component,
  css,
  debug,
  html,
} from '@miurajs/miura-element';
import {
  clearDebugLayers,
  clearDiagnostics,
  clearTimelineEvents,
  enableMiuraDebugger,
} from '@miurajs/miura-debugger';

const overlayTag = 'debugger-overlay-demo';

@component({ tag: overlayTag })
@debug({
  label: 'OverlayDemo',
  color: '34, 197, 94',
  showRenderTime: true,
})
class DebuggerOverlayDemo extends MiuraElement {
  static properties = {
    title: { type: String, default: 'Miura debugger overlay' },
    count: { type: Number, default: 0 },
    shouldThrow: { type: Boolean, default: false },
  };

  static styles = css`
    :host {
      display: block;
      font-family: 'Space Grotesk', system-ui, sans-serif;
      color: #0f172a;
    }

    .shell {
      display: grid;
      gap: 18px;
      padding: 28px;
      border-radius: 24px;
      background:
        radial-gradient(circle at top left, rgba(56, 189, 248, 0.25), transparent 32%),
        linear-gradient(135deg, #f8fafc, #eef2ff);
      box-shadow: 0 24px 70px rgba(15, 23, 42, 0.12);
    }

    h2 {
      margin: 0;
      font-size: 28px;
      letter-spacing: -0.04em;
    }

    p {
      margin: 0;
      color: #475569;
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
      background: #0f172a;
      color: white;
      box-shadow: 0 12px 26px rgba(15, 23, 42, 0.18);
    }

    button.secondary {
      background: white;
      color: #0f172a;
      box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.08);
    }

    .card {
      padding: 18px;
      border-radius: 18px;
      background: white;
      box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.06);
    }

    .count {
      font-size: 42px;
      font-weight: 800;
      letter-spacing: -0.05em;
    }
  `;

  declare title: string;
  declare count: number;
  declare shouldThrow: boolean;

  bump = () => {
    this.count += 1;
  };

  triggerError = () => {
    this.shouldThrow = true;
  };

  resetError = () => {
    this.shouldThrow = false;
    this.count = 0;
  };

  protected override onError(): boolean {
    return true;
  }

  protected override template() {
    if (this.shouldThrow) {
      throw new Error(`Unable to render "${this.title}" with count ${this.count}`);
    }

    return html`
      <div class="shell">
        <div>
          <h2>${this.title}</h2>
          <p>
            Use the buttons to trigger updates and a real render failure. The debugger overlay
            should open automatically, highlight this component, and show the semantic component
            label instead of raw internal marker ids.
          </p>
        </div>

        <div class="actions">
          <button @click=${this.bump}>Trigger Update</button>
          <button @click=${this.triggerError}>Trigger Render Error</button>
          <button class="secondary" @click=${this.resetError}>Reset Story</button>
        </div>

        <div class="card">
          <div>Component label: <strong>OverlayDemo</strong></div>
          <div class="count">${this.count}</div>
        </div>
      </div>
    `;
  }
}

const meta: Meta = {
  title: 'Miura/Debugger/01. Overlay And Layers',
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
      openOnTimeline: false,
    });
    return document.createElement(overlayTag);
  },
};

export default meta;

type Story = StoryObj;

export const Playground: Story = {};
