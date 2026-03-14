import { MiuraElement, html } from '@miura/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';

class PropertyBindingsElement extends MiuraElement {
    static properties = {
        inputValue: { type: String, default: '' },
        isDisabled: { type: Boolean, default: false },
        backgroundColor: { type: String, default: '#ffffff' }
    };

    template() {
        return html`
            <div style="font-family: sans-serif; padding: 20px;">
                <h2>Property Bindings</h2>
                
                <section style="margin: 20px 0;">
                    <h3>1. Basic Property Binding (.property)</h3>
                    <input 
                        type="text"
                        .value=${this.inputValue}
                        @input=${(e: Event) => this.inputValue = (e.target as HTMLInputElement).value}
                        placeholder="Type something..."
                    />
                    <p>Input value: ${this.inputValue}</p>
                </section>

                <section style="margin: 20px 0;">
                    <h3>2. Boolean Property Binding (?property)</h3>
                    <button ?disabled=${this.isDisabled}>
                        ${this.isDisabled ? 'Disabled Button' : 'Enabled Button'}
                    </button>
                    <button @click=${() => this.isDisabled = !this.isDisabled}>
                        Toggle Disabled
                    </button>
                </section>

                <section style="margin: 20px 0;">
                    <h3>3. Attribute Binding (property=)</h3>
                    <div style="padding: 20px; transition: background-color 0.3s;"
                         style="background-color: ${this.backgroundColor}">
                        This div's background color changes based on the input below
                    </div>
                    <input 
                        type="color"
                        .value=${this.backgroundColor}
                        @input=${(e: Event) => this.backgroundColor = (e.target as HTMLInputElement).value}
                    />
                </section>

                <section style="margin: 20px 0;">
                    <h3>4. Attribute ↔ Property Sync Demo</h3>
                    <div>
                        <button @click=${() => this.setAttribute('inputvalue', 'Set via attribute!')}>
                            Set inputValue attribute
                        </button>
                        <button @click=${() => this.removeAttribute('inputvalue')}>
                            Remove inputValue attribute
                        </button>
                        <button @click=${() => this.setAttribute('isdisabled', '')}>
                            Set isDisabled attribute (true)
                        </button>
                        <button @click=${() => this.removeAttribute('isdisabled')}>
                            Remove isDisabled attribute (false)
                        </button>
                        <button @click=${() => this.setAttribute('backgroundcolor', '#ffcccc')}>
                            Set backgroundColor attribute
                        </button>
                    </div>
                    <div style="margin-top: 10px;">
                        <strong>Current property values:</strong>
                        <ul>
                            <li>inputValue: <code>${this.inputValue}</code></li>
                            <li>isDisabled: <code>${String(this.isDisabled)}</code></li>
                            <li>backgroundColor: <code>${this.backgroundColor}</code></li>
                        </ul>
                    </div>
                    <div style="margin-top: 10px;">
                        <strong>Current attributes:</strong>
                        <ul>
                            <li>inputvalue: <code>${this.getAttribute('inputvalue')}</code></li>
                            <li>isdisabled: <code>${this.getAttribute('isdisabled')}</code></li>
                            <li>backgroundcolor: <code>${this.getAttribute('backgroundcolor')}</code></li>
                        </ul>
                    </div>
                </section>
            </div>
        `;
    }

    // Demonstrate attributeChangedCallback override for developers
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
        // Always call super to preserve framework sync
        super.attributeChangedCallback(name, oldValue, newValue);
        // Custom logic: log to console
        console.log(`[PropertyBindingsElement] attributeChangedCallback:`, { name, oldValue, newValue });
    }
}

customElements.define('miura-property-bindings', PropertyBindingsElement);

const meta: Meta<PropertyBindingsElement> = {
    title: 'Miura/Core/02. Properties & Attributes',
    component: 'miura-property-bindings',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: `
# Property Bindings in Miura

Miura supports various types of property bindings to make your templates dynamic and reactive.

## Types of Bindings

### Property Binding
For direct property access, use the \`.property\` syntax:

\`\`\`typescript
html\`
  <input .value=\${inputValue}>
\`\`\`

### Boolean Attribute Binding
For boolean attributes, use the \`?attribute\` syntax:

\`\`\`typescript
html\`
  <input ?disabled=\${isDisabled}>
\`\`\`

### Attribute Binding
For standard attributes, use the regular syntax:

\`\`\`typescript
html\`
  <div id=\${elementId}>
\`\`\`

## Usage Notes

* Properties (\`.property\`) bind directly to DOM element properties
* Boolean attributes (\`?attr\`) are added/removed based on truthiness
* Regular attributes are converted to strings
* All bindings are reactive and update automatically

## Examples

* Text Input: \`.value\` for two-way binding
* Checkboxes: \`?checked\` for boolean state
* Styles: \`style=\` for dynamic styling
* Classes: \`class=\` for dynamic classes
                `
            }
        }
    }
};

export default meta;
type Story = StoryObj<PropertyBindingsElement>;

export const Basic: Story = {
    args: {
        inputValue: '',
        isDisabled: false,
        backgroundColor: '#ffffff'
    }
};

export const WithValues: Story = {
    args: {
        inputValue: 'Hello Miura!',
        isDisabled: true,
        backgroundColor: '#e6f3ff'
    }
};
