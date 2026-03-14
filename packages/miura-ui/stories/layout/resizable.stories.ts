import '../../src/layout/resizable';

export default {
  title: 'miura-ui/Layout/Resizable',
  component: 'mui-resizable',
};

export const Default = {
  render: () => `
    <mui-resizable style="width:200px;height:100px;">
      <div>Drag the corner to resize me!</div>
    </mui-resizable>
  `
}; 