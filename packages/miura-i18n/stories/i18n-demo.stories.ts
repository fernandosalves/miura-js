import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraI18n } from '../src/i18n.js';
import { I18nMixin } from '../src/mixin.js';
import { MiuraElement, html } from '@miura/miura-element';

// ── Shared catalog ────────────────────────────────────────────────────────────

const catalog = {
    en: {
        app: { title: 'Shopping Cart', subtitle: 'Powered by miura-i18n' },
        nav: { home: 'Home', products: 'Products', cart: 'Cart', settings: 'Settings' },
        greeting: 'Hello, {{name}}!',
        farewell: 'Goodbye, {{name}}. See you soon.',
        items: { one: '1 item in cart', other: '{{count}} items in cart' },
        empty: 'Your cart is empty.',
        total: 'Total: ${{amount}}',
        actions: { add: 'Add to cart', remove: 'Remove', checkout: 'Checkout' },
        locale: { label: 'Language', switch: 'Switch to {{locale}}' },
        nested: { deep: { key: 'Deep nested English value' } },
        missing_in_fr: 'This key only exists in English (fallback demo)',
    },
    fr: {
        app: { title: 'Panier', subtitle: 'Propulsé par miura-i18n' },
        nav: { home: 'Accueil', products: 'Produits', cart: 'Panier', settings: 'Paramètres' },
        greeting: 'Bonjour, {{name}} !',
        farewell: 'Au revoir, {{name}}. À bientôt.',
        items: { one: '1 article dans le panier', other: '{{count}} articles dans le panier' },
        empty: 'Votre panier est vide.',
        total: 'Total : {{amount}} €',
        actions: { add: 'Ajouter', remove: 'Supprimer', checkout: 'Commander' },
        locale: { label: 'Langue', switch: 'Passer en {{locale}}' },
        nested: { deep: { key: 'Valeur imbriquée en français' } },
    },
    pt: {
        app: { title: 'Carrinho', subtitle: 'Desenvolvido com miura-i18n' },
        nav: { home: 'Início', products: 'Produtos', cart: 'Carrinho', settings: 'Configurações' },
        greeting: 'Olá, {{name}}!',
        farewell: 'Adeus, {{name}}. Até breve.',
        items: { one: '1 item no carrinho', other: '{{count}} itens no carrinho' },
        empty: 'O seu carrinho está vazio.',
        total: 'Total: R${{amount}}',
        actions: { add: 'Adicionar', remove: 'Remover', checkout: 'Finalizar' },
        locale: { label: 'Idioma', switch: 'Mudar para {{locale}}' },
        nested: { deep: { key: 'Valor aninhado em português' } },
        missing_in_fr: 'Este item só existe em pt (demo fallback)',
    },
    de: {
        app: { title: 'Warenkorb', subtitle: 'Mit miura-i18n' },
        nav: { home: 'Startseite', products: 'Produkte', cart: 'Warenkorb', settings: 'Einstellungen' },
        greeting: 'Hallo, {{name}}!',
        farewell: 'Auf Wiedersehen, {{name}}.',
        items: { one: '1 Artikel im Warenkorb', other: '{{count}} Artikel im Warenkorb' },
        empty: 'Ihr Warenkorb ist leer.',
        total: 'Gesamt: {{amount}} €',
        actions: { add: 'Hinzufügen', remove: 'Entfernen', checkout: 'Bestellen' },
        locale: { label: 'Sprache', switch: 'Zu {{locale}} wechseln' },
        nested: { deep: { key: 'Tief verschachtelter deutscher Wert' } },
    },
};

// ── Demo component ────────────────────────────────────────────────────────────

class I18nDemo extends I18nMixin(MiuraElement) {
    static tagName = 'i18n-demo';

    static properties = {
        userName: { type: String, default: 'Alice' },
        cartCount: { type: Number, default: 0 },
    };

    declare userName: string;
    declare cartCount: number;

    private readonly _locales = ['en', 'fr', 'pt', 'de'];

    addItem() { this.cartCount++; }
    removeItem() { if (this.cartCount > 0) this.cartCount--; }

