import { MiuraElement, html, css, component } from '../../packages/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';

@component({ tag: 'bind-demo' })
class BindDemo extends MiuraElement {
    declare name: string;
    declare email: string;
    declare agree: boolean;

    static properties = {
        name: { type: String, default: '' },
        email: { type: String, default: '' },
        agree: { type: Boolean, default: false },
    };

    static get styles() {
        return css`
            :host { display: block; padding: 20px; font-family: system-ui, sans-serif; }
            .form-group { margin: 12px 0; }
            label { display: block; font-weight: 600; margin-bottom: 4px; color: #374151; font-size: 14px; }
            input[type="text"], input[type="email"] {
                width: 100%; padding: 8px 12px; border: 1px solid #d1d5db;
                border-radius: 6px; font-size: 14px; box-sizing: border-box;
            }
            input:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2); }
            .preview {
                margin-top: 16px; padding: 16px; background: #f0fdf4;
                border: 1px solid #bbf7d0; border-radius: 8px;
            }
            .preview h4 { margin: 0 0 8px; color: #166534; }
            .preview p { margin: 4px 0; font-size: 14px; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
            .badge-yes { background: #dcfce7; color: #166534; }
            .badge-no { background: #fef2f2; color: #991b1b; }
            .syntax { margin-top: 12px; padding: 12px; background: #1e1e2e; color: #cdd6f4; border-radius: 8px; font-family: monospace; font-size: 13px; white-space: pre; overflow-x: auto; }
        `;
    }

    template() {
        return html`
            <div>
                <h3>Two-Way Binding (&amp;)</h3>
                <p style="color: #6b7280; font-size: 14px;">
                    The <code>&amp;</code> prefix creates a two-way binding.
                    Type in the inputs — the preview updates in real-time.
                </p>

                <div class="form-group">
                    <label>Name</label>
                    <input type="text" &value=${[this.name, (v: unknown) => this.name = v as string]} placeholder="Enter your name">
                </div>

                <div class="form-group">
                    <label>Email</label>
                    <input type="email" &value=${[this.email, (v: unknown) => this.email = v as string]} placeholder="email@example.com">
                </div>

                <div class="form-group">
                    <label>
                        <input type="checkbox" &checked=${[this.agree, (v: unknown) => this.agree = v as boolean]}>
                        I agree to the terms
                    </label>
                </div>

                <div class="preview">
                    <h4>Live Preview</h4>
                    <p><strong>Name:</strong> ${this.name || '(empty)'}</p>
                    <p><strong>Email:</strong> ${this.email || '(empty)'}</p>
                    <p><strong>Agreed:</strong> <span class="badge ${this.agree ? 'badge-yes' : 'badge-no'}">${this.agree ? 'Yes' : 'No'}</span></p>
                </div>

                <div class="syntax">&value=\${this.bind('name')}     // inside component
&value=\${[this.email, (v) => this.email = v]}
&checked=\${this.bind('agree')}  // inside component</div>
            </div>
        `;
    }
}

export default {
    title: 'Miura/Bindings/06. Two-Way Binding (&)',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: `
The \`&\` prefix creates a two-way binding that syncs a DOM property
with a component property via the appropriate DOM event.

\`\`\`html
<input &value=\${this.bind('name')}>
<input &value=\${[this.email, (v) => this.email = v]}>
<input &checked=\${this.bind('agree')}>
\`\`\`

**Auto-detected events:** \`value\` → \`input\`, \`checked\`/\`selected\`/\`files\` → \`change\`.
                `
            }
        }
    }
} as Meta;

export const TwoWayBinding: StoryObj = {
    render: () => '<bind-demo></bind-demo>',
    name: 'Two-Way Binding',
};
