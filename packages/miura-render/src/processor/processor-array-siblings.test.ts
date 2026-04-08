// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { TemplateProcessor } from './processor';
import { html } from '../html';

describe('TemplateProcessor array sibling roots', () => {
  it('keeps adjacent conditional sibling subtrees stable for mapped template items', async () => {
    const processor = new TemplateProcessor();

    const renderView = (showExplorerTree: boolean) => html`
      <section id="menu">
        ${[
          { id: 'explorer', label: 'Content Explorer', open: showExplorerTree },
          { id: 'scaffold', label: 'Scaffold', open: false },
        ].map((item) => html`
          <a class="row" data-id=${item.id}>${item.label}</a>
          ${item.open ? html`
            <div class="tree" data-owner=${item.id}>
              <div class="tree-row">Lab</div>
              <div class="tree-row">Series</div>
            </div>
          ` : ''}
        `)}
      </section>
    `;

    const first = renderView(true);
    const instance = await processor.createInstance(first);
    document.body.appendChild(instance.getFragment());

    expect(document.querySelectorAll('#menu .row')).toHaveLength(2);
    expect(document.querySelectorAll('#menu .tree')).toHaveLength(1);
    expect(document.querySelector('#menu .tree')?.getAttribute('data-owner')).toBe('explorer');

    const second = renderView(true);
    await instance.update(second.values);

    expect(document.querySelectorAll('#menu .row')).toHaveLength(2);
    expect(document.querySelectorAll('#menu .tree')).toHaveLength(1);
    expect(document.querySelector('#menu .tree')?.getAttribute('data-owner')).toBe('explorer');
    expect(Array.from(document.querySelectorAll('#menu .tree-row')).map((node) => node.textContent)).toEqual(['Lab', 'Series']);

    const third = renderView(false);
    await instance.update(third.values);

    expect(document.querySelectorAll('#menu .row')).toHaveLength(2);
    expect(document.querySelectorAll('#menu .tree')).toHaveLength(0);

    instance.disconnect();
    document.body.innerHTML = '';
  });
});
