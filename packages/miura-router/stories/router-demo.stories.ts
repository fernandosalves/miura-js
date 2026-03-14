import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraRouter } from '../src/router.js';
import type { RouteRenderContext, RouteRecord } from '../src/types.js';

// ── Shared styles ─────────────────────────────────────────────────────────────

const BASE_STYLES = `
    * { box-sizing: border-box; }
    body, :host { font-family: system-ui, sans-serif; }
    .shell {
        border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;
        max-width: 780px; min-height: 480px; display: flex; flex-direction: column;
    }
    header {
        background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
        color: white; padding: 1rem 1.5rem;
        display: flex; align-items: center; justify-content: space-between;
    }
    header h1 { margin: 0; font-size: 1.2rem; }
    header .badge {
        background: #38bdf8; color: #0f172a;
        font-size: .7rem; font-weight: 700; padding: .2rem .5rem;
        border-radius: 4px; text-transform: uppercase; letter-spacing: .05em;
    }
    nav {
        display: flex; gap: 0; background: #1e293b;
    }
    nav button {
        background: none; border: none; color: #94a3b8;
        padding: .7rem 1.1rem; cursor: pointer; font-size: .875rem;
        border-bottom: 2px solid transparent; transition: all .15s;
    }
    nav button:hover  { color: #e2e8f0; background: rgba(255,255,255,.05); }
    nav button.active { color: #38bdf8; border-bottom-color: #38bdf8; }
    .outlet {
        flex: 1; padding: 1.5rem; background: white;
    }
    .page-title {
        font-size: 1.3rem; font-weight: 700; color: #1e293b; margin: 0 0 1rem;
    }
    .card-grid {
        display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: .75rem;
    }
    .card {
        border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem;
        cursor: pointer; transition: box-shadow .15s;
    }
    .card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.08); }
    .card .name { font-weight: 600; color: #1e293b; margin: 0 0 .25rem; }
    .card .sub  { font-size: .8rem; color: #64748b; margin: 0; }
    .detail-box {
        background: #f8fafc; border: 1px solid #e2e8f0;
        border-radius: 8px; padding: 1.25rem;
    }
    .back-btn {
        background: #e2e8f0; border: none; border-radius: 6px;
        padding: .4rem .9rem; cursor: pointer; font-size: .875rem;
        margin-bottom: 1rem; color: #475569;
    }
    .back-btn:hover { background: #cbd5e1; }
    .tag {
        display: inline-block; padding: .15rem .5rem; border-radius: 4px;
        font-size: .75rem; background: #dbeafe; color: #1d4ed8; font-family: monospace;
    }
    .log {
        font-family: monospace; font-size: .8rem; background: #0f172a;
        color: #94a3b8; border-radius: 8px; padding: 1rem;
        max-height: 160px; overflow-y: auto; margin-top: 1rem;
    }
    .log .entry { padding: .2rem 0; border-bottom: 1px solid #1e293b; }
    .log .entry .ts  { color: #475569; }
    .log .entry .ok  { color: #4ade80; }
    .log .entry .err { color: #f87171; }
    .protected-badge {
        display: inline-flex; align-items: center; gap: .3rem;
        background: #fef3c7; color: #92400e; border: 1px solid #fde68a;
        border-radius: 6px; padding: .35rem .75rem; font-size: .8rem; font-weight: 600;
    }
`;

// ── Route page builder helpers ────────────────────────────────────────────────

function makePage(html: string): HTMLElement {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div;
}

// ── Story 1: Full SPA demo ─────────────────────────────────────────────────────

