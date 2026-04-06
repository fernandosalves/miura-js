import { MiuraElement, html, css } from '@miurajs/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';

class FocusDirectiveDemo extends MiuraElement {
    // Property declarations for TypeScript
    declare focusCount: number;
    declare blurCount: number;
    declare lastFocusedElement: string;
    declare lastBlurredElement: string;
    declare autofocusEnabled: boolean;

    static properties = {
        focusCount: { type: Number, default: 0, state: true },
        blurCount: { type: Number, default: 0, state: true },
        lastFocusedElement: { type: String, default: '', state: true },
        lastBlurredElement: { type: String, default: '', state: true },
        autofocusEnabled: { type: Boolean, default: true, state: true }
    };

    static get styles() {
        return css`
            :host {
                display: block;
                font-family: 'Helvetica Neue', Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }

            .focus-demo {
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

            .focusable-element {
                padding: 12px;
                margin: 8px;
                border: 2px solid #ddd;
                border-radius: 4px;
                background: #f9f9f9;
                cursor: pointer;
                transition: all 0.2s ease;
                display: inline-block;
                min-width: 120px;
                text-align: center;
            }

            .focusable-element:focus {
                border-color: #2196F3;
                background: #e3f2fd;
                box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
                outline: none;
            }

            .focusable-element:hover {
                border-color: #1976d2;
                background: #f5f5f5;
            }

            .stats {
                background: #f5f5f5;
                padding: 12px;
                border-radius: 4px;
                margin: 12px 0;
                font-family: monospace;
                font-size: 14px;
            }

            .stats-row {
                display: flex;
                justify-content: space-between;
                margin: 4px 0;
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

            input {
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 16px;
                margin: 4px;
            }

            .autofocus-demo {
                border: 2px dashed #ff9800;
                padding: 15px;
                margin: 15px 0;
                background: #fff3e0;
            }

            .focus-trap {
                border: 2px solid #4caf50;
                padding: 15px;
                margin: 15px 0;
                background: #e8f5e8;
            }
        `;
    }

    handleFocus = (elementId: string) => (e: FocusEvent) => {
        this.focusCount++;
        this.lastFocusedElement = elementId;
        console.log(`Element focused: ${elementId}`, e);
    };

    handleBlur = (elementId: string) => (e: FocusEvent) => {
        this.blurCount++;
        this.lastBlurredElement = elementId;
        console.log(`Element blurred: ${elementId}`, e);
    };

    toggleAutofocus = () => {
        this.autofocusEnabled = !this.autofocusEnabled;
    };

    resetCounters = () => {
        this.focusCount = 0;
        this.blurCount = 0;
        this.lastFocusedElement = '';
        this.lastBlurredElement = '';
    };

