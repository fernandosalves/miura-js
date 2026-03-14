import '../../src/overlay/teaching-bubble';

export default {
  title: 'miura-ui/Overlay/TeachingBubble',
  component: 'mui-teaching-bubble',
};

export const Default = {
  render: () => `<mui-teaching-bubble>Teaching bubble content</mui-teaching-bubble>`
};

export const WithTitle = {
  render: () => `<mui-teaching-bubble title="Tip">Teaching bubble with title</mui-teaching-bubble>`
}; 