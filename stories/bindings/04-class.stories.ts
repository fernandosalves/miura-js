import { MiuraElement, html, css } from '@miura/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';
import { component } from '@miura/miura-element';

@component({
    tag: 'class-binding-demo',
    
})
class ClassBindingDemo extends MiuraElement {
    declare isActive: boolean;
    declare isHighlighted: boolean;
    declare theme: string;

    static properties = {
        isActive: { type: Boolean, default: false },
        isHighlighted: { type: Boolean, default: false },
        theme: { type: String, default: 'default' }
    };

    static get styles() {
        return css`
            .demo-box {
                padding: 20px;
                margin: 16px 0;
                border: 2px solid #ccc;
                border-radius: 4px;
                transition: all 0.3s ease;
            }

            .active {
                border-color: #2196F3;
                background: #e3f2fd;
            }

            .highlighted {
                background: #fff3cd;
                border-color: #ffeeba;
            }

            .theme-dark {
                background: #333;
                color: white;
            }

            .theme-light {
                background: #fff;
                color: #333;
            }

            button {
                margin: 4px;
                padding: 8px 16px;
            }
        `;
    }

    private toggleActive = () => {
        this.isActive = !this.isActive;
    };

    private toggleHighlight = () => {
        this.isHighlighted = !this.isHighlighted;
    };

    private cycleTheme = () => {
        const themes = ['default', 'light', 'dark'];
        const currentIndex = themes.indexOf(this.theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        const nextTheme = themes[nextIndex];
        
        console.log('Theme change:', {
            currentTheme: this.theme,
            currentIndex,
            nextIndex,
            nextTheme
        });
        
        this.theme = nextTheme;
    };

    protected override template() {
        const classMap = {
            'demo-box': true,
            'active': this.isActive,
            'highlighted': this.isHighlighted,
            'theme-light': this.theme === 'light',
            'theme-dark': this.theme === 'dark'
        };

        console.log('Render with theme:', {
            theme: this.theme,
            classMap,
            activeClasses: Object.entries(classMap)
                .filter(([_, active]) => active)
                .map(([className]) => className),
            classString: Object.entries(classMap)
                .filter(([_, active]) => active)
                .map(([className]) => className)
                .join(' ')
        });

        return html`
            <div>
                <h3>Class Binding Examples</h3>
                
                <div class=${this.isActive ? 'demo-box active' : 'demo-box'}>
                    1. Simple Toggle
                </div>
                
                <div class=${Object.entries(classMap)
                    .filter(([_, active]) => active)
                    .map(([className]) => className)
                    .join(' ')}>
                    2. Multiple Classes (${this.theme})
                </div>
                
                <div class="demo-box ${this.isHighlighted ? 'highlighted' : ''}">
                    3. Mixed Classes
                </div>

                <div>
                    <button @click="${this.toggleActive}">Toggle Active</button>
                    <button @click="${this.toggleHighlight}">Toggle Highlight</button>
                    <button @click="${this.cycleTheme}">Change Theme</button>
                </div>
            </div>
        `;
    }
}

export default {
    title: 'Miura/Bindings/04. Class',
    component: 'class-binding-demo',
    tags: ['autodocs']
} as Meta;

type Story = StoryObj<ClassBindingDemo>;

export const Default: Story = {
    args: {
        isActive: false,
        isHighlighted: false,
        theme: 'default'
    }
}; 