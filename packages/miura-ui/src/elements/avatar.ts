import { MiuraElement, css, html } from '@miurajs/miura-element';

export class MuiAvatar extends MiuraElement {
  static properties = {
    name: { type: String, default: '' },
    src: { type: String, default: '' },
    size: { type: String, default: 'md', reflect: true },
  };

  declare name: string;
  declare src: string;
  declare size: 'sm' | 'md' | 'lg';

  static styles = css`
    :host {
      display: inline-flex;
      --_size: 32px;
      width: var(--_size);
      height: var(--_size);
      border-radius: var(--mui-radius-pill);
      overflow: hidden;
      background: var(--mui-color-accent-muted);
      color: var(--mui-color-accent);
      font-family: var(--mui-font-sans);
      font-size: var(--mui-text-sm);
      font-weight: var(--mui-weight-semibold);
      vertical-align: middle;
    }

    :host([size="sm"]) { --_size: 24px; font-size: var(--mui-text-xs); }
    :host([size="lg"]) { --_size: 44px; font-size: var(--mui-text-lg); }

    .avatar,
    img {
      width: 100%;
      height: 100%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    img {
      object-fit: cover;
    }
  `;

  private get initials(): string {
    return (this.name || '?')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }

  template() {
    return html`
      <span class="avatar" part="avatar" aria-label=${this.name || 'Avatar'}>
        ${this.src ? html`<img part="image" src=${this.src} alt=${this.name} />` : this.initials}
      </span>
    `;
  }
}

if (!customElements.get('mui-avatar')) {
  customElements.define('mui-avatar', MuiAvatar);
}
