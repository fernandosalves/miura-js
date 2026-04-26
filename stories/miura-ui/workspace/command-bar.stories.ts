import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import '../../../packages/miura-ui/src/workspace/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiCommandBarStory extends MiuraElement {
  static properties = {
    theme: { type: String, default: 'light' },
    lastAction: { type: String, default: 'None yet' },
  };

  declare theme: 'light' | 'dark';
  declare lastAction: string;

  private actions = [
    { id: 'new', label: 'New', icon: 'plus', variant: 'primary' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar' },
    { id: 'board', label: 'Board', icon: 'columns' },
    { id: 'archive', label: 'Archive', variant: 'ghost' },
  ];

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 380px; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .docs { display: grid; gap: 18px; max-width: 980px; }
    .section { display: grid; gap: 14px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); padding: 18px; box-shadow: var(--mui-shadow-sm); }
    .row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    h1, p { margin: 0; }
    p { color: var(--mui-color-text-muted); line-height: 1.5; }
  `;

  template() {
    this.dataset.muiTheme = this.theme;
    this.dataset.muiDensity = 'compact';
    return html`
      <div class="page">
        <div class="docs">
          <section class="section">
            <div class="row">
              <h1>mui-command-bar</h1>
              <mui-button size="sm" variant="secondary" @click=${() => this.theme = this.theme === 'light' ? 'dark' : 'light'}>Toggle theme</mui-button>
            </div>
            <p>Command bar anchors workspace actions without turning the page into a marketing header.</p>
            <p>Last action: ${this.lastAction}</p>
          </section>
          <mui-command-bar
            title="Design system workspace"
            subtitle="Miura UI surfaces, docs, and implementation board"
            .actions=${this.actions}
            @action=${(event: CustomEvent) => this.lastAction = event.detail.action.id}
          >
            <mui-icon slot="icon" name="spark"></mui-icon>
          </mui-command-bar>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('mui-command-bar-story')) customElements.define('mui-command-bar-story', MuiCommandBarStory);
const meta: Meta<MuiCommandBarStory> = { title: 'Miura UI Next/Workspace/Command Bar', component: 'mui-command-bar-story', tags: ['autodocs'] };
export default meta;
type Story = StoryObj<MuiCommandBarStory>;
export const Documentation: Story = { args: { theme: 'light', lastAction: 'None yet' } };
