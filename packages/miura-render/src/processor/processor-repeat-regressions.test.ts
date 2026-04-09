// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { TemplateProcessor } from './processor';
import { html } from '../html';
import { repeat } from '../directives/repeat';

describe('TemplateProcessor repeat regressions', () => {
  it('keeps nested conditional subtrees stable when keyed items reorder and shrink', async () => {
    const processor = new TemplateProcessor();

    const renderView = (items: Array<{ id: string; label: string; open: boolean }>) => html`
      <section id="menu">
        ${repeat(
          items,
          (item) => item.id,
          (item) => html`
            <article class="item" data-id=${item.id}>
              <h3>${item.label}</h3>
              ${item.open ? html`
                <div class="details" data-owner=${item.id}>
                  <span>Alpha</span>
                  <span>Beta</span>
                </div>
              ` : ''}
            </article>
          `
        )}
      </section>
    `;

    const first = renderView([
      { id: 'a', label: 'Alpha', open: true },
      { id: 'b', label: 'Beta', open: false },
      { id: 'c', label: 'Gamma', open: true },
    ]);

    const instance = await processor.createInstance(first);
    document.body.appendChild(instance.getFragment());

    expect(Array.from(document.querySelectorAll('#menu .item')).map((node) => node.getAttribute('data-id'))).toEqual(['a', 'b', 'c']);
    expect(Array.from(document.querySelectorAll('#menu .details')).map((node) => node.getAttribute('data-owner'))).toEqual(['a', 'c']);

    const second = renderView([
      { id: 'c', label: 'Gamma', open: true },
      { id: 'a', label: 'Alpha', open: false },
    ]);
    await instance.update(second.values);

    expect(Array.from(document.querySelectorAll('#menu .item')).map((node) => node.getAttribute('data-id'))).toEqual(['c', 'a']);
    expect(Array.from(document.querySelectorAll('#menu .details')).map((node) => node.getAttribute('data-owner'))).toEqual(['c']);
    expect(Array.from(document.querySelectorAll('#menu .details span')).map((node) => node.textContent)).toEqual(['Alpha', 'Beta']);

    const third = renderView([
      { id: 'a', label: 'Alpha', open: true },
      { id: 'c', label: 'Gamma', open: true },
      { id: 'd', label: 'Delta', open: false },
    ]);
    await instance.update(third.values);

    expect(Array.from(document.querySelectorAll('#menu .item')).map((node) => node.getAttribute('data-id'))).toEqual(['a', 'c', 'd']);
    expect(Array.from(document.querySelectorAll('#menu .details')).map((node) => node.getAttribute('data-owner'))).toEqual(['a', 'c']);

    instance.disconnect();
    document.body.innerHTML = '';
  });
});
