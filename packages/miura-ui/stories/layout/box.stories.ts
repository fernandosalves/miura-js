import { MiuraElement, html, css } from '@miurajs/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../../src/layout/box.js';

class BoxDemo extends MiuraElement {
    static get styles() {
        return css`
            :host { display: block; padding: 20px; font-family: system-ui; }
            h3 { margin-top: 2rem; }
            h3:first-child { margin-top: 0; }
        `;
    }

    template() {
        return html`
            <div>
                <h3>Basic Box</h3>
                <mui-box padding="var(--mui-space-4)" bg="var(--mui-surface)" radius="var(--mui-radius-md)" shadow="var(--mui-shadow-sm)">
                    Basic Box Content with padding, background, radius, and shadow
                </mui-box>

                <h3>Box with Border</h3>
                <mui-box padding="var(--mui-space-3)" border="1px solid var(--mui-border-strong)" radius="var(--mui-radius-xl)">
                    Box with strong border and extra radius
                </mui-box>

                <h3>Nested Boxes</h3>
                <mui-box padding="var(--mui-space-4)" bg="var(--mui-surface-subtle)" radius="var(--mui-radius-lg)">
                    <mui-box padding="var(--mui-space-3)" bg="var(--mui-surface)" radius="var(--mui-radius-md)">
                        Nested box content
                    </mui-box>
                </mui-box>
            </div>
        `;
    }
}

customElements.define('box-demo', BoxDemo);

const meta: Meta<BoxDemo> = {
    title: 'MiuraUI/Layout/Box',
    component: 'box-demo',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: `
# Box

Flexible container primitive for spacing, backgrounds, borders, and shadows.

## Features

- **Padding/Margin**: All sides or individual control
- **Background**: Color from tokens
- **Border**: Customizable borders
- **Radius**: Border radius from tokens
- **Shadow**: Box shadow from tokens

## Usage

\`\`\`html
<mui-box padding="var(--mui-space-4)" bg="var(--mui-surface)" radius="var(--mui-radius-md)">
  Content
</mui-box>
\`\`\`
                `
            }
        }
    }
};

export default meta;
type Story = StoryObj<BoxDemo>;

export const Default: Story = {
    args: {}
};
