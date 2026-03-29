// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { TemplateProcessor } from './processor';
import { html } from '../html';

describe('TemplateProcessor utilities', () => {
  it('applies static % utility attributes during fragment creation', async () => {
    const processor = new TemplateProcessor();
    const template = html`<div id="box" %="flex gap-2 p-2" %grow="1" %flex-1></div>`;

    const instance = await processor.createInstance(template);
    document.body.appendChild(instance.getFragment());

    const box = document.getElementById('box') as HTMLDivElement;
    expect(box.classList.contains('miura-u-flex')).toBe(true);
    expect(box.classList.contains('miura-u-gap-2')).toBe(true);
    expect(box.classList.contains('miura-u-p-2')).toBe(true);
    expect(box.classList.contains('miura-u-flex-1')).toBe(true);
    expect(box.style.flexGrow).toBe('1');
    expect(box.hasAttribute('%')).toBe(false);
    expect(box.hasAttribute('%grow')).toBe(false);
    expect(box.hasAttribute('%flex-1')).toBe(false);

    instance.disconnect();
    document.body.innerHTML = '';
  });

  it('updates dynamic % utility bindings', async () => {
    const processor = new TemplateProcessor();
    const template = html`<div id="dynamic" %=${'flex gap-2 p-2'} %grow=${'1'}></div>`;

    const instance = await processor.createInstance(template);
    document.body.appendChild(instance.getFragment());

    const box = document.getElementById('dynamic') as HTMLDivElement;
    expect(box.classList.contains('miura-u-flex')).toBe(true);
    expect(box.classList.contains('miura-u-gap-2')).toBe(true);
    expect(box.style.flexGrow).toBe('1');

    await instance.update(['grid cols-2 p-3', '0']);

    expect(box.classList.contains('miura-u-flex')).toBe(false);
    expect(box.classList.contains('miura-u-grid')).toBe(true);
    expect(box.classList.contains('miura-u-cols-2')).toBe(true);
    expect(box.classList.contains('miura-u-p-3')).toBe(true);
    expect(box.style.flexGrow).toBe('0');

    instance.disconnect();
    document.body.innerHTML = '';
  });
});
