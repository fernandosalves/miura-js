import '../../src/layout/focus-trap-zone';

export default {
  title: 'miura-ui/Layout/FocusTrapZone',
  component: 'mui-focus-trap-zone',
};

export const Default = {
  render: () => `
    <mui-focus-trap-zone style="padding:1em;">
      <button>Button 1</button>
      <button>Button 2</button>
      <input placeholder="Focusable input" />
    </mui-focus-trap-zone>
  `
}; 