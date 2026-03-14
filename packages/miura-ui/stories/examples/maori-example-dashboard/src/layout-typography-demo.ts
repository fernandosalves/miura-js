import { MiuraElement, html, css } from '@miura/miura-element';
import { component } from '@miura/miura-element';

@component({ tag: 'layout-typography-demo' })
export class LayoutTypographyDemo extends MiuraElement {
  linkClicked = false;

  static get styles() {
    return css`
      .row { display: flex; gap: 1em; margin-bottom: 1em; align-items: center; }
      .value { font-size: 0.95em; color: #888; }
    `;
  }

  private handleLink = (e: Event) => {
    e.preventDefault();
    this.linkClicked = true;
    this.requestUpdate();
  };

  template() {
    return html`
      <section>
        <h2>🎨 Layout & Typography</h2>
        <mui-stack direction="row" gap="1em">
          <mui-heading level="4">Stack</mui-heading>
          <mui-spacer size="2em"></mui-spacer>
          <mui-heading level="4">Spacer</mui-heading>
        </mui-stack>
        <mui-grid columns="3" gap="1em">
          <mui-container>Grid 1</mui-container>
          <mui-container>Grid 2</mui-container>
          <mui-container>Grid 3</mui-container>
        </mui-grid>
        <div class="row">
          <mui-link href="/about" @click=${this.handleLink}>About</mui-link>
          <span class="value">${this.linkClicked ? 'Link clicked!' : ''}</span>
        </div>
        <mui-text variant="caption">Caption text</mui-text>
        <mui-text variant="overline">Overline text</mui-text>
        <mui-text variant="subtitle">Subtitle text</mui-text>
      </section>
    `;
  }
} 