import { MiuraElement, html, css, repeat, component } from '@miurajs/miura-element';
import '../../src/layout/draggable';

@component({ tag: 'miura-draggable-repeat-repro' })
class MiuraDraggableRepeatRepro extends MiuraElement {
  static styles = css`
    :host {
      display: block;
      padding: 16px;
      background: #f8fafc;
    }

    .stack {
      display: grid;
      gap: 12px;
      max-width: 360px;
    }

    .card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      background: white;
    }

    .handle {
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      border-radius: 8px;
      padding: 4px 8px;
      cursor: grab;
      font: inherit;
      font-size: 12px;
      font-weight: 700;
    }

    .meta {
      display: grid;
      gap: 2px;
    }

    .title {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
    }

    .copy {
      font-size: 12px;
      color: #64748b;
    }
  `;

  private items = [
    { id: 'story-a', title: 'Scheduled Story', copy: 'Repeated item with handle-based drag' },
    { id: 'story-b', title: 'Another Story', copy: 'Matches the calendar chip structure more closely' },
    { id: 'story-c', title: 'Third Story', copy: 'Useful for repeated-content pointer debugging' },
  ];

  template() {
    return html`
      <div class="stack">
        ${repeat(
          this.items,
          (item) => item.id,
          (item) => html`
            <mui-draggable handle=".handle" style="display:block;">
              <div class="card">
                <button class="handle">Move</button>
                <div class="meta">
                  <div class="title">${item.title}</div>
                  <div class="copy">${item.copy}</div>
                </div>
              </div>
            </mui-draggable>
          `
        )}
      </div>
    `;
  }
}

export default {
  title: 'miura-ui/Layout/Draggable',
  component: 'mui-draggable',
};

export const Default = {
  render: () => `
    <mui-draggable style="width:150px;">
      <div>Drag me!</div>
    </mui-draggable>
  `
};

export const HandleDriven = {
  render: () => `
    <div style="display:grid; gap:12px; max-width:320px;">
      <mui-draggable handle=".handle" style="display:block;">
        <div style="display:flex; align-items:center; gap:12px; padding:12px; border-radius:12px; background:white; border:1px solid #e2e8f0;">
          <button class="handle" style="border:1px solid #cbd5e1; background:#f8fafc; border-radius:8px; padding:4px 8px; cursor:grab;">Move</button>
          <div style="display:grid; gap:2px;">
            <strong style="font-size:14px;">Scheduled Story</strong>
            <span style="font-size:12px; color:#64748b;">Drag from the handle only</span>
          </div>
        </div>
      </mui-draggable>
      <mui-draggable handle=".handle" style="display:block;">
        <div style="display:flex; align-items:center; gap:12px; padding:12px; border-radius:12px; background:white; border:1px solid #e2e8f0;">
          <button class="handle" style="border:1px solid #cbd5e1; background:#f8fafc; border-radius:8px; padding:4px 8px; cursor:grab;">Move</button>
          <div style="display:grid; gap:2px;">
            <strong style="font-size:14px;">Another Story</strong>
            <span style="font-size:12px; color:#64748b;">Matches the calendar handle pattern</span>
          </div>
        </div>
      </mui-draggable>
    </div>
  `
};

export const RepeatedHandleRepro = {
  render: () => `<miura-draggable-repeat-repro></miura-draggable-repeat-repro>`
};
