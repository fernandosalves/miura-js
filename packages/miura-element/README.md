# @miurajs/miura-element

The core component system for the miura framework. Provides the `MiuraElement` base class for creating reactive web components with properties, computed properties, lifecycle hooks, async resources, error boundaries, two-way binding, and slot utilities.

## Features

- **Decorators** — `@component`, `@property`, `@state` for cleaner definitions
- **Reactive Properties** — Type-safe definitions with automatic type conversion and attribute reflection; each property is signal-backed
- **Internal State** — `static state()` for private, non-reflected reactive state fields
- **Computed Properties** — Derived values with dependency tracking and caching
- **Async Resources** — `$resource()` for component-scoped async state with `idle`, `pending`, `resolved`, and `rejected` states
- **Form State** — `$form()` for field binders, validation, dirty/touched tracking, and submit state
- **Lifecycle Hooks** — `onMount`, `onUnmount`, `willUpdate`, `shouldUpdate`, `updated`, `onAdopt`
- **Error Boundaries** — `onError` handler with fallback UI and recovery
- **Two-Way Binding** — `&` prefix with `bind()` helper for form elements
- **AOT / JIT Compiler** — `static compiler = 'AOT'` to opt a component into the zero-DOM-query render path
- **Standalone Signals** — `$signal()` and `$computed()` for use outside components
- **Shared Signals** — `$shared(key, initial)` for lightweight app-wide reactive state
- **Router Bridge** — `$route()`, `$routeSelect()`, and `$routeData()` for reactive route context in components
- **Route Resources** — `$routeResource()` for param-driven async state tied to navigation
- **Slot Utilities** — `querySlotted()` and `onSlotChange()` for managing distributed content
- **Decorators** — `@component`, `@property`, `@computed` for concise definitions
- **Islands Architecture** — `<miura-island>` wrapper for partial hydration with `load`, `visible`, and `idle` strategies
- **TypeScript** — Full type safety with excellent DX

## Installation

```bash
pnpm add @miurajs/miura-element
```

## Quick Start

```typescript
import { MiuraElement, html, css, component } from '@miurajs/miura-element';

@component({ tag: 'my-counter' })
class Counter extends MiuraElement {
  declare count: number;

  static properties = {
    count: { type: Number, default: 0 }
  };

  static styles = css`
    :host { display: block; padding: 1rem; }
    button { padding: 0.5rem 1rem; margin: 0 0.5rem; cursor: pointer; }
  `;

  increment = () => { this.count++; };
  decrement = () => { this.count--; };

  template() {
    return html`
      <h3>Count: ${this.count}</h3>
      <button @click=${this.decrement}>-</button>
      <button @click=${this.increment}>+</button>
    `;
  }
}
```

## Decorators (Recommended)

MiuraElement provides TypeScript decorators for cleaner component definitions:

```typescript
import { MiuraElement, html, css, component, property, state } from '@miurajs/miura-element';

@component({ tag: 'user-card' })
export class UserCard extends MiuraElement {
  @property({ type: String, default: '' })
  name!: string;

  @property({ type: Number, default: 0 })
  age!: number;

  @state({ default: false })
  isEditing!: boolean;

  static get styles() {
    return css`
      :host { display: block; padding: 1rem; }
    `;
  }

  template() {
    return html`
      <h3>${this.name}, ${this.age}</h3>
      <p>Editing: ${this.isEditing}</p>
    `;
  }
}
```

**Benefits:**
- No `static properties` object needed
- Auto-registration with `@component`
- `@property` for public props, `@state` for internal state
- Type and property definition in one place

See [../../docs/miura-element/decorators.md](../../docs/miura-element/decorators.md) for full documentation and migration guide.

## API Reference

### Reactive Properties

```typescript
static properties = {
  name:     { type: String,  default: 'John' },
  age:      { type: Number,  default: 30 },
  active:   { type: Boolean, default: false },
  items:    { type: Array,   default: [] },
  config:   { type: Object,  default: {} }
};
```

