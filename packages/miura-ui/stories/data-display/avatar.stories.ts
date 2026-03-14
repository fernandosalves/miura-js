import type { Meta, StoryObj } from '@storybook/web-components';

import '../../src';
import '../../src/data-display/avatar.ts';

const meta: Meta = {
    title: 'miura-ui/Data Display/mui-avatar',
    component: 'mui-avatar',
    tags: ['autodocs'],
    argTypes: {
        size: {
            control: 'select',
            options: ['xs', 'sm', 'md', 'lg', 'xl'],
            description: 'Avatar size',
        },
        shape: {
            control: 'select',
            options: ['circle', 'rounded', 'square'],
            description: 'Avatar shape',
        },
        status: {
            control: 'select',
            options: ['none', 'online', 'busy', 'away'],
            description: 'Status indicator',
        },
        alt: {
            control: 'text',
            description: 'Alt text for image',
        },
    },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
    render: () => `<mui-avatar>JD</mui-avatar>`,
};

export const Image: Story = {
    render: () => `
        <div style="display: flex; gap: 1rem; align-items: center;">
            <mui-avatar src="https://i.pravatar.cc/40" alt="User" size="sm"></mui-avatar>
            <mui-avatar src="https://i.pravatar.cc/60" alt="User" size="md"></mui-avatar>
            <mui-avatar src="https://i.pravatar.cc/80" alt="User" size="lg"></mui-avatar>
        </div>
    `,
};

export const Initials: Story = {
    render: () => `
        <div style="display: flex; gap: 1rem; align-items: center;">
            <mui-avatar size="sm">AB</mui-avatar>
            <mui-avatar size="md">CD</mui-avatar>
            <mui-avatar size="lg">EF</mui-avatar>
        </div>
    `,
};

export const Sizes: Story = {
    render: () => `
        <div style="display: flex; gap: 1rem; align-items: center;">
            <mui-avatar size="xs">XS</mui-avatar>
            <mui-avatar size="sm">SM</mui-avatar>
            <mui-avatar size="md">MD</mui-avatar>
            <mui-avatar size="lg">LG</mui-avatar>
            <mui-avatar size="xl">XL</mui-avatar>
        </div>
    `,
};

export const Shapes: Story = {
    render: () => `
        <div style="display: flex; gap: 1rem; align-items: center;">
            <mui-avatar shape="circle">A</mui-avatar>
            <mui-avatar shape="rounded">A</mui-avatar>
            <mui-avatar shape="square">A</mui-avatar>
        </div>
    `,
};

export const WithStatus: Story = {
    render: () => `
        <div style="display: flex; gap: 1rem; align-items: center;">
            <mui-avatar status="online">JD</mui-avatar>
            <mui-avatar status="busy">JD</mui-avatar>
            <mui-avatar status="away">JD</mui-avatar>
        </div>
    `,
};

export const Fallback: Story = {
    render: () => `<mui-avatar></mui-avatar>`,
}; 