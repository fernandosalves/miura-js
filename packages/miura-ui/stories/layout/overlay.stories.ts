import '../../src/layout/overlay';

export default {
  title: 'miura-ui/Layout/Overlay',
  component: 'mui-overlay',
};

export const Default = {
  render: () => `
    <mui-overlay>
      <div style="background:#fff;padding:2em;border-radius:8px;">Overlay content</div>
    </mui-overlay>
  `
}; 