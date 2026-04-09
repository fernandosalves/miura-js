# miura Framework

Miura is built to feel like a complete web component framework out of the box: rendering, component reactivity, async state, plugins, and application structure should fit together cleanly without a lot of glue code.

## Current Direction

The framework is centered around a small set of composable primitives:

- `MiuraElement` as the component foundation
- reactive `properties`, `state`, and `computed`
- signals for standalone reactive logic
- structural directives for declarative control flow
- `$resource()` for component-scoped async state
- `$form()` for component-scoped form state
- plugins and packages layered on top for larger application concerns

## Async State With `$resource()`

`$resource()` is the first step toward stronger application primitives built directly into Miura.

It gives a component:

- a tracked async state machine: `idle`, `pending`, `resolved`, `rejected`
- a `refresh()` method to rerun the loader
- latest-request-wins behavior for overlapping refreshes
- a `view()` helper to render state-specific templates

```typescript
class BlogPostView extends MiuraElement {
  declare slug: string;

  static properties = {
    slug: { type: String, default: '' }
  };

  post = this.$resource(() =>
    fetch(`/api/posts/${this.slug}`).then((response) => response.json())
  );

  template() {
    return this.post.view({
      idle: () => html`<p>Select a post</p>`,
      pending: () => html`<p>Loading post...</p>`,
      ok: (post) => html`<article>${post.title}</article>`,
      error: (error) => html`<p>Failed to load: ${String(error)}</p>`
    });
  }
}
```

## What Comes Next

The near-term framework direction is:

- keep the component model small and predictable
- strengthen async and application-level primitives
- make forms a first-class workflow instead of glue code
- improve persistence and stability in structural rendering
- keep the docs, tests, and package APIs aligned as features land

This gives Miura a clear path toward being a practical framework, not just a set of isolated packages.
