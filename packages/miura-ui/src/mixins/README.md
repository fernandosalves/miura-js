# miura UI Mixins

This directory contains mixins for miura UI components. Mixins are composable functions that add specific features to your components without bloating the base class.

## Why Mixins?
- **Selective composition:** Only add features to components that need them.
- **Separation of concerns:** Each mixin handles a specific feature (e.g., styling, focus ring, ripple).
- **Reusability:** Mixins can be reused across different components.

## Usage

A mixin is a function that takes a base class and returns a new class with added functionality.

### Example: StylingMixin

```ts
import { MuiBase } from '../base/mui-base';
import { StylingMixin } from '../mixins/styling-mixin';

export class MuiButton extends StylingMixin(MuiBase) {
  // Now has applyStyling!
}

// Usage in component:
this.applyStyling({
  class: 'my-custom-class',
  style: { color: 'red', padding: '8px' },
  tokens: { '--mui-primary': '#ff0000' }
});
```

## Adding More Mixins
- Create a new file in this directory (e.g., `focus-ring-mixin.ts`).
- Follow the same pattern as `StylingMixin`.
- Document the mixin and its intended use. 