    template() {
        return html`
            <style>
                :host { display: block; font-family: system-ui, sans-serif; }
                .shell { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; max-width: 680px; }
                header {
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    color: white; padding: 1.25rem 1.5rem;
                }
                header h1 { margin: 0; font-size: 1.4rem; }
                header p  { margin: .25rem 0 0; opacity: .8; font-size: .85rem; }
                nav {
                    display: flex; gap: .5rem; background: #f8fafc;
                    padding: .75rem 1.5rem; border-bottom: 1px solid #e2e8f0;
                    flex-wrap: wrap;
                }
                nav span {
                    padding: .35rem .75rem; border-radius: 20px; font-size: .85rem;
                    background: white; border: 1px solid #e2e8f0; color: #475569;
                }
                .body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
                .card {
                    background: #f8fafc; border: 1px solid #e2e8f0;
                    border-radius: 8px; padding: 1rem 1.25rem;
                }
                .card-title { font-size: .75rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: .06em; margin: 0 0 .6rem; }
                .value { font-size: 1.05rem; color: #1e293b; }
                .locale-row { display: flex; gap: .5rem; flex-wrap: wrap; align-items: center; }
                button {
                    padding: .4rem .9rem; border-radius: 6px; border: none;
                    cursor: pointer; font-size: .875rem; transition: opacity .15s;
                }
                button:hover { opacity: .85; }
                .btn-primary   { background: #6366f1; color: white; }
                .btn-secondary { background: #e2e8f0; color: #475569; }
                .btn-active    { background: #6366f1; color: white; font-weight: 600; }
                .btn-danger    { background: #ef4444; color: white; }
                .cart-row { display: flex; align-items: center; gap: 1rem; }
                .badge {
                    display: inline-flex; align-items: center; justify-content: center;
                    min-width: 2rem; height: 2rem; border-radius: 9999px;
                    background: #6366f1; color: white; font-weight: 700; font-size: .875rem;
                }
                .tag {
                    display: inline-block; padding: .2rem .6rem; border-radius: 4px;
                    font-size: .75rem; background: #dbeafe; color: #1d4ed8;
                    font-family: monospace;
                }
            </style>

            <div class="shell">
                <header>
                    <h1>${this.t('app.title')}</h1>
                    <p>${this.t('app.subtitle')}</p>
                </header>

                <nav>
                    ${this.t('nav.home')} &nbsp;·&nbsp;
                    ${this.t('nav.products')} &nbsp;·&nbsp;
                    ${this.t('nav.cart')} &nbsp;·&nbsp;
                    ${this.t('nav.settings')}
                </nav>

                <div class="body">
                    <!-- Locale switcher -->
                    <div class="card">
                        <p class="card-title">${this.t('locale.label')}</p>
                        <div class="locale-row">
                            ${this._locales.map(loc =>
                                html`<button
                                    class="${this.locale === loc ? 'btn-active' : 'btn-secondary'}"
                                    @click="${() => this.setLocale(loc)}">
                                    ${loc.toUpperCase()}
                                </button>`
                            )}
                        </div>
                    </div>

                    <!-- Interpolation -->
                    <div class="card">
                        <p class="card-title">Interpolation — <span class="tag">{{ name }}</span></p>
                        <p class="value">${this.t('greeting', { name: this.userName })}</p>
                        <p class="value">${this.t('farewell', { name: this.userName })}</p>
                    </div>

                    <!-- Pluralisation -->
                    <div class="card">
                        <p class="card-title">Pluralisation — <span class="tag">{{ count }}</span></p>
                        <div class="cart-row">
                            <span class="badge">${this.cartCount}</span>
                            <span class="value">${this.t('items', { count: this.cartCount })}</span>
                        </div>
                        <div style="display:flex;gap:.5rem;margin-top:.75rem">
                            <button class="btn-primary"  @click="${this.addItem}">
                                ${this.t('actions.add')}
                            </button>
                            <button class="btn-danger"   @click="${this.removeItem}">
                                ${this.t('actions.remove')}
                            </button>
                        </div>
                    </div>

                    <!-- Nested key -->
                    <div class="card">
                        <p class="card-title">Dot-notation nested key — <span class="tag">nested.deep.key</span></p>
                        <p class="value">${this.t('nested.deep.key')}</p>
                    </div>

                    <!-- Fallback locale -->
                    <div class="card">
                        <p class="card-title">Fallback locale (key missing in FR/DE → falls back to EN)</p>
                        <p class="value">${this.t('missing_in_fr')}</p>
                    </div>

                    <!-- Missing key -->
                    <div class="card">
                        <p class="card-title">Missing key → returns key itself</p>
                        <p class="value">${this.t('this.key.does.not.exist')}</p>
                    </div>
                </div>
            </div>
        `;
    }
}

