import '../../src/navigation/menu';

export default {
  title: 'miura-ui/Navigation/Menu',
  component: 'mui-menu',
};

export const Default = {
  render: () => `
    <mui-menu open>
      <mui-menu-item>Item 1</mui-menu-item>
      <mui-menu-item>Item 2</mui-menu-item>
    </mui-menu>
  `
}; 