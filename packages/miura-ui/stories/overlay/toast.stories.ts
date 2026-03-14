import '../../src/overlay/toast';

export default {
  title: 'miura-ui/Overlay/Toast',
  component: 'mui-toast',
};

export const Open = {
  render: () => `<mui-toast open>Toast message</mui-toast>`
};

export const Closed = {
  render: () => `<mui-toast>Toast message</mui-toast>`
}; 