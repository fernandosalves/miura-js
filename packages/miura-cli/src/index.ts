#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { emitKeypressEvents } from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';

type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun';

interface CliOptions {
    force: boolean;
    yes: boolean;
    packageManager?: PackageManager;
    router?: boolean;
    ui?: boolean;
    tests?: boolean;
    store?: boolean;
    framework?: boolean;
    architect?: boolean;
    targetDir?: string;
}

interface AppOptions {
    packageManager: PackageManager;
    router: boolean;
    ui: boolean;
    tests: boolean;
    store: boolean;
    framework: boolean;
    architect: boolean;
}

interface ParsedCommand {
    command?: string;
    kind?: string;
    name?: string;
    options: CliOptions;
}

interface Choice<T extends string> {
    value: T;
    label: string;
    hint?: string;
}

const color = {
    cyan: (value: string) => `\x1b[36m${value}\x1b[0m`,
    green: (value: string) => `\x1b[32m${value}\x1b[0m`,
    magenta: (value: string) => `\x1b[35m${value}\x1b[0m`,
    muted: (value: string) => `\x1b[2m${value}\x1b[0m`,
    bold: (value: string) => `\x1b[1m${value}\x1b[0m`,
};

const HELP = `Miura CLI

Usage:
  miura create app <name> [--pm pnpm] [--router] [--ui] [--store] [--framework] [--architect] [--tests] [--yes] [--force]
  miura create component <name> [--dir <path>] [--force]
  miura init <name> [--pm pnpm] [--router] [--ui] [--store] [--framework] [--architect] [--tests] [--yes] [--force]

Examples:
  miura create app my-app
  miura create app my-app --pm npm --router --tests
  miura create app my-app --framework --router --store --architect
  miura create component UserCard
  miura create component UserCard --dir src/components
`;

async function main(argv = process.argv.slice(2)) {
    const parsed = parseArgs(argv);

    if (!parsed.command) {
        await launchInteractive(parsed.options);
        return;
    }

    if (parsed.command === 'help' || parsed.command === '--help' || parsed.command === '-h') {
        console.log(HELP);
        return;
    }

    if (parsed.command === 'init') {
        await createApp(parsed.name, parsed.options);
        return;
    }

    if (parsed.command !== 'create') {
        fail(`Unknown command "${parsed.command}".\n\n${HELP}`);
    }

    if (parsed.kind === 'app') {
        await createApp(parsed.name, parsed.options);
        return;
    }

    if (parsed.kind === 'component') {
        createComponent(parsed.name, parsed.options);
        return;
    }

    fail(`Unknown create target "${parsed.kind ?? ''}".\n\n${HELP}`);
}

async function launchInteractive(options: CliOptions) {
    if (!input.isTTY || !output.isTTY) {
        console.log(HELP);
        return;
    }

    console.log(color.bold(color.magenta('Miura CLI')));
    console.log(color.muted('Use arrow keys to move, enter to continue.'));
    console.log('');

    const action = await singleSelect(
        'What do you want to create?',
        [
            { value: 'app', label: 'App', hint: 'scaffold a Miura application' },
            { value: 'component', label: 'Component', hint: 'generate a MiuraElement component' },
            { value: 'help', label: 'Help', hint: 'show CLI commands' },
        ],
        'app'
    );

    if (action === 'help') {
        console.log(HELP);
        return;
    }

    const rl = createInterface({ input, output });
    try {
        if (action === 'component') {
            const name = await askRequired(rl, 'Component name');
            createComponent(name, options);
            return;
        }

        const name = await askRequired(rl, 'App name');
        await createApp(name, options);
    } finally {
        rl.close();
    }
}

