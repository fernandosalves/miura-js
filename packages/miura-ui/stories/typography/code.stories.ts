import '../../src/typography/code';

export default {
  title: 'miura-ui/Typography/Code',
  component: 'mui-code',
};

export const Default = {
  render: () => `<mui-code>const x = 1;</mui-code>`
};

export const LongCode = {
  render: () => `<mui-code>npm install @miurajs/ui --save-dev</mui-code>`
}; 