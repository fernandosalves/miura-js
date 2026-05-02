import { MiuraElement, css, html } from '@miurajs/miura-element';
import { debounce } from '../utils/filters.js';

export class MiuraArchitectToolbar extends MiuraElement {
  static properties = {
    searchTerm: { type: String, default: '' },
  };

  declare searchTerm: string;

  private emitSearch = debounce((value: string) => {
    this.emit('search', { term: value }, { bubbles: true, composed: true });
  }, 250);

  static styles = css`
    :host { display: flex; align-items: center; gap: var(--mui-space-3); }
    .search { width: 240px; }
  `;

  template() {
    return html`
      <mui-input
        class="search"
        placeholder="Search nodes..."
        .value=${this.searchTerm}
        @input=${(event: Event) => {
          const target = event.target as HTMLInputElement;
          this.emitSearch(target.value);
        }}
      ></mui-input>
    `;
  }
}

if (!customElements.get('miura-architect-toolbar')) {
  customElements.define('miura-architect-toolbar', MiuraArchitectToolbar);
}
