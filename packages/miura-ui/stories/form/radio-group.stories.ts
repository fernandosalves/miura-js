import '../../src/form/radio-group';
import '../../src/primitives/radio';

export default {
  title: 'miura-ui/Form/RadioGroup',
  component: 'mui-radio-group',
};

export const Default = {
  render: () => `
    <mui-radio-group name="group" value="a">
      <mui-radio value="a">A</mui-radio>
      <mui-radio value="b">B</mui-radio>
    </mui-radio-group>
  `
}; 