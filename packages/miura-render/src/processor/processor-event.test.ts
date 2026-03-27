// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { TemplateProcessor } from './processor';
import { html } from '../html';

describe('TemplateProcessor events', () => {
  it('applies prevent and stop modifiers in JIT event handlers', async () => {
    const processor = new TemplateProcessor();
    const parentHandler = vi.fn();
    const childHandler = vi.fn();

    const template = html`
      <div @mousedown=${parentHandler}>
        <button @mousedown|prevent,stop=${childHandler}>Drag</button>
      </div>
    `;

    const instance = await processor.createInstance(template);
    document.body.appendChild(instance.getFragment());

    const button = document.querySelector('button');
    expect(button).not.toBeNull();

    const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    button!.dispatchEvent(event);

    expect(childHandler).toHaveBeenCalledTimes(1);
    expect(parentHandler).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);

    instance.disconnect();
    document.body.innerHTML = '';
  });
});
