import { MiuraElement, html, css } from '@miurajsjs/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';

class AttributeBindingsElement extends MiuraElement {
    // Property declarations for TypeScript
    declare elementId: string;
    declare isActive: boolean;
    declare styles: Record<string, string>;
    declare classes: Record<string, boolean>;

    static properties = {
        elementId: { type: String, default: 'dynamic-id' },
        isActive: { type: Boolean, default: false },
        styles: {
            type: Object,
            default: {
                color: '#333',
                backgroundColor: '#f0f0f0',
                padding: '10px',
                borderRadius: '4px'
            }
        },
        classes: {
            type: Object,
            default: {
                active: false,
                highlight: true,
                hidden: false
            }
        }
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
                margin: 4px;
            }

            button:hover {
                background: #45a049;
            }

            .active {
                border: 2px solid #2196F3;
            }

            .highlight {
                background-color: #fff3cd;
            }

            .hidden {
                display: none;
            }
        `;
    }

    toggleActive = () => {
        this.isActive = !this.isActive;
    }

    toggleClass = (className: string) => {
        this.classes = {
            ...this.classes,
            [className]: !this.classes[className]
        };
    }

    updateStyle = (property: string, value: string) => {
        this.styles = {
            ...this.styles,
            [property]: value
        };
    }

    generateNewId = () => {
        this.elementId = 'id-' + Date.now();
    }

    protected override template() {
        return html`
            <div class="demo">
                <div class="section">
                    <h3>1. Basic Attribute Binding</h3>
                    <div id="${this.elementId}">
                        This element has a dynamic ID: ${this.elementId}
                    </div>
                    <button @click="${this.generateNewId}">
                        Generate New ID
                    </button>
                </div>

                <div class="section">
                    <h3>2. Boolean Attribute Binding</h3>
                    <button 
                        ?disabled="${this.isActive}"
                        @click="${this.toggleActive}"
                    >
                        ${this.isActive ? 'Disabled Button' : 'Active Button'}
                    </button>
                </div>

                <div class="section">
                    <h3>3. Style Object Binding</h3>
                    <div style="${JSON.stringify(this.styles)}">
                        This element has dynamic styles
                    </div>
                    <button @click="${() => this.updateStyle('backgroundColor', '#e8f5e9')}">
                        Green Background
                    </button>
                    <button @click="${() => this.updateStyle('backgroundColor', '#fff3cd')}">
                        Yellow Background
                    </button>
                </div>

                <div class="section">
                    <h3>4. Class Object Binding</h3>
                    <div class="${Object.keys(this.classes).filter(key => this.classes[key]).join(' ')}">
                        This element has dynamic classes
                    </div>
                    <button @click="${() => this.toggleClass('active')}">
                        Toggle Active
                    </button>
                    <button @click="${() => this.toggleClass('highlight')}">
                        Toggle Highlight
                    </button>
                    <button @click="${() => this.toggleClass('hidden')}">
                        Toggle Hidden
                    </button>
                </div>
            </div>
        `;
    }
}

customElements.define('attribute-bindings-element', AttributeBindingsElement);

export default {
    title: 'Miura/Core/04. Attribute Bindings',
    tags: ['autodocs'],
    render: (args) => {
        const element = document.createElement('attribute-bindings-element') as AttributeBindingsElement;
        Object.assign(element, args);
        return element;
    },
    argTypes: {
        elementId: { control: 'text' },
        isActive: { control: 'boolean' },
        styles: { control: 'object' },
        classes: { control: 'object' }
    },
    parameters: {
        docs: {
            description: {
                component: `
# Attribute Bindings in Miura

This story demonstrates the various ways to bind attributes in Miura components.

## Types of Attribute Bindings

### 1. Basic Attribute Binding
* Use \`attribute=\${value}\` syntax
* Values are converted to strings
* Updates automatically when value changes

\`\`\`typescript
html\`<div id=\${elementId}>\`
\`\`\`

### 2. Boolean Attribute Binding
* Use \`?attribute=\${boolean}\` syntax
* Attribute is added/removed based on truthiness
* Perfect for disabled, checked, etc.

\`\`\`typescript
html\`<button ?disabled=\${isDisabled}>\`
\`\`\`

### 3. Style Object Binding
* Use \`style=\${styleObject}\` syntax
* Object properties are converted to CSS properties
* Updates automatically with object changes

\`\`\`typescript
html\`<div style=\${JSON.stringify(styles)}>\`
\`\`\`

### 4. Class Object Binding
* Use \`class=\${classObject}\` syntax
* Object keys are class names
* Values determine if class is applied

\`\`\`typescript
html\`<div class=\${Object.keys(classes).filter(key => classes[key]).join(' ')}>\`
\`\`\`
                `
            }
        }
    }
} as Meta<AttributeBindingsElement>;

export const Default: StoryObj<AttributeBindingsElement> = {
    name: 'Attribute Bindings Demo',
    args: {
        elementId: 'dynamic-id',
        isActive: false,
        styles: {
            color: '#333',
            backgroundColor: '#f0f0f0',
            padding: '10px',
            borderRadius: '4px'
        },
        classes: {
            active: false,
            highlight: true,
            hidden: false
        }
    }
};

export const WithActiveStates: StoryObj<AttributeBindingsElement> = {
    name: 'With Active States',
    args: {
        elementId: 'active-demo',
        isActive: true,
        styles: {
            color: '#ffffff',
            backgroundColor: '#2196F3',
            padding: '15px',
            borderRadius: '8px'
        },
        classes: {
            active: true,
            highlight: true,
            hidden: false
        }
    }
};
