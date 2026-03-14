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