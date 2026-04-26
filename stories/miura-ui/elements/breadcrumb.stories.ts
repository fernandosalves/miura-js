import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiBreadcrumbStory extends MiuraElement {
  static properties = {
    selected: { type: String, default: 'None yet' },
  };

  declare selected: string;

  private items = [
    { id: 'home', label: 'Workspace' },
    { id: 'notebook', label: 'Notebook' },
    { id: 'board', label: 'Design system' },
    { id: 'page', label: 'Tabs' },
  ];

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 360px; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .docs { max-width: 760px; display: grid; gap: 18px; }
    .section { display: grid; gap: 14px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); box-shadow: var(--mui-shadow-sm); padding: 18px; }
    h1, p { margin: 0; }
    p { color: var(--mui-color-text-muted); line-height: 1.5; }
  `;

  template() {
    this.dataset.muiTheme = 'light';
    this.dataset.muiDensity = 'compact';
    return html`
      <div class="page">
        <div class="docs">
          <section class="section">
            <h1>mui-breadcrumb</h1>
            <p>Breadcrumb navigation for nested workspace locations.</p>
          </section>
          <section class="section">
            <mui-breadcrumb .items=${this.items} @item-select=${(event: CustomEvent) => this.selected = event.detail.label}></mui-breadcrumb>
            <p>Clicked: ${this.selected}</p>
          </section>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('mui-breadcrumb-story')) customElements.define('mui-breadcrumb-story', MuiBreadcrumbStory);

const meta: Meta<MuiBreadcrumbStory> = {
  title: 'Miura UI Next/Elements/Breadcrumb',
  component: 'mui-breadcrumb-story',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<MuiBreadcrumbStory>;
export const Documentation: Story = { args: { selected: 'None yet' } };