function buildSpaDemo(authed: boolean = false): HTMLElement {
    const container = document.createElement('div');
    container.style.padding = '1.5rem';

    const style = document.createElement('style');
    style.textContent = BASE_STYLES;
    container.appendChild(style);

    const shell = document.createElement('div');
    shell.className = 'shell';
    container.appendChild(shell);

    // Header
    shell.innerHTML = `
        <header>
            <h1>miura-router Demo</h1>
            <span class="badge">memory mode</span>
        </header>
        <nav id="app-nav">
            <button data-path="/" class="active">Home</button>
            <button data-path="/products">Products</button>
            <button data-path="/users">Users</button>
            <button data-path="/admin">Admin</button>
        </nav>
        <div id="app-outlet" class="outlet">Loading…</div>
        <div class="log" id="nav-log"></div>
    `;

    const outlet   = shell.querySelector('#app-outlet') as HTMLElement;
    const nav      = shell.querySelector('#app-nav')    as HTMLElement;
    const log      = shell.querySelector('#nav-log')    as HTMLElement;

    function addLog(text: string, ok = true) {
        const ts   = new Date().toLocaleTimeString();
        const div  = document.createElement('div');
        div.className = 'entry';
        div.innerHTML = `<span class="ts">[${ts}]</span> <span class="${ok ? 'ok' : 'err'}">${text}</span>`;
        log.prepend(div);
    }

    function setActive(path: string) {
        nav.querySelectorAll('button').forEach(btn => {
            btn.classList.toggle('active', (btn as HTMLButtonElement).dataset.path === path);
        });
    }

    const routes: RouteRecord[] = [
        {
            path: '/',
            component: 'home-page',
        },
        {
            path: '/products',
            component: 'products-page',
        },
        {
            path: '/products/:id',
            component: 'product-detail',
        },
        {
            path: '/users',
            component: 'users-page',
        },
        {
            path: '/users/:id',
            component: 'user-detail',
        },
        {
            path: '/admin',
            component: 'admin-page',
            guards: [
                (ctx) => {
                    if (!authed) {
                        addLog(`Guard blocked /admin → redirecting to /`, false);
                        return '/';
                    }
                    return true;
                },
            ],
        },
    ];

    const router = new MiuraRouter({
        mode: 'memory',
        routes,
        render: async (ctx: RouteRenderContext) => {
            const { pathname, params, matched } = ctx;

            if (pathname === '/') {
                outlet.replaceChildren(makePage(`
                    <h2 class="page-title">Welcome</h2>
                    <p style="color:#475569">This is a live <strong>miura-router</strong> demo running in <span class="tag">memory</span> mode — the browser URL is unaffected.</p>
                    <div class="card-grid">
                        <div class="card"><p class="name">📦 Products</p><p class="sub">Navigate with params</p></div>
                        <div class="card"><p class="name">👥 Users</p><p class="sub">Nested params /:id</p></div>
                        <div class="card"><p class="name">🔒 Admin</p><p class="sub">Guard demo</p></div>
                    </div>
                `));
            } else if (pathname === '/products') {
                outlet.replaceChildren(makePage(`
                    <h2 class="page-title">Products</h2>
                    <div class="card-grid" id="products"></div>
                `));
                const grid = outlet.querySelector('#products')!;
                [
                    { id: '1', name: 'Widget A', price: '$9.99' },
                    { id: '2', name: 'Widget B', price: '$14.99' },
                    { id: '3', name: 'Widget C', price: '$24.99' },
                    { id: '4', name: 'Widget D', price: '$4.99' },
                ].forEach(p => {
                    const card = document.createElement('div');
                    card.className = 'card';
                    card.innerHTML = `<p class="name">${p.name}</p><p class="sub">${p.price}</p>`;
                    card.addEventListener('click', () => router.navigate(`/products/${p.id}`));
                    grid.appendChild(card);
                });
            } else if (params.id && matched[0]?.path.startsWith('/products')) {
                outlet.replaceChildren(makePage(`
                    <button class="back-btn" id="back">← Back to Products</button>
                    <div class="detail-box">
                        <h2 class="page-title">Product Detail</h2>
                        <p>ID param: <span class="tag">:id = ${params.id}</span></p>
                        <p style="color:#475569">Full path: <span class="tag">${ctx.fullPath}</span></p>
                    </div>
                `));
                outlet.querySelector('#back')!.addEventListener('click', () => router.navigate('/products'));
            } else if (pathname === '/users') {
                outlet.replaceChildren(makePage(`
                    <h2 class="page-title">Users</h2>
                    <div class="card-grid" id="users"></div>
                `));
                const grid = outlet.querySelector('#users')!;
                [
                    { id: '42', name: 'Alice', role: 'Admin' },
                    { id: '7',  name: 'Bob',   role: 'Editor' },
                    { id: '99', name: 'Carol',  role: 'Viewer' },
                ].forEach(u => {
                    const card = document.createElement('div');
                    card.className = 'card';
                    card.innerHTML = `<p class="name">${u.name}</p><p class="sub">${u.role}</p>`;
                    card.addEventListener('click', () => router.navigate(`/users/${u.id}`));
                    grid.appendChild(card);
                });
            } else if (params.id && matched[0]?.path.startsWith('/users')) {
                outlet.replaceChildren(makePage(`
                    <button class="back-btn" id="back">← Back to Users</button>
                    <div class="detail-box">
                        <h2 class="page-title">User Detail</h2>
                        <p>ID param: <span class="tag">:id = ${params.id}</span></p>
                        <p style="color:#475569">Full path: <span class="tag">${ctx.fullPath}</span></p>
                    </div>
                `));
                outlet.querySelector('#back')!.addEventListener('click', () => router.navigate('/users'));
            } else if (pathname === '/admin') {
                outlet.replaceChildren(makePage(`
                    <h2 class="page-title">🔒 Admin Panel</h2>
                    <div class="detail-box">
                        <p style="color:#15803d;font-weight:600">Guard passed — you are authenticated!</p>
                        <p style="color:#475569">This route is protected by a guard. Try the <strong>Unauthenticated</strong> story to see the redirect in action.</p>
                    </div>
                `));
            }

            setActive(pathname === '/' || !pathname.includes('/') ? pathname : '/' + pathname.split('/')[1]);
            addLog(`Navigated to ${ctx.fullPath}`);
        },
    });

    // Wire up nav buttons
    nav.addEventListener('click', (e) => {
        const btn = (e.target as HTMLElement).closest('button[data-path]') as HTMLButtonElement | null;
        if (btn?.dataset.path) router.navigate(btn.dataset.path);
    });

    router.start().then(() => addLog('Router started'));

    return container;
}

