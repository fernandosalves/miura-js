import type { Meta, StoryObj } from '@storybook/web-components';

import '../../src';
import '../../src/primitives/button.js';

const meta: Meta = {
    title: 'miura-ui/Primitives/mui-button',
    component: 'mui-button',
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['solid', 'soft', 'outline', 'ghost'],
            description: 'Button visual style',
        },
        size: {
            control: 'select',
            options: ['sm', 'md', 'lg'],
            description: 'Button size',
        },
        tone: {
            control: 'select',
            options: ['primary', 'secondary', 'success', 'danger', 'warning'],
            description: 'Color tone',
        },
        disabled: {
            control: 'boolean',
            description: 'Disable the button',
        },
        loading: {
            control: 'boolean',
            description: 'Show loading state',
        },
    },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
    render: () => `<mui-button>Click me</mui-button>`,
};

export const Variants: Story = {
    render: () => `
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <mui-button variant="solid">Solid</mui-button>
            <mui-button variant="soft">Soft</mui-button>
            <mui-button variant="outline">Outline</mui-button>
            <mui-button variant="ghost">Ghost</mui-button>
        </div>
    `,
};

export const Sizes: Story = {
    render: () => `
        <div style="display: flex; gap: 0.5rem; align-items: center;">
            <mui-button size="sm">Small</mui-button>
            <mui-button size="md">Medium</mui-button>
            <mui-button size="lg">Large</mui-button>
        </div>
    `,
};

export const Tones: Story = {
    render: () => `
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <mui-button tone="primary">Primary</mui-button>
            <mui-button tone="secondary">Secondary</mui-button>
            <mui-button tone="success">Success</mui-button>
            <mui-button tone="danger">Danger</mui-button>
            <mui-button tone="warning">Warning</mui-button>
        </div>
    `,
};

export const Disabled: Story = {
    render: () => `<mui-button disabled>Disabled</mui-button>`,
};

export const Loading: Story = {
    render: () => `<mui-button loading>Loading...</mui-button>`,
};

export const Interactive: Story = {
    render: () => `
        <mui-button onclick="alert('Clicked!')">
            Click me
        </mui-button>
    `,
};

export const WithIcons: Story = {
    render: () => `
        <div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
            <mui-button variant="solid">
                <mui-icon slot="icon-start" name="save"></mui-icon>
                Save
            </mui-button>
            <mui-button variant="outline">
                Next
                <mui-icon slot="icon-end" name="arrow-right"></mui-icon>
            </mui-button>
            <mui-button variant="ghost">
                <mui-icon slot="icon-start" name="refresh-cw"></mui-icon>
                Refresh
            </mui-button>
        </div>
    `,
};
