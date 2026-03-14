import type { Meta, StoryObj } from '@storybook/web-components';

import '../../src';
import '../../src/navigation/accordion.js';

const meta: Meta = {
    title: 'miura-ui/Navigation/mui-accordion',
    component: 'mui-accordion',
    tags: ['autodocs'],
    argTypes: {
        open: {
            control: 'boolean',
            description: 'Initial open state',
        },
        disabled: {
            control: 'boolean',
            description: 'Disable the accordion',
        },
    },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
    render: () => `
        <mui-accordion>
            <div slot="header">Section 1</div>
            <div slot="content">
                This is the content for section 1. It can contain any HTML content.
            </div>
        </mui-accordion>
    `,
};

export const Multiple: Story = {
    render: () => `
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <mui-accordion>
                <div slot="header">First Accordion</div>
                <div slot="content">
                    Content for the first accordion item.
                </div>
            </mui-accordion>
            <mui-accordion>
                <div slot="header">Second Accordion</div>
                <div slot="content">
                    Content for the second accordion item.
                </div>
            </mui-accordion>
        </div>
    `,
};

export const InitiallyOpen: Story = {
    render: () => `
        <mui-accordion open>
            <div slot="header">Open by default</div>
            <div slot="content">
                This accordion starts in the open state.
            </div>
        </mui-accordion>
    `,
};

export const Disabled: Story = {
    render: () => `
        <mui-accordion disabled>
            <div slot="header">Disabled Accordion</div>
            <div slot="content">
                This accordion cannot be opened.
            </div>
        </mui-accordion>
    `,
}; 