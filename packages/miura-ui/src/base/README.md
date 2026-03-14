# MuiBase

The `MuiBase` class is the foundation for all miura UI components. It extends `MiuraElement` and provides a comprehensive set of utilities and hooks for theming, directionality, accessibility, events, responsive helpers, lifecycle, slot/content, style/class, form integration, mutation observation, portal/teleport, and safe area insets.

## Features

- **Theming & Design Tokens**
  - Theme switching (light/dark/system)
  - CSS variable helpers (get/set tokens)
  - Theme change event
- **Directionality (RTL/LTR)**
  - Direction detection (`dir`, `isRTL`)
  - Direction change event
- **Accessibility (a11y)**
  - ARIA helpers (`setAria`)
  - Focus visible utility
  - Role and tabindex helpers
  - Focus trap (stub)
  - Announce utility (screen reader live region)
  - Keyboard navigation helpers
  - Label/description association
- **Event Utilities**
  - Custom event emitter (`emit`)
  - Debounced/throttled emitters
  - Event delegation
- **Media/Responsive**
  - Responsive helpers (`isMobile`, `isTablet`, `isDesktop`)
  - Use miura's `#media` and `#resize` directives for advanced cases
- **Lifecycle & State**
  - First update callback
  - Property change hook
  - Async state helpers
- **Slot & Content Utilities**
  - Slot presence detection
  - Slot change event
- **Style & Class Utilities**
  - Class map and style map helpers
- **Form Control Integration**
  - Form association (ElementInternals)
  - Validation helpers
- **Miscellaneous**
  - Localization/i18n hooks
  - Mutation observer utility
  - Portal/teleport utility
  - Safe area insets

## Usage

Extend `MuiBase` in your component:

```ts
import { MuiBase } from '../base/mui-base';

export class MuiButton extends MuiBase {
  template() {
    return html`<button><slot></slot></button>`;
  }
}
```

## Common Utilities & Examples

### Theming
```ts
this.setTheme('dark');
const primary = this.getToken('--mui-primary');
this.setToken('--mui-primary', '#0055aa');
this.addEventListener('theme-change', e => { /* ... */ });
```

### Directionality
```ts
if (this.isRTL) { /* ... */ }
this.addEventListener('dir-change', e => { /* ... */ });
```

### Accessibility
```ts
this.setAria('label', 'Close');
this.focusVisible();
this.setRole('button');
this.setTabIndex(0);
this.announce('Item added to cart');
this.setLabelledBy('label-id');
this.setDescribedBy('desc-id');
```

### Event Utilities
```ts
this.emit('custom-event', { foo: 'bar' });
this.emitDebounced('input', { value: 'abc' });
this.emitThrottled('scroll', { y: 100 });
this.delegateEvent('click', '.child', e => { /* ... */ });
```

### Responsive
```ts
if (this.isMobile) { /* ... */ }
// Use #media and #resize in templates for advanced cases
```

### Lifecycle & State
```ts
firstUpdated() { /* ... */ }
propertyChangedCallback(name, oldVal, newVal) { /* ... */ }
```

### Slot & Content
```ts
if (this.hasSlot('icon')) { /* ... */ }
this.onSlotChange('icon', () => { /* ... */ });
```

### Style & Class
```ts
const classes = this.classMap({ active: true, disabled: false });
const styles = this.styleMap({ color: 'red', padding: '8px' });
```

### Form Integration
```ts
this.attachInternalsIfNeeded();
this.setCustomValidity('Required');
this.reportValidity();
```

### Miscellaneous
```ts
this.observeMutations(mutations => { /* ... */ });
this.portal(someNode, document.body);
const topInset = this.safeAreaInsetTop;
```

---

For more details, see the source code in `mui-base.ts`.
