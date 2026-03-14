import '../../src/data-display/badge';
import '../../src/primitives/icon';

export default {
  title: 'miura-ui/Data Display/Badge',
  component: 'mui-badge',
};

export const WithValue = {
  render: () => `<mui-badge value="3"></mui-badge>`
};

export const WithIcon = {
  render: () => `<mui-badge><mui-icon>mail</mui-icon></mui-badge>`
}; 