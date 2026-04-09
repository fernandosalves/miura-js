# `@miurajs/miura-router`

Modern, declarative routing for miura applications. Built for Web Components, the router handles hash/history/memory navigation modes, async guards, data loaders, redirects, and DOM rendering hooks.

## ✨ Features

- **Multiple navigation modes**: `hash`, `history`, or in-memory for tests.
- **Guards & loaders**: resolve access/gate data before components render.
- **Nested routes & redirects**: declarative tree definitions.
- **Type-safe route params**: `defineRoute<TParams, TData>()` with typed params and loader data contracts.
- **Runtime param validation**: optional Zod / Valibot / ArkType schema on any route.
- **Event-driven**: emits lifecycle events through the framework EventBus.
- **Performance hooks**: timing integration via `PerformanceMonitor`.
- **Reactive route signals**: consume current route context and loader data as signal-like values.

## 🚦 Quick Start

```ts
import { createRouter } from '@miurajs/miura-router';

const router = createRouter({
  mode: 'history',
  base: '/',
  fallback: '/login',
  routes: [
    { path: '/', component: 'app-home' },
    {
      path: '/admin',
      component: 'app-admin',
      renderZone: '#primary',
      guards: [async ({ data }) => (data.user?.isAdmin ? true : '/login')],
      loaders: [async () => ({ stats: await fetchStats() })],
    },
  ],
  render: (context) => mountIntoDom(context),
  eventBus,
  performance,
});

await router.start();
```

## 🛡️ Route Guards

Guards run before loaders/rendering. They may:
- return `true`/`void` to continue
- return `false` to block (`router:blocked` event)
- return a string path (sync/async) to redirect

```ts
const routes = [
  {
    path: '/dashboard',
    component: 'app-dashboard',
    guards: [async ({ data }) => (data.session ? true : '/login')],
  },
];
```

## 📦 Route Loaders

Loaders run after guards and before rendering. Existing function loaders still work as before and their returned objects are shallow-merged into `context.data`.

```ts
const routes = [
  {
    path: '/profile/:id',
    component: 'app-profile',
    loaders: [
      ({ params }) => ({ profile: fetchProfile(params.id) }),
      async ({ params }) => ({ permissions: await fetchPermissions(params.id) }),
    ],
  },
];
```

Access loader results inside the render callback (or components via `routeContext`) through `context.data`.

You can also read loader data reactively from the router itself:

```ts
const profile = router.dataSignal('profile');
const permissions = router.dataSignal('permissions', []);
const allData = router.dataSignal<{ profile?: Profile; permissions?: string[] }>();
```

For richer route state, you can also use named loaders:

```ts
const routes = [
  {
    path: '/profile/:id',
    component: 'app-profile',
    loaders: [
      {
        key: 'profile',
        load: ({ params }) => fetchProfile(params.id),
      },
      {
        key: 'permissions',
        optional: true,
        load: async ({ params }) => fetchPermissions(params.id),
      },
    ],
  },
];
```

Named loader results are exposed under `context.data.<key>`, and the full loader lifecycle is available on `context.loaders`:
- `context.loaders.status`
- `context.loaders.entries.profile`
- `context.loaders.entries.permissions`
- `context.loaders.error`

Optional loaders may fail without aborting navigation, which makes it easier to render partial route data.

## 🗂️ Nested Routes & Layout Outlets

Define a `children` array on any route to create a parent/child hierarchy. The parent route acts as a layout shell; the matched child fills the `<miura-router-outlet>` inside it.

```ts
const routes = [
  {
    path: '/app',
    component: 'app-layout',      // renders the shell + <miura-router-outlet>
    children: [
      { path: 'dashboard', component: 'app-dashboard' },
      { path: 'settings',  component: 'app-settings'  },
      { path: 'profile/:id', component: 'app-profile' },
    ],
  },
];
```

```typescript
// app-layout component
template() {
  return html`
    <nav>...</nav>
    <main>
      <miura-router-outlet></miura-router-outlet>   <!-- child component mounts here -->
    </main>
  `;
}
```

`context.matched` contains the full chain from root to leaf, so nested outlets at any depth receive the correct slice of the matched array.

## 🔗 `<miura-router-outlet>`

The `<miura-router-outlet>` custom element is a passive mount-point. The router's render callback uses `context.matched` to determine which components to mount at each level.

```typescript
import { RouterOutlet } from '@miurajs/miura-router';
// RouterOutlet registers itself as <miura-router-outlet> when imported
```

## � Redirects

```ts
{ path: '/old-path', redirect: '/new-path' }
{ path: '/dynamic', redirect: (ctx) => `/target/${ctx.params.id}` }
```

## �📢 Router Events