| Option | Description |
|--------|-------------|
| `type` | `String`, `Number`, `Boolean`, `Array`, `Object` |
| `default` | Default value |
| `reflect` | Reflect to HTML attribute (default: `false`) |
| `attribute` | Custom attribute name (default: lowercase property name) |

### Computed Properties

```typescript
static computed() {
  return {
    fullName: {
      dependencies: ['firstName', 'lastName'],
      get() { return `${this.firstName} ${this.lastName}`.trim(); }
    },
    birthYear: {
      dependencies: ['age'],
      get() { return new Date().getFullYear() - this.age; },
      set(value: number) { this.age = new Date().getFullYear() - value; }
    }
  };
}
```

### Async Resources

Use `$resource()` when a component needs to track async work and rerender automatically as the request state changes.

```typescript
import { MiuraElement, html, component } from '@miurajs/miura-element';

@component({ tag: 'user-card' })
class UserCard extends MiuraElement {
  declare userId: string;
  user = this.$resource(() => fetch(`/api/users/${this.userId}`).then((r) => r.json()));

  static properties = {
    userId: { type: String, default: '1' }
  };

  template() {
    return this.user.view({
      idle: () => html`<p>Idle</p>`,
      pending: () => html`<p>Loading user...</p>`,
      ok: (user) => html`<h3>${user.name}</h3>`,
      error: (error) => html`<p>Failed: ${String(error)}</p>`
    });
  }
}
```

`$resource()` returns an object with:

| Field | Description |
|------|-------------|
| `state` | Current state: `idle`, `pending`, `resolved`, `rejected` |
| `loading` | `true` while a request is in flight |
| `value` / `data` | Latest resolved value |
| `error` | Latest rejection value |
| `promise` | The current in-flight promise, if any |
| `refresh()` | Re-run the loader and update the component |
| `view()` | Render a template for each resource state |

Pass `{ auto: false }` if you want to create the resource without starting the first request immediately:

```typescript
class SearchResults extends MiuraElement {
  results = this.$resource(() => this.fetchResults(), { auto: false });

  connectedCallback() {
    super.connectedCallback();
    void this.results.refresh();
  }
}
```

### Form State

Use `$form()` when a component needs local form state that works directly with Miura's two-way bindings.

```typescript
import { MiuraElement, html, component } from '@miurajs/miura-element';

@component({ tag: 'profile-form' })
class ProfileForm extends MiuraElement {
  form = this.$form(
    { name: '', newsletter: false },
    {
      validate: (values) => ({
        name: values.name.trim() ? undefined : 'Name is required'
      }),
      validateAsync: async (values) => {
        const taken = await fetch(`/api/profile/check-name?name=${values.name}`).then((r) => r.json());
        return {
          name: taken.exists ? 'Name is already taken' : undefined
        };
      },
      validateAsyncOn: 'blur'
    }
  );

  async save() {
    await this.form.submit(async (values) => {
      await fetch('/api/profile', {
        method: 'POST',
        body: JSON.stringify(values)
      });
    });
  }

  template() {
    const name = this.form.field('name');
    const newsletter = this.form.field('newsletter');

    return html`
      <form @submit=${this.form.handleSubmit(async (values) => {
        await fetch('/api/profile', {
          method: 'POST',
          body: JSON.stringify(values)
        });
      })}>
        <input &value=${name} @blur=${name.touch}>
        <input type="checkbox" &checked=${newsletter}>
        <p>${name.showError ? name.error ?? '' : ''}</p>
        <p>${this.form.submitError ? 'Save failed' : ''}</p>
        <button ?disabled=${!this.form.valid || this.form.submitting} type="submit">
        ${this.form.submitting ? 'Saving...' : 'Save'}
        </button>
      </form>
    `;
  }
}
```

`$form()` returns an object with:

