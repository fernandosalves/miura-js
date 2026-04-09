// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { TemplateProcessor } from './processor';
import { html } from '../html';

describe('TemplateProcessor class/style unification', () => {
  it('accepts object values on plain class and style bindings', async () => {
    const processor = new TemplateProcessor();
    const template = html`
      <div
        id="box"
        class=${{ active: true, hidden: false }}
        style=${{ width: 12, color: 'red' }}
      ></div>
    `;

    const instance = await processor.createInstance(template);
    document.body.appendChild(instance.getFragment());

    const box = document.getElementById('box') as HTMLDivElement;
    expect(box.classList.contains('active')).toBe(true);
    expect(box.classList.contains('hidden')).toBe(false);
    expect(box.style.width).toBe('12px');
    expect(box.style.color).toBe('red');

    await instance.update([
      { active: false, hidden: true },
      { height: 20, color: 'blue' },
    ]);

    expect(box.classList.contains('active')).toBe(false);
    expect(box.classList.contains('hidden')).toBe(true);
    expect(box.style.width).toBe('');
    expect(box.style.height).toBe('20px');
    expect(box.style.color).toBe('blue');
  });

  it('keeps :class and :style working through the unified bindings', async () => {
    const processor = new TemplateProcessor();
    const template = html`
      <div
        id="alias"
        :class=${{ enabled: true, disabled: false }}
        :style=${{ opacity: '0.5' }}
      ></div>
    `;

    const instance = await processor.createInstance(template);
    document.body.appendChild(instance.getFragment());

    const alias = document.getElementById('alias') as HTMLDivElement;
    expect(alias.classList.contains('enabled')).toBe(true);
    expect(alias.style.opacity).toBe('0.5');
  });
});
