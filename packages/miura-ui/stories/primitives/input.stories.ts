import { MiuraElement, html, css } from '@miurajs/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../../src/primitives/input.js';
import '../../src/layout/stack.js';

class InputDemo extends MiuraElement {
    declare name: string;
    declare email: string;
    declare password: string;

    static properties = {
        name: { type: String, default: '' },
        email: { type: String, default: '' },
        password: { type: String, default: '' }
    };

    static get styles() {
        return css`
            :host { display: block; padding: 20px; font-family: system-ui; max-width: 600px; }
            h3 { margin-top: 2rem; }
            h3:first-child { margin-top: 0; }
            .preview {
                margin-top: 16px;
                padding: 16px;
                background: #f0fdf4;
                border: 1px solid #bbf7d0;
                border-radius: 8px;
            }
            .preview p { margin: 4px 0; font-size: 14px; }
        `;
    }

    template() {
        return html`
            <div>
                <h3>Basic Input</h3>
                <mui-stack direction="column" gap="md">
                    <mui-input
                        type="text"
                        placeholder="Enter your name"
                        &value=${[this.name, (v) => this.name = v]}
                    ></mui-input>

                    <mui-input
                        type="email"
                        placeholder="email@example.com"
                        &value=${[this.email, (v) => this.email = v]}
                    ></mui-input>

                    <mui-input
                        type="password"
                        placeholder="Password"
                        &value=${[this.password, (v) => this.password = v]}
                    ></mui-input>
                </mui-stack>

                <h3>Input Sizes</h3>
                <mui-stack direction="column" gap="md">
                    <mui-input size="sm" placeholder="Small input"></mui-input>
                    <mui-input size="md" placeholder="Medium input (default)"></mui-input>
                    <mui-input size="lg" placeholder="Large input"></mui-input>
                </mui-stack>

                <h3>Input States</h3>
                <mui-stack direction="column" gap="md">
                    <mui-input status="error" placeholder="Error state"></mui-input>
                    <mui-input status="success" placeholder="Success state"></mui-input>
                    <mui-input disabled placeholder="Disabled input"></mui-input>
                    <mui-input readonly value="Read-only value"></mui-input>
                </mui-stack>

                <div class="preview">
                    <h4>Live Preview (Two-Way Binding)</h4>
                    <p><strong>Name:</strong> ${this.name || '(empty)'}</p>
                    <p><strong>Email:</strong> ${this.email || '(empty)'}</p>
                    <p><strong>Password:</strong> ${this.password || '(empty)'}</p>
                </div>
            </div>
        `;
    }
}

customElements.define('input-demo', InputDemo);

const meta: Meta<InputDemo> = {
    title: 'MiuraUI/Primitives/Input',
    component: 'input-demo',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: `
# Input

Mobile-first, token-driven input component with two-way binding support.

## Features

- **Types**: text, email, password, number, search, tel, url
- **Sizes**: sm, md, lg
- **States**: error, success, disabled, readonly
- **Two-Way Binding**: &value for seamless state sync
- **Slots**: Prefix and suffix for icons/text

## Usage

\`\`\`html
<mui-input
  type="email"
  placeholder="email@example.com"
  &value=\${[this.email, (v) => this.email = v]}
></mui-input>

<mui-input
  status="error"
  placeholder="Error state"
></mui-input>
\`\`\`
                `
            }
        }
    }
};

export default meta;
type Story = StoryObj<InputDemo>;

export const Default: Story = {
    args: {}
};