| Field | Description |
|------|-------------|
| `values` / `data` | Current form values |
| `initialValues` | Baseline values used for `dirty` checks and `reset()` |
| `errors` | Current validation errors |
| `visibleErrors` | Validation errors for touched fields only |
| `dirty` | `true` when any field differs from its initial value |
| `valid` | `true` when no validation errors are present |
| `validating` | `true` while `validateAsync()` is running |
| `submitting` | `true` while `submit()` is in flight |
| `submitError` | Last error thrown by `submit()` |
| `submitResult` | Last resolved value returned by `submit()` |
| `submitSucceeded` | `true` after a successful submit until the form changes or state is cleared |
| `touched` | Set of fields changed or manually touched |
| `field(name)` | Returns a binder with `value`, `set`, `touch`, `isTouched`, `isDirty`, `showError`, and `error` |
| `set(name, value)` | Set one field value |
| `patch(values)` | Update multiple fields at once |
| `reset(values?)` | Reset to the initial values or replace the baseline entirely |
| `touchAll()` | Mark every field as touched |
| `shouldShowError(name)` | `true` when a field is touched and currently invalid |
| `validate()` | Re-run validation and return whether the form is valid |
| `validateAsync()` | Run async validation and return whether the form is valid |
| `clearSubmitState()` | Clear `submitError` and `submitResult` |
| `setErrors(errors, { touch })` | Apply field errors directly, useful for server validation responses |
| `clearErrors()` | Clear current field errors |
| `failSubmit(error, { errors, touch })` | Record a submit failure, optionally map field errors, then rethrow |
| `view({ ... })` | Render idle, validating, submitting, success, or error submit states declaratively |
| `submit(handler)` | Validate, set `submitting`, run the async handler, then clear `submitting` |
| `handleSubmit(handler)` | Wrap a native form submit event, prevent default, and run `submit(handler)` |

Invalid `submit()` calls automatically mark all fields as touched, which makes it easy to reveal all validation messages after the first submit attempt without extra template logic.

Use `validateAsync` for checks like username uniqueness or server-backed business rules. It is explicit by default: Miura runs it during `submit()` or when you call `form.validateAsync()` yourself.

Automatic async validation is opt-in:

- `validateAsyncOn: 'manual'` keeps validation explicit
- `validateAsyncOn: 'blur'` runs async validation when a field is touched
- `validateAsyncOn: 'change'` runs debounced async validation after value changes
- `validateAsyncDebounce` controls the debounce delay for `'change'` mode

For server-side validation, `failSubmit()` lets you map field errors and preserve the submit failure in one place:

```typescript
await this.form.submit(async (values, form) => {
  try {
    await api.saveProfile(values);
  } catch (error) {
    form.failSubmit(error, {
      errors: {
        name: 'Name already exists'
      },
      touch: true
    });
  }
});
```

For state-specific UI around submit flows, `view()` keeps the branching close to the form:

```typescript
${this.form.view({
  idle: () => html`<p>Ready</p>`,
  validating: () => html`<p>Checking...</p>`,
  submitting: () => html`<p>Saving...</p>`,
  success: () => html`<p>Saved</p>`,
  error: (error) => html`<p>${String(error)}</p>`
})}
```

### Shared State

Use `$shared()` when multiple components should react to the same lightweight piece of state without setting up a larger store.

```typescript
class ThemeToggle extends MiuraElement {
  theme = this.$shared('theme', 'light');

  template() {
    return html`
      <button @click=${() => this.theme(this.theme() === 'light' ? 'dark' : 'light')}>
        Theme: ${this.theme}
      </button>
    `;
  }
}

class ThemeBadge extends MiuraElement {
  theme = this.$shared('theme', 'light');

  template() {
    return html`<p>Current theme: ${this.theme}</p>`;
  }
}
```

Components using the same key receive the same shared signal. For larger workflows, actions, middleware, or persistence, use `miura-data-flow`.

Best practice is to namespace shared keys to avoid collisions. Prefer keys like `blog-editor:theme` over very generic keys like `theme`.

Miura also supports helpers for this:

```typescript
import { createSharedNamespace, sharedKey } from '@miurajs/miura-element';

const blogShared = createSharedNamespace('blog-editor');

const draft = blogShared.use('draft', '');
const autosave = sharedKey('blog-editor', 'autosave');
```