function parseArgs(argv: string[]): ParsedCommand {
    const positional: string[] = [];
    const options: CliOptions = {
        force: false,
        yes: false
    };

    for (let index = 0; index < argv.length; index++) {
        const arg = argv[index];

        if (arg === '--force' || arg === '-f') {
            options.force = true;
            continue;
        }

        if (arg === '--yes' || arg === '-y') {
            options.yes = true;
            continue;
        }

        if (arg === '--router') {
            options.router = true;
            continue;
        }

        if (arg === '--no-router') {
            options.router = false;
            continue;
        }

        if (arg === '--ui') {
            options.ui = true;
            continue;
        }

        if (arg === '--no-ui') {
            options.ui = false;
            continue;
        }

        if (arg === '--tests' || arg === '--vitest') {
            options.tests = true;
            continue;
        }

        if (arg === '--no-tests' || arg === '--no-vitest') {
            options.tests = false;
            continue;
        }

        if (arg === '--store' || arg === '--data-flow') {
            options.store = true;
            continue;
        }

        if (arg === '--no-store' || arg === '--no-data-flow') {
            options.store = false;
            continue;
        }

        if (arg === '--framework') {
            options.framework = true;
            continue;
        }

        if (arg === '--no-framework') {
            options.framework = false;
            continue;
        }

        if (arg === '--architect') {
            options.architect = true;
            continue;
        }

        if (arg === '--no-architect') {
            options.architect = false;
            continue;
        }

        if (arg === '--pm' || arg === '--package-manager') {
            const value = argv[++index];
            if (!value) {
                fail(`Missing value for ${arg}.`);
            }
            options.packageManager = parsePackageManager(value);
            continue;
        }

        if (arg === '--dir' || arg === '--out-dir') {
            const value = argv[++index];
            if (!value) {
                fail(`Missing value for ${arg}.`);
            }
            options.targetDir = value;
            continue;
        }

        positional.push(arg);
    }

    return {
        command: positional[0],
        kind: positional[1],
        name: positional[2] ?? (positional[0] === 'init' ? positional[1] : undefined),
        options
    };
}

async function createApp(name: string | undefined, options: CliOptions) {
    if (!name) {
        fail('App name is required.');
    }

    const projectName = toPackageName(name);
    const root = resolve(process.cwd(), name);
    const appOptions = await resolveAppOptions(options);

    ensureWritableDirectory(root, options.force);

    const files = appFiles(projectName, appOptions);
    writeFiles(root, files, options.force);

    console.log(`Created Miura app in ${root}`);
    console.log('');
    console.log('Selected options:');
    console.log(`  package manager: ${appOptions.packageManager}`);
    console.log(`  router: ${appOptions.router ? 'yes' : 'no'}`);
    console.log(`  ui: ${appOptions.ui ? 'yes' : 'no'}`);
    console.log(`  store: ${appOptions.store ? 'yes' : 'no'}`);
    console.log(`  framework: ${appOptions.framework ? 'yes' : 'no'}`);
    console.log(`  architect: ${appOptions.architect ? 'yes' : 'no'}`);
    console.log(`  tests: ${appOptions.tests ? 'yes' : 'no'}`);
    console.log('');
    console.log('Next steps:');
    console.log(`  cd ${name}`);
    console.log(`  ${installCommand(appOptions.packageManager)}`);
    console.log(`  ${runCommand(appOptions.packageManager, 'dev')}`);
}

function createComponent(name: string | undefined, options: CliOptions) {
    if (!name) {
        fail('Component name is required.');
    }

    const component = toComponentMeta(name);
    const targetDir = resolve(process.cwd(), options.targetDir ?? 'src/components');
    mkdirSync(targetDir, { recursive: true });

    const filePath = join(targetDir, `${component.fileName}.ts`);
    writeFile(filePath, componentFile(component), options.force);

    console.log(`Created component ${component.className} in ${filePath}`);
}

function ensureWritableDirectory(path: string, force: boolean) {
    if (!existsSync(path)) {
        mkdirSync(path, { recursive: true });
        return;
    }

    const entries = readdirSync(path);
    if (entries.length > 0 && !force) {
        fail(`Directory ${path} is not empty. Use --force to write into it.`);
    }
}

function writeFiles(root: string, files: Record<string, string>, force: boolean) {
    for (const [relativePath, contents] of Object.entries(files)) {
        const filePath = join(root, relativePath);
        mkdirSync(dirname(filePath), { recursive: true });
        writeFile(filePath, contents, force);
    }
}

