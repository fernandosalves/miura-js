type Constructor<T = HTMLElement> = new (...args: any[]) => T & { connectedCallback?(): void; disconnectedCallback?(): void; };

/**
 * FocusRingMixin adds focus ring management for keyboard navigation.
 * Usage:
 *   class MyComponent extends FocusRingMixin(MuiBase) { ... }
 */
export function FocusRingMixin<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    _focusRingHandler = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key === 'Shift') {
        this.classList.add('mui-focus-ring');
      }
    };
    _blurHandler = () => {
      this.classList.remove('mui-focus-ring');
    };
    connectedCallback() {
      if (super.connectedCallback) super.connectedCallback();
      this.addEventListener('keydown', this._focusRingHandler);
      this.addEventListener('blur', this._blurHandler, true);
    }
    disconnectedCallback() {
      if (super.disconnectedCallback) super.disconnectedCallback();
      this.removeEventListener('keydown', this._focusRingHandler);
      this.removeEventListener('blur', this._blurHandler, true);
    }
    focusVisible() {
      this.classList.add('mui-focus-ring');
      this.focus();
    }
  };
} 