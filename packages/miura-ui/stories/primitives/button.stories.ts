import { MiuraElement, html, css } from '@miurajs/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../../src/primitives/button.js';
import '../../src/layout/stack.js';

class ButtonDemo extends MiuraElement {
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
                <h3>Variants</h3>
                <mui-stack direction="row" gap="sm" wrap>
                    <mui-button variant="solid" tone="primary">Primary</mui-button>
                    <mui-button variant="solid" tone="secondary">Secondary</mui-button>
                    <mui-button variant="outline">Outline</mui-button>
                    <mui-button variant="ghost">Ghost</mui-button>
                    <mui-button variant="solid" tone="danger">Danger</mui-button>
                </mui-stack>

                <h3>Sizes</h3>
                <mui-stack direction="row" gap="sm" align="center" wrap>
                    <mui-button size="sm">Small</mui-button>
                    <mui-button size="md">Medium</mui-button>
                    <mui-button size="lg">Large</mui-button>
                </mui-stack>

                <h3>States</h3>
                <mui-stack direction="row" gap="sm" wrap>
                    <mui-button loading>Loading...</mui-button>
                    <mui-button disabled>Disabled</mui-button>
                    <mui-button block>Block Button</mui-button>
                </mui-stack>
            </div>
        `;
    }
}

customElements.define('button-demo', ButtonDemo);

const meta: Meta<ButtonDemo> = {
    title: 'MiuraUI/Primitives/Button',
    component: 'button-demo',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: `
# Button

Mobile-first, token-driven button component for all actions and interactions.

## Features

- **Variants**: solid, soft, outline, ghost
- **Tones**: primary, secondary, neutral, danger
- **Sizes**: sm, md, lg
- **States**: loading, disabled, block
- **Icons**: Start and end slots for icons

## Usage

\`\`\`html
<mui-button variant="solid" tone="primary">Click Me</mui-button>
<mui-button variant="outline" size="sm">Small Outline</mui-button>
<mui-button loading>Saving...</mui-button>
\`\`\`
                `
            }
        }
    }
};

export default meta;
type Story = StoryObj<ButtonDemo>;

export const Default: Story = {
    args: {}
};
