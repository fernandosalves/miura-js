import { MiuraElement, html, css } from '@miurajs/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';
import { component } from '@miurajs/miura-element';

@component({
    tag: 'intersection-demo',
    
})
class IntersectionDemo extends MiuraElement {
    declare isVisible: boolean;
    declare intersectionCount: number;

    static properties = {
        isVisible: { type: Boolean, default: false },
        intersectionCount: { type: Number, default: 0 }
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

            .scroll-container {
                height: 300px;
                overflow: auto;
                border: 1px solid #ccc;
                padding: 16px;
            }

            .target-element {
                margin-top: 400px;
                padding: 20px;
                border-radius: 8px;
                transition: all 0.3s ease;
            }

            .status-indicator {
                display: inline-block;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                margin-right: 8px;
                transition: background-color 0.3s ease;
            }
        `;
    }

    private handleIntersection = (isVisible: boolean) => {
        this.isVisible = isVisible;
        if (isVisible) {
            this.intersectionCount++;
        }
        this.requestUpdate();
    };

    protected override template() {
        const targetStyles = {
            background: this.isVisible ? '#4CAF50' : '#f5f5f5',
            border: `2px solid ${this.isVisible ? '#2E7D32' : '#ddd'}`,
            transform: `scale(${this.isVisible ? '1.05' : '1'})`,
            boxShadow: this.isVisible ? 
                '0 4px 8px rgba(0,0,0,0.2)' : 
                '0 2px 4px rgba(0,0,0,0.1)'
        };

        const indicatorStyles = {
            background: this.isVisible ? '#4CAF50' : '#ccc'
        };

        return html`
            <div class="demo-section">
                <div class="status-bar">
                    <span class="status-indicator" style=${indicatorStyles}></span>
                    Element is ${this.isVisible ? 'visible' : 'hidden'}
                    (crossed threshold ${this.intersectionCount} times)
                </div>

                <div class="scroll-container">
                    <div>Scroll down ⬇️</div>
                    
                    <div 
                        #intersect=${this.handleIntersection}
                        class="target-element"
                        style=${targetStyles}
                    >
                        <h3>${this.isVisible ? '👋 Hello!' : 'Scroll to see me'}</h3>
                        <p>I am ${this.isVisible ? 'visible! 🎉' : 'hidden'}</p>
                    </div>
                </div>
            </div>
        `;
    }
}

export default {
    title: 'Miura/Directives/Observer/04. Intersection',
    component: 'intersection-demo',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: `
# Intersection Observer Directive

The intersection directive provides a declarative way to observe element visibility.

## Usage

\`\`\`typescript
<div 
    #intersect=\${(e) => console.log('Is visible:', e.detail.isIntersecting)}
>
    Content
</div>
\`\`\`

## Features
- Declarative intersection observation
- Automatic cleanup
- Type-safe event detail
                `
            }
        }
    }
} as Meta;

type Story = StoryObj<IntersectionDemo>;

export const Default: Story = {
    args: {
        isVisible: false
    }
}; 