| Event | When |
|-------|------|
| `router:setup` | Router initialised |
| `router:navigating` | Navigation started |
| `router:navigated` | Navigation committed |
| `router:blocked` | Guard returned `false` |
| `router:not-found` | No matching route |
| `router:error` | Unhandled navigation error |
| `router:rendered` | Render callback completed |

## 🛠️ Router API

| Method | Description |
|--------|-------------|
| `router.navigate(path, opts?)` | Push a new entry and navigate |
| `router.replace(path, opts?)` | Replace current entry and navigate |
| `router.back()` | Go back in history |
| `router.forward()` | Go forward in history |
| `router.current` | Current `RouteContext` |
| `router.previous` | Previous `RouteContext` |
| `router.currentSignal` | Signal-like current route context |
| `router.select(fn)` | Derive a reactive value from the current route context |
| `router.dataSignal()` | Reactive access to the full loader data object |
| `router.dataSignal(key, fallback?)` | Reactive access to loader data by key |
| `router.start()` | Start listening to navigation events |
| `router.stop()` | Stop listening (keeps state) |
| `router.destroy()` | Full teardown |

`navigate()` and `replace()` both return `Promise<NavigationResult>`:

```ts
const result = await router.navigate('/dashboard');
if (!result.ok) console.log('blocked:', result.reason);
```

## 🔄 Reactive Route State

The router exposes signal-like state so components can respond to navigation and loader data without extra wiring.

```ts
const pathname = router.select((context) => context?.pathname ?? '/');
const profile = router.dataSignal('profile');
const data = router.dataSignal<{ profile?: Profile }>();
```

These values support:

- calling with no args to read the current value
- `.peek()` for direct reads
- `.subscribe(fn)` for updates

That makes them easy to pass into reactive templates or compose with other app primitives.

## 🔷 Type-Safe Route Params And Loader Data

Use `defineRoute<TParams, TData>()` to get typed `buildPath()` / `navigate()` helpers and to carry the expected loader data shape alongside the route definition.

```ts
import { defineRoute, createRouter } from '@miurajs/miura-router';

// No params
const homeRoute  = defineRoute({ path: '/', component: 'app-home' });

// Single param — TypeScript enforces { id: string }
const userRoute  = defineRoute<{ id: string }>({
  path: '/users/:id',
  component: 'user-page',
});

// Multiple params
const postRoute  = defineRoute<{ userId: string; postId: string }>({
  path: '/users/:userId/posts/:postId',
  component: 'post-page',
});

// Pass records to createRouter
const router = createRouter({
  mode: 'history',
  routes: [homeRoute.record, userRoute.record, postRoute.record],
  render: (ctx) => mountComponent(ctx),
});

// Typed navigation — TS error if a param is missing or wrong type
await userRoute.navigate(router, { id: '42' });
await postRoute.navigate(router, { userId: '1', postId: '99' });

// Build path without navigating
userRoute.buildPath({ id: '42' });      // → '/users/42'
postRoute.buildPath({ userId: '1', postId: '99' }); // → '/users/1/posts/99'
```

### Runtime validation with Zod

Pass any Zod-compatible schema as a second argument. Params are validated (and coerced) after every match, before guards run.

```ts
import { z } from 'zod';

const UserParams = z.object({ id: z.string().regex(/^\d+$/) });

const userRoute = defineRoute(
  { path: '/users/:id', component: 'user-page' },
  UserParams, // ← schema
);

// Navigation to /users/abc → NavigationResult { ok: false, reason: 'error' }
// Navigation to /users/42  → proceeds normally, ctx.params.id is '42'
```

The `ParamsSchema` interface is minimal — anything with `safeParse()` works (Zod, Valibot, ArkType, custom).

## 🧪 Testing

Use `mode: 'memory'` to avoid touching the real browser location. Provide a spy render callback to inspect contexts:

```ts
const renders: RouteRenderContext[] = [];
const router = createRouter({
  mode: 'memory',
  routes,
  render: (ctx) => { renders.push(ctx); },
});
await router.start();
await router.navigate('/dashboard');
assert.equal(renders.at(-1)?.route.component, 'app-dashboard');
```

The repository contains `test/router.guards-loaders.test.ts` covering redirects, blocks, and loader merges.

## 📚 Framework Integration

`MiuraFramework` wires this router automatically. Define a static `router` config in your framework subclass, and the framework handles instantiation, DOM zones, and navigation helpers (`navigate`, `replaceRoute`, `goBack`, `goForward`).

When a route defines `meta.title`, `MiuraFramework` also updates `document.title` automatically:

```ts
{
  path: '/dashboard',
  component: 'app-dashboard',
  meta: {
    title: ({ data }) => `Dashboard (${data.stats?.total ?? 0})`,
  },
}
```
