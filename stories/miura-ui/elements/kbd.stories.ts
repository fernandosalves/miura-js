import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiKbdStory extends MiuraElement {
  static properties = { theme: { type: String, default: 'light' } };
  declare theme: 'light' | 'dark';

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 340px; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .section { max-width: 760px; display: grid; gap: 16px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); padding: 18px; box-shadow: var(--mui-shadow-sm); }
    .row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
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
            <h1>mui-kbd</h1>
            <mui-button size="sm" variant="secondary" @click=${() => this.theme = this.theme === 'light' ? 'dark' : 'light'}>Toggle theme</mui-button>
          </div>
          <p>Keyboard hints should be compact, scannable, and calm inside menus, command palettes, and help surfaces.</p>
          <div class="row"><span>Open command palette</span><mui-kbd>⌘</mui-kbd><mui-kbd>K</mui-kbd></div>
          <div class="row"><span>Move selection</span><mui-kbd size="sm">↑</mui-kbd><mui-kbd size="sm">↓</mui-kbd><mui-kbd size="sm">Enter</mui-kbd></div>
        </section>
      </div>
    `;
  }
}

if (!customElements.get('mui-kbd-story')) customElements.define('mui-kbd-story', MuiKbdStory);
const meta: Meta<MuiKbdStory> = { title: 'Miura UI Next/Elements/Kbd', component: 'mui-kbd-story', tags: ['autodocs'] };
export default meta;
type Story = StoryObj<MuiKbdStory>;
export const Documentation: Story = { args: { theme: 'light' } };
