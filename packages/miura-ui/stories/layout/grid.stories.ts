import '../../src/layout/grid';

export default {
  title: 'miura-ui/Layout/Grid',
  component: 'mui-grid',
};

export const Default = {
  render: () => `
    <mui-grid columns="3" gap="1em">
      <mui-container>Grid 1</mui-container>
      <mui-container>Grid 2</mui-container>
      <mui-container>Grid 3</mui-container>
    </mui-grid>
  `
}; 