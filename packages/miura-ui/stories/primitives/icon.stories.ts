import type { Meta, StoryObj } from '@storybook/web-components';

import '../../src';

const meta: Meta = {
    title: 'miura-ui/Primitives/mui-icon',
    component: 'mui-icon',
    tags: ['autodocs'],
    argTypes: {
        name: {
            control: 'select',
            options: ['plus', 'minus', 'x', 'check', 'search', 'menu', 'home', 'user', 'users', 'bell', 'settings', 'eye', 'image', 'upload', 'download', 'mail', 'calendar', 'chevron-left', 'chevron-right', 'chevron-up', 'chevron-down', 'arrow-left', 'arrow-right', 'arrow-up', 'arrow-down', 'pencil', 'copy', 'info', 'alert-triangle', 'external-link', 'link', 'refresh-cw', 'more-horizontal', 'trash', 'save', 'loader-circle'],
        },
        size: {
            control: 'number',
        },
        strokeWidth: {
            control: 'number',
        },
        label: {
            control: 'text',
        },
    },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
    render: () => `<mui-icon name="plus"></mui-icon>`,
};

export const IconGrid: Story = {
    render: () => `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(96px,1fr));gap:1rem;">
            ${['plus', 'minus', 'x', 'check', 'search', 'menu', 'home', 'user', 'users', 'bell', 'settings', 'eye', 'image', 'upload', 'download', 'mail', 'calendar', 'chevron-left', 'chevron-right', 'chevron-up', 'chevron-down', 'arrow-left', 'arrow-right', 'arrow-up', 'arrow-down', 'pencil', 'copy', 'info', 'alert-triangle', 'external-link', 'link', 'refresh-cw', 'more-horizontal', 'trash', 'save', 'loader-circle']
                .map((name) => `
                    <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;padding:0.75rem;border:1px solid #e5e7eb;border-radius:12px;">
                        <mui-icon name="${name}" size="22"></mui-icon>
                        <span style="font-size:12px;color:#475569;">${name}</span>
                    </div>
                `).join('')}
        </div>
    `,
};

export const InButton: Story = {
    render: () => `
        <div style="display:flex;gap:0.75rem;align-items:center;">
            <mui-button variant="solid">
                <mui-icon slot="icon-start" name="save" size="18"></mui-icon>
                Save changes
            </mui-button>
            <mui-icon-button label="Search" variant="soft">
                <mui-icon name="search"></mui-icon>
            </mui-icon-button>
        </div>
    `,
};
