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
                const idx = parseInt(text.slice(MARKER.length).split(':')[0]);
                if (!isNaN(idx)) {
                    refs[idx] = refs[idx] || {};
                    refs[idx].startComment = node;
                }
            } else if (text.startsWith('/binding:')) {
                const idx = parseInt(text.slice(9).split(':')[0]);
                if (!isNaN(idx) && refs[idx]) {
                    refs[idx].endComment = node;
                }
            }
        } else if (node.nodeType === 1) {
            const el = node;
            // Unified Data-Marker System:
            // Scan for data-bN and data-eN markers
            const dataAttrs = Array.from(el.attributes).filter(a => 
                a.name.startsWith('data-b') || a.name.startsWith('data-e')
            );
            
            for (const da of dataAttrs) {
                const isEvent = da.name.startsWith('data-e');
                const idx = parseInt(da.name.slice(6));
                if (!isNaN(idx)) {
                    refs[idx] = refs[idx] || {};
                    refs[idx].el = el;
                    el.removeAttribute(da.name);
                }
            }

            // Also clean up any static data-d (directive) or data-r (reference) markers
            const staticMarkers = Array.from(el.attributes).filter(a => 
                a.name.startsWith('data-d') || a.name.startsWith('data-r')
            );
            for (const sm of staticMarkers) {
                el.removeAttribute(sm.name);
            }
        }
        node = walker.nextNode();
    }
    return refs;
}

/** Update a single Node binding (replaces nodes between comment markers). */
function setNodeBinding(ref, value) {
    if (!ref) return;
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
    if (value && typeof value === 'object' && value[Symbol.for('miura:trusted')]) {
        const temp = document.createElement('template');
        temp.innerHTML = String(value.value ?? '');
        parent.insertBefore(document.importNode(temp.content, true), end);
        if (typeof value.afterRender === 'function') {
            value.afterRender(start.parentElement || parent);
        }
        return;
    }
    if (value instanceof DocumentFragment || value instanceof Node) {
        parent.insertBefore(value, end);
    } else {
        parent.insertBefore(document.createTextNode(String(value)), end);
    }
}

/** Toggle classes from an object map { className: boolean }. */
function setObjectClass(el, prev, next) {
    if (prev && typeof prev === 'object') Object.keys(prev).forEach(k => { if (!next[k]) el.classList.remove(k); });
    Object.entries(next || {}).forEach(([k, v]) => { v ? el.classList.add(k) : el.classList.remove(k); });
}

/** Sync a Set of classes to an element (additive/diffing). */
function syncClasses(el, ref, nextSet) {
    const prev = ref.prevSet || new Set();
    prev.forEach(c => { if (!nextSet.has(c)) el.classList.remove(c); });
    nextSet.forEach(c => { if (!prev.has(c)) el.classList.add(c); });
    ref.prevSet = nextSet;
}

