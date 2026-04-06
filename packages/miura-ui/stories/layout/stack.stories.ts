import { MiuraElement, html, css } from '@miurajs/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../../src/layout/stack.js';

class StackDemo extends MiuraElement {
    static get styles() {
        return css`
            :host { display: block; padding: 20px; font-family: system-ui; }
            .demo-item {
                padding: 16px;
                background: #e0e7ff;
                border-radius: 8px;
                color: #3730a3;
                font-weight: 500;
            }
        `;
    }

    template() {
        return html`
            <div>
                <h3>Column Stack</h3>
                <mui-stack direction="column" gap="md" align="start">
                    <div class="demo-item">Item 1</div>
                    <div class="demo-item">Item 2</div>
                    <div class="demo-item">Item 3</div>
                </mui-stack>

                <h3 style="margin-top: 2rem;">Row Stack</h3>
                <mui-stack direction="row" gap="sm" justify="between" wrap>
                    <div class="demo-item">Left</div>
                    <div class="demo-item">Center</div>
                    <div class="demo-item">Right</div>
                </mui-stack>

                <h3 style="margin-top: 2rem;">Centered Stack</h3>
                <mui-stack direction="column" gap="md" align="center">
                    <div class="demo-item">Centered Item 1</div>
                    <div class="demo-item">Centered Item 2</div>
                </mui-stack>
            </div>
        `;
    }
}

customElements.define('stack-demo', StackDemo);

const meta: Meta<StackDemo> = {
    title: 'MiuraUI/Layout/Stack',
    component: 'stack-demo',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: `
# Stack Layout

Flexbox-based vertical or horizontal stack for arranging elements with consistent gaps.

## Features

- **Direction**: Row or column layouts
- **Gap**: Consistent spacing using design tokens
- **Align**: Flexible alignment options
- **Justify**: Content distribution control
- **Wrap**: Optional wrapping for responsive layouts

## Usage

\`\`\`html
<mui-stack direction="column" gap="md" align="start">
  <div>Item 1</div>
  <div>Item 2</div>
</mui-stack>
\`\`\`
                `
            }
        }
    }
};

export default meta;
type Story = StoryObj<StackDemo>;

export const Default: Story = {
    args: {}
};
