import '../../src/typography/link';

export default {
  title: 'miura-ui/Typography/Link',
  component: 'mui-link',
};

export const Default = {
  render: () => `<mui-link href="/about">About</mui-link>`
};

export const External = {
  render: () => `<mui-link href="https://miura.dev" target="_blank" rel="noopener">External Link</mui-link>`
}; 