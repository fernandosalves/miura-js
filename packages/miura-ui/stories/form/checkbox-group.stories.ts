import '../../src/form/checkbox-group';
import '../../src/primitives/checkbox';

export default {
  title: 'miura-ui/Form/CheckboxGroup',
  component: 'mui-checkbox-group',
};

export const Default = {
  render: () => `
    <mui-checkbox-group name="group" .values="a">
      <mui-checkbox value="a">A</mui-checkbox>
      <mui-checkbox value="b">B</mui-checkbox>
    </mui-checkbox-group>
  `
}; 