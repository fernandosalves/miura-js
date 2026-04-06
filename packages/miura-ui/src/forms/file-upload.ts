import { MiuraElement, html, css, component, property, state } from '@miurajs/miura-element';

/**
 * File Upload — dropzone for files
 */
@component({ tag: 'mui-file-upload' })
export class MuiFileUpload extends MiuraElement {
  @property({ type: String, default: '' })
  accept = '*';

  @property({ type: Boolean, default: false })
  multiple = false;

  @state({ default: false })
  private _dragging = false;

  static styles: any = css`
    :host { display: block; width: 100%; }
    .dropzone { 
      border: 2px dashed var(--mui-border, #e5e7eb);
      border-radius: var(--mui-radius-lg, 12px);
      padding: 32px;
      text-align: center;
      background: var(--mui-surface-subtle, #f9fafb);
      cursor: pointer;
      transition: border-color 200ms, background 200ms;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .dropzone.active { border-color: var(--mui-primary, #3b82f6); background: var(--mui-primary-subtle, rgba(59,130,246,0.04)); }
    .icon { color: var(--mui-text-secondary, #6b7280); }
    .title { font-weight: 500; font-size: 14px; color: var(--mui-text, #1f2937); }
    .subtitle { font-size: 12px; color: var(--mui-text-muted, #9ca3af); }
    input { display: none; }
  `;

  private _onClick() {
    this.shadowRoot?.querySelector('input')?.click();
  }

  private _onChange(e: any) {
    const files = Array.from(e.target.files);
    this.emit('upload', { files });
  }

  template() {
    return html`
      <div 
        class="dropzone ${this._dragging ? 'active' : ''}" 
        @click=${() => this._onClick()}
        @dragover=${(e: any) => { e.preventDefault(); this._dragging = true; }}
        @dragleave=${() => this._dragging = false}
        @drop=${(e: any) => { e.preventDefault(); this._dragging = false; this.emit('upload', { files: Array.from(e.dataTransfer.files) }); }}
      >
        <mui-icon name="upload-cloud" size="lg" class="icon"></mui-icon>
        <div class="title"><slot name="title">Click or drag to upload</slot></div>
        <div class="subtitle"><slot name="subtitle">Support for images up to 5MB</slot></div>
        <input type="file" .accept="${this.accept}" ?multiple=${this.multiple} @change=${(e: any) => this._onChange(e)}>
      </div>
    `;
  }
}
