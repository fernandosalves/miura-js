import { MiuraElement, html, css } from '@miurajs/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';
import { component } from '@miurajs/miura-element';

function fakeFetch(shouldFail = false): Promise<{ name: string; role: string }> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (shouldFail) {
                reject(new Error('Network timeout — server unreachable'));
            } else {
                resolve({ name: 'John Doe', role: 'Framework Architect' });
            }
        }, 1500);
    });
}

@component({ tag: 'async-demo' })
class AsyncDemo extends MiuraElement {
    declare userPromise: Promise<{ name: string; role: string }> | null;

    static properties = {
        userPromise: { type: Object, default: null },
    };

    static get styles() {
        return css`
            :host { display: block; padding: 20px; font-family: system-ui, sans-serif; }
            button { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; margin-right: 8px; }
            .btn-primary { background: #4f46e5; color: white; }
            .btn-danger { background: #dc2626; color: white; }
            .btn-primary:hover { background: #4338ca; }
            .btn-danger:hover { background: #b91c1c; }
            .card { margin-top: 16px; padding: 16px; border-radius: 8px; }
            .pending { background: #fefce8; border: 1px solid #fde68a; color: #92400e; }
            .resolved { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
            .rejected { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }
            .spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid #92400e; border-top-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite; margin-right: 8px; vertical-align: middle; }
            @keyframes spin { to { transform: rotate(360deg); } }
            .syntax { margin-top: 12px; padding: 12px; background: #1e1e2e; color: #cdd6f4; border-radius: 8px; font-family: monospace; font-size: 13px; white-space: pre; overflow-x: auto; }
        `;
    }

    private loadSuccess = () => { this.userPromise = fakeFetch(false); };
    private loadFailure = () => { this.userPromise = fakeFetch(true); };

    template() {
        return html`
            <div>
                <h3>Async Rendering (#async directive)</h3>
                <p style="color: #6b7280; font-size: 14px;">
                    The <code>#async</code> directive tracks a promise and renders
                    <code>&lt;template pending&gt;</code>, <code>&lt;template resolved&gt;</code>,
                    or <code>&lt;template rejected&gt;</code> — just like <code>#switch</code>
                    uses <code>&lt;template case&gt;</code>.
                </p>

                <button class="btn-primary" @click=${this.loadSuccess}>Fetch (success)</button>
                <button class="btn-danger" @click=${this.loadFailure}>Fetch (failure)</button>

                <div #async=${this.userPromise}>
                    <template pending>
                        <div class="card pending">
                            <span class="spinner"></span>
                            Loading user data…
                        </div>
                    </template>
                    <template resolved>
                        <div class="card resolved">
                            <h4>Resolved ✓</h4>
                            <p>The promise settled successfully.</p>
                        </div>
                    </template>
                    <template rejected>
                        <div class="card rejected">
                            <h4>Rejected ✗</h4>
                            <p>The promise was rejected.</p>
                        </div>
                    </template>
                </div>

                <div class="syntax">&lt;div #async=\${this.userPromise}&gt;
  &lt;template pending&gt;
    &lt;p&gt;Loading…&lt;/p&gt;
  &lt;/template&gt;
  &lt;template resolved&gt;
    &lt;p&gt;Done!&lt;/p&gt;
  &lt;/template&gt;
  &lt;template rejected&gt;
    &lt;p&gt;Error!&lt;/p&gt;
  &lt;/template&gt;
&lt;/div&gt;</div>
            </div>
        `;
    }
}

export default {
    title: 'Miura/Features/01. Async Rendering',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: `
## \`#async\` Directive

The \`#async\` directive tracks a Promise and renders the matching
\`<template>\` branch — \`pending\`, \`resolved\`, or \`rejected\`.

\`\`\`html
<div #async=\${this.dataPromise}>
  <template pending>
    <p>Loading…</p>
  </template>
  <template resolved>
    <p>Data loaded!</p>
  </template>
  <template rejected>
    <p>Something went wrong.</p>
  </template>
</div>
\`\`\`

The lower-level \`resolveAsync()\` / \`createAsyncTracker()\` helpers are
also available for custom implementations that need access to the
resolved value in the template.
                `
            }
        }
    }
} as Meta;

export const AsyncRendering: StoryObj = {
    render: () => '<async-demo></async-demo>',
    name: 'Async Rendering (#async)',
};
