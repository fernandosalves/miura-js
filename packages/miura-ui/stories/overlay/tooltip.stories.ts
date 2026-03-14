import '../../src/overlay/tooltip';
import '../../src/primitives/button';

export default {
  title: 'miura-ui/Overlay/Tooltip',
  component: 'mui-tooltip',
};

export const Default = {
  render: () => `
    <mui-tooltip for="tooltip-btn">Tooltip content</mui-tooltip>
    <mui-button id="tooltip-btn">Hover me</mui-button>
  `
}; 