// ── Story 2: Nested routes with layout ────────────────────────────────────────

function buildNestedDemo(): HTMLElement {
    const container = document.createElement('div');
    container.style.padding = '1.5rem';

    const style = document.createElement('style');
    style.textContent = BASE_STYLES + `
        .layout { display: flex; min-height: 400px; }
        .sidebar {
            width: 180px; background: #f1f5f9; border-right: 1px solid #e2e8f0;
            padding: .75rem; flex-shrink: 0;
        }
        .sidebar h3 { font-size: .75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin: 0 0 .5rem; letter-spacing: .06em; }
        .sidebar button {
            display: block; width: 100%; text-align: left; background: none; border: none;
            padding: .45rem .6rem; border-radius: 6px; cursor: pointer; font-size: .85rem; color: #475569;
        }
        .sidebar button:hover { background: #e2e8f0; }
        .sidebar button.active { background: #dbeafe; color: #1d4ed8; font-weight: 600; }
        .content { flex: 1; padding: 1.25rem; }
    `;
    container.appendChild(style);

    const shell = document.createElement('div');
    shell.className = 'shell';
    shell.innerHTML = `
        <header>
            <h1>Nested Routes — Settings Layout</h1>
            <span class="badge">layout + outlet</span>
        </header>
        <div class="layout">
            <aside class="sidebar">
                <h3>Settings</h3>
                <button data-path="/settings/profile">Profile</button>
                <button data-path="/settings/security">Security</button>
                <button data-path="/settings/notifications">Notifications</button>
                <button data-path="/settings/billing">Billing</button>
            </aside>
            <div class="content" id="nested-outlet">Select a section</div>
        </div>
    `;
    container.appendChild(shell);

    const outlet  = shell.querySelector('#nested-outlet') as HTMLElement;
    const sidebar = shell.querySelector('.sidebar') as HTMLElement;

    function setActive(path: string) {
        sidebar.querySelectorAll('button').forEach(btn => {
            btn.classList.toggle('active', (btn as HTMLButtonElement).dataset.path === path);
        });
    }

    const pages: Record<string, string> = {
        '/settings/profile': `
            <h2 class="page-title">Profile</h2>
            <div class="detail-box">
                <p><strong>Name:</strong> Alice Smith</p>
                <p><strong>Email:</strong> alice@example.com</p>
                <p style="margin:0;font-size:.8rem;color:#64748b">Route matched: <span class="tag">/settings/:section</span></p>
            </div>
        `,
        '/settings/security': `
            <h2 class="page-title">Security</h2>
            <div class="detail-box">
                <p><strong>2FA:</strong> Enabled</p>
                <p><strong>Sessions:</strong> 3 active</p>
                <p style="margin:0;font-size:.8rem;color:#64748b">Route matched: <span class="tag">/settings/:section</span></p>
            </div>
        `,
        '/settings/notifications': `
            <h2 class="page-title">Notifications</h2>
            <div class="detail-box">
                <p><strong>Email:</strong> Daily digest</p>
                <p><strong>Push:</strong> All events</p>
                <p style="margin:0;font-size:.8rem;color:#64748b">Route matched: <span class="tag">/settings/:section</span></p>
            </div>
        `,
        '/settings/billing': `
            <h2 class="page-title">Billing</h2>
            <div class="detail-box">
                <p><strong>Plan:</strong> Pro — $29/mo</p>
                <p><strong>Next bill:</strong> Apr 1, 2026</p>
                <p style="margin:0;font-size:.8rem;color:#64748b">Route matched: <span class="tag">/settings/:section</span></p>
            </div>
        `,
    };

    const router = new MiuraRouter({
        mode: 'memory',
        routes: [
            {
                path: '/settings',
                component: 'settings-layout',
                redirect: '/settings/profile',
            },
            {
                path: '/settings/:section',
                component: 'settings-section',
            },
        ],
        render: async (ctx: RouteRenderContext) => {
            const html = pages[ctx.pathname] ?? pages['/settings/profile'];
            outlet.innerHTML = html;
            setActive(ctx.pathname);
        },
    });

    sidebar.addEventListener('click', (e) => {
        const btn = (e.target as HTMLElement).closest('button[data-path]') as HTMLButtonElement | null;
        if (btn?.dataset.path) router.navigate(btn.dataset.path);
    });

    router.start();
    return container;
}

