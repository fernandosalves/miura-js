import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiCodeStory extends MiuraElement {
  static properties = { theme: { type: String, default: 'light' } };
  declare theme: 'light' | 'dark';

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 420px; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .section { max-width: 860px; display: grid; gap: 16px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); padding: 18px; box-shadow: var(--mui-shadow-sm); }
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
            <h1>mui-code</h1>
            <mui-button size="sm" variant="secondary" @click=${() => this.theme = this.theme === 'light' ? 'dark' : 'light'}>Toggle theme</mui-button>
          </div>
          <p>Inline code and code blocks keep implementation docs visually aligned with the design system.</p>
          <p>Use <mui-code>variant="secondary"</mui-code> for quiet actions and <mui-code tone="accent">data-mui-theme</mui-code> for token scopes.</p>
          <mui-code block>import '@miurajs/miura-ui/elements';

const button = document.querySelector('mui-button');
button?.addEventListener('click', () => saveWorkspace());</mui-code>
        </section>
      </div>
    `;
  }
}

if (!customElements.get('mui-code-story')) customElements.define('mui-code-story', MuiCodeStory);
const meta: Meta<MuiCodeStory> = { title: 'Miura UI Next/Elements/Code', component: 'mui-code-story', tags: ['autodocs'] };
export default meta;
type Story = StoryObj<MuiCodeStory>;
export const Documentation: Story = { args: { theme: 'light' } };
