import { MiuraElement, html, css } from '@miurajs/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';
import { component } from '@miurajs/miura-element';

@component({
    tag: 'switch-demo',
    
})
class SwitchDemo extends MiuraElement {
    declare currentTab: string;

    static properties = {
        currentTab: { type: String, default: 'home' }
    };

    static get styles() {
        return css`
            :host {
                display: block;
                padding: 20px;
            }

            .tab-buttons {
                margin-bottom: 16px;
            }

            button {
                margin: 4px;
                padding: 8px 16px;
            }

            .tab-content {
                padding: 16px;
                border: 1px solid #eee;
                border-radius: 4px;
            }
        `;
    }

    template() {
        return html`
            <div>
                <h3>Switch Directive</h3>

                <div class="tab-buttons">
                    <button @click="${() => this.currentTab = 'home'}">Home</button>
                    <button @click="${() => this.currentTab = 'about'}">About</button>
                    <button @click="${() => this.currentTab = 'contact'}">Contact</button>
                    <button @click="${() => this.currentTab = 'unknown'}">Unknown</button>
                </div>

                <div class="tab-content" #switch=${this.currentTab}>
                    <template case="home">
                        <h4>Home</h4>
                        <p>Welcome to the home page!</p>
                    </template>
                    
                    <template case="about">
                        <h4>About</h4>
                        <p>This is the about page.</p>
                    </template>
                    
                    <template case="contact">
                        <h4>Contact</h4>
                        <p>Contact us here.</p>
                    </template>

                    <template default>
                        <h4>404</h4>
                        <p>Page not found!</p>
                    </template>
                </div>
            </div>
        `;
    }
}

export default {
    title: 'Miura/Directives/Structural/02. Switch',
    component: 'switch-demo',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: `
# Switch Directive

The switch directive provides template-based conditional rendering, similar to a switch statement.

## Usage

\`\`\`typescript
<div #switch=\${value}>
    <template case="a">
        Content for case "a"
    </template>
    
    <template case="b">
        Content for case "b"
    </template>
    
    <template default>
        Default content when no case matches
    </template>
</div>
\`\`\`

## Features
- Case-based conditional rendering
- Default case support
- Template-based content
- Clean transitions between cases
- Type-safe value matching

## Example

\`\`\`typescript
class MyComponent extends MiuraElement {
    currentTab = 'home';

    template() {
        return html\`
            <div #switch=\${this.currentTab}>
                <template case="home">
                    <h2>Home</h2>
                    <p>Welcome!</p>
                </template>
                
                <template case="about">
                    <h2>About</h2>
                    <p>About us</p>
                </template>

                <template default>
                    <h2>404</h2>
                    <p>Page not found</p>
                </template>
            </div>
        \`;
    }
}
\`\`\`

## Best Practices
1. Always provide a default case
2. Use string values for cases
3. Keep templates focused and small
4. Use for navigation/tab interfaces
                `
            }
        }
    }
} as Meta;

type Story = StoryObj<SwitchDemo>;

export const Default: Story = {}; 