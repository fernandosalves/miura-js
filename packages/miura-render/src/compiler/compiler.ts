import { TemplateResult, BindingType } from '../processor/template-result';
import { TemplateParser, ParsedTemplate } from '../processor/parser';
import { CodeFactory, CompiledRenderFn, CompiledUpdateFn } from './code-factory';
import { applyUtilityValue, clearAppliedUtilities } from '../utilities/utility-resolver';
import { createDOMFragment } from '../processor/dom-fragment';

type SignalLike = {
    peek(): unknown;
    subscribe(fn: (value: unknown) => void): () => void;
    __isSignal: true;
};

function isSignal(value: unknown): value is SignalLike {
    return Boolean(
        value &&
        (typeof value === 'function' || typeof value === 'object') &&
        typeof (value as any).peek === 'function' &&
        typeof (value as any).subscribe === 'function' &&
        (value as any).__isSignal === true
    );
}

function unwrapSignalValues(values: unknown[]): unknown[] {
    if (!values?.length) return values ?? [];

    let unwrapped: unknown[] | null = null;
    for (let i = 0; i < values.length; i++) {
        const value = values[i];
        if (!isSignal(value)) continue;

        unwrapped ??= values.slice();
        unwrapped[i] = value.peek();
    }

    return unwrapped ?? values;
}

/**
 * A compiled template — owns the generated render/update functions and
 * a `refs` cache (populated on first render, reused on subsequent updates).
 */
export interface CompiledTemplate {
    /** HTML string for the template (passed to the generated render fn). */
    readonly html: string;
    /**
     * Ref indices (into the `refs` array) that correspond to Node bindings.
     * The caller (MiuraElement AOT path) manages real NodeBinding instances
     * for these indices — the generated update function skips them.
     */
    readonly nodeBindingIndices: readonly number[];
    /**
     * Directive binding descriptors: ref index + directive name (without `#`).
     * The caller creates real DirectiveBinding instances for these so that
     * structural directives (#if, #for, #switch …) work in AOT mode.
     */
    readonly directiveBindingInfos: readonly { refIndex: number; name: string }[];
    /**
     * Create the DOM fragment and collect element refs.
     * Called once per element instance (on connect / initial render).
     * Returns `{ fragment, refs }` — store `refs` and pass it to `update()`.
     */
    render(values: unknown[]): { fragment: DocumentFragment; refs: unknown[] };
    /**
     * Apply new values to cached element refs.
     * Called on every subsequent update — zero DOM queries.
     * Node bindings (nodeBindingIndices) are intentionally skipped here;
     * the caller updates them via NodeBinding.setValue().
     */
    update(refs: unknown[], values: unknown[]): void;
}

/**
 * TemplateCompiler — compiles a TemplateResult into optimised render/update
 * functions using CodeFactory.
 *
 * Templates with the same `strings` reference share a single compiled entry
 * (WeakMap-cached), so compilation happens only once per unique template
 * shape regardless of how many component instances use it.
 *
 * ── Usage ─────────────────────────────────────────────────────────────────────
 *
 *   const compiler = new TemplateCompiler();
 *
 *   // First call — parses + compiles
 *   const compiled = compiler.compile(result);
 *
 *   // On first render
 *   const { fragment, refs } = compiled.render(result.values);
 *   shadowRoot.appendChild(fragment);
 *
 *   // On subsequent updates
 *   compiled.update(refs, newResult.values);
 */
export class TemplateCompiler {
    private readonly _parseCache  = new WeakMap<TemplateStringsArray, ParsedTemplate>();
    private readonly _compileCache = new WeakMap<TemplateStringsArray, CompiledTemplate>();
    private readonly _parser = new TemplateParser();

    /**
     * Compile a TemplateResult into a reusable CompiledTemplate.
     * Results are cached by `strings` reference — identical tagged template
     * literals always return the same compiled object.
     */
    compile(result: TemplateResult): CompiledTemplate {
        const cached = this._compileCache.get(result.strings);
        if (cached) return cached;

        const parsed  = this._getOrParse(result);
        const factory = new CodeFactory(parsed.html);
        const count   = parsed.bindings.length;

        const renderFn: CompiledRenderFn = factory.generateRenderFunction(parsed.bindings, count);
        const updateFn: CompiledUpdateFn = factory.generateUpdateFunction(parsed.bindings);

        const nodeBindingIndices = parsed.bindings
            .map((b, i) => b.type === BindingType.Node ? i : -1)
            .filter(i => i !== -1);

        const directiveBindingInfos = parsed.bindings
            .map((b, i) => b.type === BindingType.Directive
                ? { refIndex: i, name: (b.name ?? '').replace(/^#/, '') }
                : null)
            .filter((x): x is { refIndex: number; name: string } => x !== null);

        const compiled: CompiledTemplate = {
            html: parsed.html,
            nodeBindingIndices,
            directiveBindingInfos,
            render(values) {
                const safeValues = unwrapSignalValues(values);
                const rendered = renderFn(parsed.html, safeValues, applyUtilityValue, clearAppliedUtilities, createDOMFragment);
                updateFn(rendered.refs as any, safeValues, applyUtilityValue, clearAppliedUtilities);
                return rendered;
            },
            update(refs, values) {
                updateFn(refs as any, unwrapSignalValues(values), applyUtilityValue, clearAppliedUtilities);
            },
        };

        this._compileCache.set(result.strings, compiled);
        return compiled;
    }

    /** Clear both caches (e.g. in tests or hot-module replacement). */
    clearCache(): void {
        // WeakMaps self-clean — re-assign to drop all entries
        (this as any)._parseCache   = new WeakMap();
        (this as any)._compileCache = new WeakMap();
    }

    private _getOrParse(result: TemplateResult): ParsedTemplate {
        let parsed = this._parseCache.get(result.strings);
        if (!parsed) {
            parsed = this._parser.parse(result.strings);
            this._parseCache.set(result.strings, parsed);
        }
        return parsed;
    }
}