function writeFile(path: string, contents: string, force: boolean) {
    if (existsSync(path) && !force) {
        fail(`File ${path} already exists. Use --force to overwrite it.`);
    }

    writeFileSync(path, contents);
}

function appFiles(projectName: string, options: AppOptions): Record<string, string> {
    if (options.framework) {
        return frameworkAppFiles(projectName, options);
    }

    const files: Record<string, string> = {
        'package.json': packageJson(projectName, options),
        'index.html': indexHtml(options),
        'src/main.ts': mainFile(projectName, options),
        'src/components/app-root.ts': componentFile({
            className: 'AppRoot',
            fileName: 'app-root',
            tagName: 'app-root',
            title: titleCase(projectName)
        }),
        'src/styles.css': stylesFile(),
        'tsconfig.json': json({
            compilerOptions: {
                target: 'ES2022',
                useDefineForClassFields: false,
                module: 'ESNext',
                moduleResolution: 'Bundler',
                strict: true,
                experimentalDecorators: true,
                emitDecoratorMetadata: true,
                skipLibCheck: true,
                isolatedModules: true,
                noEmit: true
            },
            include: [
                'src'
            ]
        }),
        'vite.config.ts': viteConfig(options),
        'README.md': readme(projectName, options)
    };

    if (options.router) {
        files['src/router.ts'] = routerFile();
        files['src/components/app-home.ts'] = componentFile({
            className: 'AppHomeElement',
            fileName: 'app-home',
            tagName: 'app-home',
            title: 'Home'
        });
        files['src/components/app-about.ts'] = componentFile({
            className: 'AppAboutElement',
            fileName: 'app-about',
            tagName: 'app-about',
            title: 'About'
        });
    }

    if (options.store) {
        files['src/state/app.store.ts'] = appStoreFile(options);
    }

    if (options.tests) {
        files['src/components/app-root.test.ts'] = appRootTestFile();
        files['vitest.config.ts'] = vitestConfig();
    }

    return files;
}

function frameworkAppFiles(projectName: string, options: AppOptions): Record<string, string> {
    const files: Record<string, string> = {
        'package.json': packageJson(projectName, options),
        'index.html': frameworkIndexHtml(projectName),
        'src/main.ts': frameworkMainFile(projectName),
        'src/app/app-shell.ts': frameworkShellFile(projectName, options),
        'src/core/framework-context.ts': frameworkContextFile(projectName),
        'src/components/app-home.ts': pageComponentFile('AppHomeElement', 'app-home', 'Home', 'This page is rendered through MiuraFramework.'),
        'src/components/app-about.ts': pageComponentFile('AppAboutElement', 'app-about', 'About', 'Add your product, team, or project story here.'),
        'src/styles.css': stylesFile(),
        'tsconfig.json': json({
            compilerOptions: {
                target: 'ES2022',
                useDefineForClassFields: false,
                module: 'ESNext',
                moduleResolution: 'Bundler',
                strict: true,
                experimentalDecorators: true,
                emitDecoratorMetadata: true,
                skipLibCheck: true,
                isolatedModules: true,
                noEmit: true
            },
            include: [
                'src'
            ]
        }),
        'vite.config.ts': viteConfig(options),
        'README.md': readme(projectName, options)
    };

    if (options.store) {
        files['src/state/app.store.ts'] = appStoreFile(options);
    }

    if (options.architect) {
        files['.miura/architect.config.json'] = json({
            name: projectName,
            manifest: '.miura/architect-manifest.json',
            entry: 'src/app/app-shell.ts'
        });
    }

    if (options.tests) {
        files['src/app/app-shell.test.ts'] = frameworkTestFile();
        files['vitest.config.ts'] = vitestConfig();
    }

    return files;
}

