import { MiuraElement, html, css, component } from '../../packages/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';

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
        items: { type: Array, default: ['Apple', 'Banana', 'Orange'] },
        currentView: { type: String, default: 'home' },
        userPromise: { type: Object, default: null },
        largeList: { type: Array, default: Array.from({ length: 100 }, (_, i) => `Item ${i + 1}`) }
    };

    declare currentView: string;
    declare userPromise: Promise<any> | null;
    declare largeList: string[];

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

            .scroll-container {
                height: 200px;
                overflow-y: auto;
                border: 1px solid #ddd;
                border-radius: 4px;
                background: white;
            }

            .row {
                padding: 10px;
                border-bottom: 1px solid #eee;
            }

            .async-box {
                padding: 20px;
                text-align: center;
                background: #f8fafc;
                border-radius: 8px;
                border: 2px dashed #cbd5e1;
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

    private setView = (view: string) => {
        this.currentView = view;
    };

    private fetchUser = () => {
        this.userPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.3) {
                    resolve({ name: 'Jane Doe', email: 'jane@example.com' });
                } else {
                    reject(new Error('Failed to connect to auth service'));
                }
            }, 1500);
        });
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
                
                <!-- ── Native JS Ternary ── -->
                <div class="demo-section">
                    <h4>Native JS Ternary</h4>
                    <div style="color:#6b7280;font-size:13px;margin-top:0">
                        JS ternary expressions <code>\${cond ? 'A' : 'B'}</code> are now fully reactive and 
                        can return strings, numbers, or nested <code>html\`...\`</code> templates.
                    </div>
                    <button @click="${this.toggleContent}">
                        Toggle (Current: ${this.showContent ? 'ON' : 'OFF'})
                    </button>
                    
                    <div class="if-else-box ${this.showContent ? 'shown' : 'hidden'}">
                        ${this.showContent 
                            ? html`<span><strong>Ternary ON:</strong> You are seeing a nested template.</span>`
                            : html`<span><strong>Ternary OFF:</strong> Showing a different template.</span>`
                        }
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

                <!-- ── #switch ── -->
                <div class="demo-section">
                    <h4>#switch / #case</h4>
                    <div class="btn-group">
                        <button @click="${() => this.setView('home')}">Home</button>
                        <button @click="${() => this.setView('profile')}">Profile</button>
                        <button @click="${() => this.setView('settings')}">Settings</button>
                    </div>
                    
                    <div #switch=${this.currentView}>
                        <template case="home">
                            <div class="if-else-box shown">
                                🏠 <strong>Home View</strong>: This is the dashboard.
                            </div>
                        </template>
                        <template case="profile">
                            <div class="if-else-box shown" style="background:#f0f9ff; color:#0369a1; border-color:#7dd3fc">
                                👤 <strong>Profile View</strong>: User details go here.
                            </div>
                        </template>
                        <template case="settings">
                            <div class="if-else-box shown" style="background:#f5f5f5; color:#404040; border-color:#d4d4d4">
                                ⚙️ <strong>Settings</strong>: System configuration.
                            </div>
                        </template>
                        <template default>
                            <div class="if-else-box hidden">Unknown View</div>
                        </template>
                    </div>
                </div>

                <!-- ── #async ── -->
                <div class="demo-section">
                    <h4>#async</h4>
                    <button @click="${this.fetchUser}">
                        ${this.userPromise ? 'Retry Fetch' : 'Fetch User Data'}
                    </button>
                    
                    <div #async=${this.userPromise}>
                        <template pending>
                            <div class="async-box">
                                ⏳ Loading data (1.5s delay)...
                            </div>
                        </template>
                        <template resolved>
                            <div class="async-box" style="border-style:solid; border-color:#16a34a; background:#f0fdf4">
                                ✅ Success! Welcome, <strong>{{name}}</strong> ({{email}})
                            </div>
                        </template>
                        <template rejected>
                            <div class="async-box" style="border-style:solid; border-color:#dc2626; background:#fef2f2">
                                ❌ Error! {{message}}
                            </div>
                        </template>
                    </div>
                </div>

                <!-- ── #virtualScroll ── -->
                <div class="demo-section">
                    <h4>#virtualScroll</h4>
                    <div class="scroll-container" #virtualScroll=${{
                        items: this.largeList,
                        itemHeight: 41,
                        containerHeight: 200,
                        render: (item: string) => html`<div class="row">${item}</div>`
                    }}></div>
                </div>
            </div>
        `;
    }
}

const SUMMARY_DOCS = `
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
<li #for=\${[items, (item) => html\\\`\\\${item.name}\\\` ]}></li>
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

## #switch / #case

Multi-branch conditional rendering using children \`<template>\` elements:

\`\`\`html
<div #switch=\${this.view}>
  <template case="home">
    <home-view></home-view>
  </template>
  <template case="profile">
    <profile-view></profile-view>
  </template>
  <template default>
    <p>Not Found</p>
  </template>
</div>
\`\`\`

## #async

Declarative promise rendering with built-in state management:

\`\`\`html
<div #async=\${this.userPromise}>
  <template pending>
    <p>Loading user data...</p>
  </template>
  <template resolved>
    <p>Welcome, {{name}}!</p>
  </template>
  <template rejected>
    <p>Error loading data.</p>
  </template>
</div>
\`\`\`

## #virtualScroll

High-performance virtualization for large lists:

\`\`\`html
<div #virtualScroll=\${{
  items: this.largeList,
  itemHeight: 50,
  containerHeight: 500,
  render: (item) => html\\\`<div class="row">\\\${item.name}</div>\\\`
}}></div>
\`\`\`

## Native Ternary Support

You can now use standard JavaScript ternary expressions for simple conditional rendering. These are fully reactive:

\`\`\`html
<div>
  \\\${this.isActive 
    ? html\\\`<span class="online">Online</span>\\\` 
    : html\\\`<span class="offline">Offline</span>\\\`
  }
</div>
\`\`\`

Unlike the \`when()\` directive, ternary expressions are evaluated every render, but Miura's architecture ensures that nested templates are still efficiently morphed rather than replaced.
`;

export default {
    title: 'Miura/Directives/Structural/01. If & For',
    component: 'structural-demo',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: SUMMARY_DOCS
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