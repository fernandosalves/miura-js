import { MiuraElement, css, html } from '@miurajs/miura-element';
import './dialog.js';
import './input.js';
import './menu.js';

export class MuiCommandPalette extends MiuraElement {
  static properties = {
    open: { type: Boolean, default: false, reflect: true },
    commands: { type: Array, default: () => [] },
    query: { type: String, default: '' },
  };

  declare open: boolean;
  declare commands: Array<{ id: string; label: string; icon?: string; shortcut?: string; disabled?: boolean }>;
  declare query: string;

  static styles = css`
    :host {
      display: contents;
      font-family: var(--mui-font-sans);
    }

    .content {
      display: grid;
      gap: var(--mui-space-4);
    }
  `;

  private get filteredCommands() {
    const query = this.query.trim().toLowerCase();
    if (!query) return this.commands ?? [];
    return (this.commands ?? []).filter((command) => command.label.toLowerCase().includes(query));
  }

  private select(command: unknown): void {
    this.open = false;
    this.emit('command-select', command, { bubbles: true, composed: true });
    this.emit('open-change', { open: false }, { bubbles: true, composed: true });
  }

  template() {
    return html`
      <mui-dialog .open=${this.open} heading="Command palette" description="Search and run workspace commands." @open-change=${(event: CustomEvent) => {
        this.open = event.detail.open;
        this.emit('open-change', { open: this.open }, { bubbles: true, composed: true });
      }}>
        <div class="content">
          <mui-input placeholder="Type a command..." .value=${this.query} @input=${(event: CustomEvent) => this.query = event.detail.value}></mui-input>
          <mui-menu .items=${this.filteredCommands} @item-select=${(event: CustomEvent) => this.select(event.detail)}></mui-menu>
        </div>
      </mui-dialog>
    `;
  }
}

if (!customElements.get('mui-command-palette')) {
  customElements.define('mui-command-palette', MuiCommandPalette);
}
