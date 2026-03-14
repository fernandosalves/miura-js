import { describe, it, expect, beforeEach } from 'vitest';
import './counter-element';
import { CounterElement } from './counter-element';

describe('CounterElement', () => {
    let element: CounterElement;

    beforeEach(() => {
        element = document.createElement('miura-counter') as CounterElement;
        document.body.appendChild(element);
    });

    it('should initialize with count = 0', () => {
        expect(element.count).toBe(0);
        const span = element.shadowRoot?.querySelector('span');
        expect(span?.textContent).toBe('0');
    });

    it('should increment count when + button is clicked', async () => {
        const incrementBtn = element.shadowRoot?.querySelector('button:last-child');
        incrementBtn?.click();
        await element.updateComplete;
        
        expect(element.count).toBe(1);
        const span = element.shadowRoot?.querySelector('span');
        expect(span?.textContent).toBe('1');
    });

    it('should decrement count when - button is clicked', async () => {
        const decrementBtn = element.shadowRoot?.querySelector('button:first-child');
        decrementBtn?.click();
        await element.updateComplete;
        
        expect(element.count).toBe(-1);
        const span = element.shadowRoot?.querySelector('span');
        expect(span?.textContent).toBe('-1');
    });
});
