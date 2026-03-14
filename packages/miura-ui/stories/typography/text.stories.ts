import type { Meta, StoryObj } from '@storybook/web-components';

import '../../src';
import '../../src/typography/text.js';

const meta: Meta = {
    title: 'miura-ui/Typography/mui-text',
    component: 'mui-text',
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['body', 'body-lg', 'caption', 'overline', 'subtitle', 'subtitle-lg'],
            description: 'Text variant',
        },
        display: {
            control: 'select',
            options: ['inline', 'block'],
            description: 'Display type',
        },
        tone: {
            control: 'select',
            options: ['neutral', 'primary', 'secondary', 'accent', 'success', 'danger', 'warning'],
            description: 'Color tone',
        },
    },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
    render: () => `<mui-text>This is default body text.</mui-text>`,
};

export const Variants: Story = {
    render: () => `
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <mui-text variant="body">Body text</mui-text>
            <mui-text variant="body-lg">Body large text</mui-text>
            <mui-text variant="caption">Caption text</mui-text>
            <mui-text variant="overline">Overline text</mui-text>
            <mui-text variant="subtitle">Subtitle text</mui-text>
            <mui-text variant="subtitle-lg">Subtitle large text</mui-text>
        </div>
    `,
};

export const DisplayTypes: Story = {
    render: () => `
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <div>
                <mui-text display="inline">Inline text</mui-text> followed by more inline text.
            </div>
            <mui-text display="block">Block text</mui-text>
        </div>
    `,
};

export const Tones: Story = {
    render: () => `
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <mui-text tone="primary">Primary text</mui-text>
            <mui-text tone="secondary">Secondary text</mui-text>
            <mui-text tone="success">Success text</mui-text>
            <mui-text tone="danger">Danger text</mui-text>
            <mui-text tone="warning">Warning text</mui-text>
        </div>
    `,
};

export const Mixed: Story = {
    render: () => `
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <mui-text variant="overline" tone="primary">Section Title</mui-text>
            <mui-text variant="body">Regular paragraph text with neutral tone.</mui-text>
            <mui-text variant="caption" tone="secondary">Small caption text with secondary tone.</mui-text>
        </div>
    `,
}; 