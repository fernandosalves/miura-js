import type { Meta, StoryObj } from '@storybook/web-components';
import {
    createIslandHTML,
    renderIslands,
    IslandRegistry,
} from '@miurajsjs/miura-element/server';
import { islandsPlugin } from '@miurajsjs/miura-vite';

// ── Styles ─────────────────────────────────────────────────────────────────────

const STYLES = `
* { box-sizing: border-box; }
body, :host { font-family: system-ui, sans-serif; }
.demo { max-width: 820px; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
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
.badge-green  { background: #16a34a; }
.badge-blue   { background: #2563eb; }
.badge-orange { background: #ea580c; }
.badge-violet { background: #7c3aed; }
.card-body { padding: 1rem; }
.row { display: flex; gap: .75rem; align-items: flex-start; flex-wrap: wrap; margin-bottom: .75rem; }
.col { flex: 1; min-width: 260px; }
.col-label { font-size: .75rem; font-weight: 700; color: #64748b; margin-bottom: .35rem; text-transform: uppercase; letter-spacing: .05em; }
.code {
    background: #0f172a; color: #94a3b8; font-family: monospace; font-size: .78rem;
    border-radius: 8px; padding: .85rem 1rem; line-height: 1.65; overflow-x: auto;
    white-space: pre;
}
.code .tag   { color: #86efac; }
.code .attr  { color: #fbbf24; }
.code .val   { color: #a5f3fc; }
.code .str   { color: #f9a8d4; }
.code .cmt   { color: #475569; font-style: italic; }
.code .kw    { color: #c084fc; }
button {
    background: #4f46e5; color: white; border: none; border-radius: 6px;
    padding: .4rem .9rem; font-size: .85rem; cursor: pointer; font-weight: 500;
}
button:hover { background: #4338ca; }
input[type=number], input[type=text] {
    border: 1px solid #cbd5e1; border-radius: 6px;
    padding: .35rem .65rem; font-size: .85rem; width: 90px;
}
label { font-size: .85rem; color: #475569; }
.manifest {
    background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;
    padding: .6rem .75rem; font-family: monospace; font-size: .8rem; color: #1e293b;
    white-space: pre; overflow-x: auto;
}
.divider { border-top: 1px solid #f1f5f9; margin: .75rem 0; }
.live-island {
    border: 2px dashed #c4b5fd; border-radius: 8px; padding: .75rem 1rem;
    background: #faf5ff; position: relative; margin-top: .75rem;
}
.live-island-label {
    position: absolute; top: -.6rem; left: .75rem;
    background: #ede9fe; color: #5b21b6; font-size: .7rem;
    font-weight: 700; padding: .1rem .4rem; border-radius: 3px;
    font-family: monospace;
}
`;

// ── Syntax highlight HTML ──────────────────────────────────────────────────────

const HTML_TOKEN = /<!--[\s\S]*?-->|<\/?[\w-]+[\s\S]*?>/g;

function _hl(raw: string): string {
    const tokenRegex = new RegExp(HTML_TOKEN, 'g');
    let result = '';
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tokenRegex.exec(raw))) {
        result += escapeHtml(raw.slice(lastIndex, match.index));
        const token = match[0];

        if (token.startsWith('<!--')) {
            result += `<span class="cmt">${escapeHtml(token)}</span>`;
        } else {
            result += highlightTag(token);
        }

        lastIndex = tokenRegex.lastIndex;
    }

    result += escapeHtml(raw.slice(lastIndex));
    return result;
}

function highlightTag(token: string): string {
    const isClosing = token.startsWith('</');
    const trimmed = token.trimEnd();
    const isSelfClosing = !isClosing && trimmed.endsWith('/>');

    const startOffset = isClosing ? 2 : 1;
    const endOffset = isSelfClosing ? 2 : 1;
    const inner = token.slice(startOffset, token.length - endOffset);
    const nameMatch = inner.match(/^[\w-]+/);

    if (!nameMatch) {
        return escapeHtml(token);
    }

    const tagName = nameMatch[0];
    const rest = inner.slice(tagName.length);
    const open = isClosing ? '&lt;/' : '&lt;';
    const close = isSelfClosing ? '/&gt;' : '&gt;';

    return `${open}<span class="tag">${tagName}</span>${highlightAttributes(rest)}${close}`;
}