if (!customElements.get('i18n-demo')) {
    miuraI18n.configure({ locale: 'en', fallbackLocale: 'en', catalog });
    customElements.define('i18n-demo', I18nDemo);
}

// ── Storybook meta ─────────────────────────────────────────────────────────────

const meta: Meta = {
    title: 'miura-i18n/Demo',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: `
# miura-i18n

Internationalisation package for the miura framework.

## Features
- \`miuraI18n\` service — singleton or per-instance, lazy catalog loading
- \`t(key, vars)\` — dot-notation keys, \`{{ variable }}\` interpolation
- Plural forms via \`Intl.PluralRules\` (or custom rules per locale)
- Fallback locale when a key is missing in the active locale
- \`I18nMixin(Base)\` — injects \`t()\`, \`locale\`, \`setLocale()\` into any \`MiuraElement\`; auto-renders on locale change
- Standalone \`t()\` helper for non-element contexts
                `,
            },
        },
    },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
    render: () => {
        const el = document.createElement('i18n-demo') as any;
        el.userName = 'Alice';
        return el;
    },
    parameters: {
        docs: {
            description: {
                story: 'Full demo — switch locales, observe pluralisation and interpolation update live.',
            },
        },
    },
};

export const FrenchLocale: Story = {
    render: () => {
        MiuraI18n.global.setLocale('fr');
        const el = document.createElement('i18n-demo') as any;
        el.userName = 'Pierre';
        el.cartCount = 3;
        return el;
    },
    parameters: {
        docs: {
            description: { story: 'Pre-loaded in French with 3 items already in the cart.' },
        },
    },
};

export const GermanLocale: Story = {
    render: () => {
        MiuraI18n.global.setLocale('de');
        const el = document.createElement('i18n-demo') as any;
        el.userName = 'Hans';
        el.cartCount = 7;
        return el;
    },
};

export const ProgrammaticAPI: Story = {
    render: () => {
        MiuraI18n.global.setLocale('en');

        const i18n = new MiuraI18n({
            locale: 'en',
            fallbackLocale: 'en',
            catalog,
        });

        const lines = [
            `t('greeting', { name: 'World' })  →  "${i18n.t('greeting', { name: 'World' })}"`,
            `t('items', { count: 1 })           →  "${i18n.t('items', { count: 1 })}"`,
            `t('items', { count: 5 })           →  "${i18n.t('items', { count: 5 })}"`,
            `t('nested.deep.key')               →  "${i18n.t('nested.deep.key')}"`,
            `t('missing_in_fr')  [fr, fb→en]    →  "${(() => { i18n.setLocale('fr'); return i18n.t('missing_in_fr'); })()}"`,
            `t('does.not.exist')                →  "${i18n.t('does.not.exist')}"`,
        ];

        const container = document.createElement('div');
        container.style.cssText = 'font-family: monospace; padding: 1.5rem; background: #0f172a; color: #e2e8f0; border-radius: 8px; line-height: 2;';
        container.innerHTML = lines.map(l =>
            `<div style="border-bottom: 1px solid #1e293b; padding: .4rem 0;">${l}</div>`
        ).join('');
        return container;
    },
    parameters: {
        docs: {
            description: {
                story: 'Shows the `miuraI18n` instance API output directly — interpolation, plurals, fallback, and missing keys.',
            },
        },
    },
};
