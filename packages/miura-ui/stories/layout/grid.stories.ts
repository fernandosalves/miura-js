import { MiuraElement, html, css } from '@miurajs/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../../src/layout/grid.js';

class GridDemo extends MiuraElement {
    static get styles() {
        return css`
            :host { display: block; padding: 20px; font-family: system-ui; }
            .demo-item {
                padding: 24px;
                background: #dbeafe;
                border-radius: 8px;
                color: #1e40af;
                font-weight: 500;
                text-align: center;
            }
        `;
    }

    template() {
        return html`
            <div>
                <h3>Basic Grid (3 columns)</h3>
                <mui-grid columns="3" gap="md">
                    <div class="demo-item">Col 1</div>
                    <div class="demo-item">Col 2</div>
                    <div class="demo-item">Col 3</div>
                    <div class="demo-item">Col 4</div>
                    <div class="demo-item">Col 5</div>
                    <div class="demo-item">Col 6</div>
                </mui-grid>

                <h3 style="margin-top: 2rem;">Auto-fit Grid</h3>
                <mui-grid columns="4" gap="lg" autoFit>
                    <div class="demo-item">Auto 1</div>
                    <div class="demo-item">Auto 2</div>
                    <div class="demo-item">Auto 3</div>
                    <div class="demo-item">Auto 4</div>
                </mui-grid>
            </div>
        `;
    }
}

customElements.define('grid-demo', GridDemo);

const meta: Meta<GridDemo> = {
    title: 'MiuraUI/Layout/Grid',
    component: 'grid-demo',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: `
# Grid Layout

Flexbox-based grid system with configurable columns and gaps.

## Features

- **Columns**: 1-12 columns or auto-fit
- **Gap**: Consistent spacing using design tokens
- **Responsive**: Responsive column props (-sm, -md, -lg)
- **Auto-fit**: Automatic column fitting based on min-width

## Usage

\`\`\`html
<mui-grid columns="3" gap="md">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</mui-grid>
\`\`\`
                `
            }
        }
    }
};

export default meta;
type Story = StoryObj<GridDemo>;

export const Default: Story = {
    args: {}
};
