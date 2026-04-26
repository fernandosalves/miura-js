import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MiuraElement, component, signal as signalDecorator, createSignal as signal } from '../index';
import { startTrace, endTrace, getCurrentTraceId, getTimelineEvents, clearTimelineEvents, enableMiuraDebugger } from '@miurajs/miura-debugger';
import { html } from '@miurajs/miura-render';

@component({ tag: 'test-child' })
class TestChild extends MiuraElement {
    template() { return html`<div>Child</div>`; }
}

@component({ tag: 'test-parent' })
class TestParent extends MiuraElement {
    @signalDecorator({ type: Number, default: 0 })
    count: any;

    template() {
        return html`
            <div @click=${() => { this.count = this.count + 1; }}>
                <test-child></test-child>
            </div>
        `;
    }
}

describe('Miura DevTools Integration', () => {
    beforeEach(() => {
        enableMiuraDebugger({ disabled: false, devtools: true });
        clearTimelineEvents();
        document.body.innerHTML = '';
    });

    it('should track parent-child relationships during render', async () => {
        const parent = document.createElement('test-parent') as TestParent;
        document.body.appendChild(parent);
        
        // Wait for update
        await parent.updateComplete;
        
        const events = getTimelineEvents();
        const discovery = events.find(e => e.stage === 'discovery' && e.values?.child === 'test-child');
        
        expect(discovery).toBeDefined();
        expect(discovery?.values?.parent).toBe('test-parent');
    });

    it('should link signal writes to user interaction traces', async () => {
        const parent = document.createElement('test-parent') as TestParent;
        document.body.appendChild(parent);
        await parent.updateComplete;
        
        clearTimelineEvents();
        
        const div = parent.shadowRoot!.querySelector('div')!;
        div.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        
        const events = getTimelineEvents();
        
        // Find the event trace
        const eventTrace = events.find(e => e.message.includes('TRACE_START: event: click'));
        expect(eventTrace).toBeDefined();
        
        // Find the signal write
        const signalWrite = events.find(e => e.stage === 'write' && e.values?.label === 'count');
        expect(signalWrite).toBeDefined();
        expect(signalWrite?.traceId).toBe(eventTrace?.traceId);
    });
});
