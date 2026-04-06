import { MiuraElement, html, css } from '@miurajs/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';

class ReferenceBindingsElement extends MiuraElement {
    // Property declarations for TypeScript
    declare elementText: string;
    declare isHighlighted: boolean;

    static properties = {
        elementText: { type: String, default: 'Click the buttons to interact with this element', state: true },
        isHighlighted: { type: Boolean, default: false, state: true }
    };

    private elementRef: HTMLElement | null = null;

    static get styles() {
        return css`
            :host {
                display: block;
                font-family: 'Helvetica Neue', Arial, sans-serif;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }

            .demo {
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                padding: 20px;
            }

            .section {
                margin-bottom: 20px;
                padding: 15px;
                border: 1px solid #eee;
                border-radius: 4px;
            }

            .target-element {
                padding: 20px;
                margin: 10px 0;
                border: 2px solid #e0e0e0;
                border-radius: 4px;
                transition: all 0.3s ease;
            }

            .target-element.highlight {
                background-color: #fff3cd;
                border-color: #ffeeba;
            }

            .button-group {
                display: flex;
                gap: 10px;
                margin-top: 10px;
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

            pre {
                background: #f5f5f5;
                padding: 10px;
                border-radius: 4px;
                margin: 10px 0;
                font-family: monospace;
            }
        `;
    }

    // Method to store the element reference
    private setElementRef = (element: Element | null) => {
        this.elementRef = element as HTMLElement;
    };

    // Methods to manipulate the referenced element
    private toggleHighlight = () => {
        if (this.elementRef) {
            this.elementRef.classList.toggle('highlight');
            this.isHighlighted = this.elementRef.classList.contains('highlight');
        }
    };

    private updateText = () => {
        if (this.elementRef) {
            this.elementText = `Element text updated at ${new Date().toLocaleTimeString()}`;
        }
    };

    private animateElement = () => {
        if (this.elementRef) {
            this.elementRef.style.transform = 'translateX(50px)';
            setTimeout(() => {
                if (this.elementRef) {
                    this.elementRef.style.transform = 'translateX(0)';
                }
            }, 500);
        }
    };

    protected override template() {
        return html`
            <div class="demo">
                <div class="section">
                    <h3>Reference Binding (#ref)</h3>
                    <p>Reference binding allows you to get direct access to DOM elements.</p>
                    
                    <div class="target-element" #ref=${this.setElementRef}>
                        ${this.elementText}
                    </div>

                    <div class="button-group">
                        <button @click="${this.toggleHighlight}">
                            ${this.isHighlighted ? 'Remove Highlight' : 'Add Highlight'}
                        </button>
                        <button @click="${this.updateText}">
                            Update Text
                        </button>
                        <button @click="${this.animateElement}">
                            Animate
                        </button>
                    </div>

                    <pre>
// Example usage:
&lt;div #ref=\${this.setElementRef}&gt;
    \${this.elementText}
&lt;/div&gt;

// In your component:
private elementRef: HTMLElement | null = null;

private setElementRef = (element: Element | null) => {
    this.elementRef = element as HTMLElement;
};
                    </pre>
                </div>
            </div>
        `;
    }
}

customElements.define('reference-bindings-element', ReferenceBindingsElement);

const meta: Meta<ReferenceBindingsElement> = {
    title: 'Miura/Core/05. Reference Bindings',
    component: 'reference-bindings-element',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: `
# Reference Bindings in Miura

Reference bindings provide a way to get direct access to DOM elements in your component.
This is useful when you need to:
- Directly manipulate DOM elements
- Integrate with third-party libraries that require DOM element references
- Perform measurements or animations
- Access native element properties and methods

## Syntax

Use the \`#ref\` prefix followed by a callback function:

\`\`\`typescript
<div #ref=\${this.setElementRef}>Content</div>
\`\`\`

## Best Practices

1. Store references as class properties
2. Use TypeScript for better type safety
3. Check if reference exists before using it
4. Clean up references when elements are removed
5. Avoid excessive DOM manipulation

## Examples

### Basic Reference
\`\`\`typescript
class MyElement extends MiuraElement {
    private myRef: HTMLElement | null = null;

    private setRef = (element: Element | null) => {
        this.myRef = element as HTMLElement;
    };

    template() {
        return html\`
            <div #ref=\${this.setRef}>
                Content
            </div>
        \`;
    }
}
\`\`\`

### With TypeScript Type Safety
\`\`\`typescript
class MyElement extends MiuraElement {
    private inputRef: HTMLInputElement | null = null;

    private setInputRef = (element: Element | null) => {
        this.inputRef = element as HTMLInputElement;
    };

    private focusInput() {
        this.inputRef?.focus();
    }

    template() {
        return html\`
            <input #ref=\${this.setInputRef} type="text">
        \`;
    }
}
\`\`\`
                `
            }
        }
    }
};

export default meta;

type Story = StoryObj<ReferenceBindingsElement>;

export const Default: Story = {
    args: {
        elementText: 'Click the buttons to manipulate this element',
        isHighlighted: false
    }
};

export const WithHighlight: Story = {
    args: {
        elementText: 'This element starts highlighted',
        isHighlighted: true
    }
};
