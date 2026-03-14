import '../../src/navigation/tabs';

export default {
  title: 'miura-ui/Navigation/Tabs',
  component: 'mui-tabs',
};

export const Default = {
  render: () => `
    <mui-tabs selected="0">
      <mui-tab slot="tab">Tab 1</mui-tab>
      <mui-tab slot="tab">Tab 2</mui-tab>
      <mui-tab-panel slot="panel">Panel 1</mui-tab-panel>
      <mui-tab-panel slot="panel">Panel 2</mui-tab-panel>
    </mui-tabs>
  `
}; 