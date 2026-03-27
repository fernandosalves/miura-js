import '../../src/layout/draggable';

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
