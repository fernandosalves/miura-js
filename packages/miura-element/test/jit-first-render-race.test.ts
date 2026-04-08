import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MiuraElement } from '../src/miura-element.js';
import { html } from '../index.js';
import { TemplateProcessor } from '@miurajs/miura-render';

const wait = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

describe('MiuraElement JIT first render', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('does not append duplicate DOM when multiple updates happen during the first JIT render', async () => {
    const originalCreateInstance = TemplateProcessor.prototype.createInstance;
    TemplateProcessor.prototype.createInstance = async function (...args: Parameters<TemplateProcessor['createInstance']>) {
      await wait(10);
      return originalCreateInstance.apply(this, args);
    };

    const tagName = `jit-race-element-${crypto.randomUUID()}`;

    class JitRaceElement extends MiuraElement {
      static override compiler = 'JIT' as const;
      static override properties = {
        value: { type: Number, default: 0 },
      };

      declare value: number;

      override connectedCallback(): void {
        super.connectedCallback();
        this.value = 1;
        queueMicrotask(() => {
          this.value = 2;
        });
      }

      protected override template() {
        return html`<div class="value">${this.value}</div>`;
      }
    }

    customElements.define(tagName, JitRaceElement);

    try {
      const element = document.createElement(tagName) as JitRaceElement;
      document.body.appendChild(element);

      await wait(40);

      const values = element.shadowRoot?.querySelectorAll('.value') ?? [];
      expect(values).toHaveLength(1);
      expect(values[0]?.textContent).toBe('2');
    } finally {
      TemplateProcessor.prototype.createInstance = originalCreateInstance;
    }
  });
});