function packageJson(projectName: string, options: AppOptions) {
    const scripts: Record<string, string> = {
        dev: 'vite',
        build: 'tsc && vite build',
        preview: 'vite preview'
    };

    const dependencies: Record<string, string> = {
        '@miurajs/miura': '^2.5.8'
    };

    const devDependencies: Record<string, string> = {
        typescript: '^5.4.5',
        vite: '^5.2.11'
    };

    if (options.router) {
        dependencies['@miurajs/miura-router'] = '^0.4.7';
    }

    if (options.store) {
        dependencies['@miurajs/miura-data-flow'] = '^0.4.7';
    }

    if (options.framework) {
        dependencies['@miurajs/miura-framework'] = '^0.4.7';
        dependencies['@miurajs/miura-element'] = '^0.4.7';
        dependencies['@miurajs/miura-router'] = '^0.4.7';
        dependencies['@miurajs/miura-data-flow'] = '^0.4.7';
    }

    if (options.ui) {
        dependencies['@miurajs/miura-ui'] = '^0.4.5';
    }

    if (options.architect) {
        devDependencies['@miurajs/miura-vite'] = '^0.1.2';
        devDependencies['@miurajs/miura-architect'] = '^0.1.2';
        scripts.dev = 'miura-architect dev -- vite';
        scripts['dev:app'] = 'vite';
        scripts.architect = 'miura-architect dev';
    }

    if (options.tests) {
        scripts.test = 'vitest run';
        scripts['test:watch'] = 'vitest';
        devDependencies.vitest = '^3.2.3';
        devDependencies.jsdom = '^26.1.0';
    }

    return json({
        name: projectName,
        version: '0.0.0',
        private: true,
        type: 'module',
        scripts,
        dependencies,
        devDependencies
    });
}

function indexHtml(options: AppOptions) {
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Miura App</title>
  </head>
  <body>
    ${options.router ? '<main id="app"></main>' : '<app-root></app-root>'}
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`;
}

function mainFile(projectName: string, options: AppOptions) {
    const imports = [
        "import './styles.css';",
        options.ui ? "import '@miurajs/miura-ui';" : '',
        options.router ? "import './components/app-home';" : "import './components/app-root';",
        options.router ? "import './components/app-about';" : '',
        options.router ? "import { router } from './router';" : ''
    ].filter(Boolean).join('\n');

    const boot = options.router ? 'void router.start();' : `console.info('${projectName} started with Miura.');`;

    return `${imports}

${boot}
`;
}

function routerFile() {
    return `import { createRouter } from '@miurajs/miura-router';

const outlet = document.querySelector('#app');

if (!outlet) {
    throw new Error('Missing #app outlet for Miura router.');
}

export const router = createRouter({
    mode: 'hash',
    routes: [
        { path: '/', component: 'app-home' },
        { path: '/about', component: 'app-about' }
    ],
    render(context) {
        outlet.replaceChildren(document.createElement(context.route.component));
    }
});
`;
}

function frameworkIndexHtml(projectName: string) {
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${titleCase(projectName)}</title>
  </head>
  <body>
    <app-shell></app-shell>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`;
}

function frameworkMainFile(projectName: string) {
    return `import './styles.css';
import './app/app-shell';

console.info('${projectName} started with MiuraFramework.');
`;
}

function frameworkShellFile(projectName: string, options: AppOptions) {
    const routeImports = `static components = {
        'app-home': async () => (await import('../components/app-home')).AppHomeElement,
        'app-about': async () => (await import('../components/app-about')).AppAboutElement
    };

    static router = [
        { path: '/', component: 'app-home', meta: { title: 'Home' } },
        { path: '/about', component: 'app-about', meta: { title: 'About' } }
    ];`;

    return `import { MiuraFramework } from '@miurajs/miura-framework';
import { css, html, shared } from '@miurajs/miura';
${options.store ? "import { appStore } from '../state/app.store';\nimport { APP_CONTEXT, APP_STORE_CONTEXT } from '../core/framework-context';" : "import { APP_CONTEXT } from '../core/framework-context';"}

export class AppShell extends MiuraFramework {
    static tagName = 'app-shell';

    static config = {
        appName: '${projectName}',
        version: '0.0.0',
        environment: import.meta.env.DEV ? 'development' as const : 'production' as const,
        debug: import.meta.env.DEV,
        router: {
            enabled: true,
            mode: 'hash' as const,
            base: '/',
            fallback: '/'
        },
        globalState: {
            theme: 'light',
            navigationOpen: true
        }
    };

    ${routeImports}

    static styles = css\`
        :host {
            display: block;
            min-height: 100vh;
            color: #1c2430;
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem 1.5rem;
            border-bottom: 1px solid #d9dde3;
            background: #ffffff;
        }

        nav {
            display: flex;
            gap: 0.75rem;
        }

        a {
            color: #28466f;
            text-decoration: none;
            font-weight: 600;
        }

        main {
            min-height: calc(100vh - 4rem);
        }
    \`;

    async connectedCallback() {
        this.$provide(APP_CONTEXT, this as never);
        ${options.store ? 'this.$provide(APP_STORE_CONTEXT, appStore as never);' : ''}
        shared('app:title', '${titleCase(projectName)}');
        shared('app:theme', 'light');
        ${options.store ? "await appStore.dispatch('setReady', true);" : ''}
        await super.connectedCallback();
    }

    protected override template() {
        return html\`
            <header>
                <strong>${titleCase(projectName)}</strong>
                <nav>
                    <a href="#/">Home</a>
                    <a href="#/about">About</a>
                </nav>
            </header>
            <main data-router-zone="primary"></main>
        \`;
    }
}

customElements.define(AppShell.tagName, AppShell);
`;
}

