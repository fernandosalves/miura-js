// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { TemplateCompiler } from './compiler';
import { html } from '../html';

describe('TemplateCompiler events', () => {
  it('applies prevent and stop modifiers in compiled event handlers', () => {
    const compiler = new TemplateCompiler();
    const parentHandler = vi.fn();
    const childHandler = vi.fn();

    const template = html`
      <div @mousedown=${parentHandler}>
        <button @mousedown|prevent,stop=${childHandler}>Drag</button>
      </div>
    `;

    const compiled = compiler.compile(template);
    const { fragment } = compiled.render(template.values);
    document.body.appendChild(fragment);

    const button = document.querySelector('button');
    expect(button).not.toBeNull();

    const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    button!.dispatchEvent(event);

    expect(childHandler).toHaveBeenCalledTimes(1);
    expect(parentHandler).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);

    document.body.innerHTML = '';
  });

  it('applies static and dynamic % utilities in compiled templates', () => {
    const compiler = new TemplateCompiler();
    const template = html`
      <div id="compiled" %="flex p-2" %grow=${'1'}>
        Content
      </div>
    `;

    const compiled = compiler.compile(template);
    const { fragment, refs } = compiled.render(template.values);
    document.body.appendChild(fragment);

    const element = document.getElementById('compiled') as HTMLDivElement;
    expect(element.classList.contains('miura-u-flex')).toBe(true);
    expect(element.classList.contains('miura-u-p-2')).toBe(true);
    expect(element.style.flexGrow).toBe('1');

    compiled.update(refs, ['0']);
    expect(element.style.flexGrow).toBe('0');

    document.body.innerHTML = '';
  });
});
