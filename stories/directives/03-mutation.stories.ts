import { MiuraElement, html, css } from '@miurajs/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';
import { component } from '@miurajs/miura-element';

@component({
    tag: 'mutation-demo',
    
})
class MutationDemo extends MiuraElement {
    declare changes: string[];
    declare observeAttributes: boolean;
    declare observeChildren: boolean;

    static properties = {
        changes: { type: Array, default: [] as string[] },
        observeAttributes: { type: Boolean, default: true },
        observeChildren: { type: Boolean, default: true }
    };

    static get styles() {
        return css`
            :host {
                display: block;
                padding: 20px;
            }

            .demo-box {
                padding: 16px;
                border: 2px solid #ccc;
                border-radius: 4px;
                margin: 16px 0;
            }

            .changes-log {
                background: #f5f5f5;
                padding: 12px;
                border-radius: 4px;
                font-family: monospace;
                max-height: 200px;
                overflow: auto;
            }

            .change-entry {
                margin: 4px 0;
                padding: 4px;
                border-bottom: 1px solid #eee;
            }

            button {
                margin: 4px;
                padding: 8px 16px;
            }
        `;
    }

    private handleMutation = (mutations: MutationRecord[]) => {
        const newChanges = mutations.map(mutation => {
            const time = new Date().toLocaleTimeString();
            if (mutation.type === 'attributes') {
                return `[${time}] Attribute '${mutation.attributeName}' changed`;
            } else if (mutation.type === 'childList') {
                const added = mutation.addedNodes.length;
                const removed = mutation.removedNodes.length;
                return `[${time}] ${added} nodes added, ${removed} removed`;
            }
            return `[${time}] Unknown mutation type: ${mutation.type}`;
        });

        this.changes = [...newChanges, ...this.changes].slice(0, 10);
        this.requestUpdate();
    };

    private addChild = () => {
        const target = this.shadowRoot?.querySelector('.target-children');
        if (target) {
            const child = document.createElement('div');
            child.textContent = `Child ${target.children.length + 1}`;
            target.appendChild(child);
        }
    };

    private removeLastChild = () => {
        const target = this.shadowRoot?.querySelector('.target-children');
        if (target && target.lastChild) {
            target.removeChild(target.lastChild);
        }
    };

    private changeAttribute = () => {
        const target = this.shadowRoot?.querySelector('.target-attributes');
        if (target) {
            const currentColor = target.getAttribute('data-color') || 'blue';
            target.setAttribute('data-color', currentColor === 'blue' ? 'red' : 'blue');
        }
    };

    protected override template() {
        return html`
            <div>
                <h3>Mutation Observer Directive</h3>

                <div class="demo-box">
                    <div 
                        #mutation=${this.handleMutation}
                        .options="${{
                            attributes: this.observeAttributes,
                            childList: this.observeChildren,
                            subtree: true
                        }}"
                    >
                        <div class="target-attributes" data-color="blue">
                            Observe attribute changes
                        </div>
                        
                        <div class="target-children">
                            Observe children changes
                        </div>
                    </div>

                    <div>
                        <button @click="${this.addChild}">Add Child</button>
                        <button @click="${this.removeLastChild}">Remove Child</button>
                        <button @click="${this.changeAttribute}">Change Attribute</button>
                    </div>
                </div>

                <div class="changes-log">
                    ${this.changes.map(change => html`
                        <div class="change-entry">${change}</div>
                    `)}
                </div>
            </div>
        `;
    }
}

export default {
    title: 'Miura/Directives/Observer/06. Mutation',
    component: 'mutation-demo',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: `
# Mutation Observer Directive

The mutation directive provides a declarative way to observe DOM changes.

## Usage

\`\`\`typescript
<div 
    #mutation=\${(mutations) => console.log('Changes:', mutations)}
    .options=\${{
        attributes: true,
        childList: true,
        subtree: true
    }}
>
    Observed content
</div>
\`\`\`

## Features
- Observe attribute changes
- Observe child element changes
- Type-safe MutationRecord[]
                `
            }
        }
    }
} as Meta;

type Story = StoryObj<MutationDemo>;

export const Default: Story = {
    args: {
        changes: [],
        observeAttributes: true,
        observeChildren: true
    }
}; 