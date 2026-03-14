import type { Meta, StoryObj } from '@storybook/web-components';

import '../../src';
import '../../src/overlay/alert.js';

const meta: Meta = {
    title: 'miura-ui/Overlay/mui-alert',
    component: 'mui-alert',
    tags: ['autodocs'],
    argTypes: {
        tone: {
            control: 'select',
            options: ['success', 'danger', 'warning', 'info'],
            description: 'Alert tone',
        },
        dismissible: {
            control: 'boolean',
            description: 'Show dismiss button',
        },
    },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
    render: () => `<mui-alert>This is a default info alert</mui-alert>`,
};

export const Tones: Story = {
    render: () => `
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <mui-alert tone="success">Success: Your changes have been saved</mui-alert>
            <mui-alert tone="danger">Danger: Please review the highlighted fields</mui-alert>
            <mui-alert tone="warning">Warning: This action cannot be undone</mui-alert>
            <mui-alert tone="info">Info: Additional details are available</mui-alert>
        </div>
    `,
};

export const Dismissible: Story = {
    render: () => `
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <mui-alert tone="success" dismissible>
                Success message that can be dismissed
            </mui-alert>
            <mui-alert tone="warning" dismissible>
                Warning message that can be dismissed
            </mui-alert>
        </div>
    `,
};

export const WithIcons: Story = {
    render: () => `
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <mui-alert tone="success" dismissible>
                <span slot="icon">✓</span>
                Success with custom icon
            </mui-alert>
            <mui-alert tone="danger" dismissible>
                <span slot="icon">⚠</span>
                Error with custom icon
            </mui-alert>
            <mui-alert tone="info" dismissible>
                <span slot="icon">ℹ</span>
                Info with custom icon
            </mui-alert>
        </div>
    `,
};

export const LongContent: Story = {
    render: () => `
        <mui-alert tone="warning" dismissible>
            This is a longer alert message that demonstrates how the alert component handles multiple lines of text and maintains proper spacing and alignment throughout the content area.
        </mui-alert>
    `,
}; 