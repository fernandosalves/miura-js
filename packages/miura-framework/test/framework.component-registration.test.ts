import { describe, it, expect, vi } from 'vitest';
import { MiuraFramework } from '../src/miura-framework.js';
import { MiuraElement, html } from '@miurajs/miura-element';

// Mock component
class TestComponent extends MiuraElement {
  template() { return html`<div>Test</div>`; }
}

const importFn = vi.fn().mockResolvedValue({ default: TestComponent });

class MyAppLazy extends MiuraFramework {
  static tagName = 'lazy-app';
  static components = {
    'lazy-comp': importFn
  };
  template() { return html`<div>App</div>`; }
}

class MyAppResolve extends MiuraFramework {
  static tagName = 'resolve-app';
  static components = {
    'lazy-comp': importFn
  };
  template() { return html`<div>App</div>`; }
}

customElements.define(MyAppLazy.tagName, MyAppLazy);
customElements.define(MyAppResolve.tagName, MyAppResolve);

describe('MiuraFramework Component Registration', () => {
  it('should store component factories without invoking them during boot', async () => {
    const app = new MyAppLazy();
    document.body.appendChild(app);
    
    await new Promise(resolve => setTimeout(resolve, 100));

    // Factory should NOT have been called yet
    expect(importFn).not.toHaveBeenCalled();
    expect(app.componentRegistry.has('lazy-comp')).toBe(false);
  });

  it('should resolve and register component on-demand', async () => {
    const app = new MyAppResolve();
    document.body.appendChild(app);
    await new Promise(resolve => setTimeout(resolve, 100));

    // Manually trigger resolution
    const resolved = await (app as any)._resolveComponent('lazy-comp');
    
    expect(importFn).toHaveBeenCalled();
    expect(resolved).toBe(TestComponent);
    expect(app.componentRegistry.has('lazy-comp')).toBe(true);
    expect(customElements.get('lazy-comp')).toBe(TestComponent);
  });
});
