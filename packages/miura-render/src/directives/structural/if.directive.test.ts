// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { TemplateProcessor, html } from '../../../index';

describe('IfDirective', () => {
  it('registers #elseif branches even when the #if branch is initially visible', async () => {
    const processor = new TemplateProcessor();

    const renderView = (showPrimary: boolean, showSecondary: boolean) => html`
      <section>
        <div class="primary" #if=${showPrimary}>Primary</div>
        <div class="secondary" #elseif=${showSecondary}>Secondary</div>
        <div class="fallback" #else>Fallback</div>
      </section>
    `;

    const first = renderView(true, false);
    const instance = await processor.createInstance(first);
    document.body.appendChild(instance.getFragment());

    expect(document.querySelector('.primary')?.textContent).toBe('Primary');
    expect(document.querySelector('.secondary')).toBeNull();
    expect(document.querySelector('.fallback')).toBeNull();

    const second = renderView(false, true);
    await instance.update(second.values);

    expect(document.querySelector('.primary')).toBeNull();
    expect(document.querySelector('.secondary')?.textContent).toBe('Secondary');
    expect(document.querySelector('.fallback')).toBeNull();

    const third = renderView(false, false);
    await instance.update(third.values);

    expect(document.querySelector('.primary')).toBeNull();
    expect(document.querySelector('.secondary')).toBeNull();
    expect(document.querySelector('.fallback')?.textContent).toBe('Fallback');

    instance.disconnect();
    document.body.innerHTML = '';
  });

  it('keeps a slot sibling stable when toggling a preceding #if branch', async () => {
    const processor = new TemplateProcessor();

    const renderView = (showLead: boolean) => html`
      <section>
        <div class="lead" #if=${showLead}>Lead</div>
        <slot name="content"></slot>
      </section>
    `;

    const first = renderView(false);
    const instance = await processor.createInstance(first);
    document.body.appendChild(instance.getFragment());

    const initialSlot = document.querySelector('slot[name="content"]');
    expect(initialSlot).not.toBeNull();
    expect(document.querySelector('.lead')).toBeNull();

    const second = renderView(true);
    await instance.update(second.values);

    expect(document.querySelector('.lead')?.textContent).toBe('Lead');
    expect(document.querySelector('slot[name="content"]')).toBe(initialSlot);

    const third = renderView(false);
    await instance.update(third.values);

    expect(document.querySelector('.lead')).toBeNull();
    expect(document.querySelector('slot[name="content"]')).toBe(initialSlot);

    instance.disconnect();
    document.body.innerHTML = '';
  });
});
