import { flattenTheme, getThemePreset, MuiThemeTokens } from './tokens.js';

const MEDIA_QUERY = '(prefers-color-scheme: dark)';

type TokenRegistry = Set<string>;

export class MuiThemeProvider extends HTMLElement {
    static tagName = 'mui-theme-provider';

    static get observedAttributes(): string[] {
        return ['theme', 'global'];
    }

    private mediaQuery?: MediaQueryList;
    private readonly handleSystemThemeChange = () => {
        if (this.theme === 'system') {
            this.applyTheme();
        }
    };

    private hostTokens: TokenRegistry = new Set();
    private globalTokens: TokenRegistry = new Set();

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback(): void {
        this.render();
        this.applyTheme();
        this.setupSystemListener();
    }

    disconnectedCallback(): void {
        this.teardownSystemListener();
        this.clearTokens(document.documentElement.style, this.globalTokens);
    }

    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
        if (oldValue === newValue) return;
        if (name === 'theme' || name === 'global') {
            this.applyTheme();
            this.setupSystemListener();
        }
    }

    get theme(): string {
        return this.getAttribute('theme') ?? 'light';
    }

    set theme(value: string) {
        this.setAttribute('theme', value);
    }

    get global(): boolean {
        return this.hasAttribute('global');
    }

    set global(value: boolean) {
        if (value) {
            this.setAttribute('global', '');
        } else {
            this.removeAttribute('global');
        }
    }

    private render(): void {
        if (!this.shadowRoot) return;
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: contents;
                }
            </style>
            <slot></slot>
        `;
    }

    private resolveThemeName(): string {
        if (this.theme !== 'system') {
            return this.theme;
        }
        if (typeof window === 'undefined') {
            return 'light';
        }
        return window.matchMedia(MEDIA_QUERY).matches ? 'dark' : 'light';
    }

    private applyTheme(): void {
        const themeName = this.resolveThemeName();
        const theme = getThemePreset(themeName);
        const tokens = flattenTheme(theme);

        this.applyTokens(this.style, tokens, this.hostTokens);

        if (this.global) {
            this.applyTokens(document.documentElement.style, tokens, this.globalTokens);
        } else {
            this.clearTokens(document.documentElement.style, this.globalTokens);
        }

        this.setAttribute('data-theme', themeName);
        this.dispatchEvent(new CustomEvent('mui-theme-change', {
            detail: { theme: themeName },
            bubbles: true,
            composed: true,
        }));
    }

    private applyTokens(target: CSSStyleDeclaration, tokens: MuiThemeTokens, registry: TokenRegistry): void {
        this.clearTokens(target, registry);
        Object.entries(tokens).forEach(([name, value]) => {
            target.setProperty(name, value);
            registry.add(name);
        });
    }

    private clearTokens(target: CSSStyleDeclaration, registry: TokenRegistry): void {
        registry.forEach((name) => target.removeProperty(name));
        registry.clear();
    }

    private setupSystemListener(): void {
        this.teardownSystemListener();
        if (this.theme === 'system' && typeof window !== 'undefined') {
            this.mediaQuery = window.matchMedia(MEDIA_QUERY);
            this.mediaQuery.addEventListener('change', this.handleSystemThemeChange);
        }
    }

    private teardownSystemListener(): void {
        if (this.mediaQuery) {
            this.mediaQuery.removeEventListener('change', this.handleSystemThemeChange);
            this.mediaQuery = undefined;
        }
    }
}

if (!customElements.get(MuiThemeProvider.tagName)) {
    customElements.define(MuiThemeProvider.tagName, MuiThemeProvider);
}
