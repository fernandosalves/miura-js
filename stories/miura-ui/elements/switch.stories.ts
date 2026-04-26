import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiSwitchStory extends MiuraElement {
  static properties = {
    enabled: { type: Boolean, default: true },
    compact: { type: Boolean, default: false },
    changes: { type: Number, default: 0 },
  };

  declare enabled: boolean;
  declare compact: boolean;
  declare changes: number;

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 520px; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .docs { max-width: 760px; display: grid; gap: 18px; }
    .section { display: grid; gap: 14px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); box-shadow: var(--mui-shadow-sm); padding: 18px; }
    .row { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; }
    h1, h2, p { margin: 0; }
    p { color: var(--mui-color-text-muted); line-height: 1.5; }
    .state { border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-md); background: var(--mui-color-surface-muted); padding: 10px; }
  `;

  private updateEnabled(event: CustomEvent) {
    this.enabled = event.detail.checked;
    this.changes++;
  }

  template() {
    this.dataset.muiTheme = "light";
    this.dataset.muiDensity = this.compact ? "compact" : "comfortable";

    return html`
      <div class="page" data-mui-theme="light" data-mui-density=${this.compact ? 'compact' : 'comfortable'}>
        <div class="docs">
          <section class="section">
            <h1>mui-switch</h1>
            <p>Use switches for immediate binary settings. It renders with role=switch and emits composed change events.</p>
          </section>
          <section class="section">
            <h2>Examples</h2>
            <div class="row">
              <mui-switch .checked=${this.enabled} @change=${(event: CustomEvent) => this.updateEnabled(event)}>
                ${this.enabled ? 'Publishing enabled' : 'Publishing disabled'}
              </mui-switch>
              <mui-switch checked disabled>Locked on</mui-switch>
              <mui-switch disabled>Locked off</mui-switch>
            </div>
          </section>
          <section class="section">
            <h2>Density</h2>
            <mui-switch .checked=${this.compact} @change=${(event: CustomEvent) => this.compact = event.detail.checked}>Compact density</mui-switch>
          </section>
          <section class="section">
            <h2>State</h2>
            <div class="state">enabled=${String(this.enabled)} changes=${this.changes}</div>
          </section>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('mui-switch-story')) customElements.define('mui-switch-story', MuiSwitchStory);

const meta: Meta<MuiSwitchStory> = {
  title: 'Miura UI Next/Elements/Switch',
  component: 'mui-switch-story',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<MuiSwitchStory>;

export const Documentation: Story = {
  args: { enabled: true, compact: false, changes: 0 },
};
