import { MiuraElement, html, css } from '@miura/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';
import { component } from '@miura/miura-element';

@component({
    tag: 'style-binding-demo',
    
})
class StyleBindingDemo extends MiuraElement {
    declare bgColor: string;
    declare fontSize: number;
    
    static properties = {
        bgColor: { type: String, default: '#2196F3' },
        fontSize: { type: Number, default: 16 },
    };

    static get styles() {
        return css`
            :host {
                display: block;
                padding: 20px;
                font-family: system-ui, sans-serif;
            }

            .demo-box {
                margin: 16px 0;
                padding: 20px;
                border-radius: 8px;
                color: white;
                font-weight: 600;
                transition: all 0.3s ease;
            }

            .controls { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }

            button {
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                color: white;
            }

            .btn-green { background: #16a34a; }
            .btn-green:hover { background: #15803d; }
            .btn-yellow { background: #ca8a04; }
            .btn-yellow:hover { background: #a16207; }
            .btn-blue { background: #2563eb; }
            .btn-blue:hover { background: #1d4ed8; }
            .btn-red { background: #dc2626; }
            .btn-red:hover { background: #b91c1c; }
            .btn-sm { background: #6b7280; }
            .btn-sm:hover { background: #4b5563; }
            .btn-lg { background: #6b7280; }
            .btn-lg:hover { background: #4b5563; }

            .syntax { margin-top: 12px; padding: 12px; background: #1e1e2e; color: #cdd6f4; border-radius: 8px; font-family: monospace; font-size: 13px; white-space: pre; overflow-x: auto; }
        `;
    }

    private setBg = (color: string) => { this.bgColor = color; };
    private smaller = () => { this.fontSize = Math.max(12, this.fontSize - 2); };
    private larger = () => { this.fontSize = Math.min(32, this.fontSize + 2); };

    protected override template() {
        return html`
            <div>
                <h3>Style Object Binding</h3>
                <p style="color: #6b7280; font-size: 14px;">
                    Pass a JS object to <code>style=</code> to set multiple inline styles reactively.
                </p>

                <div class="controls">
                    <button class="btn-green" @click=${() => this.setBg('#16a34a')}>Green Background</button>
                    <button class="btn-yellow" @click=${() => this.setBg('#ca8a04')}>Yellow Background</button>
                    <button class="btn-blue" @click=${() => this.setBg('#2563eb')}>Blue Background</button>
                    <button class="btn-red" @click=${() => this.setBg('#dc2626')}>Red Background</button>
                    <button class="btn-sm" @click=${this.smaller}>Font −</button>
                    <button class="btn-lg" @click=${this.larger}>Font +</button>
                </div>

                <div class="demo-box" style=${{
                    backgroundColor: this.bgColor,
                    fontSize: this.fontSize + 'px',
                }}>
                    This element has dynamic styles
                </div>

                <div class="syntax">style=\${{
  backgroundColor: this.bgColor,   // '${this.bgColor}'
  fontSize: this.fontSize + 'px',  // '${this.fontSize}px'
}}</div>
            </div>
        `;
    }
}

export default {
    title: 'Miura/Bindings/03. Style',
    component: 'style-binding-demo',
    tags: ['autodocs']
} as Meta;

type Story = StoryObj<StyleBindingDemo>;

export const Default: Story = {
    args: {
        bgColor: '#2196F3',
        fontSize: 16,
    }
};