function frameworkContextFile(_projectName: string) {
    return `import { createContextKey, type RouterBridgeLike } from '@miurajs/miura';
import type { Store } from '@miurajs/miura-data-flow';

export interface AppState {
    ready: boolean;
    theme: 'light' | 'dark';
    navigationOpen: boolean;
}

export type AppStore = Store<AppState>;

export type AppHandle = HTMLElement & {
    store?: AppStore;
    router?: RouterBridgeLike & {
        navigate?: (path: string, options?: unknown) => Promise<unknown>;
    };
};

export const APP_CONTEXT = createContextKey<AppHandle>('app');
export const APP_STORE_CONTEXT = createContextKey<AppStore>('app-store');
export const APP_ROUTER_CONTEXT = createContextKey<RouterBridgeLike>('app-router');

export function getApp(): AppHandle | undefined {
    return (document.querySelector('app-shell') as AppHandle | null) ?? undefined;
}

export function getAppStore(): AppStore | undefined {
    return getApp()?.store;
}
`;
}

function appStoreFile(_options: AppOptions) {
    return `import { Store } from '@miurajs/miura-data-flow';

export interface AppState {
    ready: boolean;
    theme: 'light' | 'dark';
    navigationOpen: boolean;
}

export const appStore = new Store<AppState>({
    ready: false,
    theme: 'light',
    navigationOpen: true
}, 'app');

appStore.defineActions({
    setReady: (_state, ready: boolean) => ({ ready }),
    setTheme: (_state, theme: AppState['theme']) => ({ theme }),
    toggleNavigation: (state) => ({ navigationOpen: !state.navigationOpen })
});

export const selectAppReady = () => appStore.getState().ready;
export const selectTheme = () => appStore.getState().theme;
`;
}

function pageComponentFile(className: string, tagName: string, title: string, body: string) {
    return `import { MiuraElement, component, css, html, getShared } from '@miurajs/miura';

@component({ tag: '${tagName}' })
export class ${className} extends MiuraElement {
    static styles = css\`
        :host {
            display: block;
            padding: 3rem 1.5rem;
        }

        section {
            max-width: 48rem;
            margin: 0 auto;
        }

        h1 {
            margin: 0 0 0.75rem;
            font-size: 2.5rem;
        }

        p {
            margin: 0;
            color: #526070;
            line-height: 1.7;
        }
    \`;

    protected override template() {
        const appTitle = getShared<string>('app:title')?.peek() ?? 'Miura App';

        return html\`
            <section>
                <h1>${title}</h1>
                <p>${body}</p>
                <p>Shared title signal: \${appTitle}</p>
            </section>
        \`;
    }
}
`;
}

function frameworkTestFile() {
    return `import { describe, expect, it } from 'vitest';
import './app-shell';

describe('app-shell', () => {
    it('registers the framework shell', () => {
        expect(customElements.get('app-shell')).toBeDefined();
    });
});
`;
}

