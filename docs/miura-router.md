# miura Router

> Full package README: [`packages/miura-router/README.md`](../packages/miura-router/README.md)

`@miurajs/miura-router` is the client-side router for the miura framework. It supports hash, history, and in-memory navigation modes; async guards and data loaders; nested routes with layout outlets; and redirects.

---

## Quick Start

```typescript
import { createRouter } from '@miurajs/miura-router';

const router = createRouter({
  mode: 'history',
  base: '/',
  fallback: '/login',
  routes: [
    { path: '/', component: 'app-home' },
    {
      path: '/app',
      component: 'app-layout',
      children: [
        { path: 'dashboard', component: 'app-dashboard' },
        { path: 'profile/:id', component: 'app-profile' },
        { path: 'settings',   component: 'app-settings'  },
      ],
    },
    { path: '/login', component: 'app-login' },
    { path: '/old', redirect: '/app/dashboard' },
  ],
  render: async (context) => {
    // mount context.route.component into the DOM
  },
});

await router.start();
```

---

## Route Record

```typescript
interface RouteRecord {
  path: string;                           // relative or absolute path segment
  component: string;                      // custom element tag name
  renderZone?: string;                    // CSS selector for mount point
  slot?: string;                          // named slot in layout
  meta?: Record<string, any>;            // arbitrary metadata
  props?: Record<string, any>;           // static props passed to component
  guards?: RouteGuard[];                  // pre-navigation guards
  loaders?: RouteLoader[];               // async data loaders
  redirect?: string | ((ctx) => string); // redirect instead of rendering
  children?: RouteRecord[];              // nested child routes
}
```

---

## Guards

Guards run before loaders and rendering. Return value controls navigation:

| Return value | Effect |
|---|---|
| `true` / `undefined` / `void` | Allow navigation |
| `false` | Block — emits `router:blocked` event |
| `string` | Redirect to that path |

```typescript
const authGuard: RouteGuard = async ({ data }) => {
  return data.session ? true : '/login';
};

{ path: '/admin', component: 'app-admin', guards: [authGuard] }
```

---

## Loaders

Loaders run after all guards pass. Results are shallow-merged into `context.data`.

```typescript
const routes = [
  {
    path: '/profile/:id',
    component: 'app-profile',
    loaders: [
      ({ params }) => ({ profile: fetchProfile(params.id) }),
      async ({ params }) => ({ perms: await fetchPermissions(params.id) }),
    ],
  },
];
```

Access inside the render callback or component via `context.data.profile`, `context.data.perms`, etc.

---

## Nested Routes & Layout Outlets

Define `children` on a parent route. The parent component must include `<router-outlet>` as a mount point:

```typescript
const routes = [
  {
    path: '/app',
    component: 'app-layout',
    children: [
      { path: 'dashboard', component: 'app-dashboard' },
      { path: 'settings',  component: 'app-settings'  },
    ],
  },
];
```

```typescript
// app-layout.ts
@component({ tag: 'app-layout' })
class AppLayout extends MiuraElement {
  template() {
    return html`
      <nav>...</nav>
      <main><router-outlet></router-outlet></main>
    `;
  }
}
```

`context.matched` contains the full route chain `[parent, child, …]` so the render callback can mount each level independently.

---

## Route Context

Available in guards, loaders, and the render callback:

```typescript
interface RouteContext {
  route: RouteRecord;           // the leaf (matched) route
  matched: RouteRecord[];       // full chain from root to leaf
  pathname: string;             // e.g. '/app/dashboard'
  fullPath: string;             // pathname + search + hash
  params: Record<string, string>; // e.g. { id: '42' }
  query: URLSearchParams;       // parsed query string
  hash: string;                 // URL fragment
  data: Record<string, any>;   // merged loader results
  timestamp: number;            // navigation start time (performance.now())
}
```

## Reactive Signals

The router also exposes signal-like route state:

```typescript
const pathname = router.select((context) => context?.pathname ?? '/');
const profile = router.dataSignal('profile');
```

Use this when components or app services need to react to route context or loader data without manually passing everything through the render callback.

## Route Component Lifecycle

Route components mounted by `MiuraFramework` or `<miura-router-outlet>` can
implement route-aware hooks:

```typescript
class UserPage extends MiuraElement {
  onRouteEnter(context: RouteRenderContext) {
    // First time this component instance is mounted for a route.
  }

  onRouteUpdate(context: RouteRenderContext, previous: RouteContext | null) {
    // Same component instance was reused for a new route context.
  }

  onRouteLeave(context: RouteContext) {
    // Component is about to be removed from its route zone or outlet.
  }
}
```

Use these hooks for route-specific effects such as scroll restoration,
transition state, focus management, analytics, or cancelling work that belongs
to a route instance. Components still receive `routeContext` automatically, and
`data-route` is kept as a serialised debug/fallback attribute.

---

## Router API

```typescript
const router = createRouter(options);

await router.start();                           // begin listening to navigation

const result = await router.navigate('/path');  // push + navigate
const result = await router.replace('/path');   // replace + navigate
router.back();                                  // history.back()
router.forward();                               // history.forward()

router.current;   // RouteContext | undefined
router.previous;  // RouteContext | null

router.stop();    // stop listening (keeps state)
router.destroy(); // full teardown
```

`navigate()` and `replace()` return `Promise<NavigationResult>`:
```typescript
if (result.ok) {
  console.log(result.context.route.component);
} else {
  console.log(result.reason); // 'blocked' | 'not-found' | 'error'
}
```

---

## Navigation Modes

| Mode | Description |
|------|-------------|
| `'history'` | HTML5 `pushState` / `popstate` (default) |
| `'hash'` | `location.hash` changes |
| `'memory'` | In-memory stack — no browser history; ideal for tests |

---

## Events

Emitted on the optional `eventBus` passed in `RouterOptions`:

| Event | Data |
|-------|------|
| `router:setup` | router instance |
| `router:navigating` | `{ from, to }` |
| `router:navigated` | `RouteContext` |
| `router:blocked` | `{ context, reason }` |
| `router:not-found` | `{ path }` |
| `router:error` | `{ error }` |
| `router:rendered` | `RouteContext` |
