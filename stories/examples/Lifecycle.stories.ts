import { MiuraElement, html, css } from '@miurajs/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';
import { component } from '@miurajs/miura-element';
import { PropertyValues } from '@miurajs/miura-element';

// ── Lifecycle Demo ──────────────────────────────────────

@component({ tag: 'lifecycle-demo' })
class LifecycleDemo extends MiuraElement {
    declare count: number;
    // Non-reactive log buffer — entries rendered on next natural re-render
    private _log: string[] = [];

    static properties = {
        count: { type: Number, default: 0 },
    };

    static get styles() {
        return css`
            :host {
                display: block;
                padding: 20px;
                font-family: system-ui, sans-serif;
            }
            .section {
                margin: 16px 0;
                padding: 16px;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                background: #fafafa;
            }
            h4 { margin-top: 0; color: #333; }
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
            button:hover { background: #4338ca; }
            .log {
                max-height: 200px;
                overflow-y: auto;
                font-family: monospace;
                font-size: 12px;
                background: #1e1e2e;
                color: #a6e3a1;
                padding: 12px;
                border-radius: 6px;
                margin-top: 8px;
            }
            .log-entry {
                padding: 2px 0;
                border-bottom: 1px solid #313244;
            }
            .log-entry:last-child { border-bottom: none; }
            .badge {
                display: inline-block;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 600;
                margin-right: 6px;
            }
            .badge-mount { background: #a6e3a1; color: #1e1e2e; }
            .badge-update { background: #89b4fa; color: #1e1e2e; }
            .badge-will { background: #f9e2af; color: #1e1e2e; }
            .counter {
                font-size: 48px;
                font-weight: bold;
                color: #4f46e5;
                text-align: center;
                margin: 16px 0;
            }
        `;
    }

    private addLog(message: string) {
        const time = new Date().toLocaleTimeString('en-US', { hour12: false, fractionalSecondDigits: 3 } as any);
        this._log.push(`[${time}] ${message}`);
    }

    onMount() {
        this.addLog('🟢 onMount() — first render complete, DOM is ready');
    }

    onUnmount() {
        console.log('🔴 onUnmount() — cleaning up');
    }

    willUpdate(changedProperties: PropertyValues) {
        if (changedProperties.size > 0) {
            const changes: string[] = [];
            changedProperties.forEach((v: unknown, k: PropertyKey) => {
                changes.push(`${String(k)}: ${v} → ${(this as any)[k]}`);
            });
            this.addLog(`⚡ willUpdate(${changes.join(', ')})`);
        }
    }

    shouldUpdate(changedProperties: PropertyValues): boolean {
        // Example: skip update if only log changed (prevent infinite loop)
        if (changedProperties.size === 1 && changedProperties.has('log')) {
            return true; // Allow log updates
        }
        return true;
    }

    updated(changedProperties?: PropertyValues) {
        if (changedProperties && changedProperties.has('count')) {
            this.addLog(`✅ updated() — count is now ${this.count}`);
        }
    }

    private increment = () => { this.count++; };
    private decrement = () => { this.count--; };
    private clearLog = () => { this._log = []; this.requestUpdate(); };

    template() {
        return html`
            <div>
                <h3>Lifecycle Hooks Demo</h3>

                <div class="section">
                    <h4>Counter (triggers lifecycle)</h4>
                    <div class="counter">${this.count}</div>
                    <div style="text-align: center;">
                        <button @click="${this.decrement}">- 1</button>
                        <button @click="${this.increment}">+ 1</button>
                    </div>
                </div>

                <div class="section">
                    <h4>Lifecycle Log</h4>
                    <p style="font-size: 13px; color: #666; margin-top: 0;">
                        Each property change triggers:
                        <span class="badge badge-will">willUpdate</span>
                        → render →
                        <span class="badge badge-update">updated</span>
                        (and <span class="badge badge-mount">onMount</span> once on first render)
                    </p>
                    <button @click="${this.clearLog}">Clear Log</button>
                    <div class="log">
                        ${this._log.length === 0
                            ? html`<div class="log-entry" style="color: #6c7086;">No events yet. Click the counter buttons.</div>`
                            : this._log.map(entry => html`<div class="log-entry">${entry}</div>`)
                        }
                    </div>
                </div>
            </div>
        `;
    }
}

// ── Slot Demo ──────────────────────────────────────

@component({ tag: 'slot-demo' })
class SlotDemo extends MiuraElement {
    declare slottedCount: number;
    declare headerPresent: boolean;

    static properties = {
        slottedCount: { type: Number, default: 0 },
        headerPresent: { type: Boolean, default: false },
    };

    static get styles() {
        return css`
            :host {
                display: block;
                padding: 20px;
                font-family: system-ui, sans-serif;
            }
            .card {
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                overflow: hidden;
            }
            .card-header {
                background: #4f46e5;
                color: white;
                padding: 12px 16px;
                font-weight: 600;
            }
            .card-header.empty {
                background: #94a3b8;
            }
            .card-body {
                padding: 16px;
                background: #fafafa;
            }
            .card-footer {
                padding: 12px 16px;
                background: #f1f5f9;
                border-top: 1px solid #e0e0e0;
                font-size: 13px;
                color: #64748b;
            }
            .info {
                margin: 12px 0;
                padding: 8px 12px;
                background: #dbeafe;
                color: #1e40af;
                border-radius: 4px;
                font-size: 13px;
            }
        `;
    }

