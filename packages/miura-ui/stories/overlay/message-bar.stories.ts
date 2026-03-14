import '../../src/overlay/message-bar';

export default {
  title: 'miura-ui/Overlay/MessageBar',
  component: 'mui-message-bar',
};

export const Default = {
  render: () => `<mui-message-bar>Message bar</mui-message-bar>`
};

export const Info = {
  render: () => `<mui-message-bar type="info">Info message</mui-message-bar>`
}; 