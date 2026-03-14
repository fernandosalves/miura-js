import type { Meta, StoryObj } from '@storybook/web-components';

import '../../src';
import '../../src/overlay/snackbar.js';

const meta: Meta = {
    title: 'miura-ui/Overlay/mui-snackbar',
    component: 'mui-snackbar',
    tags: ['autodocs'],
    argTypes: {
        open: {
            control: 'boolean',
            description: 'Snackbar open state',
        },
        duration: {
            control: 'number',
            description: 'Auto-dismiss duration in milliseconds',
        },
        placement: {
            control: 'select',
            options: ['bottom-center', 'bottom-left', 'bottom-right', 'top-center', 'top-left', 'top-right'],
            description: 'Snackbar placement',
        },
    },
};

export default meta;
type Story = StoryObj;

export const Open: Story = {
    render: () => `
        <mui-snackbar open>
            This is a snackbar message
        </mui-snackbar>
    `,
};

export const WithAction: Story = {
    render: () => `
        <mui-snackbar open>
            Message saved successfully
            <button slot="action">Undo</button>
        </mui-snackbar>
    `,
};

export const Placements: Story = {
    render: () => `
        <div style="position: relative; height: 200px;">
            <mui-snackbar open placement="top-left">
                Top Left
            </mui-snackbar>
            <mui-snackbar open placement="top-center">
                Top Center
            </mui-snackbar>
            <mui-snackbar open placement="top-right">
                Top Right
            </mui-snackbar>
            <mui-snackbar open placement="bottom-left">
                Bottom Left
            </mui-snackbar>
            <mui-snackbar open placement="bottom-center">
                Bottom Center
            </mui-snackbar>
            <mui-snackbar open placement="bottom-right">
                Bottom Right
            </mui-snackbar>
        </div>
    `,
};

export const LongDuration: Story = {
    render: () => `
        <mui-snackbar open duration="10000">
            This snackbar will stay visible for 10 seconds
        </mui-snackbar>
    `,
};

export const NoAutoDismiss: Story = {
    render: () => `
        <mui-snackbar open duration="0">
            This snackbar won't auto-dismiss
            <button slot="action">Dismiss</button>
        </mui-snackbar>
    `,
};

export const Interactive: Story = {
    render: () => `
        <button onclick="document.getElementById('interactive-snackbar').open = true" style="padding: 0.5rem 1rem; background: var(--mui-color-primary); color: white; border: none; border-radius: 0.25rem;">
            Show Snackbar
        </button>
        <mui-snackbar id="interactive-snackbar" placement="bottom-center">
            Action completed successfully
            <button slot="action" onclick="document.getElementById('interactive-snackbar').open = false">Dismiss</button>
        </mui-snackbar>
    `,
}; 