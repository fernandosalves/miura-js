import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import '../../../packages/miura-ui/src/workspace/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiNotificationCenterStory extends MiuraElement {
  static properties = {
    theme: { type: String, default: 'light' },
    open: { type: Boolean, default: false },
    selected: { type: String, default: 'None yet' },
    items: { type: Array, default: () => [
      { id: 'n1', title: 'Build passed', description: 'miura-ui package and Storybook build finished.', time: 'now', tone: 'success' },
      { id: 'n2', title: 'Review calendar surface', description: 'Two events need final density validation.', time: '4m', tone: 'warning' },
      { id: 'n3', title: 'Node moved', description: 'Decision card moved in the canvas story.', time: '12m', read: true },
    ] },
  };

  declare theme: 'light' | 'dark';
  declare open: boolean;
  declare selected: string;
  declare items: any[];

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 420px; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .section { max-width: 780px; display: grid; gap: 16px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); padding: 18px; box-shadow: var(--mui-shadow-sm); }
    .row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    h1, p { margin: 0; }
    p { color: var(--mui-color-text-muted); line-height: 1.5; }
  `;

  template() {
    this.dataset.muiTheme = this.theme;
    this.dataset.muiDensity = 'compact';
    return html`
      <div class="page">
        <section class="section">
          <div class="row">
            <h1>mui-notification-center</h1>
            <mui-button size="sm" variant="secondary" @click=${() => this.theme = this.theme === 'light' ? 'dark' : 'light'}>Toggle theme</mui-button>
            <mui-notification-center
              .items=${this.items}
              .open=${this.open}
              @open-change=${(event: CustomEvent) => this.open = event.detail.open}
              @mark-all-read=${(event: CustomEvent) => this.items = event.detail.items}
              @notification-select=${(event: CustomEvent) => this.selected = event.detail.item.title}
            ></mui-notification-center>
          </div>
          <p>Notification center gives app chrome a consistent place for status, alerts, background jobs, and collaboration events.</p>
          <p>Selected notification: ${this.selected}</p>
        </section>
      </div>
    `;
  }
}

if (!customElements.get('mui-notification-center-story')) customElements.define('mui-notification-center-story', MuiNotificationCenterStory);
const meta: Meta<MuiNotificationCenterStory> = { title: 'Miura UI Next/Workspace/Notification Center', component: 'mui-notification-center-story', tags: ['autodocs'] };
export default meta;
type Story = StoryObj<MuiNotificationCenterStory>;
export const Documentation: Story = { args: { theme: 'light', open: false, selected: 'None yet' } };
