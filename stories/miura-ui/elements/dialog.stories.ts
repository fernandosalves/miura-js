import '../../../packages/miura-ui/src/tokens/tokens.css';
import '../../../packages/miura-ui/src/elements/index';
import '../../../packages/miura-ui/src/forms/index';
import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css } from '../../../packages/miura-element';

class MuiDialogStory extends MiuraElement {
  static properties = {
    open: { type: Boolean, default: false },
    closes: { type: Number, default: 0 },
    lastReason: { type: String, default: 'None yet' },
  };

  declare open: boolean;
  declare closes: number;
  declare lastReason: string;

  static styles = css`
    :host { display: block; font-family: var(--mui-font-sans); }
    .page { min-height: 580px; padding: 28px; background: var(--mui-color-bg); color: var(--mui-color-text); }
    .docs { max-width: 800px; display: grid; gap: 18px; }
    .section { display: grid; gap: 14px; border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-lg); background: var(--mui-color-surface); box-shadow: var(--mui-shadow-sm); padding: 18px; }
    .row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    h1, h2, p { margin: 0; }
    p { color: var(--mui-color-text-muted); line-height: 1.5; }
    .state { border: 1px solid var(--mui-color-border); border-radius: var(--mui-radius-md); background: var(--mui-color-surface-muted); padding: 10px; }
  `;

  private handleOpenChange(event: CustomEvent) {
    this.open = event.detail.open;
    if (!event.detail.open) {
      this.closes++;
      this.lastReason = event.detail.reason ?? 'unknown';
    }
  }

  private closeFromAction() {
    this.open = false;
    this.closes++;
    this.lastReason = 'action';
  }

  template() {
    this.dataset.muiTheme = "light";
    this.dataset.muiDensity = "compact";

    return html`
      <div class="page" data-mui-theme="light" data-mui-density="compact">
        <div class="docs">
          <section class="section">
            <h1>mui-dialog</h1>
            <p>Dialog provides a modal surface with backdrop click close, Escape close, header/body/footer slots, and open-change events.</p>
          </section>
          <section class="section">
            <h2>Example</h2>
            <div class="row">
              <mui-button @click=${() => this.open = true}>Open dialog</mui-button>
              <mui-button variant="secondary" @click=${() => this.open = false}>Force close</mui-button>
            </div>
            <div class="state">open=${String(this.open)} closes=${this.closes} lastReason=${this.lastReason}</div>
          </section>
        </div>
        <mui-dialog
          .open=${this.open}
          heading="Publish workspace"
          description="Confirm the visible state before publishing."
          @open-change=${(event: CustomEvent) => this.handleOpenChange(event)}
        >
          <mui-field label="Release name" help="This uses normal Miura UI form controls inside the dialog.">
            <mui-input value="Miura UI Next"></mui-input>
          </mui-field>
          <mui-button slot="footer" variant="ghost" @click=${() => this.open = false}>Cancel</mui-button>
          <mui-button slot="footer" @click=${() => this.closeFromAction()}>Publish</mui-button>
        </mui-dialog>
      </div>
    `;
  }
}

if (!customElements.get('mui-dialog-story')) customElements.define('mui-dialog-story', MuiDialogStory);

const meta: Meta<MuiDialogStory> = {
  title: 'Miura UI Next/Elements/Dialog',
  component: 'mui-dialog-story',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<MuiDialogStory>;

export const Documentation: Story = {
  args: { open: false, closes: 0, lastReason: 'None yet' },
};
