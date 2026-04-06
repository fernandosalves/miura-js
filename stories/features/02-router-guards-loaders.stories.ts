import { MiuraElement, html, css } from '@miurajs/miura-element';
import { component } from '@miurajs/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';
import { createRouter } from '@miurajs/miura-router';
import type { RouteRecord, RouteRenderContext, RouterInstance } from '@miurajs/miura-router';

interface DemoLog {
    level: 'info' | 'warn' | 'error';
    message: string;
}

@component({ tag: 'router-guards-demo' })
class RouterGuardsDemo extends MiuraElement {
    static properties = {
        current: { type: Object },
        logs: { type: Array },
    };

    static styles = css`
        :host {
            display: block;
            font-family: 'Space Grotesk', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: radial-gradient(circle at top, #fdf2f8, #f8fafc 60%);
            color: #0f172a;
            border-radius: 16px;
            padding: 28px;
            box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
        }
        h2 {
            margin: 0 0 8px;
            font-size: 20px;
            letter-spacing: -0.02em;
        }
        p {
            margin: 0 0 20px;
            color: #475569;
        }
        .actions {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 24px;
        }
        button {
            all: unset;
            padding: 10px 18px;
            border-radius: 999px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            color: white;
            background: linear-gradient(120deg, #0ea5e9, #6366f1);
            box-shadow: 0 10px 30px rgba(99, 102, 241, 0.25);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 35px rgba(99, 102, 241, 0.35);
        }
        button.secondary {
            background: linear-gradient(120deg, #14b8a6, #84cc16);
            box-shadow: 0 10px 30px rgba(20, 184, 166, 0.25);
        }
        button.destructive {
            background: linear-gradient(120deg, #f97316, #ef4444);
            box-shadow: 0 10px 30px rgba(239, 68, 68, 0.2);
        }
        .panel {
            border-radius: 18px;
            padding: 18px;
            background: white;
            box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.05);
            margin-bottom: 18px;
        }
        .panel pre {
            background: #0f172a;
            color: #e2e8f0;
            padding: 16px;
            border-radius: 12px;
            max-height: 240px;
            overflow: auto;
        }
        ul {
            list-style: none;
            padding: 0;
            margin: 0;
            display: grid;
            gap: 10px;
        }
        li {
            padding: 12px 14px;
            border-radius: 12px;
            background: #f1f5f9;
            font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular;
            font-size: 13px;
        }
        li.warn {
            background: #fef3c7;
            color: #92400e;
        }
        li.error {
            background: #fee2e2;
            color: #991b1b;
        }
        .meta {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            color: #475569;
            font-size: 14px;
        }
        strong {
            color: #0f172a;
        }
    `;

    declare current?: RouteRenderContext;
    declare logs: DemoLog[];
    private router?: RouterInstance;
    private activeRouteElement?: HTMLElement;
    private readonly demoUser = { name: 'Leona Reyes', isAdmin: false };

    constructor() {
        super();
        this.logs = [{ level: 'info', message: 'Router idle — pick a route to see guards & loaders.' }];
    }

    connectedCallback() {
        super.connectedCallback();
        this.setupRouter();
    }

    disconnectedCallback() {
        this.router?.destroy();
        super.disconnectedCallback();
    }

    private async setupRouter() {
        if (this.router) return;
        const eventBus = {
            emit: (type: string, data?: any) => this.recordEvent(type, data),
        };

        this.router = createRouter({
            routes: this.createRoutes(),
            mode: 'memory',
            eventBus,
            render: (context) => this.handleRender(context),
        });
        await this.router.start();
    }

    private createRoutes(): RouteRecord[] {
        return [
            { path: '/', component: 'router-demo-home', meta: { label: 'Home' } },
            { path: '/login', component: 'router-demo-login', meta: { label: 'Login' } },
            {
                path: '/admin',
                component: 'router-demo-admin',
                meta: { label: 'Admin' },
                guards: [() => (this.demoUser.isAdmin ? true : '/login')],
                loaders: [() => ({ user: this.demoUser, metrics: { lastSync: new Date().toISOString() } })],
            },
            {
                path: '/reports',
                component: 'router-demo-reports',
                meta: { label: 'Reports' },
                guards: [() => false],
            },
            {
                path: '/profile/:id',
                component: 'router-demo-profile',
                meta: { label: 'Profile' },
                loaders: [
                    ({ params }: RouteRenderContext) => ({ profile: { id: params.id, name: `Agent ${params.id}` } }),
                    async () => ({ permissions: ['view', 'export'] }),
                ],
            },
        ];
    }

    private handleRender(context: RouteRenderContext) {
        this.current = context;
        this.record('info', `Rendered ${context.route.path} with data keys: ${Object.keys(context.data || {}).join(', ') || 'none'}`);
        this.mountRouteComponent(context);
        this.requestUpdate();
    }

