import { MiuraElement } from '@miurajsjs/miura-element';
import { html, css } from '@miurajsjs/miura-render';
import type { Meta, StoryObj } from '@storybook/web-components';

class IntroductionElement extends MiuraElement {
    // Property declarations for TypeScript
    declare name: string;
    declare count: number;
    declare items: string[];

    static properties = {
        name: { type: String, default: '', state: true },
        count: { type: Number, default: 0, state: true },
        items: { type: Array, default: () => ['Item 1', 'Item 2', 'Item 3'], state: true }
    };

    static get styles() {
        return css`
            :host {
                display: block;
                font-family: 'Helvetica Neue', Arial, sans-serif;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }

            .intro-demo {
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                padding: 20px;
            }

            .demo-section {
                margin-bottom: 20px;
                padding: 15px;
                border: 1px solid #eee;
                border-radius: 4px;
            }

            h3 {
                color: #2196F3;
                margin-top: 0;
            }

            button {
                background: #4CAF50;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: background-color 0.2s;
            }

            button:hover {
                background: #45a049;
            }

            input {
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 16px;
                margin-right: 8px;
            }

            ul {
                list-style-type: none;
                padding: 0;
            }

            li {
                padding: 8px 0;
                border-bottom: 1px solid #eee;
            }

            li:last-child {
                border-bottom: none;
            }

            .expression {
                background: #f5f5f5;
                padding: 8px;
                border-radius: 4px;
                margin: 8px 0;
                font-family: monospace;
            }
        `;
    }

    handleNameInput = (e: Event) => {
        const input = e.target as HTMLInputElement;
        this.name = input.value;
    }

    incrementCount = () => {
        this.count++;
    }

    protected override template() {
        return html`
            <div class="intro-demo">
                <div class="demo-section">
                    <h3>Basic Text Interpolation</h3>
                    <input 
                        type="text"
                        .value="${this.name}"
                        @input="${this.handleNameInput}"
                        placeholder="Enter your name"
                    />
                    <div>Hello, ${this.name}!</div>
                    <div class="expression">
                        ${html`<div>Hello, ${this.name}!</div>`}
                    </div>
                </div>

                <div class="demo-section">
                    <h3>Expression Evaluation</h3>
                    <button @click="${this.incrementCount}">
                        Count: ${this.count}
                    </button>
                    <div>Double: ${this.count * 2}</div>
                    <div class="expression">
                        ${html`<div>Double: ${this.count * 2}</div>`}
                    </div>
                </div>

                <div class="demo-section">
                    <h3>Array Iteration</h3>
                    <ul>
                        ${this.items.map(item => html`
                            <li>${item}</li>
                        `)}
                    </ul>
                    <div class="expression">
                        ${this.items.map(item => html`<li>${item}</li>`)}
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('introduction-element', IntroductionElement);

const meta: Meta<IntroductionElement> = {
    title: 'Miura/Core/01. Introduction',
    component: 'introduction-element',
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<IntroductionElement>;

export const Default: Story = {
    args: {
        name: 'World',
        count: 0,
        items: ['Template Literals', 'Dynamic Content', 'Reactive Updates']
    }
};
