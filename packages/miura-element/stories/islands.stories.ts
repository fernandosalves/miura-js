import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css, component } from '@miurajs/miura-element';

// Import MiuraIsland to ensure the element is registered
import '@miurajs/miura-element';

// ── Demo components that act as "island" targets ───────────────────────────────

@component({ tag: 'island-counter' })
class IslandCounter extends MiuraElement {
    static properties = { count: { type: Number, default: 0 } };
    declare count: number;

    static get styles() {
        return css`
            :host { display: inline-flex; align-items: center; gap: .5rem; font-family: system-ui; }
            button {
                width: 2rem; height: 2rem; border-radius: 50%;
                border: 2px solid #4f46e5; background: #ede9fe;
                color: #4f46e5; font-size: 1rem; cursor: pointer; font-weight: 700;
            }
            button:hover { background: #4f46e5; color: white; }
            .value { font-size: 1.25rem; font-weight: 700; color: #1e293b; min-width: 2rem; text-align: center; }
        `;
    }

    template() {
        return html`
            <button @click=${() => this.count--}>−</button>
            <span class="value">${this.count}</span>
            <button @click=${() => this.count++}>+</button>
        `;
    }
}

@component({ tag: 'island-card' })
class IslandCard extends MiuraElement {
    static properties = {
        title:   { type: String,  default: 'Card' },
        body:    { type: String,  default: '' },
        color:   { type: String,  default: '#4f46e5' },
    };
    declare title: string;
    declare body: string;
    declare color: string;

    static get styles() {
        return css`
            :host { display: block; border-radius: 10px; overflow: hidden; font-family: system-ui; max-width: 320px; }
            .header { padding: .75rem 1rem; color: white; font-weight: 700; font-size: 1rem; }
            .body   { padding: 1rem; background: white; border: 1px solid #e2e8f0; border-top: none; color: #475569; }
        `;
    }

