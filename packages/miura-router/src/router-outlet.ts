import type { RouteContext, RouteLifecycleHooks, RouteRecord, RouteRenderContext } from './types.js';

/**
 * RouterOutlet — `<miura-router-outlet>`
 *
 * Drop this element into any layout component's template to mark where child
 * routes should render. The router identifies outlets by their `name` attribute
 * (default: "default") and injects child route components into them.
 *
 * Usage:
 *   ```html
 *   <!-- In a layout component template -->
 *   <nav>...</nav>
 *   <miura-router-outlet></miura-router-outlet>
 *   ```
 *
 *   ```html
 *   <!-- Named outlet -->
 *   <miura-router-outlet name="sidebar"></miura-router-outlet>
 *   ```
 *
 * Routes define which outlet they target via `renderZone`:
 *   ```ts
 *   { path: '/users/:id', component: 'user-detail', renderZone: 'sidebar' }
 *   ```
 */
export class RouterOutlet extends HTMLElement {
    private _current: HTMLElement | null = null;
    private _currentContext: RouteRenderContext | null = null;

    static get observedAttributes() {
        return ['name'];
    }

    get outletName(): string {
        return this.getAttribute('name') || 'default';
    }

    connectedCallback(): void {
        if (!this.hasAttribute('role')) {
            this.setAttribute('role', 'region');
        }
    }

    disconnectedCallback(): void {
        this._clearCurrent();
    }

    /**
     * Render a route component into this outlet.
     * Called by MiuraRouter when the matched route targets this outlet.
     */
    renderRoute(record: RouteRecord, context: RouteRenderContext): HTMLElement {
        if (this._current?.tagName.toLowerCase() === record.component.toLowerCase()) {
            this._injectContext(this._current, context);
            this._callRouteUpdate(this._current, context, this._currentContext);
            this._currentContext = context;
            return this._current;
        }

        const element = document.createElement(record.component);
        this._clearCurrent();
        this._injectContext(element, context);
        this.appendChild(element);
        this._current = element as HTMLElement;
        this._currentContext = context;
        this._callRouteEnter(this._current, context);
        return this._current;
    }

    /**
     * Clear whatever is currently rendered in this outlet.
     */
    clear(): void {
        this._clearCurrent();
    }

    private _clearCurrent(): void {
        if (this._current && this._currentContext) {
            this._callRouteLeave(this._current, this._currentContext);
        }

        if (this._current?.parentNode === this) {
            this._current.remove();
        }

        // Defensive cleanup: if rendering ever drifted and extra nodes remained
        // in the outlet, clear them so each navigation starts from a clean slate.
        this.replaceChildren();
        this._current = null;
        this._currentContext = null;
    }

    private _injectContext(element: Element, context: RouteContext): void {
        (element as any).routeContext = context;
        element.setAttribute('data-route', JSON.stringify({
            params: context.params,
            query: Object.fromEntries(context.query.entries()),
            hash: context.hash,
        }));
    }

    private _callRouteEnter(element: Element, context: RouteRenderContext): void {
        const hook = (element as RouteLifecycleHooks).onRouteEnter;
        if (typeof hook === 'function') {
            void hook.call(element, context);
        }
    }

    private _callRouteUpdate(element: Element, context: RouteRenderContext, previous: RouteContext | null): void {
        const hook = (element as RouteLifecycleHooks).onRouteUpdate;
        if (typeof hook === 'function') {
            void hook.call(element, context, previous);
        }
    }

    private _callRouteLeave(element: Element, context: RouteContext | RouteRenderContext): void {
        const hook = (element as RouteLifecycleHooks).onRouteLeave;
        if (typeof hook === 'function') {
            void hook.call(element, context);
        }
    }
}

/** Register the element if not already registered */
if (!customElements.get('miura-router-outlet')) {
    customElements.define('miura-router-outlet', RouterOutlet);
}