function appRootTestFile() {
    return `import { describe, expect, it } from 'vitest';
import './app-root';

describe('app-root', () => {
    it('registers the root component', () => {
        expect(customElements.get('app-root')).toBeDefined();
    });
});
`;
}

function componentFile(component: ComponentMeta) {
    return `import { MiuraElement, component, css, html } from '@miurajs/miura';

@component({ tag: '${component.tagName}' })
export class ${component.className} extends MiuraElement {
    declare title: string;

    static properties = {
        title: { type: String, default: '${component.title}' }
    };

    static styles = css\`
        :host {
            display: block;
            color: #1c2430;
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        section {
            display: grid;
            gap: 0.75rem;
            max-width: 42rem;
            margin: 4rem auto;
            padding: 0 1.5rem;
        }

        h1 {
            margin: 0;
            font-size: clamp(2rem, 6vw, 4rem);
            line-height: 1;
        }

        p {
            margin: 0;
            color: #526070;
            font-size: 1.05rem;
            line-height: 1.6;
        }
    \`;

    protected override template() {
        return html\`
            <section>
                <h1>\${this.title}</h1>
                <p>Your Miura component is ready.</p>
            </section>
        \`;
    }
}
`;
}

function stylesFile() {
    return `:root {
  color: #1c2430;
  background: #f6f4ef;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  min-width: 320px;
  min-height: 100vh;
  margin: 0;
}
`;
}

function viteConfig(options?: AppOptions) {
    const importPlugin = options?.architect
        ? "import { miuraVitePlugin } from '@miurajs/miura-vite';\n"
        : '';
    const plugins = options?.architect
        ? `\n    plugins: [\n        ...miuraVitePlugin({ architect: true })\n    ],`
        : '';
    const manualChunks = options?.architect || options?.framework ? `,
    build: {
        target: 'es2022',
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules/@miurajs/miura-framework')) return 'miura-framework';
                    if (id.includes('node_modules/@miurajs/miura-router')) return 'miura-router';
                    if (id.includes('node_modules/@miurajs/miura-data-flow')) return 'miura-data-flow';
                    if (id.includes('node_modules/@miurajs/miura-ui')) return 'miura-ui';
                    if (id.includes('node_modules/@miurajs/')) return 'miura-core';
                }
            }
        }
    }` : '';

    return `import { defineConfig } from 'vite';
${importPlugin}

export default defineConfig({${plugins}
    server: {
        open: true
    }${manualChunks}
});
`;
}

function vitestConfig() {
    return `import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom'
    }
});
`;
}

function readme(projectName: string, options: AppOptions) {
    const extraScripts = [
        options.tests ? '- `pnpm test` runs the test suite.' : '',
        options.architect ? '- `pnpm architect` starts Miura Architect.' : ''
    ].filter(Boolean).join('\n');

    return `# ${projectName}

Created with the Miura CLI.

## Scripts

- \`pnpm dev\` starts the local dev server.
- \`pnpm build\` builds the app for production.
- \`pnpm preview\` previews the production build.
${extraScripts ? `${extraScripts}\n` : ''}
`;
}

