import { MiuraElement, html, css, component, property, state } from '@miurajs/miura-element';

/**
 * Calendar Event — interactive event block
 */
@component({ tag: 'mui-calendar-event' })
export class MuiCalendarEvent extends MiuraElement {
  @property({ type: String, default: '' })
  title = '';

  @property({ type: String, default: 'primary' })
  color: 'primary' | 'success' | 'warning' | 'error' | 'default' = 'primary';

  @property({ type: Boolean, default: false })
  resizable = false;

  @state({ default: false })
  private _dragging = false;

  static styles: any = css`
    :host { display: block; margin-bottom: 2px; position: relative; }
    .event { 
      font-size: 11px; 
      padding: 2px 6px; 
      border-radius: 4px; 
      background: var(--_bg, #eff6ff); 
      color: var(--_text, #2563eb); 
      border-left: 3px solid var(--_border, #3b82f6);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: grab;
      user-select: none;
      transition: box-shadow 150ms;
    }
    .event:active { cursor: grabbing; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .event:hover { filter: brightness(0.98); }

    :host([color="success"]) { --_bg: #f0fdf4; --_text: #166534; --_border: #22c55e; }
    :host([color="warning"]) { --_bg: #fffbeb; --_text: #92400e; --_border: #f59e0b; }
    :host([color="error"]) { --_bg: #fef2f2; --_text: #991b1b; --_border: #ef4444; }
    :host([color="default"]) { --_bg: #f9fafb; --_text: #4b5563; --_border: #9ca3af; }

    .resize-handle { 
      position: absolute; 
      top: 0; 
      right: 0; 
      bottom: 0; 
      width: 6px; 
      cursor: ew-resize; 
      opacity: 0;
      background: rgba(0,0,0,0.1);
      border-radius: 0 4px 4px 0;
      transition: opacity 150ms;
    }
    :host(:hover) .resize-handle { opacity: 1; }
  `;

  private _onDragStart(e: DragEvent) {
    e.dataTransfer?.setData('application/json', JSON.stringify({ title: this.title }));
    e.dataTransfer!.effectAllowed = 'move';
  }

  template() {
    return html`
      <div 
        class="event" 
        draggable="true" 
        @dragstart=${(e: DragEvent) => this._onDragStart(e)}
      >
        <slot>${this.title}</slot>
        ${this.resizable ? html`<div class="resize-handle" @mousedown=${(e: any) => this.emit('resize-start', { originalEvent: e })}></div>` : ''}
      </div>
    `;
  }
}
