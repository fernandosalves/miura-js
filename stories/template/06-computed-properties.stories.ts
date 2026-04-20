import { MiuraElement, html, css } from '../../packages/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';

class ComputedPropertiesElement extends MiuraElement {
    // Declare instance properties for TypeScript
    declare firstName: string;
    declare lastName: string;
    declare age: number;
    declare isSenior: boolean;
    declare fullName: string;
    declare birthYear: number;
    declare greeting: string;
    declare ageStatus: string;

    // Properties configuration
    static properties = {
        firstName: { type: String, default: 'John' },
        lastName: { type: String, default: 'Doe' },
        age: { type: Number, default: 30 },
        isSenior: { type: Boolean, default: false }
    };

    // Computed properties
    static computed() {
        return {
            fullName: {
                dependencies: ['firstName', 'lastName'],
                get() {
                    return `${this.firstName} ${this.lastName}`.trim();
                }
            },
            birthYear: {
                dependencies: ['age'],
                get() {
                    return new Date().getFullYear() - this.age;
                },
                set(value: number) {
                    this.age = new Date().getFullYear() - value;
                }
            },
            greeting: {
                dependencies: ['firstName'],
                get() {
                    const hour = new Date().getHours();
                    const timeOfDay = hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening';
                    return `Good ${timeOfDay}, ${this.firstName}!`;
                }
            },
            ageStatus: {
                dependencies: ['age'],
                get() {
                    return this.age >= 65 ? 'Senior' : 'Adult';
                }
            }
        };
    }

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

            .computed-output {
                padding: 15px;
                margin: 10px 0;
                background-color: #f8f9fa;
                border-left: 4px solid #007bff;
                border-radius: 4px;
                font-family: monospace;
                white-space: pre-wrap;
            }

            .controls {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin: 15px 0;
            }

            .control-group {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }

            label {
                font-weight: 500;
                color: #495057;
            }

            input, select {
                padding: 8px 12px;
                border: 1px solid #ced4da;
                border-radius: 4px;
                font-size: 14px;
            }

            .highlight {
                color: #e83e8c;
                font-weight: 500;
            }
        `;
    }

    // Event handlers as arrow function class fields
    handleFirstNameInput = (e: Event) => {
        const target = e.target as HTMLInputElement;
        this.firstName = target.value;
    }

    handleLastNameInput = (e: Event) => {
        const target = e.target as HTMLInputElement;
        this.lastName = target.value;
    }

    handleAgeInput = (e: Event) => {
        const target = e.target as HTMLInputElement;
        this.age = parseInt(target.value) || 0;
    }

    // Lifecycle method called after updates
    updated(changedProperties?: Map<string, unknown>) {
        // Called after updates are completed
    }

    template() {
        return html`
            <div class="demo">
                <h2>Computed Properties Demo</h2>
                <p>This component demonstrates the use of computed properties in Miura.</p>
                
                <div class="section">
                    <h3>Input Values</h3>
                    <div class="controls">
                        <div class="control-group">
                            <label for="firstName">First Name:</label>
                            <input 
                                id="firstName" 
                                type="text" 
                                .value="${this.firstName}"
                                @input="${this.handleFirstNameInput}"
                                placeholder="First name"
                            >
                        </div>
                        
                        <div class="control-group">
                            <label for="lastName">Last Name:</label>
                            <input 
                                id="lastName" 
                                type="text" 
                                .value="${this.lastName}"
                                @input="${this.handleLastNameInput}"
                                placeholder="Last name"
                            >
                        </div>
                        
                        <div class="control-group">
                            <label for="age">Age:</label>
                            <input 
                                id="age" 
                                type="number" 
                                .value="${this.age}"
                                @input="${this.handleAgeInput}"
                                placeholder="Age"
                            >
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <h3>Computed Values</h3>
                    
                    <div class="computed-output">
                        <div><strong>Full Name:</strong> <span class="highlight">${this.fullName}</span></div>
                        <div><strong>Birth Year (approx):</strong> <span class="highlight">${this.birthYear}</span> 
                            <small>(set to 1980 to see computed age update)</small>
                        </div>
                        <div><strong>Greeting:</strong> <span class="highlight">${this.greeting}</span></div>
                        <div><strong>Age Status:</strong> <span class="highlight">${this.ageStatus}</span> 
                            <small>${this.age >= 65 ? '👴' : '👨‍💼'}</small>
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <h3>How It Works</h3>
                    <p>Computed properties are defined using <code>Object.defineProperties</code> in the constructor.</p>
                    <p>They automatically update when their dependencies change, and their values are cached for performance.</p>
                    <p>Try changing the input values above to see the computed properties update in real-time.</p>
                </div>
            </div>
        `;
    }
}

customElements.define('computed-properties-element', ComputedPropertiesElement);


type Story = StoryObj<ComputedPropertiesElement>;

export default {
    title: 'Miura/Core/06. Computed Properties',
    component: 'computed-properties-element',
    // Only include writable properties in argTypes
    argTypes: {
        firstName: {
            control: 'text',
            description: 'The first name of the person',
            table: { category: 'Properties' },
        },
        lastName: {
            control: 'text',
            description: 'The last name of the person',
            table: { category: 'Properties' },
        },
        age: {
            control: { type: 'number', min: 0, max: 120 },
            description: 'The age of the person',
            table: { category: 'Properties' },
        },
        isSenior: {
            control: 'boolean',
            description: 'Whether the person is a senior citizen',
            table: { category: 'Properties' },
        },
        // Include computed properties as read-only
        fullName: {
            control: { type: null }, // Disable control for computed properties
            description: 'Computed: Full name (first + last)',
            table: {
                category: 'Computed Properties',
                type: { summary: 'string' }
            },
        },
        birthYear: {
            control: { type: 'number', min: 1900, max: new Date().getFullYear() },
            description: 'Computed: Birth year based on current year and age',
            table: {
                category: 'Computed Properties',
                type: { summary: 'number' }
            },
        },
        greeting: {
            control: { type: null },
            description: 'Computed: Time-based greeting with name',
            table: {
                category: 'Computed Properties',
                type: { summary: 'string' }
            },
        },
        ageStatus: {
            control: { type: 'select' },
            options: ['Adult', 'Senior'],
            description: 'Computed: Age category (Adult/Senior)',
            table: {
                category: 'Computed Properties',
                type: { summary: 'string' }
            },
        },
    },
    args: {
        firstName: 'John',
        lastName: 'Doe',
        age: 30,
        isSenior: false,
    },
    parameters: {
        docs: {
            description: {
                component: 'Demonstrates computed properties in Miura elements. Computed properties are automatically updated when their dependencies change.'
            }
        },
        controls: {
            sort: 'requiredFirst',
            expanded: true
        }
    }
}


export const Default: Story = {
    args: {
        firstName: 'John',
        lastName: 'Doe',
        age: 30,
        isSenior: false,
    }
};

export const SeniorCitizen: Story = {
    args: {
        firstName: 'Jane',
        lastName: 'Smith',
        age: 72,
        isSenior: true,
    }
};

export const YoungAdult: Story = {
    args: {
        firstName: 'Alex',
        lastName: 'Johnson',
        age: 22,
        isSenior: false,
    }
};

// Add a story that demonstrates updating computed properties
export const WithUpdates: Story = {
    args: {
        firstName: 'Initial',
        lastName: 'User',
        age: 25,
        isSenior: false,
    },
    parameters: {
        docs: {
            description: {
                story: 'This story demonstrates how computed properties update when their dependencies change.'
            }
        }
    }
};