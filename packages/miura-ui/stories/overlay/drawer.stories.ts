import '../../src/overlay/drawer';

export default {
  title: 'miura-ui/Overlay/Drawer',
  component: 'mui-drawer',
};

export const Left = {
  render: () => `<mui-drawer open position="left">Drawer content (left)</mui-drawer>`
};

export const Right = {
  render: () => `<mui-drawer open position="right">Drawer content (right)</mui-drawer>`
}; 