function highlightAttributes(segment: string): string {
    let result = '';
    let i = 0;

    while (i < segment.length) {
        const char = segment[i];

        if (/\s/.test(char)) {
            result += char;
            i++;
            continue;
        }

        const nameMatch = segment.slice(i).match(/^[\w-:]+/);
        if (!nameMatch) {
            result += escapeHtml(char);
            i++;
            continue;
        }

        const name = nameMatch[0];
        result += `<span class="attr">${name}</span>`;
        i += name.length;

        let spaceAfterName = '';
        while (i < segment.length && /\s/.test(segment[i])) {
            spaceAfterName += segment[i++];
        }

        if (segment[i] !== '=') {
            result += spaceAfterName;
            continue;
        }

        i++; // consume '='
        let spaceAfterEq = '';
        while (i < segment.length && /\s/.test(segment[i])) {
            spaceAfterEq += segment[i++];
        }

        let value = '';
        if (i < segment.length && (segment[i] === '"' || segment[i] === "'")) {
            const quote = segment[i++];
            let start = i;
            while (i < segment.length && segment[i] !== quote) {
                i++;
            }
            value = quote + segment.slice(start, i);
            if (i < segment.length && segment[i] === quote) {
                value += segment[i++];
            }
        } else {
            const start = i;
            while (i < segment.length && !/\s/.test(segment[i])) {
                i++;
            }
            value = segment.slice(start, i);
        }

        result += `${spaceAfterName}=${spaceAfterEq}<span class="str">${escapeHtml(value)}</span>`;
    }

    return result;
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ── Demo builder ───────────────────────────────────────────────────────────────

function buildDemo(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.innerHTML = `<style>${STYLES}</style>`;
    const demo = document.createElement('div');
    demo.className = 'demo';
    wrap.appendChild(demo);

    // ── 1. createIslandHTML() ─────────────────────────────────────────────────
    const card1 = document.createElement('div');
    card1.className = 'card';
    card1.innerHTML = `
        <div class="card-header">
            <h3>createIslandHTML() — server utility</h3>
            <span class="badge badge-green">zero-DOM</span>
        </div>
        <div class="card-body">
            <div class="row" style="margin-bottom:.5rem">
                <label>component:</label>
                <input id="c1-comp" type="text" value="my-counter" style="width:140px">
                <label>count:</label>
                <input id="c1-count" type="number" value="5" style="width:65px">
                <label>hydrate:</label>
                <select id="c1-hydrate">
                    <option value="load">load</option>
                    <option value="visible">visible</option>
                    <option value="idle">idle</option>
                </select>
                <button id="c1-btn">Generate</button>
            </div>
            <div class="code" id="c1-out"></div>
        </div>
    `;
    demo.appendChild(card1);

    function updateCard1() {
        const comp  = (card1.querySelector<HTMLInputElement>('#c1-comp')!).value;
        const count = +(card1.querySelector<HTMLInputElement>('#c1-count')!).value;
        const hyd   = (card1.querySelector<HTMLSelectElement>('#c1-hydrate')!).value;
        const html  = createIslandHTML({
            component: comp,
            props:     { count },
            hydrate:   hyd as any,
            placeholder: `<${comp} count="${count}">${count}</${comp}>`,
        });
        card1.querySelector('#c1-out')!.innerHTML = _hl(html);
    }

    card1.querySelector('#c1-btn')!.addEventListener('click', updateCard1);
    updateCard1();

    // ── 2. IslandRegistry ─────────────────────────────────────────────────────
    const card2 = document.createElement('div');
    card2.className = 'card';
    card2.innerHTML = `
        <div class="card-header">
            <h3>IslandRegistry — centralised SSR island catalogue</h3>
            <span class="badge badge-blue">server</span>
        </div>
        <div class="card-body">
            <p style="font-size:.85rem;color:#475569;margin:0 0 .75rem">
                Register island defaults once at app boot; call <code>render()</code>
                anywhere in your SSR templates.
            </p>
            <div class="row">
                <div class="col">
                    <div class="col-label">Registration (runs at startup)</div>
                    <div class="code"><span class="kw">IslandRegistry</span>.register(<span class="str">'my-counter'</span>, {
  props: { count: <span class="val">0</span> }, hydrate: <span class="str">'load'</span>
});
<span class="kw">IslandRegistry</span>.register(<span class="str">'app-chart'</span>, {
  props: { data: [] }, hydrate: <span class="str">'visible'</span>
});
<span class="kw">IslandRegistry</span>.register(<span class="str">'like-button'</span>, {
  props: { liked: <span class="val">false</span> }, hydrate: <span class="str">'idle'</span>
});</div>
                </div>
                <div class="col">
                    <div class="col-label">Usage in route handler</div>
                    <div class="code"><span class="cmt">// Override per-request props</span>
<span class="kw">IslandRegistry</span>.render(<span class="str">'my-counter'</span>, {
  props: { count: <span class="val">42</span> }
});

<span class="cmt">// No override — uses defaults</span>
<span class="kw">IslandRegistry</span>.render(<span class="str">'app-chart'</span>);</div>
                </div>
            </div>
            <div class="divider"></div>
            <div class="row" style="margin-bottom:.5rem">
                <label>Override count:</label>
                <input id="c2-count" type="number" value="42" style="width:65px">
                <button id="c2-btn">Render my-counter</button>
            </div>
            <div class="code" id="c2-out"></div>
        </div>
    `;
    demo.appendChild(card2);

    IslandRegistry.register('my-counter', { props: { count: 0 }, hydrate: 'load' });
    IslandRegistry.register('app-chart',  { props: { data: [] }, hydrate: 'visible' });
    IslandRegistry.register('like-button', { props: { liked: false }, hydrate: 'idle' });

    card2.querySelector('#c2-btn')!.addEventListener('click', () => {
        const count = +(card2.querySelector<HTMLInputElement>('#c2-count')!).value;
        const html  = IslandRegistry.render('my-counter', { props: { count } });
        card2.querySelector('#c2-out')!.innerHTML = _hl(html);
    });
    card2.querySelector<HTMLElement>('#c2-out')!.innerHTML =
        _hl(IslandRegistry.render('my-counter', { props: { count: 42 } }));

    // ── 3. renderIslands() + manifest ─────────────────────────────────────────
    const card3 = document.createElement('div');
    card3.className = 'card';
    card3.innerHTML = `
        <div class="card-header">
            <h3>renderIslands() + build manifest</h3>
            <span class="badge badge-orange">batch</span>
        </div>
        <div class="card-body">
            <button id="c3-btn">Render all registered islands</button>
            <div class="row" style="margin-top:.75rem;gap:1rem">
                <div class="col">
                    <div class="col-label">HTML output (first island)</div>
                    <div class="code" id="c3-html">&nbsp;</div>
                </div>
                <div class="col">
                    <div class="col-label">islands.manifest.json</div>
                    <div class="manifest" id="c3-manifest">&nbsp;</div>
                </div>
            </div>
        </div>
    `;
    demo.appendChild(card3);

    card3.querySelector('#c3-btn')!.addEventListener('click', () => {
        const { rendered, manifest } = renderIslands([
            { component: 'my-counter', props: { count: 5 } },
            { component: 'my-counter', props: { count: 10 }, hydrate: 'visible' },
            { component: 'app-chart',  props: { data: [1,2,3] }, hydrate: 'visible' },
            { component: 'like-button', props: { liked: true }, hydrate: 'idle' },
        ]);
        card3.querySelector('#c3-html')!.innerHTML = _hl(rendered[0].html);
        card3.querySelector('#c3-manifest')!.textContent = JSON.stringify(manifest, null, 2);
    });

    // ── 4. islandsPlugin HTML transform ───────────────────────────────────────
    const card4 = document.createElement('div');
    card4.className = 'card';
    card4.innerHTML = `
        <div class="card-header">
            <h3>islandsPlugin() — Vite HTML transform (simulated)</h3>
            <span class="badge badge-violet">build-time</span>
        </div>
        <div class="card-body">
            <p style="font-size:.85rem;color:#475569;margin:0 0 .75rem">
                The Vite plugin runs <code>transformIndexHtml</code> to inject
                <code>&lt;script type="application/json"&gt;</code>, add the
                <code>hydrate</code> attribute, and insert a placeholder.
                Edit the input HTML below and click Transform.
            </p>
            <div class="row" style="align-items:stretch;gap:1rem">
                <div class="col">
                    <div class="col-label">Input HTML (from file)</div>
                    <textarea id="c4-in" style="width:100%;height:130px;font-family:monospace;font-size:.78rem;border:1px solid #e2e8f0;border-radius:6px;padding:.5rem;resize:vertical;">&lt;miura-island component="my-counter"&gt;&lt;/miura-island&gt;
&lt;miura-island component="app-chart" hydrate="visible"&gt;&lt;/miura-island&gt;</textarea>
                </div>
                <div class="col">
                    <div class="col-label">Output HTML (after Vite transform)</div>
                    <div class="code" id="c4-out" style="min-height:130px">&nbsp;</div>
                </div>
            </div>
            <button id="c4-btn" style="margin-top:.5rem">Transform</button>
        </div>
    `;
    demo.appendChild(card4);

    const plugin = islandsPlugin({
        components: {
            'my-counter': { props: { count: 0 }, hydrate: 'load',
                placeholder: '<my-counter count="0">0</my-counter>' },
            'app-chart':  { props: { data: [] }, hydrate: 'visible',
                placeholder: '<div class="chart-ph">Loading chart…</div>' },
        },
    });

    card4.querySelector('#c4-btn')!.addEventListener('click', () => {
        const input = (card4.querySelector<HTMLTextAreaElement>('#c4-in')!).value;
        const hook  = (plugin as any).transformIndexHtml as (html: string) => string;
        const out   = hook(input);
        card4.querySelector('#c4-out')!.innerHTML = _hl(out);
    });

    return wrap;
}

// ── Meta ───────────────────────────────────────────────────────────────────────

const meta: Meta = {
    title: 'miura-element/IslandSSR',
    parameters: {
        docs: {
            description: {
                component: `
**SSR prerender utilities for \`<miura-island>\`.**

### Server utilities (\`@miurajsjs/miura-element/server\`)

| Export | Description |
|---|---|
| \`createIslandHTML(def)\` | Serialise a single island to HTML with \`<script type="application/json">\` props |
| \`renderIslands(defs)\` | Batch render + build manifest |
| \`buildManifest(islands)\` | Build \`IslandManifest\` from rendered islands |
| \`IslandRegistry\` | Centralised registry — \`register()\`, \`render()\`, \`renderAll()\` |

### Vite plugin (\`@miurajsjs/miura-vite\`)

\`\`\`ts
import { islandsPlugin } from '@miurajsjs/miura-vite';

export default defineConfig({
  plugins: [
    islandsPlugin({
      components: {
        'my-counter': { props: { count: 0 }, hydrate: 'load' },
        'app-chart':  { props: { data: [] }, hydrate: 'visible' },
      },
      manifest: 'islands.manifest.json',
    }),
  ],
});
\`\`\`
                `,
            },
        },
    },
};

export default meta;
type Story = StoryObj;

export const IslandSSRDemo: Story = {
    name: 'SSR prerender — createIslandHTML / IslandRegistry / islandsPlugin',
    render: () => buildDemo(),
};
