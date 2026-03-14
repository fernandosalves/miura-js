import type { Meta, StoryObj } from '@storybook/web-components';

import '../../src';
import '../../src/primitives/input.js';

const meta: Meta = {
    title: 'miura-ui/Primitives/mui-input',
    component: 'mui-input',
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['outline', 'filled', 'flush'],
            description: 'Input visual style',
        },
        size: {
            control: 'select',
            options: ['sm', 'md', 'lg'],
            description: 'Input size',
        },
        tone: {
            control: 'select',
            options: ['primary', 'secondary', 'success', 'danger', 'warning'],
            description: 'Color tone',
        },
        disabled: {
            control: 'boolean',
            description: 'Disable the input',
        },
        readonly: {
            control: 'boolean',
            description: 'Make input readonly',
        },
        placeholder: {
            control: 'text',
            description: 'Placeholder text',
        },
    },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
    render: () => `<mui-input placeholder="Type here..."></mui-input>`,
};

export const Variants: Story = {
    render: () => `
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <mui-input placeholder="Outline" variant="outline"></mui-input>
            <mui-input placeholder="Filled" variant="filled"></mui-input>
            <mui-input placeholder="Flush" variant="flush"></mui-input>
        </div>
    `,
};

export const Sizes: Story = {
    render: () => `
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <mui-input placeholder="Small" size="sm"></mui-input>
            <mui-input placeholder="Medium" size="md"></mui-input>
            <mui-input placeholder="Large" size="lg"></mui-input>
        </div>
    `,
};

export const Tones: Story = {
    render: () => `
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <mui-input placeholder="Primary" tone="primary"></mui-input>
            <mui-input placeholder="Success" tone="success"></mui-input>
            <mui-input placeholder="Danger" tone="danger"></mui-input>
            <mui-input placeholder="Warning" tone="warning"></mui-input>
        </div>
    `,
};

export const Disabled: Story = {
    render: () => `<mui-input placeholder="Disabled" disabled></mui-input>`,
};

export const Readonly: Story = {
    render: () => `<mui-input value="Readonly value" readonly></mui-input>`,
};

export const WithValue: Story = {
    render: () => `<mui-input value="Prefilled value"></mui-input>`,
};