You can also pass array keys directly:

```typescript
this.theme = this.$shared(['blog-editor', 'theme'], 'light');
```

### Context Injection

Use tree-scoped context when a parent should expose data or services to deep descendants without threading them through props or global shared keys.

```typescript
import { MiuraElement, createContextKey, html, signal, type Signal } from '@miurajs/miura-element';

const themeContext = createContextKey<Signal<string>>('theme');

class ThemeProvider extends MiuraElement {
  theme = this.$signal('light');

  constructor() {
    super();
    this.$provide(themeContext, this.theme);
  }

  template() {
    return html`
      <button @click=${() => this.theme(this.theme() === 'light' ? 'dark' : 'light')}>
        Toggle
      </button>
      <theme-badge></theme-badge>
    `;
  }
}

class ThemeBadge extends MiuraElement {
  template() {
    const theme = this.$inject(themeContext, signal('light'));
    return html`<p>Theme: ${theme}</p>`;
  }
}
```

The nearest provider wins, so nested layouts can override context locally. For reactive context, provide a signal, resource, form, or another reactive primitive and let descendants bind to it directly.

### Router Bridge

Use the router bridge helpers when a component should react to route context or loader data directly.

```typescript
class ProfilePage extends MiuraElement {
  route = this.$route(router);
  pathname = this.$routeSelect(router, (context) => context?.pathname ?? '/');
  profile = this.$routeData(router, 'profile');

  template() {
    return html`
      <p>${this.pathname}</p>
      <h2>${this.profile()?.name ?? 'Loading...'}</h2>
    `;
  }
}
```

These helpers wrap the router's reactive route signals so components can consume route state without manually threading `context.data` through props.

When route params should drive async fetching, use `$routeResource()`:

```typescript
class ProfilePage extends MiuraElement {
  profile = this.$routeResource(
    router,
    (context) => context?.params.id,
    (id) => fetch(`/api/users/${id}`).then((r) => r.json()),
    { skip: (id) => !id }
  );

  template() {
    return this.profile.view({
      idle: () => html`<p>Select a user</p>`,
      pending: () => html`<p>Loading...</p>`,
      ok: (user) => html`<h2>${user.name}</h2>`,
      error: (error) => html`<p>${String(error)}</p>`
    });
  }
}
```

### Styles

```typescript
static styles = css`
  :host { display: block; padding: 1rem; }
  .title { font-size: 1.5rem; font-weight: bold; }
`;
```

### Lifecycle Hooks

| Hook | When | Use Case |
|------|------|----------|
| `onMount()` | Once, after first render | Fetch data, init third-party libraries |
| `onUnmount()` | On disconnect | Cancel fetches, dispose resources |
| `willUpdate(changed)` | Before each render | Derive values from changed properties |
| `shouldUpdate(changed)` | Before each render | Return `false` to skip an unnecessary render |
| `updated(changed)` | After each render | Post-render DOM operations |
| `onAdopt()` | `adoptedCallback` | Handle document changes |

```typescript
@component({ tag: 'my-widget' })
class MyWidget extends MiuraElement {
  onMount() {
    this.data = await fetch('/api/data').then(r => r.json());
  }

  onUnmount() {
    this.abortController?.abort();
  }

  willUpdate(changed) {
    if (changed.has('items')) {
      this.filteredItems = this.items.filter(i => i.active);
    }
  }

  shouldUpdate(changed) {
    // Skip renders that only change internal bookkeeping
    return !changed.has('_internalTick');
  }
}
```

### Error Boundaries

Override `onError(error)` to catch rendering errors. Return `true` to suppress `console.error`.

```typescript
@component({ tag: 'safe-widget' })
class SafeWidget extends MiuraElement {
  onError(error: Error): boolean {
    this.shadowRoot!.innerHTML = `
      <div class="error">
        <h3>Something went wrong</h3>
        <p>${error.message}</p>
        <button onclick="this.getRootNode().host.recover()">Retry</button>
      </div>
    `;
    return true; // suppress console.error
  }
}
```

