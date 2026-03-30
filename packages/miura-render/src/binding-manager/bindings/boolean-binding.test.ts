// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { BooleanBinding } from './boolean-binding';

describe('BooleanBinding', () => {
  it('reflects boolean bindings to attributes on custom elements', async () => {
    class TestDialogElement extends HTMLElement {
      static observedAttributes = ['open'];

      open = false;

      attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null) {
        if (name === 'open') {
          this.open = newValue !== null;
        }
      }
    }

    customElements.define('test-dialog-binding', TestDialogElement);

    const element = document.createElement('test-dialog-binding') as TestDialogElement;
    document.body.appendChild(element);

    const binding = new BooleanBinding(element, 'open');
    binding.setValue(true);

    expect(element.hasAttribute('open')).toBe(true);
    expect(element.open).toBe(true);

    binding.setValue(false);

    expect(element.hasAttribute('open')).toBe(false);
    expect(element.open).toBe(false);
  });
});
