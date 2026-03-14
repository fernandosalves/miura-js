import { TemplateResult } from '../processor/template-result';

/**
 * Conditional rendering directive.
 *
 * Renders `trueCase` when condition is truthy, `falseCase` when falsy.
 * Unlike ternary expressions, template functions are only called for the
 * active branch — the inactive branch is never evaluated.
 *
 * Usage:
 * ```ts
 * html`
 *   ${when(this.isLoggedIn,
 *     () => html`<user-profile .user="${this.user}"></user-profile>`,
 *     () => html`<login-form></login-form>`
 *   )}
 * `
 * ```
 *
 * @param condition - Truthy/falsy value to test
 * @param trueCase - Template function called when condition is truthy
 * @param falseCase - Optional template function called when condition is falsy
 */
export function when<T extends TemplateResult>(
    condition: unknown,
    trueCase: () => T,
    falseCase?: () => T
): T | undefined {
    return condition ? trueCase() : falseCase?.();
}
