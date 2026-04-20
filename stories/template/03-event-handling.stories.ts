import { MiuraElement, html, css } from '../../packages/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';

/**
 * # Event Handling in Miura
 * 
 * This story demonstrates various ways to handle events in Miura components.
 * Miura provides a powerful and flexible event handling system that supports
 * both arrow functions and regular methods for event handlers.
 * 
 * ## Event Binding Syntax
 * 
 * Miura uses the `@` prefix for event bindings in templates:
 * ```typescript
 * // Basic event binding
 * @click="${this.handleClick}"
 * 
 * // With event modifiers
 * @click|prevent="${this.handleClick}"  // preventDefault()
 * @click|stop="${this.handleClick}"     // stopPropagation()
 * 
 * // Keyboard events with key modifiers
 * @keydown|enter="${this.handleEnter}"
 * @keydown|esc="${this.handleEscape}"
 * ```
 * 
 * ## Method Binding Approaches
 * 
 * ### 1. Arrow Functions (Class Fields)
 * ```typescript
 * class MyComponent extends MiuraElement {
 *   handleClick = () => {
 *     // 'this' is automatically bound
 *     this.count++;
 *   }
 * }
 * ```
 * 
 * ### 2. Regular Methods
 * ```typescript
 * class MyComponent extends MiuraElement {
 *   handleClick() {
 *     // Miura handles method binding
 *     this.count++;
 *   }
 * }
 * ```
 * 
 * ## State Updates
 * 
 * Properties marked with `state: true` will automatically trigger re-renders:
 * ```typescript
 * static properties = {
 *   count: { type: Number, state: true }
 * };
 * ```
 * 
 * ## Event Types
 * 
 * Miura supports all standard DOM events:
 * - Mouse events: click, mousedown, mouseup, mousemove
 * - Keyboard events: keydown, keyup, keypress
 * - Form events: input, change, submit
 * - Focus events: focus, blur
 * - Touch events: touchstart, touchmove, touchend
 * 
 * ## Example Implementation
 * 
 * Below is a comprehensive example showing various event handling patterns.
 */

class EventDemoElement extends MiuraElement {
    // Property declarations for TypeScript
    declare clickCount: number;
    declare inputValue: string;
    declare mousePosition: string;

    static properties = {
        clickCount: { type: Number, default: 0, state: true },
        inputValue: { type: String, default: '', state: true },
        mousePosition: { type: String, default: '', state: true }
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

            .event-demo {
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
                width: 100%;
                margin-bottom: 10px;
            }

            .mouse-area {
                height: 100px;
                background: #f5f5f5;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                margin-top: 10px;
                cursor: crosshair;
            }
        `;
    }

    handleClick = () => {
        this.clickCount++;
    }

    handleInput = (e: Event) => {
        const target = e.target as HTMLInputElement;
        this.inputValue = target.value;
    }

    handleMouseMove = (e: MouseEvent) => {
        this.mousePosition = `X: ${e.offsetX}, Y: ${e.offsetY}`;
    }

    protected override template() {
        return html`
            <div class="event-demo">
                <div class="demo-section">
                    <h3>Click Events</h3>
                    <button @click="${this.handleClick}">
                        Click me (${this.clickCount} clicks)
                    </button>
                </div>

                <div class="demo-section">
                    <h3>Input Events</h3>
                    <input 
                        type="text"
                        .value="${this.inputValue}"
                        @input="${this.handleInput}"
                        placeholder="Type something..."
                    />
                    <p>You typed: ${this.inputValue}</p>
                </div>

                <div class="demo-section">
                    <h3>Mouse Events</h3>
                    <div 
                        class="mouse-area"
                        @mousemove="${this.handleMouseMove}"
                    >
                        Mouse position: ${this.mousePosition}
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('event-demo-element', EventDemoElement);

const meta: Meta<EventDemoElement> = {
    title: 'Miura/Core/03. Event Handling',
    component: 'event-demo-element',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: `
# Event Handling in Miura Components

This component demonstrates different event handling patterns in Miura.

## Features Demonstrated

* **Click Events**
  * Basic click handling
  * Automatic method binding
  * State updates with \`state: true\`

* **Input Events**
  * Form input handling
  * Two-way data binding
  * TypeScript event typing

* **Mouse Events**
  * Mouse position tracking
  * Event object usage
  * Real-time updates

## Implementation Notes

* Uses both arrow functions and regular methods
* Demonstrates automatic state updates
* Shows proper TypeScript event typing
* Includes CSS styling for interactive elements

## Usage Example

\`\`\`typescript
<event-demo-element></event-demo-element>
\`\`\`
                `
            }
        }
    }
};

export default meta;

type Story = StoryObj<EventDemoElement>;

export const Default: Story = {
    args: {
        clickCount: 0,
        inputValue: '',
        mousePosition: ''
    }
};
