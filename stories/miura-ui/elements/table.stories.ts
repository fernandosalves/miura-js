import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiTableStory extends MiuraElement {
  static properties = { selected: { type: String, default: '1' } };
  declare selected: string;

  private columns = [
    { key: 'title', label: 'Title' },
    { key: 'status', label: 'Status' },
    { key: 'owner', label: 'Owner' },
  ];

  private rows = [
    { id: '1', title: 'Design tokens', status: 'Ready', owner: 'Fernando' },
    { id: '2', title: 'Command palette', status: 'Building', owner: 'Miura' },
    { id: '3', title: 'Canvas kit', status: 'Next', owner: 'Team' },
  ];

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 480px; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .section { max-width: 860px; display: grid; gap: 16px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); box-shadow: var(--mui-shadow-sm); padding: 18px; }
    h1, p { margin: 0; }
    p { color: var(--mui-color-text-muted); }
  `;

  template() {
    this.dataset.muiTheme = 'light';
    this.dataset.muiDensity = 'compact';
    return html`
      <div class="page">
        <section class="section">
          <h1>mui-table</h1>
          <p>Compact selectable table for operational data.</p>
          <mui-table .columns=${this.columns} .rows=${this.rows} .selected=${this.selected} @row-select=${(event: CustomEvent) => this.selected = event.detail.id}></mui-table>
          <p>Selected row: ${this.selected}</p>
        </section>
      </div>
    `;
  }
}

if (!customElements.get('mui-table-story')) customElements.define('mui-table-story', MuiTableStory);
const meta: Meta<MuiTableStory> = { title: 'Miura UI Next/Elements/Table', component: 'mui-table-story', tags: ['autodocs'] };
export default meta;
type Story = StoryObj<MuiTableStory>;
export const Documentation: Story = { args: { selected: '1' } };