/** Apply a style object map { property: value }. */
function setObjectStyle(el, ref, next) {
    const prevKeys = ref.styleKeys || new Set();
    const nextKeys = new Set(Object.keys(next || {}));
    prevKeys.forEach((key) => {
        if (!nextKeys.has(key)) el.style[key] = '';
    });
    Object.entries(next || {}).forEach(([k, v]) => {
        el.style[k] = typeof v === 'number' ? \`\${v}px\` : (v == null ? '' : String(v));
    });
    ref.styleKeys = nextKeys;
}

/** Sync a composite style string (including static parts) to cssText. */
function syncStyleText(el, ref, nextText) {
    if (ref.prev === nextText) return;
    el.style.cssText = nextText;
    ref.prev = nextText;
    ref.styleKeys = null; // Clear object-style tracking
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

function _updateCode(b: TemplateBinding, _ri: number): string {
    const r = `refs[${b.groupStart ?? b.index}]`;
    const v = `values[${b.index}]`;

    switch (b.type) {
        case BindingType.Node:
            // Handled externally via NodeBinding instances — skip in generated code.
            return `/* node binding ${b.groupStart ?? b.index}: managed by caller */`;

        case BindingType.Property: {
            const prop = _stripPrefix(b.name);
            return `if (${r} && ${r}.prev !== ${v}) { ${r}.prev = ${v}; ${r}.el.${prop} = ${v}; }`;
        }

        case BindingType.Boolean: {
            const attr = JSON.stringify(_stripPrefix(b.name));
            return `if (${r} && ${r}.prev !== ${v}) { ${r}.prev = ${v}; ${v} ? ${r}.el.setAttribute(${attr}, '') : ${r}.el.removeAttribute(${attr}); }`;
        }

        case BindingType.Class: {
            const strings = b.strings || ['', ''];
            const startIdx = b.groupStart ?? b.index;
            const partIndices = Array.from({ length: strings.length - 1 }, (_, k) => startIdx + k);
            
            return `
                if (${r}) {
                    const _next = new Set();
                    ${strings.map((s, i) => {
                        let step = '';
                        if (s.trim()) {
                            step += `${JSON.stringify(s)}.split(/\\s+/).filter(Boolean).forEach(c => _next.add(c));\n`;
                        }
                        if (i < partIndices.length) {
                            const vIdx = partIndices[i];
                            step += `
                                {
                                    const _v = values[${vIdx}];
                                    if (typeof _v === 'string') {
                                        _v.split(/\\s+/).filter(Boolean).forEach(c => _next.add(c));
                                    } else if (typeof _v === 'object' && _v !== null) {
                                        Object.entries(_v).forEach(([k, v]) => { if (v) _next.add(k); });
                                    }
                                }
                            `;
                        }
                        return step;
                    }).join('')}
                    syncClasses(${r}.el, ${r}, _next);
                }
            `;
        }

        case BindingType.Style: {
            const strings = b.strings || ['', ''];
            const startIdx = b.groupStart ?? b.index;
            const isSingle = strings.length === 2 && strings[0] === '' && strings[1] === '';
            
            if (isSingle) {
                return `
                    if (${r}) {
                        const _v = ${v};
                        if (typeof _v === 'string') {
                            syncStyleText(${r}.el, ${r}, _v);
                        } else {
                            setObjectStyle(${r}.el, ${r}, _v);
                        }
                    }
                `;
            }

            const styleParts = strings.map((s, i) => {
                const valIdx = startIdx + i;
                const vPart = `values[${valIdx}]`;
                const processed = `(typeof ${vPart} === 'object' && ${vPart} !== null ? Object.entries(${vPart}).map(([k, val]) => (k.replace(/[A-Z]/g, l => '-' + l.toLowerCase()) + ': ' + (val ?? ''))).join('; ') : (${vPart} == null ? '' : ${vPart}))`;
                return i < strings.length - 1 
                    ? `${JSON.stringify(s)} + ${processed}` 
                    : JSON.stringify(s);
            }).join(' + ');

            return `if (${r}) { syncStyleText(${r}.el, ${r}, ${styleParts}); }`;
        }

        case BindingType.Attribute: {
            const attrName = JSON.stringify(b.name);
            const rPrev = `${r}.p${b.index}`;
            const { strings } = b;
            if (strings && strings.length > 1) {
                const parts = strings.map((s, i) => {
                    const valIdx = (b.groupStart ?? b.index) + i;
                    const val = `(values[${valIdx}] == null ? '' : values[${valIdx}])`;
                    return i < strings.length - 1 
                        ? `${JSON.stringify(s)} + ${val}` 
                        : JSON.stringify(s);
                }).join(' + ');
                return `if (${r} && ${rPrev} !== ${v}) { ${rPrev} = ${v}; ${r}.el.setAttribute(${attrName}, ${parts}); }`;
            }
            return `if (${r} && ${rPrev} !== ${v}) { ${rPrev} = ${v}; ${r}.el.setAttribute(${attrName}, ${v} == null ? '' : String(${v})); }`;
        }

        case BindingType.Event:
            // Events set once at render time — skip on update
            return `/* event: ${b.name} — set at render */`;

        case BindingType.ObjectClass:
            return `if (${r}) { setObjectClass(${r}.el, ${r}.prev, ${v}); ${r}.prev = ${v}; }`;

        case BindingType.ObjectStyle:
            return `if (${r}) { setObjectStyle(${r}.el, ${r}, ${v}); }`;

        case BindingType.Spread:
            return `if (${r} && ${r}.prev !== ${v}) { ${r}.prev = ${v}; Object.assign(${r}.el, ${v}||{}); }`;

        case BindingType.Async: {
            const asyncProp = _stripPrefix(b.name);
            return `if (${r} && ${r}.prev !== ${v}) { ${r}.prev = ${v}; Promise.resolve(${v}).then(rv => { ${r}.el.${asyncProp} = rv; }); }`;
        }

        case BindingType.Bind: {
            const propName = JSON.stringify(_stripPrefix(b.name));
            return `if (${r} && ${r}.prev !== ${v}) { ${r}.prev = ${v}; ${r}.el[${propName}] = ${v}; }`;
        }

        case BindingType.Utility: {
            const utilityName = JSON.stringify(b.name);
            return `if (${r} && ${r}.prev !== ${v}) { ${r}.prev = ${v}; ${r}.utilityState = applyUtilityValue(${r}.el, ${utilityName}, ${v}, ${r}.utilityState); }`;
        }

        case BindingType.Reference:
            return `if (${v} && typeof ${v} === 'object' && ${r}) { ${v}.value = ${r}.el; }`;

        case BindingType.Directive:
            return `/* directive handled at runtime */`;

        default:
            return `setNodeBinding(${r}, ${v});`;
    }
}

function _renderEventCode(b: TemplateBinding, _ri: number): string {
    const r = `refs[${b.groupStart ?? b.index}]`;
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
        if (${r} && ${r}.listener) ${r}.el.removeEventListener(${evt}, ${r}.listener, ${removeOptions});
        if (${r}) ${r}.listener = ${v} ? ${wrappedHandler} : null;
        if (${r} && ${r}.listener) ${r}.el.addEventListener(${evt}, ${r}.listener, ${options});
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
            const fragment = createDOMFragment(html);
            const refs = collectRefs(fragment, ${count});
            ${updateLines}
            return { fragment, refs };
        `;

        // eslint-disable-next-line no-new-func
        return new Function('html', 'values', 'applyUtilityValue', 'clearAppliedUtilities', 'createDOMFragment', src) as CompiledRenderFn;
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
    createDOMFragment: (html: string) => DocumentFragment,
) => { fragment: DocumentFragment; refs: RefSlot[] };

export type CompiledUpdateFn = (
    refs: RefSlot[],
    values: unknown[],
    applyUtilityValue: (...args: any[]) => any,
    clearAppliedUtilities: (...args: any[]) => any,
) => void;
