import { BindingType } from '../processor/template-result';
import type { TemplateBinding } from '../processor/parser';

/** Runtime ref slot stored in the generated refs array */
interface RefSlot {
    /** For Node bindings: the start comment node */
    startComment?: Comment;
    /** For Node bindings: the end comment node */
    endComment?: Comment;
    /** For attribute / element bindings: the host element */
    el?: Element;
    /** Previous value — used to skip no-op updates */
    prev?: unknown;
    /** Bound event listener (for cleanup) */
    listener?: EventListener;
}

// ── Shared runtime helper code injected into every generated function ─────────

const HELPERS = /* js */`
const MARKER = 'binding:';

/** Collect all binding refs from a cloned fragment (run once per render). */
function collectRefs(frag, count) {
    const refs = new Array(count);
    const walker = document.createTreeWalker(
        frag,
        0x1 | 0x80, // SHOW_ELEMENT | SHOW_COMMENT
        null
    );
    let node = walker.nextNode();
    while (node) {
        if (node.nodeType === 8) {
            const text = node.textContent || '';
            if (text.startsWith(MARKER)) {
                const idx = +text.slice(MARKER.length);
                if (!isNaN(idx)) {
                    refs[idx] = refs[idx] || {};
                    refs[idx].startComment = node;
                }
            } else if (text.startsWith('/binding:')) {
                const idx = +text.slice(9);
                if (!isNaN(idx) && refs[idx]) {
                    refs[idx].endComment = node;
                }
            }
        } else if (node.nodeType === 1) {
            for (const attr of Array.from(node.attributes)) {
                if (attr.value.startsWith(MARKER)) {
                    const idx = +attr.value.slice(MARKER.length);
                    if (!isNaN(idx)) {
                        refs[idx] = refs[idx] || {};
                        refs[idx].el = node;
                        node.removeAttribute(attr.name);
                    }
                }
            }
        }
        node = walker.nextNode();
    }
    return refs;
}

/** Update a single Node binding (replaces nodes between comment markers). */
function setNodeBinding(ref, value) {
    if (ref.prev === value) return;
    ref.prev = value;
    const start = ref.startComment;
    const end = ref.endComment;
    if (!start || !end || !start.parentNode) return;
    const parent = start.parentNode;
    // Remove existing content between markers
    let cur = start.nextSibling;
    while (cur && cur !== end) {
        const next = cur.nextSibling;
        parent.removeChild(cur);
        cur = next;
    }
    if (value == null || value === '') return;
    if (value instanceof DocumentFragment || value instanceof Node) {
        parent.insertBefore(value, end);
    } else {
        parent.insertBefore(document.createTextNode(String(value)), end);
    }
}

/** Toggle classes from an object map { className: boolean }. */
function setObjectClass(el, prev, next) {
    if (prev) Object.keys(prev).forEach(k => { if (!next[k]) el.classList.remove(k); });
    Object.entries(next).forEach(([k, v]) => { v ? el.classList.add(k) : el.classList.remove(k); });
}

/** Apply a style object map { property: value }. */
function setObjectStyle(el, next) {
    Object.entries(next).forEach(([k, v]) => { el.style[k] = v == null ? '' : String(v); });
}
`;

// ── Per-binding update code generation ───────────────────────────────────────

/**
 * Strip the binding-syntax prefix character(s) from a raw attribute name.
 * `b.name` is stored as the raw attribute name (e.g. `.value`, `?disabled`,
 * `&model`, `~data`) so that the JIT path can use it verbatim. The AOT path
 * generates JS property accesses and must use the clean identifier instead.
 */