    private mountRouteComponent(context: RouteRenderContext) {
        const zone = this.shadowRoot?.querySelector('[data-router-zone]');
        if (!zone) return;

        if (this.activeRouteElement) {
            this.activeRouteElement.remove();
            this.activeRouteElement = undefined;
        }

        const element = document.createElement(context.route.component) as HTMLElement & { routeContext?: RouteRenderContext };
        (element as any).routeContext = context;
        zone.appendChild(element);
        this.activeRouteElement = element;
    }

    private record(level: DemoLog['level'], message: string) {
        this.logs = [...this.logs, { level, message }];
    }

    private recordEvent(type: string, data?: any) {
        const level: DemoLog['level'] = type.includes('error')
            ? 'error'
            : type.includes('blocked')
                ? 'warn'
                : 'info';
        const detail = data?.to?.route?.path || data?.route?.path || data?.location?.pathname || '';
        this.record(level, `${type}${detail ? ` → ${detail}` : ''}`);
    }

    private handleNavigate(path: string) {
        return async () => {
            if (!this.router) return;
            this.record('info', `navigate(${path})`);
            await this.router.navigate(path);
        };
    }

    template() {
        return html`
            <h2>Router Guards + Loaders</h2>
            <p>Trigger guarded routes, redirects, and loader data to see how the router responds.</p>

            <div class="actions">
                <button @click=${this.handleNavigate('/admin')}>Attempt Admin (redirect)</button>
                <button class="destructive" @click=${this.handleNavigate('/reports')}>
                    Blocked Reports
                </button>
                <button class="secondary" @click=${this.handleNavigate('/profile/42')}>
                    Load Profile #42
                </button>
                <button @click=${this.handleNavigate('/')}>Go Home</button>
            </div>

            <div class="panel">
                <div class="meta">
                    <div><strong>Active route:</strong> ${this.current?.route.path ?? '—'}</div>
                    <div><strong>Params:</strong> ${JSON.stringify(this.current?.params ?? {})}</div>
                    <div><strong>Query:</strong> ${this.current ? this.current.query.toString() || 'none' : '—'}</div>
                </div>
                <pre>${this.current ? JSON.stringify(this.current.data, null, 2) : '// Loader data appears here'}</pre>
            </div>

            <div class="panel route-shell">
                <div class="route-heading">Rendered Component</div>
                <div class="route-zone" data-router-zone="primary"></div>
            </div>

            <div class="panel">
                <strong>Router Event Log</strong>
                <ul>
                    ${this.logs.map(log => html`<li class=${log.level}>${log.message}</li>`)}
                </ul>
            </div>
        `;
    }
}

export default {
    title: 'Miura/Features/02. Router Guards & Loaders',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: `Demonstrates MiuraRouter guards, redirects, and loader data munging. The component uses memory mode so navigation stays encapsulated inside the story.`,
            },
        },
    },
} as Meta;

export const GuardsAndLoaders: StoryObj = {
    name: 'Guards, Redirects & Loader Data',
    render: () => '<router-guards-demo></router-guards-demo>',
};

@component({ tag: 'router-demo-home' })
class RouterDemoHome extends MiuraElement {
    template() {
        return html`
            <div class="route-card">
                <h3>Welcome Home</h3>
                <p>Use the controls above to navigate into guarded routes.</p>
            </div>
        `;
    }
}

@component({ tag: 'router-demo-login' })
class RouterDemoLogin extends MiuraElement {
    template() {
        return html`
            <div class="route-card">
                <h3>Access Needed</h3>
                <p>The admin area redirected you here because the guard denied access.</p>
            </div>
        `;
    }
}

@component({ tag: 'router-demo-admin' })
class RouterDemoAdmin extends MiuraElement {
    declare routeContext?: RouteRenderContext;

    template() {
        const user = this.routeContext?.data.user;
        return html`
            <div class="route-card">
                <h3>Admin Insights</h3>
                <p>Welcome back, ${user?.name ?? 'Unknown'}.</p>
                <small>Last sync: ${this.routeContext?.data.metrics?.lastSync ?? '–'}</small>
            </div>
        `;
    }
}

@component({ tag: 'router-demo-reports' })
class RouterDemoReports extends MiuraElement {
    template() {
        return html`
            <div class="route-card">
                <h3>Reports</h3>
                <p>This route is intentionally blocked by a guard.</p>
            </div>
        `;
    }
}

@component({ tag: 'router-demo-profile' })
class RouterDemoProfile extends MiuraElement {
    declare routeContext?: RouteRenderContext;

    template() {
        const profile = this.routeContext?.data.profile;
        const permissions = this.routeContext?.data.permissions ?? [];
        return html`
            <div class="route-card">
                <h3>Profile for ${profile?.name ?? 'Unknown Agent'}</h3>
                <p>ID: ${profile?.id ?? '—'}</p>
                <p>Permissions: ${permissions.join(', ') || 'none'}</p>
            </div>
        `;
    }
}
