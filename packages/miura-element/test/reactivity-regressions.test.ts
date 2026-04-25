import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MiuraElement, html, trustedHTML } from '../index.js';

const waitForUpdate = async (element: MiuraElement, timeoutMs = 150) => {
  await Promise.race([
    element.updateComplete,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Timed out waiting for updateComplete')), timeoutMs);
    }),
  ]);
};

describe('MiuraElement reactivity regressions', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('resolves updateComplete for initial and subsequent updates', async () => {
    const tagName = `update-complete-${crypto.randomUUID()}`;

    class UpdateCompleteElement extends MiuraElement {
      static override properties = {
        value: { type: Number, default: 0 },
      };

      declare value: number;

      protected override template() {
        return html`<div class="value">${this.value}</div>`;
      }
    }

    customElements.define(tagName, UpdateCompleteElement);

    const element = document.createElement(tagName) as UpdateCompleteElement;
    document.body.appendChild(element);

    await waitForUpdate(element);
    expect(element.shadowRoot?.querySelector('.value')?.textContent).toBe('0');

    element.value = 2;
    await waitForUpdate(element);

    expect(element.shadowRoot?.querySelector('.value')?.textContent).toBe('2');
  });

  it('promotes direct property reads to fine-grained binding updates', async () => {
    const tagName = `fine-grained-${crypto.randomUUID()}`;

    class FineGrainedElement extends MiuraElement {
      static override properties = {
        value: { type: Number, default: 0 },
      };

      declare value: number;
      renderCount = 0;

      protected override template() {
        this.renderCount++;
        return html`<div class="value">${this.value}</div>`;
      }
    }

    customElements.define(tagName, FineGrainedElement);

    const element = document.createElement(tagName) as FineGrainedElement;
    document.body.appendChild(element);

    await waitForUpdate(element);
    expect(element.shadowRoot?.querySelector('.value')?.textContent).toBe('0');
    expect(element.renderCount).toBe(1);

    element.value = 3;
    await Promise.resolve();

    expect(element.shadowRoot?.querySelector('.value')?.textContent).toBe('3');
    expect(element.renderCount).toBe(1);
  });

  it('keeps re-rendering transformed property reads', async () => {
    const tagName = `transformed-read-${crypto.randomUUID()}`;

    class TransformedReadElement extends MiuraElement {
      static override properties = {
        value: { type: Number, default: 0 },
      };

      declare value: number;
      renderCount = 0;

      protected override template() {
        this.renderCount++;
        return html`<div class="value">${this.value + 1}</div>`;
      }
    }

    customElements.define(tagName, TransformedReadElement);

    const element = document.createElement(tagName) as TransformedReadElement;
    document.body.appendChild(element);

    await waitForUpdate(element);
    expect(element.shadowRoot?.querySelector('.value')?.textContent).toBe('1');

    element.value = 3;
    await waitForUpdate(element);

    expect(element.shadowRoot?.querySelector('.value')?.textContent).toBe('4');
    expect(element.renderCount).toBe(2);
  });

  it('does not promote falsy fallback reads into unrelated empty bindings', async () => {
    const tagName = `fallback-read-${crypto.randomUUID()}`;

    class FallbackReadElement extends MiuraElement {
      static override properties = {
        subtitle: { type: String, default: '' },
        showLead: { type: Boolean, default: false },
      };

      declare subtitle: string;
      declare showLead: boolean;

      protected override template() {
        return html`
          <section class="shell">
            ${this.showLead ? html`<span class="lead">Lead</span>` : ''}
            <p class="subtitle">${this.subtitle || 'Default subtitle'}</p>
          </section>
        `;
      }
    }

    customElements.define(tagName, FallbackReadElement);

    const element = document.createElement(tagName) as FallbackReadElement;
    document.body.appendChild(element);

    await waitForUpdate(element);
    expect(element.shadowRoot?.querySelector('.subtitle')?.textContent).toBe('Default subtitle');

    element.subtitle = 'Administration';
    await waitForUpdate(element);

    const shell = element.shadowRoot?.querySelector('.shell');
    expect(element.shadowRoot?.querySelector('.subtitle')?.textContent).toBe('Administration');
    expect(shell?.textContent?.replace(/\s+/g, ' ').trim()).toBe('Administration');
  });

  it('coalesces same-tick property changes into one component update', async () => {
    const tagName = `batched-update-${crypto.randomUUID()}`;

    class BatchedUpdateElement extends MiuraElement {
      static override properties = {
        value: { type: Number, default: 0 },
      };

      declare value: number;
      renderCount = 0;
      updatedCount = 0;

      protected override template() {
        this.renderCount++;
        return html`<div class="value">${this.value + 1}</div>`;
      }

      protected override updated() {
        this.updatedCount++;
      }
    }

    customElements.define(tagName, BatchedUpdateElement);

    const element = document.createElement(tagName) as BatchedUpdateElement;
    document.body.appendChild(element);

    await waitForUpdate(element);
    expect(element.renderCount).toBe(1);
    expect(element.updatedCount).toBe(1);

    element.value = 1;
    element.value = 2;
    element.value = 3;
    await waitForUpdate(element);

    expect(element.shadowRoot?.querySelector('.value')?.textContent).toBe('4');
    expect(element.renderCount).toBe(2);
    expect(element.updatedCount).toBe(2);
  });

  it('keeps default slot content rendered when toggling a preceding #if block', async () => {
    const tagName = `conditional-slot-${crypto.randomUUID()}`;

    class ConditionalSlotElement extends MiuraElement {
      static override properties = {
        showLead: { type: Boolean, default: false },
      };

      declare showLead: boolean;

      protected override template() {
        return html`
          <div class="lead" #if=${this.showLead}>Lead</div>
          <slot></slot>
        `;
      }
    }

    customElements.define(tagName, ConditionalSlotElement);

    const element = document.createElement(tagName) as ConditionalSlotElement;
    const projected = document.createElement('span');
    projected.textContent = 'Projected';
    element.appendChild(projected);
    document.body.appendChild(element);

    await waitForUpdate(element);

    const initialSlot = element.shadowRoot?.querySelector('slot') as HTMLSlotElement | null;
    expect(initialSlot).not.toBeNull();
    expect(initialSlot?.assignedElements({ flatten: true })).toEqual([projected]);
    expect(element.shadowRoot?.querySelector('.lead')).toBeNull();

    element.showLead = true;
    await waitForUpdate(element);

    const updatedSlot = element.shadowRoot?.querySelector('slot') as HTMLSlotElement | null;
    expect(updatedSlot).toBe(initialSlot);
    expect(updatedSlot?.assignedElements({ flatten: true })).toEqual([projected]);
    expect(element.shadowRoot?.querySelector('.lead')?.textContent).toBe('Lead');
  });

  it('renders trustedHTML in AOT templates and runs afterRender on fine-grained updates', async () => {
    const tagName = `aot-trusted-html-${crypto.randomUUID()}`;
    const afterRenderRoots: Array<Element | DocumentFragment> = [];

    class AotTrustedHtmlElement extends MiuraElement {
      static override compiler = 'AOT' as const;
      static override properties = {
        content: { type: String, default: '<span data-version="one">One</span>' },
      };

      declare content: string;
      renderCount = 0;

      protected override template() {
        this.renderCount++;
        return html`
          <article id="trusted-host">
            ${trustedHTML(this.content, {
              afterRender(root) {
                afterRenderRoots.push(root);
              },
            })}
          </article>
        `;
      }
    }

    customElements.define(tagName, AotTrustedHtmlElement);

    const element = document.createElement(tagName) as AotTrustedHtmlElement;
    document.body.appendChild(element);

    await waitForUpdate(element);

    const host = element.shadowRoot?.querySelector('#trusted-host') as HTMLElement;
    expect(host.querySelector('[data-version="one"]')?.textContent).toBe('One');
    expect(afterRenderRoots).toEqual([host]);
    expect(element.renderCount).toBe(1);

    element.content = '<strong data-version="two">Two</strong>';
    await Promise.resolve();

    expect(host.querySelector('[data-version="one"]')).toBeNull();
    expect(host.querySelector('[data-version="two"]')?.textContent).toBe('Two');
    expect(afterRenderRoots).toEqual([host, host]);
    expect(element.renderCount).toBe(1);
  });

  it('preserves trustedHTML DOM on AOT updates when html and enhancer are unchanged', async () => {
    const tagName = `aot-trusted-html-stable-${crypto.randomUUID()}`;
    let enhanceCount = 0;
    const afterRender = () => {
      enhanceCount++;
    };

    class StableAotTrustedHtmlElement extends MiuraElement {
      static override compiler = 'AOT' as const;
      static override properties = {
        htmlText: { type: String, default: '<span id="stable-aot">Stable</span>' },
        tick: { type: Number, default: 0 },
      };

      declare htmlText: string;
      declare tick: number;

      protected override template() {
        return html`
          <article id="stable-aot-host">
            ${trustedHTML(this.htmlText, { afterRender })}
            <span id="stable-aot-tick">${this.tick}</span>
          </article>
        `;
      }
    }

    customElements.define(tagName, StableAotTrustedHtmlElement);

    const element = document.createElement(tagName) as StableAotTrustedHtmlElement;
    document.body.appendChild(element);

    await waitForUpdate(element);

    const stableNode = element.shadowRoot?.querySelector('#stable-aot');
    expect(stableNode).not.toBeNull();
    expect(enhanceCount).toBe(1);

    element.tick = 1;
    await Promise.resolve();

    expect(element.shadowRoot?.querySelector('#stable-aot')).toBe(stableNode);
    expect(element.shadowRoot?.querySelector('#stable-aot-tick')?.textContent).toBe('1');
    expect(enhanceCount).toBe(1);
  });
});