    template() {
        return html`
            <div class="header" style="background:${this.color}">${this.title}</div>
            <div class="body">${this.body || 'No content.'}</div>
        `;
    }
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const STYLES = `
* { box-sizing: border-box; }
body, :host { font-family: system-ui, sans-serif; }
.demo { max-width: 760px; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
.card { border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; background: white; }
.card-header {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    color: white; padding: .75rem 1rem;
    display: flex; align-items: center; justify-content: space-between;
}
.card-header h3 { margin: 0; font-size: .95rem; }
.badge {
    font-size: .7rem; font-weight: 700; padding: .15rem .5rem;
    border-radius: 4px; text-transform: uppercase; letter-spacing: .05em;
}
.badge-violet { background: #7c3aed; }
.badge-teal   { background: #0d9488; }
.badge-orange { background: #ea580c; }
.card-body { padding: 1rem; }
.island-shell {
    border: 2px dashed #c4b5fd; border-radius: 8px; padding: .75rem 1rem;
    background: #faf5ff; position: relative;
}
.island-label {
    position: absolute; top: -.6rem; left: .75rem;
    background: #ede9fe; color: #5b21b6; font-size: .7rem;
    font-weight: 700; padding: .1rem .4rem; border-radius: 3px;
    font-family: monospace; text-transform: uppercase; letter-spacing: .05em;
}
.ssr-placeholder {
    background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 6px;
    padding: .5rem .75rem; color: #64748b; font-size: .85rem; font-style: italic;
}
.row { display: flex; gap: .75rem; align-items: center; flex-wrap: wrap; margin-bottom: .75rem; }
button {
    background: #4f46e5; color: white; border: none; border-radius: 6px;
    padding: .4rem .9rem; font-size: .85rem; cursor: pointer; font-weight: 500;
}
button:hover { background: #4338ca; }
.status { font-size: .8rem; color: #64748b; margin-top: .5rem; }
.status[data-hydrated] { color: #16a34a; font-weight: 600; }
.code { background: #1e293b; color: #7dd3fc; font-family: monospace; font-size: .8rem;
    border-radius: 6px; padding: .75rem 1rem; margin-top: .75rem; line-height: 1.6; }
.comment { color: #475569; }
`;

// ── Demo builder ───────────────────────────────────────────────────────────────

function buildDemo(): HTMLElement {
    const wrap = document.createElement('div');
    const style = document.createElement('style');
    style.textContent = STYLES;
    wrap.appendChild(style);

    const demo = document.createElement('div');
    demo.className = 'demo';
    wrap.appendChild(demo);

    // ── Immediate hydration ───────────────────────────────────────────────────
    const card1 = document.createElement('div');
    card1.className = 'card';
    card1.innerHTML = `
        <div class="card-header">
            <h3>hydrate="load" (default) — counter with initial count=5</h3>
            <span class="badge badge-violet">immediate</span>
        </div>
        <div class="card-body">
            <div class="island-shell">
                <span class="island-label">miura-island</span>
                <miura-island component="island-counter">
                    <script type="application/json">{"count": 5}</script>
                    <div class="ssr-placeholder">⚡ Hydrating…</div>
                </miura-island>
            </div>
            <div class="code">
<span class="comment">&lt;!-- HTML sent from server --&gt;</span><br>
&lt;<span style="color:#86efac">miura-island</span> component="island-counter"&gt;<br>
&nbsp;&nbsp;&lt;script type="application/json"&gt;{"count": 5}&lt;/script&gt;<br>
&nbsp;&nbsp;&lt;<span style="color:#86efac">island-counter</span> count="5"&gt;5&lt;/island-counter&gt;<br>
&lt;/<span style="color:#86efac">miura-island</span>&gt;
            </div>
        </div>
    `;
    demo.appendChild(card1);

    // ── Visible hydration ─────────────────────────────────────────────────────
    const card2 = document.createElement('div');
    card2.className = 'card';
    card2.innerHTML = `
        <div class="card-header">
            <h3>hydrate="visible" — hydrate on IntersectionObserver</h3>
            <span class="badge badge-teal">lazy</span>
        </div>
        <div class="card-body">
            <p style="font-size:.85rem;color:#475569;margin:0 0 .75rem">
                The island below starts with a static placeholder.
                It hydrates when it enters the viewport (already visible here, so immediately in a story).
                In a real page, it would fire as the user scrolls down.
            </p>
            <div class="island-shell" id="visible-shell">
                <span class="island-label">hydrate="visible"</span>
                <miura-island id="visible-island" component="island-card" hydrate="visible">
                    <script type="application/json">{"title":"Lazy Card","body":"Hydrated when visible!","color":"#0d9488"}</script>
                    <div class="ssr-placeholder">Scroll this into view to hydrate…</div>
                </miura-island>
            </div>
            <p class="status" id="visible-status">waiting for intersection…</p>
            <div class="code">
&lt;<span style="color:#86efac">miura-island</span> component="island-card" <span style="color:#fbbf24">hydrate="visible"</span>&gt;<br>
&nbsp;&nbsp;&lt;script type="application/json"&gt;{"title":"Lazy Card","body":"Hydrated when visible!"}&lt;/script&gt;<br>
&lt;/<span style="color:#86efac">miura-island</span>&gt;
            </div>
        </div>
    `;
    demo.appendChild(card2);

    const visibleIsland = card2.querySelector<HTMLElement>('#visible-island')!;
    const visibleStatus = card2.querySelector<HTMLElement>('#visible-status')!;
    visibleIsland.addEventListener('miura-island:hydrated', () => {
        visibleStatus.textContent = '✅ hydrated — island-card is now interactive';
        visibleStatus.setAttribute('data-hydrated', '');
    });

    // ── Idle hydration ────────────────────────────────────────────────────────
    const card3 = document.createElement('div');
    card3.className = 'card';
    card3.innerHTML = `
        <div class="card-header">
            <h3>hydrate="idle" — requestIdleCallback</h3>
            <span class="badge badge-orange">idle</span>
        </div>
        <div class="card-body">
            <p style="font-size:.85rem;color:#475569;margin:0 0 .75rem">
                Hydration defers to browser idle time — ideal for below-the-fold
                components that don't need to be interactive immediately.
            </p>
            <div class="island-shell">
                <span class="island-label">hydrate="idle"</span>
                <miura-island id="idle-island" component="island-counter" hydrate="idle">
                    <script type="application/json">{"count": 100}</script>
                    <div class="ssr-placeholder">Waiting for idle time…</div>
                </miura-island>
            </div>
            <p class="status" id="idle-status">deferred…</p>
            <div class="code">
&lt;<span style="color:#86efac">miura-island</span> component="island-counter" <span style="color:#fbbf24">hydrate="idle"</span>&gt;<br>
&nbsp;&nbsp;&lt;script type="application/json"&gt;{"count": 100}&lt;/script&gt;<br>
&lt;/<span style="color:#86efac">miura-island</span>&gt;
            </div>
        </div>
    `;
    demo.appendChild(card3);

    const idleIsland  = card3.querySelector<HTMLElement>('#idle-island')!;
    const idleStatus  = card3.querySelector<HTMLElement>('#idle-status')!;
    idleIsland.addEventListener('miura-island:hydrated', () => {
        idleStatus.textContent = '✅ hydrated during idle time';
        idleStatus.setAttribute('data-hydrated', '');
    });

    // ── Imperative API ────────────────────────────────────────────────────────
    const card4 = document.createElement('div');
    card4.className = 'card';
    card4.innerHTML = `
        <div class="card-header">
            <h3>Imperative API — island.hydrate()</h3>
            <span class="badge badge-violet">manual trigger</span>
        </div>
        <div class="card-body">
            <div class="row">
                <button id="btn-hydrate">Hydrate now</button>
            </div>
            <div class="island-shell">
                <span class="island-label">not yet hydrated</span>
                <miura-island id="manual-island" component="island-card" hydrate="manual">
                    <script type="application/json">{"title":"On-Demand","body":"Hydrated by button click","color":"#ea580c"}</script>
                    <div class="ssr-placeholder">Click the button above to hydrate this island.</div>
                </miura-island>
            </div>
            <p class="status" id="manual-status">idle — click to hydrate</p>
        </div>
    `;
    demo.appendChild(card4);

    const manualIsland = card4.querySelector<any>('#manual-island')!;
    const manualStatus = card4.querySelector<HTMLElement>('#manual-status')!;
    manualIsland.addEventListener('miura-island:hydrated', () => {
        manualStatus.textContent = '✅ hydrated on demand';
        manualStatus.setAttribute('data-hydrated', '');
        (card4.querySelector('#btn-hydrate') as HTMLButtonElement).disabled = true;
    });
    card4.querySelector('#btn-hydrate')!.addEventListener('click', () => {
        manualIsland.hydrate();
    });

    return wrap;
}

// ── Meta ───────────────────────────────────────────────────────────────────────

const meta: Meta = {
    title: 'miura-element/MiuraIsland',
    parameters: {
        docs: {
            description: {
                component: `
**\`<miura-island>\`** — Islands architecture / partial hydration wrapper.

Wraps server-rendered static HTML. Lazily creates and mounts a miura (or any custom-element)
component when the chosen hydration strategy fires.

| Strategy | Attribute | Trigger |
|---|---|---|
| Immediate | \`hydrate="load"\` (default) | \`connectedCallback\` |
| Viewport | \`hydrate="visible"\` | \`IntersectionObserver\` |
| Idle | \`hydrate="idle"\` | \`requestIdleCallback\` |
| Manual | any other value | \`island.hydrate()\` imperative call |

Props are read from a \`<script type="application/json">\` child or \`data-props\` attribute
and applied as **properties** (not attributes) for full type fidelity.
                `,
            },
        },
    },
};

export default meta;
type Story = StoryObj;

export const IslandsDemo: Story = {
    name: 'MiuraIsland — load / visible / idle / manual',
    render: () => buildDemo(),
};
