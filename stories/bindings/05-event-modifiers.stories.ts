import { MiuraElement, html, css } from '@miurajsjs/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';
import { component } from '@miurajsjs/miura-element';


@component({
    tag: 'event-modifiers-demo',
    
})
class EventModifiersDemo extends MiuraElement {
    declare clickCount: number;
    declare inputValue: string;
    declare mouseX: number;
    declare throttledX: number;
    declare keyPressed: string;
    declare modifierPressed: string;
    declare outsideClicks: number;

    static properties = {
        clickCount: { type: Number, default: 0 },
        inputValue: { type: String, default: '' },
        mouseX: { type: Number, default: 0 },
        throttledX: { type: Number, default: 0 },
        keyPressed: { type: String, default: '' },
        modifierPressed: { type: String, default: '' },
        outsideClicks: { type: Number, default: 0 }
    };

    static get styles() {
        return css`
            :host {
                display: block;
                padding: 20px;
            }

            .demo-section {
                margin: 16px 0;
                padding: 16px;
                border: 1px solid #eee;
                border-radius: 4px;
            }

            button {
                margin: 8px;
                padding: 8px 16px;
            }

            input {
                padding: 8px;
                margin: 8px;
                width: 200px;
            }
        `;
    }

    private handleClick = (e: Event) => {
        this.clickCount++;
    };

    private handleInput = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const value = target.value;
        console.log('Input handler called:', {
            value,
            target,
            type: e.type,
            currentValue: this.inputValue
        });
        this.inputValue = value;
        this.requestUpdate();
    };

    private handleMouseMove = (e: MouseEvent) => {
        this.mouseX = e.clientX;
        this.requestUpdate();
    };

    private handleThrottledMove = (e: MouseEvent) => {
        this.throttledX = e.clientX;
        this.requestUpdate();
    };

    private handleKey = (e: KeyboardEvent) => {
        // Log any key press
        const key = e.key;
        console.log('Key pressed:', key);
        
        // Only update state if Enter is pressed (due to |key:Enter modifier)
        if (key === 'Enter') {
            this.keyPressed = 'Enter ⏎';
            this.requestUpdate();
        }
    };

    protected override template() {
        return html`
            <div>
                <h3>Event Modifier Examples</h3>
                
                <!-- Basic Modifiers -->
                <div class="demo-section">
                    <h4>1. Basic Modifiers</h4>
                    <button @click|prevent=${this.handleClick}>
                        Prevent Default (${this.clickCount})
                    </button>
                    <button @click|once=${this.handleClick}>
                        Click Once Only
                    </button>
                    <button @click|stop=${this.handleClick}>
                        Stop Propagation
                    </button>
                </div>

                <!-- Time-based Modifiers -->
                <div class="demo-section">
                    <h4>2. Time-based Modifiers</h4>
                    <input 
                        type="text" 
                        .value="${this.inputValue}"
                        @input="${this.handleInput}"
                        placeholder="Type with debounce..."
                    />
                    <p>Current value: ${this.inputValue}</p>
                    <p><small>Value updates 500ms after typing stops</small></p>

                    <div 
                        style="padding: 20px; background: #f5f5f5; margin-top: 10px;"
                        @mousemove="${this.handleMouseMove}"
                    >
                        Normal Mouse X: ${this.mouseX}
                    </div>
                    <div 
                        style="padding: 20px; background: #e0e0e0;"
                        @mousemove|throttle:400="${this.handleThrottledMove}"
                    >
                        Throttled Mouse X: ${this.throttledX}
                        <br>
                        <small>Updates max once per 400ms</small>
                    </div>
                </div>

                <!-- Key Modifiers -->
                <div class="demo-section">
                    <h4>3. Key Modifiers</h4>
                    <div>
                        <input 
                            @keydown|key:Enter=${this.handleKey}
                            placeholder="Type something..."
                        >
                        <small style="display: block; color: #666; margin-top: 4px;">
                            Press Enter to trigger the event
                        </small>
                        <p>Last key pressed: ${this.keyPressed || 'None'}</p>
                    </div>
                </div>

                <!-- Advanced Modifiers -->
                <div class="demo-section">
                    <h4>4. Advanced Modifiers</h4>
                    
                    <!-- Passive Scroll -->
                    <div style="border: 1px solid #eee; margin: 10px 0;">
                        <div 
                            @scroll|passive=${this.handleScroll}
                            style="height: 100px; overflow: auto; padding: 10px;"
                        >
                            <div style="height: 200px; background: linear-gradient(#f5f5f5, #e0e0e0);">
                                Scroll me (passive)
                                <br>
                                <small>Check console for scroll events</small>
                            </div>
                        </div>
                    </div>

                    <!-- Capture Phase -->
                    <div style="border: 1px solid #eee; margin: 10px 0; padding: 10px;">
                        <div 
                            @click|capture=${this.handleCapture}
                            style="padding: 20px; background: #f5f5f5;"
                        >
                            Parent (capture phase)
                            <button @click="${this.handleBubble}">
                                Child (bubble phase)
                            </button>
                        </div>
                        <small>Check console for event order</small>
                    </div>
                </div>
            </div>
        `;
    }

    // Add handlers
    private handleScroll = () => {
        console.log('Passive scroll event');
    };

    private handleCapture = () => {
        console.log('Capture phase: Parent first');
    };

    private handleBubble = (e: Event) => {
        console.log('Bubble phase: Child second');
        e.stopPropagation(); // Stop it here to see the difference
    };
}

export default {
    title: 'Miura/Bindings/05. Event Modifiers (@)',
    component: 'event-modifiers-demo',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: `
# Event Modifiers in Miura

Event modifiers allow you to modify event behavior declaratively in the template.

## Available Modifiers

### Basic Modifiers
- \`prevent\`: Calls preventDefault()
- \`stop\`: Calls stopPropagation()
- \`once\`: Handler executes only once

### Time-based Modifiers
- \`debounce:ms\`: Delays execution until pause in events
- \`throttle:ms\`: Limits execution rate

### Key Modifiers
- \`key:Enter\`: Only triggers on specific key

### Advanced Modifiers
- \`passive\`: Improves scroll performance
- \`capture\`: Uses capture phase instead of bubble

## Usage Examples

\`\`\`typescript
// Basic modifiers
<button @click|prevent=\${handler}>
<div @click|stop=\${handler}>
<button @click|once=\${handler}>

// Time-based modifiers
<input @input|debounce:500=\${handler}>
<div @mousemove|throttle:400=\${handler}>

// Key modifiers
<input @keydown|key:Enter=\${handler}>

// Advanced modifiers
<div @scroll|passive=\${handler}>
<div @click|capture=\${handler}>
\`\`\`

## Event Phases

When using capture modifier, events flow in this order:
1. Capture phase (parent → child)
2. Target phase
3. Bubble phase (child → parent)

## Performance Tips

- Use \`passive\` for scroll events
- Use \`debounce\` for input events
- Use \`throttle\` for frequent events (mousemove, resize)
                `
            }
        }
    }
} as Meta;

type Story = StoryObj<EventModifiersDemo>;

export const Default: Story = {
    args: {
        clickCount: 0,
        inputValue: ''
    }
}; 