async function resolveAppOptions(options: CliOptions): Promise<AppOptions> {
    const defaults: AppOptions = {
        packageManager: options.packageManager ?? 'pnpm',
        router: options.router ?? options.framework ?? false,
        ui: options.ui ?? false,
        tests: options.tests ?? false,
        store: options.store ?? options.framework ?? false,
        framework: options.framework ?? false,
        architect: options.architect ?? false
    };

    if (options.yes || !input.isTTY || !output.isTTY) {
        return normalizeAppOptions(defaults);
    }

    console.log(color.bold(color.magenta('Create a Miura app')));
    console.log(color.muted('Use arrow keys to move, space to toggle, enter to continue.'));
    console.log('');

    const packageManager = await singleSelect<PackageManager>(
        'Select package manager',
        [
            { value: 'pnpm', label: 'pnpm', hint: 'fast workspace-friendly default' },
            { value: 'npm', label: 'npm', hint: 'Node standard package manager' },
            { value: 'yarn', label: 'yarn', hint: 'classic Yarn workflow' },
            { value: 'bun', label: 'bun', hint: 'Bun runtime and package manager' },
        ],
        defaults.packageManager
    );

    const selected = await multiSelect(
        'Select app capabilities',
        [
            { value: 'framework', label: 'MiuraFramework app shell', hint: 'single app root, lifecycle, services' },
            { value: 'router', label: 'Miura Router', hint: 'routes and page components' },
            { value: 'store', label: 'Global data store', hint: 'Store, selectors, app state' },
            { value: 'ui', label: 'Miura UI', hint: 'design-system package' },
            { value: 'architect', label: 'Miura Architect', hint: 'dev visualization config' },
            { value: 'tests', label: 'Vitest', hint: 'starter test setup' },
        ],
        new Set(
            [
                defaults.framework ? 'framework' : '',
                defaults.router ? 'router' : '',
                defaults.store ? 'store' : '',
                defaults.ui ? 'ui' : '',
                defaults.architect ? 'architect' : '',
                defaults.tests ? 'tests' : '',
            ].filter(Boolean) as Array<keyof Omit<AppOptions, 'packageManager'>>
        )
    );

    return normalizeAppOptions({
        packageManager,
        router: selected.has('router'),
        ui: selected.has('ui'),
        store: selected.has('store'),
        framework: selected.has('framework'),
        architect: selected.has('architect'),
        tests: selected.has('tests')
    });
}

function normalizeAppOptions(options: AppOptions): AppOptions {
    if (!options.framework) {
        return options;
    }

    return {
        ...options,
        router: true,
        store: true
    };
}

async function askRequired(rl: ReturnType<typeof createInterface>, label: string): Promise<string> {
    const answer = (await rl.question(`${color.cyan(label)}: `)).trim();
    if (!answer) {
        fail(`${label} is required.`);
    }

    return answer;
}

async function singleSelect<T extends string>(
    title: string,
    choices: Array<Choice<T>>,
    initialValue: T
): Promise<T> {
    if (!input.isTTY || !output.isTTY) {
        return initialValue;
    }

    emitKeypressEvents(input);
    input.resume();
    input.setRawMode(true);

    let activeIndex = Math.max(0, choices.findIndex((choice) => choice.value === initialValue));
    let renderedLines = 0;

    const render = () => {
        if (renderedLines > 0) {
            output.write(`\x1b[${renderedLines}A`);
            output.write('\x1b[0J');
        }

        const lines = [
            color.bold(title),
            color.muted('Enter confirms.'),
            ...choices.map((choice, index) => {
                const active = index === activeIndex;
                const selectedMark = active ? color.green('◉') : color.muted('○');
                const cursor = active ? color.cyan('›') : ' ';
                const hint = choice.hint ? ` ${color.muted(choice.hint)}` : '';
                const label = active ? color.bold(choice.label) : choice.label;
                return `${cursor} ${selectedMark} ${label}${hint}`;
            }),
            ''
        ];

        renderedLines = lines.length;
        output.write(lines.join('\n'));
    };

    return await new Promise<T>((resolve) => {
        const finish = () => {
            input.setRawMode(false);
            input.off('keypress', onKeypress);
            input.pause();
            output.write('\n');
            resolve(choices[activeIndex].value);
        };

        const onKeypress = (_value: string, key: { name?: string; ctrl?: boolean }) => {
            if (key.ctrl && key.name === 'c') {
                input.setRawMode(false);
                input.pause();
                output.write('\n');
                process.exit(130);
            }

            if (key.name === 'up' || key.name === 'k') {
                activeIndex = (activeIndex - 1 + choices.length) % choices.length;
                render();
                return;
            }

            if (key.name === 'down' || key.name === 'j') {
                activeIndex = (activeIndex + 1) % choices.length;
                render();
                return;
            }

            if (key.name === 'return' || key.name === 'enter') {
                finish();
            }
        };

        input.on('keypress', onKeypress);
        render();
    });
}

