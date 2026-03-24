import { MiuraElement, html } from '@miurajsjs/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';
import { component } from '@miurajsjs/miura-element';


@component({
    tag: 'boolean-binding-demo',
    
})
class BooleanBindingDemo extends MiuraElement {
    declare isDisabled: boolean;
    declare isReadOnly: boolean;

    static properties = {
        isDisabled: { type: Boolean, default: false },
        isReadOnly: { type: Boolean, default: false }
    };

    protected override template() {
        return html`
            <div>
                <h3>Boolean Binding Examples</h3>
                
                <div>
                    <input 
                        type="text"
                        ?disabled="${this.isDisabled}"
                        ?readonly="${this.isReadOnly}"
                        placeholder="Test input"
                    />
                </div>

                <div>
                    <button ?disabled="${this.isDisabled}">
                        Test Button
                    </button>
                </div>
            </div>
        `;
    }
}

type Story = StoryObj<BooleanBindingDemo>;

export default {
    title: 'Miura/Bindings/01. Boolean (?)',
    component: 'boolean-binding-demo',
    tags: ['autodocs']
} as Meta;

export const Default: Story = {
    args: {
        isDisabled: false,
        isReadOnly: false
    }
};

export const DisabledState: Story = {
    args: {
        isDisabled: true,
        isReadOnly: false
    }
};

export const ReadOnlyState: Story = {
    args: {
        isDisabled: false,
        isReadOnly: true
    }
}; 