### Two-Way Binding (`&`)

The `&` prefix creates a two-way binding that sets a DOM property and listens for the corresponding event to push changes back.

```typescript
template() {
  return html`
    <!-- Using the bind() helper (recommended) -->
    <input &value=${this.bind('name')}>
    <input type="checkbox" &checked=${this.bind('agree')}>

    <!-- Using a tuple [currentValue, setter] -->
    <input &value=${[this.email, (v) => this.email = v]}>
  `;
}
```

**Auto-detected events:**

| Property | Event |
|----------|-------|
| `value` | `input` |
| `checked` | `change` |
| `selected` | `change` |
| `files` | `change` |
| *(other)* | `input` |

### Slot Utilities

```typescript
@component({ tag: 'my-card' })
class MyCard extends MiuraElement {
  onMount() {
    // Query slotted elements
    const headerEls = this.querySlotted('header');

    // React to slot changes
    this.onSlotChange('', (elements) => {
      this.hasContent = elements.length > 0;
    });
  }

  template() {
    return html`
      <div class="card">
        <slot name="header"></slot>
        <slot></slot>
        <slot name="footer"></slot>
      </div>
    `;
  }
}
```

### Helper Methods

#### `emit(eventName, detail?, options?)`

Convenience wrapper for dispatching custom events.

```typescript
@component({ tag: 'mui-drawer' })
class MuiDrawer extends MiuraElement {
  private handleClose() {
    this.open = false;
    this.emit('close');
  }

  private handleToggle() {
    this.collapsed = !this.collapsed;
    this.emit('toggle', { collapsed: this.collapsed });
  }

  private handleSelect(id: string) {
    // Emit with bubbles and composed for cross shadow-DOM
    this.emit('item-select', { id }, { bubbles: true, composed: true });
  }
}
```

**Options:**
- `bubbles` (default: `false`) - Event bubbles up the DOM
- `composed` (default: `false`) - Event crosses shadow DOM boundary
- `cancelable` (default: `false`) - Event can be prevented

#### `hasSlot(name)`

Checks if a named slot has assigned content. Useful for conditional rendering.

```typescript
@component({ tag: 'mui-panel' })
class MuiPanel extends MiuraElement {
  template() {
    return html`
      <div class="panel">
        ${when(this.hasSlot('actions'),
          () => html`
            <div class="actions">
              <slot name="actions"></slot>
            </div>
          `
        )}
        <slot></slot>
      </div>
    `;
  }
}
```

### Template Binding Reference

| Prefix | Type | Example |
|--------|------|---------|
| *(none)* | Text / Node | `${this.name}` |
| `@` | Event | `@click=${this.handler}` |
| `.` | Property | `.value=${this.text}` |
| `?` | Boolean attribute | `?disabled=${this.off}` |
| `&` | Two-way binding | `&value=${this.bind('name')}` |
| `#` | Reference / Directive | `#ref`, `#if`, `#for` |
| `class` | Class map | `class=${{ active: true }}` |
| `style` | Style object | `style=${{ color: 'red' }}` |

Event modifiers via `|`: `@click|prevent=${handler}`, `@click|prevent,stop=${handler}`

### Conditional Rendering

```typescript
import { when, choose } from '@miurajs/miura-element';

// when(condition, trueCase, falseCase?)
${when(this.loggedIn,
  () => html`<user-panel></user-panel>`,
  () => html`<login-form></login-form>`
)}

// choose(value, [...cases], default?)
${choose(this.status, [
  ['loading', () => html`<spinner></spinner>`],
  ['error',   () => html`<error-msg></error-msg>`],
  ['ready',   () => html`<content></content>`],
])}
```

### Keyed List Rendering

```typescript
import { repeat } from '@miurajs/miura-element';

${repeat(this.items,
  (item) => item.id,                              // key function
  (item, i) => html`<item-card .data=${item}>`     // template function
)}
```

