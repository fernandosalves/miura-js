import '../../src/overlay/spinner';

export default {
  title: 'miura-ui/Overlay/Spinner',
  component: 'mui-spinner',
};

export const Default = {
  render: () => `<mui-spinner></mui-spinner>`
};

export const Large = {
  render: () => `<mui-spinner style="width:48px;height:48px;"></mui-spinner>`
}; 