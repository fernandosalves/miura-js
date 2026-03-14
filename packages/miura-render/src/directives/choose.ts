import { TemplateResult } from '../processor/template-result';

/**
 * A single case in a choose() call: [value, templateFn].
 */
export type ChoiceCase<V, T extends TemplateResult> = [V, () => T];

/**
 * Multi-branch conditional rendering directive.
 *
 * Evaluates `value` against a list of cases and renders the matching branch.
 * Only the matched branch's template function is called.
 *
 * Usage:
 * ```ts
 * html`
 *   ${choose(this.page, [
 *     ['home',    () => html`<home-page></home-page>`],
 *     ['about',   () => html`<about-page></about-page>`],
 *     ['contact', () => html`<contact-page></contact-page>`],
 *   ], () => html`<not-found></not-found>`)}
 * `
 * ```
 *
 * @param value - The value to match against cases
 * @param cases - Array of [matchValue, templateFn] tuples
 * @param defaultCase - Optional template function when no case matches
 */
export function choose<V, T extends TemplateResult>(
    value: V,
    cases: ChoiceCase<V, T>[],
    defaultCase?: () => T
): T | undefined {
    for (const [caseValue, templateFn] of cases) {
        if (caseValue === value) {
            return templateFn();
        }
    }
    return defaultCase?.();
}
