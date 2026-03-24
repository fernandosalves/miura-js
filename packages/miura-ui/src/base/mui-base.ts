import { MiuraElement } from '@miurajs/miura-element';

// Utility: Debounce
function debounce(fn: Function, delay: number) {
  let timer: any;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
// Utility: Throttle
function throttle(fn: Function, limit: number) {
  let inThrottle: boolean;
  return (...args: any[]) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export class MuiBase extends MiuraElement {
  // --- 1. Theming & Design Tokens ---
  get theme(): string {
    return getComputedStyle(this).getPropertyValue('--mui-theme')?.trim() || 'light';
  }
  setTheme(theme: 'light' | 'dark' | 'system' | string) {
    this.style.setProperty('--mui-theme', theme);
    this.emit('theme-change', { theme });
  }
  getToken(name: string): string {
    return getComputedStyle(this).getPropertyValue(name)?.trim();
  }
  setToken(name: string, value: string) {
    this.style.setProperty(name, value);
  }
  // Listen for theme changes (system)
  connectedCallback() {
    super.connectedCallback?.();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', this._onSystemThemeChange);
    this._observeDir();
  }
  disconnectedCallback() {
    super.disconnectedCallback?.();
    window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', this._onSystemThemeChange);
    if (this._dirObserver) this._dirObserver.disconnect();
    if (this._mutationObserver) this._mutationObserver.disconnect();
  }
  _onSystemThemeChange = (e: MediaQueryListEvent) => {
    this.emit('theme-change', { theme: e.matches ? 'dark' : 'light', system: true });
  };

  // --- 2. Directionality (RTL/LTR) ---
  get dir(): string {
    return this.getAttribute('dir') || document.documentElement.getAttribute('dir') || 'ltr';
  }
  get isRTL(): boolean {
    return this.dir === 'rtl';
  }
  _dirObserver: MutationObserver | null = null;
  _observeDir() {
    this._dirObserver = new MutationObserver(() => {
      this.emit('dir-change', { dir: this.dir });
    });
    this._dirObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['dir'] });
  }

  // --- 3. Accessibility (a11y) ---
  setAria(name: string, value: string | boolean | null) {
    if (value === null || value === undefined || value === false) {
      this.removeAttribute(`aria-${name}`);
    } else {
      this.setAttribute(`aria-${name}` , String(value));
    }
  }
  focusVisible() {
    this.focus();
    this.classList.add('mui-focus-visible');
  }
  setRole(role: string) {
    this.setAttribute('role', role);
  }
  getRole(): string | null {
    return this.getAttribute('role');
  }
  setTabIndex(index: number) {
    this.tabIndex = index;
  }
  getTabIndex(): number {
    return this.tabIndex;
  }
  // Focus trap (stub, for modals/dialogs)
  enableFocusTrap() {
    // Implement focus trap logic for modals/dialogs
  }
  disableFocusTrap() {
    // Remove focus trap logic
  }
  // Announce utility (for screen reader live regions)
  announce(message: string, politeness: 'polite' | 'assertive' = 'polite') {
    let live = document.getElementById('mui-live-region');
    if (!live) {
      live = document.createElement('div');
      live.id = 'mui-live-region';
      live.setAttribute('aria-live', politeness);
      live.setAttribute('role', 'status');
      live.style.position = 'absolute';
      live.style.width = '1px';
      live.style.height = '1px';
      live.style.overflow = 'hidden';
      live.style.clip = 'rect(1px, 1px, 1px, 1px)';
      document.body.appendChild(live);
    }
    live.textContent = '';
    setTimeout(() => { live!.textContent = message; }, 100);
  }
  // Keyboard navigation helpers (arrow keys, roving tabindex, etc.)
  handleArrowNavigation(event: KeyboardEvent, items: HTMLElement[], orientation: 'horizontal' | 'vertical' = 'horizontal') {
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    let nextIndex = currentIndex;
    if (orientation === 'horizontal') {
      if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % items.length;
      if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + items.length) % items.length;
    } else {
      if (event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % items.length;
      if (event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + items.length) % items.length;
    }
    if (nextIndex !== currentIndex) {
      items[nextIndex].focus();
      event.preventDefault();
    }
  }
  setLabelledBy(id: string) {
    this.setAria('labelledby', id);
  }
  setDescribedBy(id: string) {
    this.setAria('describedby', id);
  }

  // --- 4. Event Utilities ---
  emit(name: string, detail?: any) {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }
  emitDebounced = debounce(this.emit.bind(this), 200);
  emitThrottled = throttle(this.emit.bind(this), 200);
  // Event delegation helper
  delegateEvent(eventName: string, selector: string, handler: (event: Event) => void) {
    this.addEventListener(eventName, (event) => {
      const target = event.target as HTMLElement;
      if (target && target.matches(selector)) {
        handler(event);
      }
    });
  }

  // --- 5. Media/Responsive ---
  get isMobile(): boolean {
    return window.matchMedia('(max-width: 600px)').matches;
  }
  get isTablet(): boolean {
    return window.matchMedia('(min-width: 601px) and (max-width: 900px)').matches;
  }
  get isDesktop(): boolean {
    return window.matchMedia('(min-width: 901px)').matches;
  }
  // Use #media and #resize directives for breakpoint/resize events in templates

  // --- 6. Lifecycle & State ---
  firstUpdated() {
    // Called after first render
  }
  propertyChangedCallback(name: string, oldValue: any, newValue: any) {
    // Called when a property changes (override in subclasses)
  }
  requestUpdate() {
    super.requestUpdate?.();
  }
  isLoading = false;
  isError = false;

  // --- 7. Slot & Content Utilities ---
  hasSlot(name?: string): boolean {
    if (name) {
      const slot = this.shadowRoot?.querySelector(`slot[name="${name}"]`) as HTMLSlotElement | null;
      return !!slot && slot.assignedNodes().length > 0;
    } else {
      const slot = this.shadowRoot?.querySelector('slot') as HTMLSlotElement | null;
      return !!slot && slot.assignedNodes().length > 0;
    }
  }
  onSlotChange(name: string, callback: () => void) {
    const slot = this.shadowRoot?.querySelector(`slot${name ? `[name="${name}"]` : ''}`);
    if (slot) {
      slot.addEventListener('slotchange', callback);
    }
  }

  // --- 8. Style & Class Utilities ---
  classMap(classes: Record<string, boolean>): string {
    return Object.entries(classes).filter(([_, v]) => v).map(([k]) => k).join(' ');
  }
  styleMap(styles: Record<string, string | number>): string {
    return Object.entries(styles).map(([k, v]) => `${k}: ${v};`).join(' ');
  }

  // --- 9. Form Control Integration ---
  // Form association (ElementInternals API)
  _internals: ElementInternals | null = null;
  formAssociated = false;
  attachInternalsIfNeeded() {
    if ('attachInternals' in this && !this._internals) {
      // @ts-ignore
      this._internals = this.attachInternals();
      this.formAssociated = true;
    }
  }
  setCustomValidity(message: string) {
    this._internals?.setValidity({ customError: !!message }, message, this);
  }
  reportValidity(): boolean {
    return this._internals?.reportValidity() ?? true;
  }
  // Value sync (implement in form controls)

  // --- 10. Miscellaneous ---
  // Localization/i18n hooks
  get lang(): string {
    return this.getAttribute('lang') || document.documentElement.getAttribute('lang') || 'en';
  }
  // Mutation observer utility
  _mutationObserver: MutationObserver | null = null;
  observeMutations(callback: MutationCallback, options?: MutationObserverInit) {
    if (this._mutationObserver) this._mutationObserver.disconnect();
    this._mutationObserver = new MutationObserver(callback);
    this._mutationObserver.observe(this, options || { childList: true, subtree: true });
  }
  // For portal/teleport and safe area insets utilities, see ../utils/portal and ../utils/safe-area
} 