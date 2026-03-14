import '../../src/navigation/breadcrumbs';

export default {
  title: 'miura-ui/Navigation/Breadcrumbs',
  component: 'mui-breadcrumbs',
};

export const Default = {
  render: () => `
    <mui-breadcrumbs>
      <mui-breadcrumb href="/">Home</mui-breadcrumb>
      <mui-breadcrumb href="/section">Section</mui-breadcrumb>
      <mui-breadcrumb>Current</mui-breadcrumb>
    </mui-breadcrumbs>
  `
}; 