Uses an **LIS-based (Longest Increasing Subsequence) diffing algorithm** to compute the minimal set of DOM moves when items are reordered.

### Async Rendering

```typescript
import { createAsyncTracker, resolveAsync } from '@miurajs/miura-element';

// Create tracker (e.g. in onMount or event handler)
this.userTracker = createAsyncTracker(
  fetchUser(this.userId),
  () => this.requestUpdate()
);

// In template()
${resolveAsync(this.userTracker,
  (user) => html`<p>Hello ${user.name}</p>`,       // resolved
  ()     => html`<p>Loading...</p>`,                // pending
  (err)  => html`<p>Error: ${err.message}</p>`      // rejected
)}
```

### Virtual Scrolling

Use the `#virtualScroll` directive to virtualize a large list. The directive manages the scroll container, spacer, and visible slice internally — no manual scroll listeners needed:

```typescript
template() {
  return html`
    <div #virtualScroll=${{
      items: this.items,       // full list (e.g. 10,000 items)
      itemHeight: 40,          // fixed row height in px
      containerHeight: 400,    // viewport height in px
      render: (item, i) => html`<div class="row">${item.name}</div>`,
      overscan: 3,             // extra rows above/below viewport
    }}></div>
  `;
}
```

The lower-level `computeVirtualSlice()` function is also available for custom implementations:

```typescript
import { computeVirtualSlice } from '@miurajs/miura-element';

const vs = computeVirtualSlice({
  items: this.items,
  itemHeight: 40,
  containerHeight: 400,
  render: (item, i) => html`<div class="row">${item.name}</div>`,
  overscan: 3,
}, this.scrollTop);

// vs.visibleItems, vs.totalHeight, vs.startIndex, etc.
```

### Internal State (`static state()`)

Use `static state()` for reactive fields that are private to the component and should **not** reflect to HTML attributes:

```typescript
@component({ tag: 'search-box' })
class SearchBox extends MiuraElement {
  // Public properties — reflected, observable from outside
  static properties = {
    placeholder: { type: String, default: '' },
  };

  // Internal state — reactive but not reflected
  static state() {
    return {
      query:     { type: String,  default: '' },
      loading:   { type: Boolean, default: false },
      results:   { type: Array,   default: [] },
    };
  }

  declare placeholder: string;
  declare query: string;
  declare loading: boolean;
  declare results: unknown[];
}
```

### AOT / JIT Rendering Compiler

Every component defaults to **JIT** (Just-in-Time) rendering via the `TemplateProcessor` pipeline, which supports every binding type. Add `static compiler = 'AOT' as const` to opt a component class into the faster compiled path:

```typescript
@component({ tag: 'data-row' })
class DataRow extends MiuraElement {
  static compiler = 'AOT' as const;
  declare label: string;
  declare value: number;
  static properties = {
    label: { type: String, default: '' },
    value: { type: Number, default: 0 },
  };

  template() {
    return html`<td>${this.label}</td><td>${this.value}</td>`;
  }
}
```

| | JIT (default) | AOT |
|---|---|---|
| First render | `TemplateProcessor` → `Binding[]` | `TemplateCompiler` → `render()` → `{ fragment, refs }` |
| Updates | `instance.update(values)` | Direct `refs[N].el.prop = v` — **zero DOM queries** |
| Directives / `repeat()` | ✅ Full support | ✅ Delegated to `NodeBinding` / `DirectiveBinding` |
| Best for | All components | High-frequency updates, list rows, counters |

### Standalone Signals

Create reactive values outside of components:

```typescript
import { $signal, $computed } from '@miurajs/miura-element';

const count = $signal(0);
const label = $computed(() => `Count: ${count.get()}`);

count.set(count.get() + 1);
console.log(label.get()); // 'Count: 1'
```

Signals created with `$signal()` / `$computed()` can be passed directly into `html` bindings — `BindingManager` subscribes to them automatically so bindings update without triggering a full component re-render.

## Best Practices

