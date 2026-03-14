import { MiuraElement, html, css } from '@miura/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';
import { component } from '@miura/miura-element';

@component({
    tag: 'structural-demo',
    
})
class StructuralDemo extends MiuraElement {
    static compiler = 'AOT' as const;
    declare showContent: boolean;
    declare score: number;
    declare items: string[];

    static properties = {
        showContent: { type: Boolean, default: true },
        score: { type: Number, default: 85 },
        items: { type: Array, default: ['Apple', 'Banana', 'Orange'] }
    };

    static get styles() {
        return css`
            :host {
                display: block;
                padding: 20px;
                font-family: system-ui, sans-serif;
            }

            .demo-section {
                margin: 16px 0;
                padding: 16px;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                background: #fafafa;
            }

            h4 {
                margin-top: 0;
                color: #333;
            }

            button {
                margin: 4px;
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                background: #4f46e5;
                color: white;
                cursor: pointer;
                font-size: 13px;
            }

            button:hover {
                background: #4338ca;
            }

            .item {
                padding: 8px;
                margin: 4px 0;
                background: #fff;
                border: 1px solid #e0e0e0;
                border-radius: 4px;
            }

            li.item {
                padding: 8px;
                margin: 4px 0;
                background: #fff;
                border: 1px solid #e0e0e0;
                border-radius: 4px;
                list-style: none;
            }

            .grade {
                display: inline-block;
                padding: 8px 16px;
                border-radius: 6px;
                font-weight: 600;
                font-size: 16px;
                margin: 8px 0;
            }

            .grade-a { background: #dcfce7; color: #166534; }
            .grade-b { background: #fef9c3; color: #854d0e; }
            .grade-c { background: #fed7aa; color: #9a3412; }
            .grade-f { background: #fecaca; color: #991b1b; }

            .if-else-box {
                padding: 12px 16px;
                border-radius: 6px;
                margin: 8px 0;
                font-size: 14px;
            }

            .shown { background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; }
            .hidden { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }

            .score-display {
                font-size: 24px;
                font-weight: bold;
                margin: 8px 0;
                color: #4f46e5;
            }

            .btn-group {
                display: flex;
                gap: 4px;
                flex-wrap: wrap;
                margin: 8px 0;
            }
        `;
    }

    private toggleContent = () => {
        this.showContent = !this.showContent;
    };

    private setScore = (value: number) => {
        this.score = Math.max(0, Math.min(100, value));
    };

    private addItem = () => {
        const allFruits = ['Mango', 'Pear', 'Grape', 'Kiwi', 'Apple', 'Banana', 'Orange'];
        const availableFruits = allFruits.filter(f => !this.items.includes(f));
        
        if (availableFruits.length === 0) return;
        
        const randomFruit = availableFruits[Math.floor(Math.random() * availableFruits.length)];
        this.items = [...this.items, randomFruit];
    };

    private removeItem = () => {
        this.items = this.items.slice(0, -1);
    };

    protected override template() {
        return html`
            <div>
                <h3>Structural Directives</h3>

                <!-- ── #if / #else ── -->
                <div class="demo-section">
                    <h4>#if / #else</h4>
                    <button @click="${this.toggleContent}">
                        Toggle Content
                    </button>

                    <div class="if-else-box shown" #if=${this.showContent}>
                        <strong>Visible!</strong> This content is shown because the condition is truthy.
                    </div>
                    <div class="if-else-box hidden" #else>
                        <strong>Hidden state.</strong> The #if condition is falsy, so #else is shown instead.
                    </div>
                </div>

                <!-- ── #if / #elseif / #else ── -->
                <div class="demo-section">
                    <h4>#if / #elseif / #else (Grade Calculator)</h4>
                    <div class="score-display">Score: ${this.score}</div>
                    <div class="btn-group">
                        <button @click="${() => this.setScore(95)}">95 (A)</button>
                        <button @click="${() => this.setScore(82)}">82 (B)</button>
                        <button @click="${() => this.setScore(71)}">71 (C)</button>
                        <button @click="${() => this.setScore(45)}">45 (F)</button>
                        <button @click="${() => this.setScore(this.score + 5)}">+5</button>
                        <button @click="${() => this.setScore(this.score - 5)}">-5</button>
                    </div>

                    <div class="grade grade-a" #if=${this.score >= 90}>
                        Grade A — Excellent!
                    </div>
                    <div class="grade grade-b" #elseif=${this.score >= 80}>
                        Grade B — Good job!
                    </div>
                    <div class="grade grade-c" #elseif=${this.score >= 70}>
                        Grade C — Passing
                    </div>
                    <div class="grade grade-f" #else>
                        Grade F — Needs improvement
                    </div>
                </div>

                <!-- ── #for (callback mode) ── -->
                <div class="demo-section">
                    <h4>#for — Callback Mode</h4>
                    <div style="color:#6b7280;font-size:13px;margin-top:0">
                        Pass <code>[items, callback]</code> — the callback receives each item and returns a template.
                    </div>
                    <div class="btn-group">
                        <button @click="${this.addItem}">Add Item</button>
                        <button @click="${this.removeItem}">Remove Item</button>
                    </div>

                    <ul>
                        <li #for=${[this.items, (item: string) => html`
                            <div class="item">${item}</div>
                        `]}>
                        </li>
                    </ul>
                </div>

                <!-- ── #for (template mode) ── -->
                <div class="demo-section">
                    <h4>#for — Template Mode</h4>
                    <div style="color:#6b7280;font-size:13px;margin-top:0">
                        Pass just the array. Use a <code>&lt;template&gt;</code> child with
                        <code>{{'{{$item}}'}}</code> / <code>{{'{{$index}}'}}</code> tokens.
                    </div>

                    <div>
                        <ul #for=${this.items}>
                            <template>
                                <li class="item">{{$index}}. {{$item}}</li>
                            </template>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }
}

export default {
    title: 'Miura/Directives/Structural/01. If & For',
    component: 'structural-demo',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: `
# Structural Directives

Structural directives modify the DOM structure by adding or removing elements.

## #if / #else

Conditionally renders content with an optional else branch:

\`\`\`html
<div #if=\${loggedIn}>Welcome back!</div>
<div #else>Please log in.</div>
\`\`\`

## #if / #elseif / #else

Full conditional chain — like if/else-if/else in code:

\`\`\`html
<div #if=\${score >= 90}>Grade A</div>
<div #elseif=\${score >= 80}>Grade B</div>
<div #elseif=\${score >= 70}>Grade C</div>
<div #else>Grade F</div>
\`\`\`

Only the **first matching branch** is rendered. The #else is the fallback.

## #for

Renders lists of items. Two modes:

### Callback mode
\`\`\`html
<li #for=\${[items, (item) => html\`\${item.name}\`]}></li>
\`\`\`

### Template mode
Pass just the array, use \`{{$item}}\` / \`{{$index}}\` tokens:
\`\`\`html
<ul #for=\${this.items}>
  <template>
    <li>{{$index}}. {{$item.name}}</li>
  </template>
</ul>
\`\`\`
                `
            }
        }
    }
} as Meta;

type Story = StoryObj<StructuralDemo>;

export const Default: Story = {
    args: {
        showContent: true,
        score: 85,
        items: ['Apple', 'Banana', 'Orange']
    }
}; 