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
    /** Utility classes/styles applied by % bindings */
    utilityState?: unknown;
    /** Track active style keys for object-style updates */
    styleKeys?: Set<string> | null;
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

/** Fix namespace for foreign-content elements (SVG, MathML) parsed via innerHTML. */
const _NS_MAP = { svg: 'http://www.w3.org/2000/svg', math: 'http://www.w3.org/1998/Math/MathML' };
function fixNamespaces(root) {
    for (const [tag, ns] of Object.entries(_NS_MAP)) {
        for (const el of root.querySelectorAll(tag)) {
            if (el.namespaceURI === ns) continue;
            if (el.parentElement && el.parentElement.namespaceURI === ns) continue;
            el.parentNode.replaceChild(recreateNS(el, ns), el);
        }
    }
}
function recreateNS(src, ns) {
    const el = document.createElementNS(ns, src.tagName.toLowerCase());
    for (const attr of Array.from(src.attributes)) el.setAttributeNS(attr.namespaceURI, attr.name, attr.value);
    for (const child of Array.from(src.childNodes)) {
        el.appendChild(child.nodeType === 1 ? recreateNS(child, ns) : child.cloneNode(true));
    }
    return el;
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
function setObjectStyle(el, prevKeys, next) {
    const nextKeys = new Set(Object.keys(next));
    if (prevKeys) {
        prevKeys.forEach((key) => {
            if (!nextKeys.has(key)) el.style[key] = '';
        });
    }
    Object.entries(next).forEach(([k, v]) => {
        el.style[k] = typeof v === 'number' ? \`\${v}px\` : (v == null ? '' : String(v));
    });
    return nextKeys;
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
            return `
                if (${r}.prev !== ${v}) {
                    const _next = ${v};
                    if (typeof _next === 'string') {
                        ${r}.el.className = _next;
                    } else {
                        if (typeof ${r}.prev === 'string') ${r}.el.className = '';
                        setObjectClass(${r}.el, ${r}.prev && typeof ${r}.prev === 'object' ? ${r}.prev : null, _next || {});
                    }
                    ${r}.prev = _next;
                }
            `;
        }

        case BindingType.Style:
            return `
                if (${r}.prev !== ${v}) {
                    const _next = ${v};
                    if (typeof _next === 'string') {
                        ${r}.el.style.cssText = _next;
                        ${r}.styleKeys = null;
                    } else {
                        if (typeof ${r}.prev === 'string') ${r}.el.style.cssText = '';
                        ${r}.styleKeys = setObjectStyle(${r}.el, ${r}.styleKeys, _next || {});
                    }
                    ${r}.prev = _next;
                }
            `;

        case BindingType.Attribute: {
            const attrName = JSON.stringify(b.name);
            return `if (${r}.prev !== ${v}) { ${r}.prev = ${v}; ${r}.el.setAttribute(${attrName}, ${v} == null ? '' : String(${v})); }`;
        }

        case BindingType.Event:
            // Events set once at render time — skip on update
            return `/* event: ${b.name} — set at render */`;

        case BindingType.ObjectClass:
            return `
                { const _next = ${v}||{}; setObjectClass(${r}.el, ${r}.prev && typeof ${r}.prev === 'object' ? ${r}.prev : null, _next); ${r}.prev = _next; }
            `;

        case BindingType.ObjectStyle:
            return `
                if (${r}.prev !== ${v}) {
                    const _next = ${v} || {};
                    if (typeof ${r}.prev === 'string') ${r}.el.style.cssText = '';
                    ${r}.styleKeys = setObjectStyle(${r}.el, ${r}.styleKeys, _next);
                    ${r}.prev = _next;
                }
            `;

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

        case BindingType.Utility: {
            const utilityName = JSON.stringify(b.name);
            return `if (${r}.prev !== ${v}) { ${r}.prev = ${v}; ${r}.utilityState = applyUtilityValue(${r}.el, ${utilityName}, ${v}, ${r}.utilityState); }`;
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
    const modifiers = b.modifiers ?? [];
    const hasOnce = modifiers.includes('once');
    const hasPassive = modifiers.includes('passive');
    const hasCapture = modifiers.includes('capture');
    const hasPrevent = modifiers.includes('prevent');
    const hasStop = modifiers.includes('stop');
    const keyModifier = modifiers.find((modifier) => modifier.startsWith('key:'));
    const options = `{${[
        hasOnce ? 'once: true' : '',
        hasPassive ? 'passive: true' : '',
        hasCapture ? 'capture: true' : '',
    ].filter(Boolean).join(', ')}}`;
    const removeOptions = `{${[
        hasPassive ? 'passive: true' : '',
        hasCapture ? 'capture: true' : '',
    ].filter(Boolean).join(', ')}}`;
    const needsWrappedHandler = hasPrevent || hasStop || !!keyModifier;
    const keyGuard = keyModifier
        ? (() => {
            const key = keyModifier.split(':')[1] ?? '';
            const mapped = key.toLowerCase() === 'enter'
                ? 'Enter'
                : key.toLowerCase() === 'escape'
                    ? 'Escape'
                    : key.toLowerCase() === 'space'
                        ? ' '
                        : key;
            return `if (!(event instanceof KeyboardEvent) || event.key !== ${JSON.stringify(mapped)}) return;`;
        })()
        : '';
    const wrappedHandler = needsWrappedHandler
        ? `
        function(event) {
            ${keyGuard}
            ${hasPrevent ? 'event.preventDefault();' : ''}
            ${hasStop ? 'event.stopPropagation();' : ''}
            return ${v}.call(this, event);
        }
    `
        : v;
    return `
        if (${r}.listener) ${r}.el.removeEventListener(${evt}, ${r}.listener, ${removeOptions});
        ${r}.listener = ${v} ? ${wrappedHandler} : null;
        if (${r}.listener) ${r}.el.addEventListener(${evt}, ${r}.listener, ${options});
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
            fixNamespaces(fragment);
            const refs = collectRefs(fragment, ${count});
            ${updateLines}
            return { fragment, refs };
        `;

        // eslint-disable-next-line no-new-func
        return new Function('html', 'values', 'applyUtilityValue', 'clearAppliedUtilities', src) as CompiledRenderFn;
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
        return new Function('refs', 'values', 'applyUtilityValue', 'clearAppliedUtilities', src) as CompiledUpdateFn;
    }

    get html(): string { return this._html; }
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type CompiledRenderFn = (
    html: string,
    values: unknown[],
    applyUtilityValue: (...args: any[]) => any,
    clearAppliedUtilities: (...args: any[]) => any,
) => { fragment: DocumentFragment; refs: RefSlot[] };

export type CompiledUpdateFn = (
    refs: RefSlot[],
    values: unknown[],
    applyUtilityValue: (...args: any[]) => any,
    clearAppliedUtilities: (...args: any[]) => any,
) => void;