1. **Use computed properties for derived state** instead of manual updates
2. **Keep dependency arrays minimal** — only what the computed actually reads
3. **Use `static state()` for internal UI state** — keeps it off attributes and out of observed properties
4. **Use arrow functions for event handlers** — automatic `this` binding
5. **Use `static compiler = 'AOT'` for hot paths** — rows, counters, table cells that update frequently
6. **Use `shouldUpdate` sparingly** — only to skip truly unnecessary renders
7. **Clean up in `onUnmount`** — abort controllers, remove global listeners, dispose resources
8. **Use `&` binding for forms** — cleaner than manual `@input` + `.value` wiring

## 🖥️ Server-side Utilities (`@miurajs/miura-element/server`)

Import from `@miurajs/miura-element/server` in Node.js / SSR / SSG contexts. **Zero DOM dependency.**

```ts
import { createIslandHTML, IslandRegistry, renderIslands } from '@miurajs/miura-element/server';
```

### `createIslandHTML(def)`

Generate a single `<miura-island>` HTML string from a definition object:

```ts
const html = createIslandHTML({
  component: 'my-counter',
  props:     { count: 5 },
  hydrate:   'visible',
  placeholder: '<my-counter count="5">5</my-counter>',
});
// → <miura-island component="my-counter" hydrate="visible">
//     <script type="application/json">{"count":5}</script>
//     <my-counter count="5">5</my-counter>
//   </miura-island>
```

### `IslandRegistry`

Register island defaults once at app boot; look them up anywhere in your SSR templates:

```ts
IslandRegistry.register('my-counter', { props: { count: 0 }, hydrate: 'load' });
IslandRegistry.register('app-chart',  { props: { data: [] }, hydrate: 'visible' });

// In a route handler — override props per-request
const html = IslandRegistry.render('my-counter', { props: { count: req.session.count } });
```

### `renderIslands(defs)`

Batch-render an array of island definitions and get a typed manifest back:

```ts
const { rendered, manifest } = renderIslands([
  { component: 'my-counter', props: { count: 5 } },
  { component: 'app-chart',  props: { data: [] }, hydrate: 'visible' },
]);
// manifest.total === 2
// manifest.entries[].component, .hydrate, .count
```

## 🏝️ Islands Architecture (`<miura-island>`)

`<miura-island>` is a partial hydration wrapper. It renders static SSR'd HTML immediately and lazily creates the interactive component when the chosen strategy fires.

```html
<!-- Hydrate immediately (default) -->
<miura-island component="my-counter">
  <script type="application/json">{"count": 5}</script>
  <!-- SSR placeholder shown before JS runs -->
  <my-counter count="5">5</my-counter>
</miura-island>

<!-- Hydrate when scrolled into view -->
<miura-island component="app-chart" hydrate="visible">
  <script type="application/json">{"data": [1,2,3]}</script>
  <div class="chart-placeholder">…</div>
</miura-island>

<!-- Hydrate during browser idle time -->
<miura-island component="like-button" hydrate="idle" data-props='{"liked":false}'>
</miura-island>
```

### Hydration strategies

| `hydrate` value | When it fires |
|---|---|
| `"load"` (default) | Immediately in `connectedCallback` |
| `"visible"` | When the island enters the viewport (`IntersectionObserver`, 200 px root margin) |
| `"idle"` | During browser idle time (`requestIdleCallback`, 2 s timeout fallback) |
| anything else | Never — call `island.hydrate()` imperatively |

### Props channel

Props are applied as **properties** (not attributes) on the created element for full type fidelity:

1. First source: `<script type="application/json">` child element (recommended for SSR)
2. Second source: `data-props` attribute (JSON string)

### Events

`miura-island:hydrated` bubbles from the island after the component mounts. `event.detail.element` is the created component, `event.detail.props` are the resolved props.

```typescript
island.addEventListener('miura-island:hydrated', (e) => {
  console.log('hydrated', e.detail.element);
});

// Imperative hydration
island.hydrate();
```

## License

MIT
