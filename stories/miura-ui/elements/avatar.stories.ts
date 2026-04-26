import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiAvatarStory extends MiuraElement {
  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 360px; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .section { max-width: 760px; display: grid; gap: 16px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); box-shadow: var(--mui-shadow-sm); padding: 18px; }
    .row { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
    h1, p { margin: 0; }
    p { color: var(--mui-color-text-muted); }
  `;

  template() {
    this.dataset.muiTheme = 'light';
    this.dataset.muiDensity = 'compact';
    return html`
      <div class="page">
        <section class="section">
          <h1>mui-avatar</h1>
          <p>Avatar displays initials or an image with consistent sizing.</p>
          <div class="row">
            <mui-avatar size="sm" name="Fernando Alves"></mui-avatar>
            <mui-avatar name="Miura UI"></mui-avatar>
            <mui-avatar size="lg" name="Ada Lovelace"></mui-avatar>
          </div>
        </section>
      </div>
    `;
  }
}

if (!customElements.get('mui-avatar-story')) customElements.define('mui-avatar-story', MuiAvatarStory);

const meta: Meta<MuiAvatarStory> = { title: 'Miura UI Next/Elements/Avatar', component: 'mui-avatar-story', tags: ['autodocs'] };
export default meta;
type Story = StoryObj<MuiAvatarStory>;
export const Documentation: Story = {};
