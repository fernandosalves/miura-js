import { MiuraElement, html, css } from '@miura/miura-element';
import { component } from '@miura/miura-element';

@component({ tag: 'primitives-demo' })
export class PrimitivesDemo extends MiuraElement {
  count = 0;
  inputValue = '';
  chipVisible = true;
  progress = 40;

  static get styles() {
    return css`
      .row { display: flex; align-items: center; gap: 1em; margin-bottom: 1em; }
      .value { font-size: 0.95em; color: #888; }
    `;
  }

  private handleInput = (e: Event) => {
    this.inputValue = (e.target as HTMLInputElement).value;
    this.requestUpdate();
  };

  private removeChip = () => {
    this.chipVisible = false;
    this.requestUpdate();
  };

  private incProgress = () => {
    this.progress = Math.min(100, this.progress + 10);
    this.requestUpdate();
  };
  private decProgress = () => {
    this.progress = Math.max(0, this.progress - 10);
    this.requestUpdate();
  };

  template() {
    return html`
      <section>
        <h2>🧩 Primitives</h2>
        <div class="row">
          <mui-button @click=${() => { this.count++; this.requestUpdate(); }}>Button (${this.count})</mui-button>
          <span class="value">Clicked: ${this.count} times</span>
        </div>
        <div class="row">
          <mui-input placeholder="Type here..." .value=${this.inputValue} @input=${this.handleInput}></mui-input>
          <span class="value">Value: ${this.inputValue}</span>
        </div>
        <div class="row">
          <mui-avatar src="https://i.pravatar.cc/40" alt="User"></mui-avatar>
          <mui-badge value="3"><mui-icon>mail</mui-icon></mui-badge>
          ${this.chipVisible ? html`<mui-chip removable @remove=${this.removeChip}>Chip</mui-chip>` : html`<mui-button @click=${() => { this.chipVisible = true; this.requestUpdate(); }}>Restore Chip</mui-button>`}
        </div>
        <div class="row">
          <mui-button @click=${this.decProgress}>-</mui-button>
          <mui-progress .value=${this.progress} max="100"></mui-progress>
          <mui-button @click=${this.incProgress}>+</mui-button>
          <span class="value">${this.progress}%</span>
        </div>
        <div class="row">
          <mui-skeleton style="width:60px;height:1em;"></mui-skeleton>
        </div>
      </section>
    `;
  }
} 