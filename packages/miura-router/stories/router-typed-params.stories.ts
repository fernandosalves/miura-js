import type { Meta, StoryObj } from '@storybook/web-components';
import { createRouter, defineRoute, buildPath } from '@miurajs/miura-router';
import type { RouteRenderContext } from '@miurajs/miura-router';

// ── Typed route definitions ────────────────────────────────────────────────────

const homeRoute    = defineRoute({ path: '/',               component: 'app-home'    });
const usersRoute   = defineRoute({ path: '/users',          component: 'app-users'   });
const userRoute    = defineRoute<{ id: string }>({
    path: '/users/:id',
    component: 'app-user-detail',
});
const postRoute    = defineRoute<{ userId: string; postId: string }>({
    path: '/users/:userId/posts/:postId',
    component: 'app-post',
});
const searchRoute  = defineRoute({ path: '/search', component: 'app-search' });

// ── Styles ─────────────────────────────────────────────────────────────────────

const STYLES = `
* { box-sizing: border-box; }
body, :host { font-family: system-ui, sans-serif; }
.demo { max-width: 800px; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
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
.badge-indigo { background: #4f46e5; }
.badge-green  { background: #16a34a; }
.badge-amber  { background: #d97706; }
.card-body { padding: 1rem; }
.row { display: flex; gap: .5rem; align-items: center; flex-wrap: wrap; margin-bottom: .75rem; }
label { font-size: .85rem; color: #475569; font-weight: 500; }
input[type=text], input[type=number] {
    border: 1px solid #cbd5e1; border-radius: 6px;
    padding: .35rem .65rem; font-size: .85rem; width: 110px;
}
button {
    background: #4f46e5; color: white; border: none; border-radius: 6px;
    padding: .4rem .9rem; font-size: .85rem; cursor: pointer; font-weight: 500;
}
button:hover { background: #4338ca; }
button:disabled { opacity: .5; cursor: not-allowed; }
button.secondary { background: #64748b; }
button.secondary:hover { background: #475569; }
.result {
    font-family: monospace; font-size: .85rem; background: #f8fafc;
    border: 1px solid #e2e8f0; border-radius: 6px; padding: .6rem .75rem;
    color: #1e293b; min-height: 2.5rem; white-space: pre-wrap;
}
.result.ok    { border-color: #bbf7d0; background: #f0fdf4; color: #166534; }
.result.error { border-color: #fecaca; background: #fef2f2; color: #b91c1c; }
.nav-log {
    font-family: monospace; font-size: .8rem; background: #0f172a;
    color: #94a3b8; border-radius: 8px; padding: .75rem 1rem;
    max-height: 140px; overflow-y: auto;
}
.log-line { padding: .15rem 0; border-bottom: 1px solid #1e293b; }
.log-line .ts  { color: #475569; }
.log-line .ok  { color: #4ade80; }
.log-line .err { color: #f87171; }
.route-table { width: 100%; border-collapse: collapse; font-size: .85rem; }
.route-table th { background: #f1f5f9; text-align: left; padding: .4rem .7rem; font-weight: 600; color: #475569; }
.route-table td { padding: .4rem .7rem; border-top: 1px solid #f1f5f9; color: #1e293b; font-family: monospace; }
.route-table tr:hover td { background: #f8fafc; }
.chip {
    display: inline-block; padding: .1rem .4rem; border-radius: 4px;
    font-size: .75rem; background: #ede9fe; color: #5b21b6; font-weight: 600;
}
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

    // ── Route table ──────────────────────────────────────────────────────────
    const tableCard = document.createElement('div');
    tableCard.className = 'card';
    tableCard.innerHTML = `
        <div class="card-header">
            <h3>Typed route definitions</h3>
            <span class="badge badge-indigo">defineRoute&lt;TParams&gt;</span>
        </div>
        <div class="card-body">
            <table class="route-table">
                <thead><tr>
                    <th>Route</th><th>Path</th><th>TParams</th>
                </tr></thead>
                <tbody>
                    <tr><td>homeRoute</td><td>/</td><td><span class="chip">none</span></td></tr>
                    <tr><td>usersRoute</td><td>/users</td><td><span class="chip">none</span></td></tr>
                    <tr><td>userRoute</td><td>/users/:id</td><td><span class="chip">{ id: string }</span></td></tr>
                    <tr><td>postRoute</td><td>/users/:userId/posts/:postId</td><td><span class="chip">{ userId, postId }</span></td></tr>
                    <tr><td>searchRoute</td><td>/search</td><td><span class="chip">none</span></td></tr>
                </tbody>
            </table>
        </div>
    `;
    demo.appendChild(tableCard);

    // ── buildPath() ──────────────────────────────────────────────────────────
    const buildCard = document.createElement('div');
    buildCard.className = 'card';
    buildCard.innerHTML = `
        <div class="card-header">
            <h3>buildPath() — typed param substitution</h3>
            <span class="badge badge-green">compile-time safe</span>
        </div>
        <div class="card-body">
            <div class="row">
                <label>userId:</label>
                <input id="uid" type="text" value="42">
                <label>postId:</label>
                <input id="pid" type="text" value="7">
                <button id="btn-build">Build path</button>
                <button id="btn-build-bad" class="secondary">Missing param →</button>
            </div>
            <div class="result" id="build-result">path will appear here…</div>
        </div>
    `;
    demo.appendChild(buildCard);

    const buildResult = buildCard.querySelector<HTMLElement>('#build-result')!;
    buildCard.querySelector('#btn-build')!.addEventListener('click', () => {
        const userId  = (buildCard.querySelector<HTMLInputElement>('#uid')!).value;
        const postId  = (buildCard.querySelector<HTMLInputElement>('#pid')!).value;
        try {
            const path = postRoute.buildPath({ userId, postId });
            buildResult.textContent = `postRoute.buildPath({ userId: "${userId}", postId: "${postId}" })\n→ "${path}"`;
            buildResult.className = 'result ok';
        } catch (e: any) {
            buildResult.textContent = `Error: ${e.message}`;
            buildResult.className = 'result error';
        }
    });

    buildCard.querySelector('#btn-build-bad')!.addEventListener('click', () => {
        try {
            buildPath('/users/:userId/posts/:postId', { userId: '1' } as any);
        } catch (e: any) {
            buildResult.textContent = `buildPath('/users/:userId/posts/:postId', { userId: '1' })\n→ throws: ${e.message}`;
            buildResult.className = 'result error';
        }
    });

    // ── navigate() ───────────────────────────────────────────────────────────
    const navCard = document.createElement('div');
    navCard.className = 'card';
    navCard.innerHTML = `
        <div class="card-header">
            <h3>TypedRoute.navigate() — live router in memory mode</h3>
            <span class="badge badge-amber">memory mode</span>
        </div>
        <div class="card-body">
            <div class="row">
                <button id="btn-home">→ home</button>
                <button id="btn-users">→ users</button>
            </div>
            <div class="row">
                <label>userId:</label>
                <input id="nav-uid" type="text" value="42" style="width:80px">
                <button id="btn-user">→ userRoute</button>
                <label>postId:</label>
                <input id="nav-pid" type="text" value="7" style="width:80px">
                <button id="btn-post">→ postRoute</button>
            </div>
            <div class="nav-log" id="nav-log"></div>
        </div>
    `;
    demo.appendChild(navCard);

    const navLog = navCard.querySelector<HTMLElement>('#nav-log')!;
    const renders: RouteRenderContext[] = [];

    function addLog(text: string, ok = true) {
        const ts  = new Date().toLocaleTimeString();
        const div = document.createElement('div');
        div.className = 'log-line';
        div.innerHTML = `<span class="ts">[${ts}]</span> <span class="${ok ? 'ok' : 'err'}">${text}</span>`;
        navLog.prepend(div);
    }

    const router = createRouter({
        mode: 'memory',
        routes: [
            homeRoute.record,
            usersRoute.record,
            userRoute.record,
            postRoute.record,
            searchRoute.record,
        ],
        render: (ctx) => {
            renders.push(ctx);
            addLog(`navigated → ${ctx.route.component}  params=${JSON.stringify(ctx.params)}`);
        },
    });

    router.start().then(() => addLog('router started'));

    navCard.querySelector('#btn-home')!.addEventListener('click', async () => {
        const r = await homeRoute.navigate(router, {});
        if (!r.ok) addLog(`blocked: ${r.reason}`, false);
    });

    navCard.querySelector('#btn-users')!.addEventListener('click', async () => {
        const r = await usersRoute.navigate(router, {});
        if (!r.ok) addLog(`blocked: ${r.reason}`, false);
    });

    navCard.querySelector('#btn-user')!.addEventListener('click', async () => {
        const id = (navCard.querySelector<HTMLInputElement>('#nav-uid')!).value;
        try {
            const r = await userRoute.navigate(router, { id });
            if (!r.ok) addLog(`blocked: ${r.reason}`, false);
        } catch (e: any) { addLog(e.message, false); }
    });

    navCard.querySelector('#btn-post')!.addEventListener('click', async () => {
        const userId = (navCard.querySelector<HTMLInputElement>('#nav-uid')!).value;
        const postId = (navCard.querySelector<HTMLInputElement>('#nav-pid')!).value;
        try {
            const r = await postRoute.navigate(router, { userId, postId });
            if (!r.ok) addLog(`blocked: ${r.reason}`, false);
        } catch (e: any) { addLog(e.message, false); }
    });

    return wrap;
}

// ── Meta ───────────────────────────────────────────────────────────────────────

const meta: Meta = {
    title: 'miura-router/Typed Route Params',
    parameters: {
        docs: {
            description: {
                component: `
**\`defineRoute<TParams>\`** — type-safe route definitions with typed \`buildPath()\` and \`navigate()\`.

\`\`\`ts
const userRoute = defineRoute<{ id: string }>({
  path: '/users/:id',
  component: 'user-page',
});

userRoute.buildPath({ id: '42' })          // → '/users/42'
await userRoute.navigate(router, { id: '42' });
\`\`\`

TypeScript catches missing or extra params at compile time. \`buildPath()\` throws at runtime
if a required segment is absent. Pass a Zod/Valibot schema as the second argument for runtime coercion.
                `,
            },
        },
    },
};

export default meta;
type Story = StoryObj;

export const TypedParamsDemo: Story = {
    name: 'defineRoute<TParams> — buildPath / navigate',
    render: () => buildDemo(),
};
