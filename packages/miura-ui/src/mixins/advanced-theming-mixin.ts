type Constructor<T = HTMLElement> = new (...args: any[]) => T & { connectedCallback?(): void; disconnectedCallback?(): void; };

/**
 * AdvancedThemingMixin adds theme switching, context propagation, and theme change subscription.
 * Usage:
 *   class MyComponent extends AdvancedThemingMixin(MuiBase) { ... }
 */
export function AdvancedThemingMixin<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    _theme: string = 'light';
    _themeListeners: Set<(theme: string) => void> = new Set();

    get theme() {
      return this._theme;
    }
    set theme(val: string) {
      if (this._theme !== val) {
        this._theme = val;
        this.style.setProperty('--mui-theme', val);
        this._notifyThemeChange(val);
      }
    }
    setTheme(theme: string) {
      this.theme = theme;
    }
    subscribeToThemeChange(cb: (theme: string) => void) {
      this._themeListeners.add(cb);
      return () => this._themeListeners.delete(cb);
    }
    _notifyThemeChange(theme: string) {
      this._themeListeners.forEach(cb => cb(theme));
      this.dispatchEvent(new CustomEvent('theme-change', { detail: { theme }, bubbles: true, composed: true }));
    }
    connectedCallback() {
      if (super.connectedCallback) super.connectedCallback();
      // Optionally inherit theme from parent
      const parentTheme = this.closest('[style*="--mui-theme"]')?.getAttribute('style')?.match(/--mui-theme:\s*([^;]+)/)?.[1];
      if (parentTheme) this.theme = parentTheme.trim();
    }
  };
} 