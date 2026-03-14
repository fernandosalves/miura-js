import '../../src/layout/visually-hidden';

export default {
  title: 'miura-ui/Layout/VisuallyHidden',
  component: 'mui-visually-hidden',
};

export const Default = {
  render: () => `
    <span>Visible text</span>
    <mui-visually-hidden>Screen reader only text</mui-visually-hidden>
  `
}; 