# miura Directives

Directives are special attributes in miura templates that add dynamic behavior to elements. They allow you to declaratively attach logic, event handling, and advanced features to your UI, similar to Angular or Vue directives.

## Types of Directives

### 1. Core (Structural) Directives
These are always loaded and available in every miura app:

- **#if** — Conditional rendering
- **#for** — List rendering
- **#switch** — Case-based conditional rendering

#### Example:
```html
<div #if=${isVisible}>Visible if true</div>
<ul>
  <li #for=${[items, (item) => html`<span>${item}</span>`]}></li>
</ul>
<div #switch=${tab}>
  <template case="a">Tab A</template>
  <template case="b">Tab B</template>
  <template default>Default</template>
</div>
```

### 2. Lazy-Loaded Directives
These are loaded **on demand**—only if you use them in your template. This keeps your app fast and lean!

- **#resize** — React to element resize
- **#intersect** — Observe element visibility in viewport
- **#focus** — Handle focus/blur events
- **#mutation** — Observe DOM mutations
- **#lazy** — Lazy load content when visible
- **#animate** — Add animations and transitions
- **#validate** — Real-time form validation
- **#media** — Responsive behavior via media queries
- **#gesture** — Touch and mouse gesture handling

#### Example:
```html
<div #resize=${(entry) => console.log(entry)}>Resizable</div>
<div #intersect=${(visible) => console.log(visible)}>Watch me</div>
<input #focus=${(focused) => console.log(focused)}>
<div #mutation=${(mutations) => console.log(mutations)}></div>
<div #lazy=${{ placeholder: html`<span>Loading...</span>` }}>
  <img src="heavy.jpg">
</div>
<div #animate=${{ trigger: 'hover', animation: 'fadeIn' }}>Animated!</div>
<input #validate=${{ rules: { required: true }, onValid: v => ... }}>
<div #media=${{ mobile: () => html`Mobile`, desktop: () => html`Desktop` }}></div>
<div #gesture=${{ swipe: dir => ..., pinch: scale => ... }}></div>
```

## How Lazy Loading Works
- Only the core directives are included in your initial bundle.
- When the template engine encounters a non-core `#directive`, it dynamically imports the code for that directive.
- If you never use a directive, it is never loaded—no dead code!
- This keeps your app fast, especially for large projects or component libraries.

## Creating Custom Directives

### Using Decorators

```typescript
import { directive, lazyDirective, BaseDirective } from '@miurajs/render';

@directive('my-directive')
export class MyDirective extends BaseDirective {
  mount(element: Element) { /* ... */ }
  update(value: unknown) { /* ... */ }
  unmount() { /* ... */ }
}

@lazyDirective('my-lazy')
export class MyLazyDirective extends BaseDirective {
  mount(element: Element) { /* ... */ }
}
```

### Manual Registration

```typescript
import { DirectiveManager } from '@miurajs/render';
DirectiveManager.register('my-directive', MyDirective);
DirectiveManager.registerLazyDirective('my-lazy', async () => {
  const { MyLazyDirective } = await import('./my-lazy');
  return MyLazyDirective;
});
```

## Best Practices
- Use core directives for common structural logic.
- Use lazy directives for advanced features, performance, and only when needed.
- Clean up resources in `unmount`.
- Keep directive logic focused and reusable.
- Document your custom directives for your team.

## Debugging
Enable debug logging for directives:
```typescript
import { enableDebug } from '@miurajs/render';
enableDebug({ directives: true, directiveManager: true });
```

---

**miura Directives** give you the power of advanced UI logic with zero dead code and maximum performance. Use them declaratively, extend them easily, and keep your apps fast!
