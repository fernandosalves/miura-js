import type {
    Locale,
    Catalog,
    TranslationMap,
    InterpolationValues,
    I18nOptions,
    TranslationResult,
    LocaleChangeListener,
    PluralRules,
} from './types.js';

const DEFAULT_LOCALE = 'en';
const DEFAULT_INTERP = { start: '{{', end: '}}' };

/**
 * MiuraI18n — internationalisation service for the miura framework.
 *
 * ── Quick start ───────────────────────────────────────────────────────────────
 *
 *   const i18n = new MiuraI18n({
 *     locale: 'en',
 *     catalog: {
 *       en: { greeting: 'Hello, {{name}}!', items: { one: '1 item', other: '{{count}} items' } },
 *       fr: { greeting: 'Bonjour, {{name}} !', items: { one: '1 article', other: '{{count}} articles' } },
 *     },
 *   });
 *
 *   i18n.t('greeting', { name: 'World' });   // → "Hello, World!"
 *   i18n.t('items', { count: 3 });           // → "3 items"
 *   i18n.setLocale('fr');
 *   i18n.t('greeting', { name: 'Monde' });   // → "Bonjour, Monde !"
 *
 * ── Singleton usage ───────────────────────────────────────────────────────────
 *
 *   MiuraI18n.configure({ locale: 'en', catalog: { ... } });
 *   const { t } = MiuraI18n.global;
 */
export class MiuraI18n {
    private _locale: Locale;
    private _fallback: Locale;
    private _catalog: Catalog;
    private _pluralRules: Record<Locale, PluralRules>;
    private _interp: { start: string; end: string };
    private _listeners = new Set<LocaleChangeListener>();

    // ── Singleton ─────────────────────────────────────────────────────────────

    private static _global: MiuraI18n | null = null;

    /** Global singleton instance. Call `configure()` first. */
    static get global(): MiuraI18n {
        if (!MiuraI18n._global) {
            MiuraI18n._global = new MiuraI18n({});
        }
        return MiuraI18n._global;
    }

    /** Configure the global singleton (idempotent — merges catalog). */
    static configure(options: I18nOptions): MiuraI18n {
        if (!MiuraI18n._global) {
            MiuraI18n._global = new MiuraI18n(options);
        } else {
            const inst = MiuraI18n._global;
            if (options.locale) inst.setLocale(options.locale);
            if (options.catalog) inst.loadCatalog(options.catalog);
        }
        return MiuraI18n._global;
    }

    // ── Constructor ───────────────────────────────────────────────────────────

    constructor(options: I18nOptions) {
        this._locale   = options.locale         ?? DEFAULT_LOCALE;
        this._fallback = options.fallbackLocale ?? DEFAULT_LOCALE;
        this._catalog  = options.catalog        ?? {};
        this._pluralRules = options.pluralRules ?? {};
        this._interp   = options.interpolation  ?? DEFAULT_INTERP;
    }

    // ── Locale management ─────────────────────────────────────────────────────

    get locale(): Locale { return this._locale; }

    setLocale(locale: Locale): void {
        if (locale === this._locale) return;
        this._locale = locale;
        this._listeners.forEach(l => l(locale));
    }

    /**
     * Load additional translations. Merges into existing catalog.
     * Call this to lazy-load locale data when the user switches language.
     */
    loadCatalog(partial: Catalog): void {
        for (const [locale, map] of Object.entries(partial)) {
            this._catalog[locale] = _deepMerge(this._catalog[locale] ?? {}, map);
        }
    }

    /** Load a single locale's translations (convenience wrapper). */
    loadTranslations(locale: Locale, map: TranslationMap): void {
        this.loadCatalog({ [locale]: map });
    }

    // ── Translation ───────────────────────────────────────────────────────────

    /**
     * Translate a key, with optional interpolation and pluralisation.
     *
     *   t('greeting', { name: 'World' })     → "Hello, World!"
     *   t('items', { count: 3 })             → "3 items"   (uses plural key)
     *   t('nav.home')                        → "Home"      (nested key)
     *   t('missing.key', {}, 'Fallback')     → "Fallback"  (explicit default)
     */
    t(
        key: string,
        values: InterpolationValues = {},
        defaultValue?: string,
    ): string {
        return this.translate(key, values, defaultValue).value;
    }

    /** Like `t()` but returns a full `TranslationResult` (includes metadata). */
    translate(
        key: string,
        values: InterpolationValues = {},
        defaultValue?: string,
    ): TranslationResult {
        // Try active locale
        let raw = _lookupKey(this._catalog[this._locale], key);
        let usedFallback = false;

        // Try fallback locale
        if (raw === null && this._fallback !== this._locale) {
            raw = _lookupKey(this._catalog[this._fallback], key);
            if (raw !== null) usedFallback = true;
        }

        if (raw === null) {
            return {
                value: defaultValue ?? key,
                usedFallback: false,
                missing: true,
            };
        }

        // Pluralisation — if raw is an object pick the right category
        if (typeof raw === 'object') {
            const count = typeof values.count === 'number' ? values.count : 1;
            const category = this._selectPlural(this._locale, count);
            const pluralRaw = (raw as TranslationMap)[category] ?? (raw as TranslationMap)['other'];
            raw = typeof pluralRaw === 'string' ? pluralRaw : key;
        }

        return {
            value: _interpolate(raw as string, values, this._interp),
            usedFallback,
            missing: false,
        };
    }

    // ── Subscription ──────────────────────────────────────────────────────────

    /** Subscribe to locale changes. Returns an unsubscribe function. */
    onLocaleChange(listener: LocaleChangeListener): () => void {
        this._listeners.add(listener);
        return () => this._listeners.delete(listener);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /** True if the catalog has at least a partial translation for the locale. */
    hasLocale(locale: Locale): boolean {
        return locale in this._catalog && Object.keys(this._catalog[locale]).length > 0;
    }

    /** List all locales currently loaded in the catalog. */
    get loadedLocales(): Locale[] {
        return Object.keys(this._catalog);
    }

    private _selectPlural(locale: Locale, count: number): string {
        const custom = this._pluralRules[locale];
        if (custom) return custom.select(count);
        try {
            return new Intl.PluralRules(locale).select(count);
        } catch {
            return count === 1 ? 'one' : 'other';
        }
    }
}

// ── Module-level helpers ──────────────────────────────────────────────────────

function _lookupKey(map: TranslationMap | undefined, key: string): string | TranslationMap | null {
    if (!map) return null;
    if (key in map) return map[key];

    // Support dot-notation nested keys: "nav.home" → map.nav.home
    const parts = key.split('.');
    let current: TranslationMap | string = map;
    for (const part of parts) {
        if (typeof current !== 'object' || !(part in current)) return null;
        current = (current as TranslationMap)[part];
    }
    return current as string | TranslationMap;
}

function _interpolate(
    template: string,
    values: InterpolationValues,
    delimiters: { start: string; end: string },
): string {
    const { start, end } = delimiters;
    const escaped = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`${escaped(start)}\\s*(\\w+)\\s*${escaped(end)}`, 'g');
    return template.replace(re, (_, key) => {
        const val = values[key];
        return val !== undefined ? String(val) : `${start}${key}${end}`;
    });
}

function _deepMerge(target: TranslationMap, source: TranslationMap): TranslationMap {
    const result: TranslationMap = { ...target };
    for (const [k, v] of Object.entries(source)) {
        if (typeof v === 'object' && typeof result[k] === 'object') {
            result[k] = _deepMerge(result[k] as TranslationMap, v);
        } else {
            result[k] = v;
        }
    }
    return result;
}
