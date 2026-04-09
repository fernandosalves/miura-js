import { describe, expect, it } from 'vitest';
import { MiuraElement } from '../src/miura-element.js';
import { state } from '../src/decorators.js';

describe('@state decorator', () => {
  it('preserves raw boolean values when no explicit type/default is provided', () => {
    const tagName = `state-bool-${crypto.randomUUID()}`;

    class TestElement extends MiuraElement {}

    state()(TestElement.prototype as MiuraElement, 'submitting');
    customElements.define(tagName, TestElement);

    const element = document.createElement(tagName) as TestElement & { submitting: boolean };
    element.submitting = false;
    expect(element.submitting).toBe(false);

    element.submitting = true;
    expect(element.submitting).toBe(true);
  });

  it('preserves raw string values when no explicit type/default is provided', () => {
    const tagName = `state-string-${crypto.randomUUID()}`;

    class TestElement extends MiuraElement {}

    state()(TestElement.prototype as MiuraElement, 'error');
    customElements.define(tagName, TestElement);

    const element = document.createElement(tagName) as TestElement & { error: string };
    element.error = '';
    expect(element.error).toBe('');

    element.error = 'boom';
    expect(element.error).toBe('boom');
  });
});