    protected override template() {
        return html`
            <div class="focus-demo">
                <h2>Focus Directive Demo</h2>
                <p>This demonstrates the focus directive with autofocus, focus/blur event handling, and focus management.</p>

                <div class="demo-section">
                    <h3>Focus Statistics</h3>
                    <div class="stats">
                        <div class="stats-row">
                            <span>Focus Events:</span>
                            <span>${this.focusCount}</span>
                        </div>
                        <div class="stats-row">
                            <span>Blur Events:</span>
                            <span>${this.blurCount}</span>
                        </div>
                        <div class="stats-row">
                            <span>Last Focused:</span>
                            <span>${this.lastFocusedElement || 'None'}</span>
                        </div>
                        <div class="stats-row">
                            <span>Last Blurred:</span>
                            <span>${this.lastBlurredElement || 'None'}</span>
                        </div>
                    </div>
                    <button @click="${this.resetCounters}">Reset Counters</button>
                </div>

                <div class="demo-section">
                    <h3>1. Basic Focus/Blur Events</h3>
                    <p>Click or tab through these elements to see focus/blur events:</p>
                    
                    <div 
                        class="focusable-element"
                        #focus=${{
                            onFocus: this.handleFocus('element-1'),
                            onBlur: this.handleBlur('element-1')
                        }}
                    >
                        Element 1
                    </div>
                    
                    <div 
                        class="focusable-element"
                        #focus=${{
                            onFocus: this.handleFocus('element-2'),
                            onBlur: this.handleBlur('element-2')
                        }}
                    >
                        Element 2
                    </div>
                    
                    <div 
                        class="focusable-element"
                        #focus=${{
                            onFocus: this.handleFocus('element-3'),
                            onBlur: this.handleBlur('element-3')
                        }}
                    >
                        Element 3
                    </div>
                </div>

                <div class="demo-section">
                    <h3>2. Autofocus Demo</h3>
                    <p>Elements with autofocus will automatically receive focus when mounted:</p>
                    
                    <button @click="${this.toggleAutofocus}">
                        ${this.autofocusEnabled ? 'Disable' : 'Enable'} Autofocus
                    </button>
                    
                    <div class="autofocus-demo">
                        <input 
                            type="text"
                            placeholder="This input has autofocus"
                            #focus=${{
                                autofocus: this.autofocusEnabled,
                                onFocus: this.handleFocus('autofocus-input'),
                                onBlur: this.handleBlur('autofocus-input')
                            }}
                        />
                        
                        <button 
                            #focus=${{
                                autofocus: this.autofocusEnabled,
                                onFocus: this.handleFocus('autofocus-button'),
                                onBlur: this.handleBlur('autofocus-button')
                            }}
                        >
                            Autofocus Button
                        </button>
                    </div>
                </div>

                <div class="demo-section">
                    <h3>3. Form Focus Management</h3>
                    <p>Demonstrates focus handling in a form context:</p>
                    
                    <div class="focus-trap">
                        <input 
                            type="text"
                            placeholder="First Name"
                            #focus=${{
                                onFocus: this.handleFocus('first-name'),
                                onBlur: this.handleBlur('first-name')
                            }}
                        />
                        
                        <input 
                            type="text"
                            placeholder="Last Name"
                            #focus=${{
                                onFocus: this.handleFocus('last-name'),
                                onBlur: this.handleBlur('last-name')
                            }}
                        />
                        
                        <input 
                            type="email"
                            placeholder="Email"
                            #focus=${{
                                onFocus: this.handleFocus('email'),
                                onBlur: this.handleBlur('email')
                            }}
                        />
                        
                        <button 
                            #focus=${{
                                onFocus: this.handleFocus('submit-btn'),
                                onBlur: this.handleBlur('submit-btn')
                            }}
                        >
                            Submit
                        </button>
                    </div>
                </div>

                <div class="demo-section">
                    <h3>4. Dynamic Focus Elements</h3>
                    <p>Elements that can be dynamically focused:</p>
                    
                    <button 
                        @click="${() => this.shadowRoot?.querySelector('#dynamic-element')?.focus()}"
                    >
                        Focus Dynamic Element
                    </button>
                    
                    <div 
                        id="dynamic-element"
                        class="focusable-element"
                        tabindex="0"
                        #focus=${{
                            onFocus: this.handleFocus('dynamic-element'),
                            onBlur: this.handleBlur('dynamic-element')
                        }}
                    >
                        Dynamic Element
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('focus-directive-demo', FocusDirectiveDemo);

const meta: Meta<FocusDirectiveDemo> = {
    title: 'Miura/Directives/Utility/07. Focus',
    component: 'focus-directive-demo',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: `
# Focus Directive

The focus directive provides focus management capabilities for elements, including autofocus and focus/blur event handling.

## Features

### Autofocus
Automatically focus an element when it's mounted to the DOM:

\`\`\`typescript
html\`
  <input #focus=\${{
    autofocus: true,
    onFocus: this.handleFocus,
    onBlur: this.handleBlur
  }} />
\`\`\`

### Focus/Blur Event Handling
Handle focus and blur events with custom callbacks:

\`\`\`typescript
html\`
  <div #focus=\${{
    onFocus: (e) => console.log('Element focused'),
    onBlur: (e) => console.log('Element blurred')
  }}>
    Focusable Element
  </div>
\`\`\`

## Use Cases

- **Form Management**: Automatically focus the first input field
- **Accessibility**: Improve keyboard navigation
- **Focus Trapping**: Manage focus within modal dialogs
- **Focus Restoration**: Remember and restore focus state
- **Event Tracking**: Monitor user interaction patterns

## Options

- \`autofocus\`: Boolean - Automatically focus the element on mount
- \`onFocus\`: Function - Callback when element receives focus
- \`onBlur\`: Function - Callback when element loses focus

## Best Practices

1. Use autofocus sparingly - only one element should have autofocus per page
2. Provide visual feedback for focused elements
3. Ensure focus indicators meet accessibility standards
4. Handle focus restoration when components unmount
                `
            }
        }
    }
};

export default meta;
type Story = StoryObj<FocusDirectiveDemo>;

export const Basic: Story = {
    args: {}
};

export const WithAutofocus: Story = {
    args: {
        autofocusEnabled: true
    }
};

export const WithoutAutofocus: Story = {
    args: {
        autofocusEnabled: false
    }
}; 