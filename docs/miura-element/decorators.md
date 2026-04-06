# MiuraElement Decorators

MiuraElement provides TypeScript decorators for cleaner, more declarative component definitions.

## Available Decorators

### `@component({ tag })`

Registers the custom element automatically. Replaces manual `customElements.define()` calls.

```typescript
import { MiuraElement, html, css, component } from '@miurajs/miura-element';

@component({ tag: 'my-counter' })
export class MyCounter extends MiuraElement {
  // Component definition
}

// No need for: customElements.define('my-counter', MyCounter);
```

### `@property(options)`

Defines a reactive property. Replaces `static properties = {...}` object syntax.

```typescript
@component({ tag: 'user-card' })
export class UserCard extends MiuraElement {
  @property({ type: String, default: '' })
  name!: string;

  @property({ type: Number, default: 0 })
  age!: number;

  @property({ type: Boolean, default: false })
  active!: boolean;

  @property({ type: Array, default: [] })
  tags!: string[];

  @property({ type: Object, default: {} })
  metadata!: Record<string, unknown>;

  template() {
    return html`<h3>${this.name}, ${this.age}</h3>`;
  }
}
```

#### Property Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `type` | `String \| Number \| Boolean \| Array \| Object` | `String` | Type constructor for conversion |
| `default` | `any` | `undefined` | Default value for the property |
| `attribute` | `string \| boolean` | `true` | Attribute name or false to disable |
| `reflect` | `boolean` | `false` | Reflect property changes to attribute |

### `@state(options)`

Defines internal reactive state that is NOT reflected to attributes. Use for private component state.

```typescript
@component({ tag: 'todo-list' })
export class TodoList extends MiuraElement {
  // Public properties (can be set via attributes)
  @property({ type: Array, default: [] })
  items!: Todo[];

  // Internal state (private to component)
  @state({ default: '' })
  inputValue!: string;

  @state({ default: false })
  isLoading!: boolean;

  @state({ default: 'all' })
  filter!: 'all' | 'active' | 'completed';

  template() {
    return html`
      <input 
        &value=${this.bind('inputValue')}
        @keydown=${this.handleKeyDown}
      >
      <p>Filter: ${this.filter}</p>
    `;
  }
}
```

## Decorators vs Static Properties

### Old Pattern (Still Works)

```typescript
export class MyComponent extends MiuraElement {
  static tagName = 'my-component';
  
  declare name: string;
  declare age: number;

  static properties = {
    name: { type: String, default: '' },
    age: { type: Number, default: 0 },
  };

  // ...
}

customElements.define(MyComponent.tagName, MyComponent);
```

### New Pattern (Recommended)

```typescript
@component({ tag: 'my-component' })
export class MyComponent extends MiuraElement {
  @property({ type: String, default: '' })
  name!: string;

  @property({ type: Number, default: 0 })
  age!: number;

  // ...
}
```

## Benefits of Decorators

1. **Less Boilerplate**: No separate `static properties` object
2. **Type Safety**: Property types are declared inline with definite assignment assertion (`!`)
3. **Better DX**: Property and type in one place
4. **Auto-Registration**: `@component` handles `customElements.define()`
5. **Clear Intent**: `@property` vs `@state` makes public/private distinction obvious

## TypeScript Configuration

Ensure your `tsconfig.json` has decorators enabled:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## Migration Guide

To migrate existing components:

1. Add `@component({ tag: '...' })` decorator to class
2. Convert each `static properties` entry to `@property()` decorator
3. Remove `static tagName` and manual `customElements.define()` call
4. Use `@state()` for internal-only reactive properties
5. Add definite assignment assertion (`!`) or initialize property values

### Example Migration

**Before:**
```typescript
export class UserProfile extends MiuraElement {
  static tagName = 'user-profile';
  
  declare username: string;
  declare isAdmin: boolean;

  static properties = {
    username: { type: String, default: '' },
    isAdmin: { type: Boolean, default: false },
  };
}

customElements.define(UserProfile.tagName, UserProfile);
```

**After:**
```typescript
@component({ tag: 'user-profile' })
export class UserProfile extends MiuraElement {
  @property({ type: String, default: '' })
  username!: string;

  @property({ type: Boolean, default: false })
  isAdmin!: boolean;
}
```

## Complete Example

```typescript
import { MiuraElement, html, css, component, property, state } from '@miurajs/miura-element';

@component({ tag: 'shopping-cart' })
export class ShoppingCart extends MiuraElement {
  // Public properties
  @property({ type: Array, default: [] })
  items!: CartItem[];

  @property({ type: Number, default: 0 })
  itemCount!: number;

  // Internal state
  @state({ default: false })
  isOpen!: boolean;

  @state({ default: '' })
  searchQuery!: string;

  static get styles() {
    return css`
      :host { display: block; }
      .cart { padding: 1rem; }
    `;
  }

  get total() {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  toggleCart = () => {
    this.isOpen = !this.isOpen;
  };

  template() {
    return html`
      <div class="cart">
        <button @click=${this.toggleCart}>
          Cart (${this.itemCount})
        </button>
        
        ${when(this.isOpen, () => html`
          <div class="cart-dropdown">
            <input 
              placeholder="Search items..." 
              &value=${this.bind('searchQuery')}
            >
            <p>Total: $${this.total.toFixed(2)}</p>
            <slot></slot>
          </div>
        `)}
      </div>
    `;
  }
}
```

## Notes

- Both old and new patterns are supported for backward compatibility
- Decorators require TypeScript with `experimentalDecorators` enabled
- `@state()` properties automatically have `attribute: false` and `reflect: false`
- All properties (decorated or static) are signal-backed for reactivity
