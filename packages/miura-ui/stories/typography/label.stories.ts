import '../../src/typography/label';

export default {
  title: 'miura-ui/Typography/Label',
  component: 'mui-label',
};

export const Default = {
  render: () => `<mui-label>Label</mui-label>`
};

export const WithFor = {
  render: () => `
    <mui-label for="input-id">Username</mui-label>
    <mui-input id="input-id"></mui-input>
  `
}; 