import '../../src/layout/scroll-area';

export default {
  title: 'miura-ui/Layout/ScrollArea',
  component: 'mui-scroll-area',
};

export const Default = {
  render: () => `
    <mui-scroll-area style="height:100px;width:300px;">
      <div style="height:300px;">This content is very tall and will scroll.</div>
    </mui-scroll-area>
  `
}; 