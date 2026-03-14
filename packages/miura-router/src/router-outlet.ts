import type { RouteContext, RouteRecord } from './types.js';

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

    /**
     * Render a route component into this outlet.
     * Called by MiuraRouter when the matched route targets this outlet.
     */
    renderRoute(record: RouteRecord, context: RouteContext): void {
        this._clearCurrent();

        const element = document.createElement(record.component);
        this._injectContext(element, context);
        this.appendChild(element);
        this._current = element as HTMLElement;
    }

    /**
     * Clear whatever is currently rendered in this outlet.
     */
    clear(): void {
        this._clearCurrent();
    }

    private _clearCurrent(): void {
        if (this._current) {
            this._current.remove();
            this._current = null;
        }
    }

    private _injectContext(element: Element, context: RouteContext): void {
        if ('routeContext' in element) {
            (element as any).routeContext = context;
            return;
        }
        element.setAttribute('data-route', JSON.stringify({
            params: context.params,
            query: Object.fromEntries(context.query.entries()),
            hash: context.hash,
        }));
    }
}

/** Register the element if not already registered */
if (!customElements.get('miura-router-outlet')) {
    customElements.define('miura-router-outlet', RouterOutlet);
}
