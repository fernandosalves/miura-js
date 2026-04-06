import { MiuraElement, html, css, component, property } from '@miurajs/miura-element';

/**
 * Switch — toggle switch
 *
 * <mui-switch checked>Dark Mode</mui-switch>
 */
@component({ tag: 'mui-switch' })
export class MuiSwitch extends MiuraElement {
  @property({ type: Boolean, default: false, reflect: true })
  checked!: boolean;

  @property({ type: Boolean, default: false, reflect: true })
  disabled!: boolean;

  @property({ type: String, default: 'md' })
  size!: 'sm' | 'md';

  static styles: any = css`
    :host { display: inline-flex; }
    .switch-wrap { display: inline-flex; align-items: center; gap: var(--mui-space-2, 8px); cursor: pointer; user-select: none; }
    :host([disabled]) .switch-wrap { cursor: not-allowed; opacity: 0.5; }
    .track { position: relative; width: var(--_track-w, 40px); height: var(--_track-h, 22px); background: var(--mui-border-strong, #d1d5db); border-radius: var(--mui-radius-full, 999px); transition: background 100ms; flex-shrink: 0; }
    :host([size="sm"]) { --_track-w: 32px; --_track-h: 18px; }
    :host([checked]) .track { background: var(--mui-primary, #3b82f6); }
    .thumb { position: absolute; top: 2px; left: 2px; width: calc(var(--_track-h, 22px) - 4px); height: calc(var(--_track-h, 22px) - 4px); background: white; border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,0.2); transition: transform 100ms; }
    :host([checked]) .thumb { transform: translateX(calc(var(--_track-w, 40px) - var(--_track-h, 22px))); }
    .label { font-size: var(--mui-text-sm, 0.875rem); color: var(--mui-text, #1f2937); }
  `;

  private _toggle() {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.emit('change', { checked: this.checked }, { bubbles: true });
  }

  template() {
    return html`
      <div class="switch-wrap" role="switch" aria-checked="${this.checked}" tabindex="0"
        @click=${() => this._toggle()}
        @keydown=${(e: KeyboardEvent) => (e.key === ' ' || e.key === 'Enter') && this._toggle()}
      >
        <div class="track"><div class="thumb"></div></div>
        <span class="label"><slot></slot></span>
      </div>
    `;
  }
}
