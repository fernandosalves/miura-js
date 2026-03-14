/**
 * `<miura-island>` — Islands architecture / partial hydration wrapper.
 *
 * Wraps server-rendered static HTML and lazily hydrates a miura (or any
 * custom-element) component when the chosen strategy fires.
 *
 * ## Attributes
 *
 * | Attribute   | Values                        | Default  | Description |
 * |-------------|-------------------------------|----------|-------------|
 * | `component` | custom element tag name       | —        | **Required.** Tag name to instantiate on hydration. |
 * | `hydrate`   | `"load"` `"visible"` `"idle"` | `"load"` | When to hydrate. |
 * | `data-props`| JSON string                   | —        | Props to apply (alternative to `<script>` child). |
 *
 * ## Props channel
 *
 * Props are read from the **first** matching source:
 * 1. `<script type="application/json">` child element (recommended for SSR)
 * 2. `data-props` attribute
 *
 * Props are applied as **properties** (not attributes) on the created element
 * so arrays, objects, numbers, and booleans all round-trip correctly.
 *
 * ## Usage
 *
 * ```html
 * <!-- Hydrate immediately on page load (default) -->
 * <miura-island component="my-counter">
 *   <script type="application/json">{"count": 5}</script>
 *   <!-- SSR placeholder shown until JS runs -->
 *   <my-counter count="5">5</my-counter>
 * </miura-island>
 *
 * <!-- Hydrate only when the island scrolls into view -->
 * <miura-island component="app-chart" hydrate="visible">
 *   <script type="application/json">{"data": [1, 2, 3]}</script>
 *   <div class="chart-placeholder">Loading…</div>
 * </miura-island>
 *
 * <!-- Hydrate during browser idle time -->
 * <miura-island component="like-button" hydrate="idle" data-props='{"liked":false}'>
 * </miura-island>
 * ```
 *
 * ## Events
 *
 * - `miura-island:hydrated` — dispatched on the `<miura-island>` element after
 *   the component is mounted. `event.detail.element` is the created component.
 */
export class MiuraIsland extends HTMLElement {
    static get observedAttributes(): string[] {
        return ['component', 'hydrate'];
    }

    private _hydrated = false;
    private _io: IntersectionObserver | null = null;

    connectedCallback(): void {
        const strategy = (this.getAttribute('hydrate') ?? 'load').toLowerCase();
        switch (strategy) {
            case 'visible': this._scheduleVisible(); break;
            case 'idle':    this._scheduleIdle();    break;
            default:        this._hydrate();         break;
        }
    }

    disconnectedCallback(): void {
        this._io?.disconnect();
        this._io = null;
    }

    // ── Public ────────────────────────────────────────────────────────────────

    /**
     * Imperatively trigger hydration regardless of strategy.
     * Safe to call multiple times — hydrates only once.
     */
    hydrate(): void {
        this._hydrate();
    }

    // ── Private ───────────────────────────────────────────────────────────────

    private _hydrate(): void {
        if (this._hydrated) return;
        this._hydrated = true;

        const tag = this.getAttribute('component');
        if (!tag) {
            console.warn('[miura-island] Missing required "component" attribute.');
            return;
        }

        const props = this._readProps();
        const el = document.createElement(tag);

        for (const [key, value] of Object.entries(props)) {
            (el as any)[key] = value;
        }

        // Replace an existing SSR placeholder with the same tag if present,
        // otherwise just append the new component.
        const placeholder = this.querySelector(tag);
        if (placeholder) {
            placeholder.replaceWith(el);
        } else {
            this.appendChild(el);
        }

        this.setAttribute('data-hydrated', '');
        this.dispatchEvent(
            new CustomEvent('miura-island:hydrated', {
                bubbles: true,
                composed: true,
                detail: { element: el, props },
            }),
        );
    }

    private _readProps(): Record<string, unknown> {
        // 1. <script type="application/json"> child
        const script = this.querySelector('script[type="application/json"]');
        if (script?.textContent) {
            try { return JSON.parse(script.textContent); } catch (e) {
                console.warn('[miura-island] Failed to parse props from <script>:', e);
            }
        }

        // 2. data-props attribute
        const attr = this.getAttribute('data-props');
        if (attr) {
            try { return JSON.parse(attr); } catch (e) {
                console.warn('[miura-island] Failed to parse data-props attribute:', e);
            }
        }

        return {};
    }

    private _scheduleVisible(): void {
        if (!('IntersectionObserver' in window)) {
            this._hydrate();
            return;
        }

        this._io = new IntersectionObserver((entries) => {
            if (entries.some(e => e.isIntersecting)) {
                this._io!.disconnect();
                this._io = null;
                this._hydrate();
            }
        }, { rootMargin: '200px' });

        this._io.observe(this);
    }

    private _scheduleIdle(): void {
        if ('requestIdleCallback' in window) {
            (window as any).requestIdleCallback(() => this._hydrate(), { timeout: 2000 });
        } else {
            setTimeout(() => this._hydrate(), 100);
        }
    }
}

// ── Auto-register ─────────────────────────────────────────────────────────────

if (!customElements.get('miura-island')) {
    customElements.define('miura-island', MiuraIsland);
}
