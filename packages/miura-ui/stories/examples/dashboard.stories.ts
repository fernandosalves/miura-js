import './maori-example-dashboard/src/maori-example-dashboard';
import type { Meta, StoryObj } from '@storybook/web-components';

export default {
  title: 'miura-ui/Examples/Dashboard',
  component: 'miura-example-dashboard',
  tags: ['autodocs'],
};

export const Default = {
  render: () => `
    <miura-example-dashboard></miura-example-dashboard>
  `
}; 
