# `@miurajs/miura`

The main package for the miura framework.

This package bundles and exports all the core modules, making it easy to get started with miura.

## Included Building Blocks

- `MiuraElement` for reactive custom elements
- `html` and `css` template utilities
- property, state, and computed reactivity
- structural directives and fine-grained bindings
- component-scoped async resources with `$resource()`
- component-scoped form state with `$form()`
- lightweight shared state with `$shared()`
- signals and shared reactive primitives

## Example

```typescript
import { MiuraElement, html, component } from '@miurajs/miura';

@component({ tag: 'app-user-card' })
class AppUserCard extends MiuraElement {
  user = this.$resource(() => fetch('/api/user').then((r) => r.json()));

  template() {
    return this.user.view({
      pending: () => html`<p>Loading...</p>`,
      ok: (user) => html`<p>${user.name}</p>`,
      error: (error) => html`<p>${String(error)}</p>`
    });
  }
}
```

```typescript
@component({ tag: 'app-signup-form' })
class AppSignupForm extends MiuraElement {
  form = this.$form({ email: '', acceptedTerms: false });

  template() {
    const email = this.form.field('email');

    return html`
      <form @submit=${this.form.handleSubmit(async (values) => {
        console.log(values);
      })}>
        <input &value=${email} @blur=${email.touch}>
        <input type="checkbox" &checked=${this.form.field('acceptedTerms')}>
        <p>${email.showError ? email.error ?? '' : ''}</p>
      </form>
    `;
  }
}
```

Async validation is also supported through `validateAsync`, and is automatically respected by `submit()` / `handleSubmit()`. Automatic modes are opt-in through `validateAsyncOn: 'blur' | 'change'`.

Forms also keep submit outcome state through `submitError`, `submitResult`, and `submitSucceeded`, which helps keep success/error UI close to the form primitive instead of in separate component state.

Server-side field validation can also be mapped back into the form with `setErrors()`.
For submit flows, `failSubmit()` can capture the submit error and field errors together.
`view()` can render submit-state UI declaratively from the form itself.

For lightweight cross-component state, `$shared(key, initial)` gives multiple components the same signal instance without requiring a full store setup. Use namespaced keys like `blog-editor:theme`, `sharedKey(...)`, or `createSharedNamespace(...)` to avoid collisions.

See [@miurajs/miura-element](/Users/fernandoalves/Desktop/_dev/miura-js/packages/miura-element/README.md) for the component API and [docs](/Users/fernandoalves/Desktop/_dev/miura-js/docs/README.md) for the broader framework documentation.
