import type { Meta, StoryObj } from '@storybook/web-components';

import '../../src';
import '../../src/overlay/dialog.js';

const meta: Meta = {
    title: 'miura-ui/Overlay/mui-dialog',
    component: 'mui-dialog',
    tags: ['autodocs'],
    argTypes: {
        open: {
            control: 'boolean',
            description: 'Dialog open state',
        },
        modal: {
            control: 'boolean',
            description: 'Modal behavior (backdrop click to close)',
        },
    },
};

export default meta;
type Story = StoryObj;

export const Open: Story = {
    render: () => `
        <mui-dialog open>
            <div slot="header">Dialog Title</div>
            <div>
                This is the main content of the dialog. It can contain any HTML content including forms, text, and other components.
            </div>
            <div slot="actions">
                <button onclick="this.closest('mui-dialog').open = false">Cancel</button>
                <button onclick="this.closest('mui-dialog').open = false" style="background: var(--mui-color-primary); color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem;">Confirm</button>
            </div>
        </mui-dialog>
    `,
};

export const Modal: Story = {
    render: () => `
        <mui-dialog open modal>
            <div slot="header">Modal Dialog</div>
            <div>
                This is a modal dialog. Clicking the backdrop will close it.
            </div>
            <div slot="actions">
                <button onclick="this.closest('mui-dialog').open = false">OK</button>
            </div>
        </mui-dialog>
    `,
};

export const NonModal: Story = {
    render: () => `
        <mui-dialog open modal="false">
            <div slot="header">Non-Modal Dialog</div>
            <div>
                This is a non-modal dialog. Clicking the backdrop will not close it.
            </div>
            <div slot="actions">
                <button onclick="this.closest('mui-dialog').open = false">Close</button>
            </div>
        </mui-dialog>
    `,
};

export const Interactive: Story = {
    render: () => `
        <button onclick="document.getElementById('interactive-dialog').open = true" style="padding: 0.5rem 1rem; background: var(--mui-color-primary); color: white; border: none; border-radius: 0.25rem;">
            Open Dialog
        </button>
        <mui-dialog id="interactive-dialog">
            <div slot="header">Interactive Dialog</div>
            <div>
                This dialog was opened programmatically. You can close it using the button below or by pressing ESC.
            </div>
            <div slot="actions">
                <button onclick="document.getElementById('interactive-dialog').open = false">Close</button>
            </div>
        </mui-dialog>
    `,
}; 