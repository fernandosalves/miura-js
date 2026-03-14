import '../../src/layout/spacer';
import '../../src/typography/heading';

export default {
  title: 'miura-ui/Layout/Spacer',
  component: 'mui-spacer',
};

export const Default = {
  render: () => `
    <mui-heading level="4">Before</mui-heading>
    <mui-spacer size="2em"></mui-spacer>
    <mui-heading level="4">After</mui-heading>
  `
}; 