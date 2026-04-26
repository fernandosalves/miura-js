import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiTabsStory extends MiuraElement {
  static properties = {
    active: { type: String, default: 'overview' },
    changes: { type: Number, default: 0 },
  };

  declare active: string;
  declare changes: number;

  private items = [
    { id: 'overview', label: 'Overview' },
    { id: 'activity', label: 'Activity' },
    { id: 'settings', label: 'Settings' },
    { id: 'disabled', label: 'Disabled', disabled: true },
  ];

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 520px; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .docs { max-width: 820px; display: grid; gap: 18px; }
    .section { display: grid; gap: 14px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); box-shadow: var(--mui-shadow-sm); padding: 18px; }
    h1, h2, p { margin: 0; }
    p { color: var(--mui-color-text-muted); line-height: 1.5; }
    .panel { border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-md); background: var(--mui-color-surface-muted); padding: 14px; }
  `;

  template() {
    this.dataset.muiTheme = 'light';
    this.dataset.muiDensity = 'compact';

    return html`
      <div class="page">
        <div class="docs">
          <section class="section">
            <h1>mui-tabs</h1>
            <p>Tabs switch between related views. Supports keyboard navigation with arrow keys, Home, and End.</p>
          </section>
          <section class="section">
            <mui-tabs .items=${this.items} .active=${this.active} @change=${(event: CustomEvent) => {
              this.active = event.detail.active;
              this.changes++;
            }}>
              <div class="panel">
                <h2>${this.active}</h2>
                <p>Active tab is ${this.active}. Changes: ${this.changes}.</p>
              </div>
            </mui-tabs>
          </section>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('mui-tabs-story')) customElements.define('mui-tabs-story', MuiTabsStory);

const meta: Meta<MuiTabsStory> = {
  title: 'Miura UI Next/Elements/Tabs',
  component: 'mui-tabs-story',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<MuiTabsStory>;
export const Documentation: Story = { args: { active: 'overview', changes: 0 } };