    onMount() {
        this.onSlotChange('', (elements) => {
            this.slottedCount = elements?.length ?? 0;
        });
        this.onSlotChange('header', (elements) => {
            this.headerPresent = (elements?.length ?? 0) > 0;
        });
    }

    template() {
        return html`
            <div>
                <h3>Slot Utilities Demo</h3>

                <div class="info">
                    Default slot has <strong>${this.slottedCount}</strong> element(s).
                    Header slot: <strong>${this.headerPresent ? 'present' : 'empty'}</strong>.
                </div>

                <div class="card">
                    <div class="card-header ${this.headerPresent ? '' : 'empty'}">
                        <slot name="header">Default Header (no content slotted)</slot>
                    </div>
                    <div class="card-body">
                        <slot>
                            <p style="color: #94a3b8;">No content provided. Add children to this component.</p>
                        </slot>
                    </div>
                    <div class="card-footer">
                        <slot name="footer">Default footer</slot>
                    </div>
                </div>
            </div>
        `;
    }
}

// ── Error Boundary Demo ──────────────────────────────────

@component({ tag: 'error-boundary-demo' })
class ErrorBoundaryDemo extends MiuraElement {
    declare shouldBreak: boolean;
    declare errorMsg: string;

    static properties = {
        shouldBreak: { type: Boolean, default: false },
        errorMsg: { type: String, default: '' },
    };

    static get styles() {
        return css`
            :host {
                display: block;
                padding: 20px;
                font-family: system-ui, sans-serif;
            }
            .section {
                margin: 16px 0;
                padding: 16px;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                background: #fafafa;
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
            button:hover { background: #4338ca; }
            button.danger { background: #dc2626; }
            button.danger:hover { background: #b91c1c; }
            .error-box {
                padding: 16px;
                background: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 8px;
                color: #991b1b;
            }
            .error-box h4 { margin-top: 0; }
            .ok-box {
                padding: 16px;
                background: #f0fdf4;
                border: 1px solid #bbf7d0;
                border-radius: 8px;
                color: #166534;
            }
        `;
    }

    onError(error: Error): boolean {
        this.errorMsg = error.message;
        // Render fallback UI directly into shadow root
        const root = this.shadowRoot!;
        root.innerHTML = '';
        const style = document.createElement('style');
        style.textContent = `
            .error-box { padding: 16px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #991b1b; font-family: system-ui, sans-serif; }
            .error-box h4 { margin-top: 0; }
            .error-box button { margin-top: 8px; padding: 8px 16px; border: none; border-radius: 4px; background: #4f46e5; color: white; cursor: pointer; }
        `;
        const fallback = document.createElement('div');
        fallback.className = 'error-box';
        fallback.innerHTML = `<h4>Something went wrong</h4><p>${error.message}</p>`;
        const btn = document.createElement('button');
        btn.textContent = 'Recover';
        btn.addEventListener('click', () => this.recover());
        fallback.appendChild(btn);
        root.appendChild(style);
        root.appendChild(fallback);
        return true; // Error handled
    }

    // Exposed so the fallback button can call it
    recover() {
        this.shouldBreak = false;
        this.errorMsg = '';
        // Force fresh render
        (this as any)._hasError = false;
        (this as any).templateInstance = null;
        (this as any).requestUpdate();
    }

    private triggerError = () => {
        this.shouldBreak = true;
    };

    template() {
        if (this.shouldBreak) {
            throw new Error('Intentional error! The component broke.');
        }

        return html`
            <div>
                <h3>Error Boundary Demo</h3>
                <div class="section">
                    <div class="ok-box">
                        <h4>Component is healthy</h4>
                        <p>Click the button below to trigger a rendering error.</p>
                    </div>
                    <div style="margin-top: 12px;">
                        <button class="danger" @click="${this.triggerError}">
                            Trigger Error
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

// ── Storybook Config ──────────────────────────────────

export default {
    title: 'Miura/Core/07. Lifecycle & Slots',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: `
# Lifecycle Hooks & Slot Utilities

## Lifecycle Hooks

| Hook | When | Use Case |
|------|------|----------|
| \`onMount()\` | Once, after first render | Fetch data, init libraries |
| \`onUnmount()\` | On disconnect | Cleanup, cancel fetches |
| \`willUpdate(changed)\` | Before each render | Derive values |
| \`shouldUpdate(changed)\` | Before each render | Skip unnecessary renders |
| \`updated(changed)\` | After each render | Post-render logic |
| \`onError(error)\` | On render error | Fallback UI |
| \`onAdopt()\` | adoptedCallback | Document change handling |

## Slot Utilities

- **\`querySlotted(name?)\`** — Get elements assigned to a slot
- **\`onSlotChange(name, callback)\`** — React to slot content changes

## Error Boundaries

Override \`onError(error)\` to catch rendering errors and display fallback UI.
Return \`true\` to suppress the default console.error.
                `
            }
        }
    }
} as Meta;

export const LifecycleHooks: StoryObj = {
    render: () => '<lifecycle-demo></lifecycle-demo>',
};

export const Slots: StoryObj = {
    render: () => `
        <slot-demo>
            <h2 slot="header">Custom Header</h2>
            <p>This is slotted content in the default slot.</p>
            <p>And a second paragraph.</p>
            <span slot="footer">Custom footer — powered by Miura</span>
        </slot-demo>
    `,
};

export const SlotsEmpty: StoryObj = {
    name: 'Slots (Empty)',
    render: () => '<slot-demo></slot-demo>',
};

export const ErrorBoundary: StoryObj = {
    render: () => '<error-boundary-demo></error-boundary-demo>',
};
