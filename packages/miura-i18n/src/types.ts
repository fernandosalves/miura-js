// ── Core types for miura-i18n ─────────────────────────────────────────────────

/** BCP-47 locale tag, e.g. "en", "en-US", "pt-BR" */
export type Locale = string;

/** A flat or nested map of translation keys to strings */
export type TranslationMap = {
    [key: string]: string | TranslationMap;
};

/** Translation catalog — one TranslationMap per locale */
export type Catalog = Record<Locale, TranslationMap>;

/** Interpolation variables passed to t() */
export type InterpolationValues = Record<string, string | number | boolean>;

/** Plural forms configuration for a locale */
export interface PluralRules {
    /**
     * Given a count, return the plural category key.
     * Common categories: "zero" | "one" | "two" | "few" | "many" | "other"
     */
    select(count: number): string;
}

/**
 * Options for initialising miuraI18n.
 */
export interface I18nOptions {
    /** Initial active locale. Defaults to "en". */
    locale?: Locale;
    /** Fallback locale used when a key is missing in the active locale. */
    fallbackLocale?: Locale;
    /** Initial translation catalog. More locales can be loaded later. */
    catalog?: Catalog;
    /**
     * Custom plural-rules per locale.
     * If omitted, the browser's Intl.PluralRules is used.
     */
    pluralRules?: Record<Locale, PluralRules>;
    /**
     * Interpolation delimiters.
     * Defaults to `{ start: '{{', end: '}}' }`.
     */
    interpolation?: { start: string; end: string };
}

/** Result of a translation lookup */
export interface TranslationResult {
    value: string;
    /** True when the key was found in the fallback locale, not the active one */
    usedFallback: boolean;
    /** True when the key was not found at all (value is the key itself) */
    missing: boolean;
}

/** Subscriber callback called whenever the active locale changes */
export type LocaleChangeListener = (locale: Locale) => void;
