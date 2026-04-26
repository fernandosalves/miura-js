import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import '../../../packages/miura-ui/src/forms/index';
import '../../../packages/miura-ui/src/workspace/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiAppShellStory extends MiuraElement {
  static properties = {
    inspector: { type: Boolean, default: true },
    theme: { type: String, default: 'light' },
  };

  declare inspector: boolean;
  declare theme: 'light' | 'dark';

  static styles = css`
    :host { display: block; height: 680px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); overflow: hidden; font-family: var(--mui-font-sans); }
    .rail { width: var(--mui-rail-width); height: 100%; display: grid; place-items: center; background: var(--mui-color-surface-muted); border-right: 1px solid var(--mui-color-border); color: var(--mui-color-accent); }
    .nav, .inspector { height: 100%; box-sizing: border-box; padding: 16px; background: var(--mui-color-surface); }
    .content { height: 100%; box-sizing: border-box; padding: 22px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .panel { display: grid; gap: 12px; padding: 16px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); box-shadow: var(--mui-shadow-sm); }
    h1, h2, p { margin: 0; }
    p { color: var(--mui-color-text-muted); line-height: 1.5; }
  `;

  template() {
    this.dataset.muiTheme = this.theme;
    this.dataset.muiDensity = "compact";

    return html`
      <mui-app-shell data-mui-theme=${this.theme} data-mui-density="compact" .inspector=${this.inspector}>
        <div slot="rail" class="rail"><mui-icon name="spark" size="24"></mui-icon></div>
        <div slot="nav" class="nav">
          <h2>Navigation</h2>
          <p>Secondary navigation slot.</p>
        </div>
        <main class="content">
          <section class="panel">
            <h1>mui-app-shell</h1>
            <p>Four-zone application shell: rail, nav, content, and optional inspector.</p>
            <mui-button @click=${() => this.inspector = !this.inspector}>Toggle inspector</mui-button>
            <mui-button variant="secondary" @click=${() => this.theme = this.theme === 'light' ? 'dark' : 'light'}>Toggle theme</mui-button>
          </section>
        </main>
        <aside slot="inspector" class="inspector">
          <h2>Inspector</h2>
          <p>Contextual details slot.</p>
        </aside>
      </mui-app-shell>
    `;
  }
}

if (!customElements.get('mui-app-shell-story')) customElements.define('mui-app-shell-story', MuiAppShellStory);

const meta: Meta<MuiAppShellStory> = {
  title: 'Miura UI Next/Workspace/App Shell',
  component: 'mui-app-shell-story',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<MuiAppShellStory>;

export const Documentation: Story = {
  args: { inspector: true, theme: 'light' },
};
