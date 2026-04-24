import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MiuraElement, html } from '../index.js';

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
});
