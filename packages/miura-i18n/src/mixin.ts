import { MiuraI18n } from './i18n.js';
import type { Locale, InterpolationValues } from './types.js';

/** Members injected by I18nMixin — exposed as a separate interface for type merging */
export interface I18nMixinMembers {
    readonly _i18n: MiuraI18n;
    readonly locale: Locale;
    setLocale(locale: Locale): void;
    t(key: string, values?: InterpolationValues, defaultValue?: string): string;
}

type Constructor<T = HTMLElement> = new (...args: any[]) => T;

/**
 * I18nMixin — adds `t()`, `locale`, and `setLocale()` helpers to any
 * MiuraElement subclass and automatically re-renders when the locale changes.
 *
 * ── Usage ─────────────────────────────────────────────────────────────────────
 *
 *   @component({ tag: 'my-header' })
 *   class MyHeader extends I18nMixin(MiuraElement) {
 *     template() {
 *       return html`
 *         <h1>${this.t('page.title')}</h1>
 *         <p>${this.t('greeting', { name: 'World' })}</p>
 *         <select @change=${(e: Event) => this.setLocale((e.target as HTMLSelectElement).value)}>
 *           <option value="en">English</option>
 *           <option value="fr">Français</option>
 *         </select>
 *       `;
 *     }
 *   }
 *
 * ── Custom instance ───────────────────────────────────────────────────────────
 *
 *   class MyHeader extends I18nMixin(MiuraElement, myCustomI18nInstance) { ... }
 */
export function I18nMixin<TBase extends Constructor<HTMLElement>>(
    Base: TBase,
    instance?: MiuraI18n,
): TBase & Constructor<I18nMixinMembers> {
    // Capture base lifecycle hooks before extending (standard TS mixin pattern)
    const proto = Base.prototype as any;
    const _superConnected    = proto.connectedCallback    as (() => void) | undefined;
    const _superDisconnected = proto.disconnectedCallback as (() => void) | undefined;

    class I18nElement extends Base {
        get _i18n(): MiuraI18n {
            return instance ?? MiuraI18n.global;
        }

        _i18nUnsub?: () => void;

        /** Active locale from the i18n instance */
        get locale(): Locale {
            return this._i18n.locale;
        }

        /** Switch the locale globally and re-render this element */
        setLocale(locale: Locale): void {
            this._i18n.setLocale(locale);
        }

        /**
         * Translate a key.
         * Delegates to the MiuraI18n instance — see MiuraI18n.t() for full docs.
         */
        t(key: string, values?: InterpolationValues, defaultValue?: string): string {
            return this._i18n.t(key, values, defaultValue);
        }

        connectedCallback(): void {
            _superConnected?.call(this);
            // Re-render whenever the locale changes
            this._i18nUnsub = this._i18n.onLocaleChange(() => {
                if (typeof (this as any).requestUpdate === 'function') {
                    (this as any).requestUpdate();
                }
            });
        }

        disconnectedCallback(): void {
            this._i18nUnsub?.();
            this._i18nUnsub = undefined;
            _superDisconnected?.call(this);
        }
    }

    return I18nElement as unknown as TBase & Constructor<I18nMixinMembers>;
}

/**
 * Standalone `t()` function that uses the global MiuraI18n instance.
 * Useful in non-element contexts (e.g., directives, utilities).
 */
export function t(key: string, values?: InterpolationValues, defaultValue?: string): string {
    return MiuraI18n.global.t(key, values, defaultValue);
}
