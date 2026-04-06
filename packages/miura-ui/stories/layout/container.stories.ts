import { MiuraElement, html, css } from '@miurajs/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../../src/layout/container.js';

class ContainerDemo extends MiuraElement {
    static get styles() {
        return css`
            :host { display: block; font-family: system-ui; }
            .demo-content {
                background: var(--mui-surface-subtle, #f3f2f1);
                padding: 2rem;
                border-radius: 8px;
                text-align: center;
            }
            h3 { margin: 2rem 0 1rem; text-align: center; }
            h3:first-child { margin-top: 0; }
        `;
    }

    template() {
        return html`
            <div>
                <h3>Small Container (640px)</h3>
                <mui-container size="sm" center>
                    <div class="demo-content">Small container content</div>
                </mui-container>

                <h3>Large Container (1024px)</h3>
                <mui-container size="lg" center>
                    <div class="demo-content">Large container content</div>
                </mui-container>

                <h3>Full Width Container</h3>
                <mui-container size="full">
                    <div class="demo-content">Full width container</div>
                </mui-container>
            </div>
        `;
    }
}

customElements.define('container-demo', ContainerDemo);

const meta: Meta<ContainerDemo> = {
    title: 'MiuraUI/Layout/Container',
    component: 'container-demo',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: `
# Container

Max-width container for centering content and maintaining consistent widths.

## Features

- **Sizes**: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px), full (100%)
- **Center**: Auto margin for centering
- **Padding**: Horizontal padding for edge spacing

## Usage

\`\`\`html
<mui-container size="lg" center>
  <page-content></page-content>
</mui-container>
\`\`\`
                `
            }
        }
    }
};

export default meta;
type Story = StoryObj<ContainerDemo>;

export const Default: Story = {
    args: {}
};
