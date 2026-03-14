import '../../src/data-display/progress';

export default {
  title: 'miura-ui/Data Display/Progress',
  component: 'mui-progress',
};

export const Value = {
  render: () => `<mui-progress value="40" max="100"></mui-progress>`
};

export const Indeterminate = {
  render: () => `<mui-progress indeterminate></mui-progress>`
}; 