// ── Storybook meta ─────────────────────────────────────────────────────────────

const meta: Meta = {
    title: 'miura-router/Demo',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: `
# miura-router

Client-side router for the miura framework.

## Features
- Three modes: \`hash\`, \`history\`, \`memory\`
- Path params (\`/users/:id\`) and query strings
- Nested / layout routes with \`<miura-router-outlet>\`
- Route guards (sync or async — redirect or block)
- Route loaders (async data pre-fetch per route)
- Redirects (static string or dynamic function)
- \`navigate(path)\`, \`replace(path)\`, \`back()\`, \`forward()\`
- Event hooks: \`router:navigating\`, \`router:navigated\`, \`router:blocked\`, \`router:not-found\`
                `,
            },
        },
    },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
    render: () => buildSpaDemo(false),
    parameters: {
        docs: {
            description: {
                story: `
Full SPA demo in **memory mode**. Navigate between pages, drill into product and user details via \`:id\` params, and observe the guard blocking the **Admin** route.
                `,
            },
        },
    },
};

export const AuthenticatedAdmin: Story = {
    render: () => buildSpaDemo(true),
    parameters: {
        docs: {
            description: {
                story: 'Same as Default but \`authed = true\` — the Admin route guard now passes and the admin panel is accessible.',
            },
        },
    },
};

export const NestedLayoutRoutes: Story = {
    render: () => buildNestedDemo(),
    parameters: {
        docs: {
            description: {
                story: `
Demonstrates a **settings layout** with a persistent sidebar and a child outlet that updates on navigation. Uses \`/settings/:section\` param matching and the redirect from \`/settings → /settings/profile\`.
            `,
            },
        },
    },
};