async function multiSelect<T extends string>(
    title: string,
    choices: Array<Choice<T>>,
    initialSelected: Set<T>
): Promise<Set<T>> {
    if (!input.isTTY || !output.isTTY) {
        return initialSelected;
    }

    emitKeypressEvents(input);
    input.resume();
    input.setRawMode(true);

    let activeIndex = 0;
    let renderedLines = 0;
    const selected = new Set(initialSelected);

    const render = () => {
        if (renderedLines > 0) {
            output.write(`\x1b[${renderedLines}A`);
            output.write('\x1b[0J');
        }

        const lines = [
            color.bold(title),
            color.muted('Space toggles, enter confirms.'),
            ...choices.map((choice, index) => {
                const active = index === activeIndex;
                const selectedMark = selected.has(choice.value) ? color.green('◉') : color.muted('○');
                const cursor = active ? color.cyan('›') : ' ';
                const hint = choice.hint ? ` ${color.muted(choice.hint)}` : '';
                const label = active ? color.bold(choice.label) : choice.label;
                return `${cursor} ${selectedMark} ${label}${hint}`;
            }),
            ''
        ];

        renderedLines = lines.length;
        output.write(lines.join('\n'));
    };

    return await new Promise<Set<T>>((resolve) => {
        const finish = () => {
            input.setRawMode(false);
            input.off('keypress', onKeypress);
            input.pause();
            output.write('\n');
            resolve(selected);
        };

        const onKeypress = (_value: string, key: { name?: string; ctrl?: boolean }) => {
            if (key.ctrl && key.name === 'c') {
                input.setRawMode(false);
                input.pause();
                output.write('\n');
                process.exit(130);
            }

            if (key.name === 'up' || key.name === 'k') {
                activeIndex = (activeIndex - 1 + choices.length) % choices.length;
                render();
                return;
            }

            if (key.name === 'down' || key.name === 'j') {
                activeIndex = (activeIndex + 1) % choices.length;
                render();
                return;
            }

            if (key.name === 'space') {
                const value = choices[activeIndex].value;
                if (selected.has(value)) {
                    selected.delete(value);
                } else {
                    selected.add(value);
                }
                render();
                return;
            }

            if (key.name === 'return' || key.name === 'enter') {
                finish();
            }
        };

        input.on('keypress', onKeypress);
        render();
    });
}

function parsePackageManager(value: string): PackageManager {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'pnpm' || normalized === 'npm' || normalized === 'yarn' || normalized === 'bun') {
        return normalized;
    }

    fail(`Unsupported package manager "${value}". Use pnpm, npm, yarn, or bun.`);
}

function installCommand(packageManager: PackageManager) {
    if (packageManager === 'npm') {
        return 'npm install';
    }

    if (packageManager === 'yarn') {
        return 'yarn install';
    }

    if (packageManager === 'bun') {
        return 'bun install';
    }

    return 'pnpm install';
}

function runCommand(packageManager: PackageManager, script: string) {
    if (packageManager === 'npm') {
        return `npm run ${script}`;
    }

    if (packageManager === 'yarn') {
        return `yarn ${script}`;
    }

    if (packageManager === 'bun') {
        return `bun run ${script}`;
    }

    return `pnpm ${script}`;
}

interface ComponentMeta {
    className: string;
    fileName: string;
    tagName: string;
    title: string;
}

function toComponentMeta(name: string): ComponentMeta {
    const words = splitWords(name);
    const className = `${words.map(capitalize).join('')}Element`;
    const fileName = words.join('-');
    const tagName = fileName.includes('-') ? fileName : `miura-${fileName}`;

    return {
        className,
        fileName,
        tagName,
        title: titleCase(words.join(' '))
    };
}

function splitWords(value: string) {
    const normalized = value
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();

    if (!normalized) {
        fail(`Invalid name "${value}".`);
    }

    return normalized.split('-').filter(Boolean);
}

function toPackageName(value: string) {
    const base = basename(value);
    return splitWords(base).join('-');
}

function titleCase(value: string) {
    return splitWords(value).map(capitalize).join(' ');
}

function capitalize(value: string) {
    return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function json(value: unknown) {
    return `${JSON.stringify(value, null, 2)}\n`;
}

function fail(message: string): never {
    console.error(message);
    process.exit(1);
}

main().catch((error: unknown) => {
    fail(error instanceof Error ? error.message : String(error));
});