function _stripPrefix(name: string | undefined): string {
    if (!name) return '';
    // Handle 3-char spread prefix first, then single-char prefixes
    return name.replace(/^(\.\.\.|[.?&~:#@])/, '');
}

function _updateCode(b: TemplateBinding, ri: number): string {
    const r = `refs[${ri}]`;
    const v = `values[${b.index}]`;

    switch (b.type) {
        case BindingType.Node:
            // Handled externally via NodeBinding instances — skip in generated code.
            return `/* node binding ${ri}: managed by caller */`;

        case BindingType.Property: {
            const prop = _stripPrefix(b.name);
            return `if (${r}.prev !== ${v}) { ${r}.prev = ${v}; ${r}.el.${prop} = ${v}; }`;
        }

        case BindingType.Boolean: {
            const attr = JSON.stringify(_stripPrefix(b.name));
            return `if (${r}.prev !== ${v}) { ${r}.prev = ${v}; ${v} ? ${r}.el.setAttribute(${attr}, '') : ${r}.el.removeAttribute(${attr}); }`;
        }

        case BindingType.Class: {
            return `if (${r}.prev !== ${v}) { ${r}.prev = ${v}; ${r}.el.className = ${v}; }`;
        }

        case BindingType.Style:
            return `if (${r}.prev !== ${v}) { ${r}.prev = ${v}; ${r}.el.style.cssText = ${v}; }`;

        case BindingType.Attribute: {
            const attrName = JSON.stringify(b.name);
            return `if (${r}.prev !== ${v}) { ${r}.prev = ${v}; ${r}.el.setAttribute(${attrName}, ${v} == null ? '' : String(${v})); }`;
        }

        case BindingType.Event:
            // Events set once at render time — skip on update
            return `/* event: ${b.name} — set at render */`;

        case BindingType.ObjectClass:
            return `{ const _next = ${v}||{}; setObjectClass(${r}.el, ${r}.prev, _next); ${r}.prev = _next; }`;

        case BindingType.ObjectStyle:
            return `if (${r}.prev !== ${v}) { ${r}.prev = ${v}; setObjectStyle(${r}.el, ${v}||{}); }`;

        case BindingType.Spread:
            return `if (${r}.prev !== ${v}) { ${r}.prev = ${v}; Object.assign(${r}.el, ${v}||{}); }`;

        case BindingType.Async: {
            const asyncProp = _stripPrefix(b.name);
            return `if (${r}.prev !== ${v}) { ${r}.prev = ${v}; Promise.resolve(${v}).then(rv => { ${r}.el.${asyncProp} = rv; }); }`;
        }

        case BindingType.Bind: {
            const propName = JSON.stringify(_stripPrefix(b.name));
            return `if (${r}.prev !== ${v}) { ${r}.prev = ${v}; ${r}.el[${propName}] = ${v}; }`;
        }

        case BindingType.Reference:
            return `if (${v} && typeof ${v} === 'object') { ${v}.value = ${r}.el; }`;

        case BindingType.Directive:
            return `/* directive handled at runtime */`;

        default:
            return `setNodeBinding(${r}, ${v});`;
    }
}

function _renderEventCode(b: TemplateBinding, ri: number): string {
    const r = `refs[${ri}]`;
    const v = `values[${b.index}]`;
    const evt = JSON.stringify(b.name);
    const once  = (b.modifiers ?? []).includes('once')  ? ', { once: true }'  : '';
    const pass  = (b.modifiers ?? []).includes('passive') ? ' | passive' : '';
    return `
        if (${r}.listener) ${r}.el.removeEventListener(${evt}, ${r}.listener${pass ? ', {passive:true}' : ''});
        ${r}.listener = ${v};
        if (${v}) ${r}.el.addEventListener(${evt}, ${v}${once});
    `;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * CodeFactory — generates optimised render/update JavaScript from a parsed
 * miura template.
 *
 * The generated functions use a `refs` array whose slots are populated once
 * (by `collectRefs()`) and then reused on every subsequent update call,
 * avoiding repeated DOM tree walks.
 */
export class CodeFactory {
    private readonly _html: string;

    constructor(html: string) {
        this._html = html;
    }

    /**
     * Generate the render function for the template.
     * The returned function creates the DOM, collects refs, applies initial
     * values, and returns `{ fragment, refs }`.
     */
    generateRenderFunction(bindings: TemplateBinding[], count: number): CompiledRenderFn {
        const updateLines = bindings.map((b, ri) => {
            if (b.type === BindingType.Event) return _renderEventCode(b, ri);
            return _updateCode(b, ri);
        }).join('\n');

        const src = /* js */`
            ${HELPERS}
            const _tpl = document.createElement('template');
            _tpl.innerHTML = html;
            const fragment = _tpl.content.cloneNode(true);
            const refs = collectRefs(fragment, ${count});
            ${updateLines}
            return { fragment, refs };
        `;

        // eslint-disable-next-line no-new-func
        return new Function('html', 'values', src) as CompiledRenderFn;
    }

    /**
     * Generate the update function for the template.
     * Requires the `refs` array produced by the render function.
     */
    generateUpdateFunction(bindings: TemplateBinding[]): CompiledUpdateFn {
        const lines = bindings.map((b, ri) => {
            if (b.type === BindingType.Event) return _renderEventCode(b, ri);
            return _updateCode(b, ri);
        }).join('\n');

        const src = /* js */`
            ${HELPERS}
            ${lines}
        `;

        // eslint-disable-next-line no-new-func
        return new Function('refs', 'values', src) as CompiledUpdateFn;
    }

    get html(): string { return this._html; }
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type CompiledRenderFn = (
    html: string,
    values: unknown[],
) => { fragment: DocumentFragment; refs: RefSlot[] };

export type CompiledUpdateFn = (
    refs: RefSlot[],
    values: unknown[],
) => void;
