import { MiuraElement, html, css, component } from '../../packages/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';

@component({
    tag: 'resize-demo',

})
class ResizeDemo extends MiuraElement {
    declare displayWidth: number;
    declare displayHeight: number;

    static properties = {
        displayWidth: { type: Number, default: 0 },
        displayHeight: { type: Number, default: 0 },
    };

    static get styles() {
        return css`
            :host {
                display: block;
                padding: 20px;
                font-family: system-ui, sans-serif;
            }

            .resize-box {
                resize: both;
                overflow: auto;
                width: 300px;
                height: 150px;
                min-height: 80px;
                min-width: 120px;
                max-width: 100%;
                padding: 16px;
                border: 2px dashed #94a3b8;
                border-radius: 8px;
                background: #f8fafc;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                box-sizing: border-box;
                cursor: nwse-resize;
            }

            .resize-box:hover {
                border-color: #4f46e5;
                background: #eef2ff;
            }

            .size-display {
                font-size: 28px;
                font-weight: 700;
                color: #1e293b;
                font-variant-numeric: tabular-nums;
            }

            .hint {
                margin-top: 8px;
                font-size: 13px;
                color: #94a3b8;
            }

            .syntax { margin-top: 12px; padding: 12px; background: #1e1e2e; color: #cdd6f4; border-radius: 8px; font-family: monospace; font-size: 13px; white-space: pre; overflow-x: auto; }
        `;
    }

    private handleResize = (entry: ResizeObserverEntry) => {
        const rect = entry.contentRect;
        this.displayWidth = Math.round(rect.width);
        this.displayHeight = Math.round(rect.height);
    };

    protected override template() {
        return html`
            <div>
                <h3>Resize Observer Directive</h3>
                <p style="color: #6b7280; font-size: 14px;">
                    The <code>#resize</code> directive observes element size changes via
                    <code>ResizeObserver</code>. Drag the bottom-right corner of the box below.
                </p>

                <div #resize=${this.handleResize} class="resize-box">
                    <div class="size-display">
                        ${this.displayWidth} x ${this.displayHeight}
                    </div>
                    <div class="hint">Drag corner to resize</div>
                </div>

                <div class="syntax">&lt;div #resize=\${this.handleResize}&gt;
  ...
&lt;/div&gt;

handleResize = (entry: ResizeObserverEntry) => {
  this.width = entry.contentRect.width;
};</div>
            </div>
        `;
    }
}

export default {
    title: 'Miura/Directives/Observer/05. Resize',
    component: 'resize-demo',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: `
# Resize Observer Directive

The resize directive provides a declarative way to observe element size changes.

## Usage

\`\`\`typescript
<div 
    #resize=\${(entry) => console.log('Size:', entry.contentRect)}
    style="resize: both; overflow: auto;"
>
    Resizable content
</div>
\`\`\`

## Features
- Declarative resize observation
- Automatic cleanup
- Type-safe ResizeObserverEntry
                `
            }
        }
    }
} as Meta;

type Story = StoryObj<ResizeDemo>;

export const Default: Story = {};