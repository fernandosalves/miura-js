import { MiuraElement, html, css } from '@miurajs/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';
import { component } from '@miurajs/miura-element';

@component({
    tag: 'reference-binding-demo',
    
})
class ReferenceBindingDemo extends MiuraElement {
    declare elementText: string;
    static properties = {
        elementText: { type: String, default: 'Click buttons to manipulate this element' }
    };

    // Store element reference
    private elementRef: HTMLElement | null = null;

    static get styles() {
        return css`
            .target {
                padding: 16px;
                margin: 16px 0;
                border: 2px solid #ccc;
                border-radius: 4px;
                transition: all 0.3s ease;
            }

            .highlight {
                background: #fff3cd;
                border-color: #ffeeba;
            }

            button {
                margin: 4px;
                padding: 8px 16px;
            }
        `;
    }

    // Method to store the element reference
    private setRef = (element: Element | null) => {
        this.elementRef = element as HTMLElement;
        console.log('Reference set:', this.elementRef);
    };

    // Methods to manipulate the referenced element
    private highlight = () => {
        this.elementRef?.classList.toggle('highlight');
    };

    private updateText = () => {
        if (this.elementRef) {
            this.elementText = `Text updated at ${new Date().toLocaleTimeString()}`;
        }
    };

    private animateElement = () => {
        if (this.elementRef) {
            this.elementRef.style.transform = 'translateX(50px)';
            setTimeout(() => {
                if (this.elementRef) {
                    this.elementRef.style.transform = '';
                }
            }, 500);
        }
    };

    protected override template() {
        return html`
            <div>
                <h3>Reference Binding Example</h3>
                
                <div class="target" #ref=${this.setRef}>
                    ${this.elementText}
                </div>

                <div>
                    <button @click="${this.highlight}">
                        Highlight Element
                    </button>
                    <button @click="${this.updateText}">
                        Update Text
                    </button>
                    <button @click="${this.animateElement}">
                        Animate Element
                    </button>
                </div>
            </div>
        `;
    }
}

export default {
    title: 'Miura/Bindings/02. Reference (#)',
    component: 'reference-binding-demo',
    tags: ['autodocs']
} as Meta;

type Story = StoryObj<ReferenceBindingDemo>;

export const Default: Story = {
    args: {
        elementText: 'Click buttons to manipulate this element'
    }
}; 