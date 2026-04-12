import { BindingType } from './template-result';
import { debugLog } from '../utils/debug';
import { DirectiveManager } from '../directives/directive-manager';

/**
 * Represents a template binding.
 * @interface TemplateBinding
 */
export interface TemplateBinding {
    /** The type of the binding */
    type: BindingType;
    /** The name of the binding (optional) */
    name?: string;
    /** The index of the binding */
    index: number;
    /** Event modifiers (optional) */
    modifiers?: string[];
    /** For multi-part attribute bindings: static string segments (N+1 entries for N values) */
    strings?: string[];
    /** For multi-part attribute bindings: which part this is (0-based) */
    partIndex?: number;
    /** For multi-part attribute bindings: index of the first binding in the group */
    groupStart?: number;
    /** Human-readable debug context for developer-facing errors */
    debugLabel?: string;
}

/**
 * Represents the result of parsing a template string.
 * @interface ParsedTemplate
 */
export interface ParsedTemplate {
    /** The HTML string with binding markers */
    html: string;
    /** Array of template bindings found in the HTML */
    bindings: TemplateBinding[];
}

/**
 * Parser state machine states
 */
const enum ParserState {
    TEXT = 0,
    TAG = 1,
    ATTR_NAME = 2,
    ATTR_EQ = 3,
    ATTR_VALUE_DQ = 4,
    ATTR_VALUE_SQ = 5,
    COMMENT = 6,
}

/**
 * Context for a multi-part attribute currently being parsed
 */
interface AttrContext {
    name: string;
    prefix: string;
    cleanName: string;
    openQuotePos: number;
    startBindingIndex: number;
    strings: string[];
    partCount: number;
    modifiers: string[];
    foreignNs?: boolean; // true if this attribute is inside SVG/MathML context
}

/**
 * Parser for HTML templates with binding markers.
 * Uses a state machine to correctly handle expressions in any context:
 * text content, single-expression attributes, and multi-expression attributes.
 */
export class TemplateParser {
    private static BINDING_MARKER = 'binding:';
    private static ATTRIBUTE_PREFIX_REGEX = /^([.@?#&:~%]|\.\.\.)/;

    /**
     * Performance tracking
     */
    private metrics = {
        parseTime: 0,
        parseCount: 0,
        cacheHits: 0,
        cacheMisses: 0
    };

    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        return { ...this.metrics };
    }

    /**
     * Reset performance metrics
     */
    resetMetrics() {
        this.metrics = {
            parseTime: 0,
            parseCount: 0,
            cacheHits: 0,
            cacheMisses: 0
        };
    }

    /**
     * Parses template strings and extracts bindings.
     * Handles text/node bindings, single-expression attribute bindings,
     * and multi-expression attribute bindings (e.g. style="color: ${a}; bg: ${b}").
     */
    parse(strings: TemplateStringsArray): ParsedTemplate {
        const startTime = performance.now();
        this.metrics.parseCount++;

        debugLog('parser', 'Starting template parse', {
            stringsLength: strings.length,
            strings: Array.from(strings)
        });

        const bindings: TemplateBinding[] = [];
        let html = '';

        // State machine
        let state: ParserState = ParserState.TEXT;
        let lastAttrName = '';
        let attrNameStart = -1;
        let attrValueContentStart = -1;
        let openQuotePos = -1;

        // Tag tracking for auto-promotion (e.g. textarea interpolation)
        let currentTagName = '';
        let tagNameStart = -1;
        let lastTagOpenHtmlPos = -1;

        // Namespace tracking for foreign content (SVG, MathML)
        // When inside SVG/MathML, attribute binding markers must use data-bN
        // instead of attrName="binding:N" because the HTML parser validates
        // SVG attribute values and rejects "binding:N" for numeric attrs like viewBox.
        const nsStack: string[] = []; // stack of 'svg' | 'math'
        let isClosingTag = false;
        // Check if we're inside a foreign namespace OR currently parsing an svg/math
        // opening tag (its own attributes are parsed before the '>' pushes to nsStack)
        const inForeignNs = () => nsStack.length > 0 || currentTagName === 'svg' || currentTagName === 'math';

        // Multi-part attribute tracking
        let attrCtx: AttrContext | null = null;

        for (let i = 0; i < strings.length; i++) {
            const str = strings[i];
            const isLast = i === strings.length - 1;

            // htmlStart: position in `str` from which we start emitting to `html`.
            // For attribute continuation strings we skip the content (captured in attrCtx.strings).
            let htmlStart = 0;

            // If we're continuing inside an attribute value from the previous string,
            // we must first look for the closing quote.
            if (attrCtx && (state === ParserState.ATTR_VALUE_DQ || state === ParserState.ATTR_VALUE_SQ)) {
                const quote = state === ParserState.ATTR_VALUE_DQ ? '"' : "'";
                const closePos = str.indexOf(quote);

                if (closePos === -1) {
                    // Still inside the attribute — entire string is attribute content
                    if (!isLast) {
                        // Expression inside the same attribute
                        attrCtx.strings.push(str);
                        attrCtx.partCount++;
                        bindings.push({
                            type: BindingType.Attribute,
                            name: attrCtx.name,
                            index: i,
                            partIndex: attrCtx.partCount - 1,
                            groupStart: attrCtx.startBindingIndex,
                        });
                    }
                    // Don't emit anything to HTML for this string
                    continue;
                } else {
                    // Attribute value closes in this string
                    const finalStaticPart = str.substring(0, closePos);
                    attrCtx.strings.push(finalStaticPart);

                    // Assign the completed strings array to the first binding in the group
                    const firstBinding = bindings.find(b => b.index === attrCtx!.startBindingIndex);
                    if (firstBinding) {
                        firstBinding.strings = attrCtx.strings;
                    }

                    // Finalize the attribute type for the group
                    this.finalizeAttrGroup(bindings, attrCtx);

                    const wasForeignNs = attrCtx.foreignNs;
                    attrCtx = null;
                    state = ParserState.TAG;
                    // Resume HTML after closing quote (same for both cases,
                    // but foreign namespace already omitted the opening attrName=")
                    htmlStart = closePos + 1;
                }
            }

            // Scan characters to track state transitions
            let j = htmlStart;
            while (j < str.length) {
                const ch = str[j];

                switch (state) {
                    case ParserState.TEXT:
                        if (ch === '<') {
                            if (str[j + 1] === '!' && str[j + 2] === '-' && str[j + 3] === '-') {
                                state = ParserState.COMMENT;
                                j += 3;
                            } else if (str[j + 1] === '/') {
                                isClosingTag = true;
                                currentTagName = '';
                                state = ParserState.TAG;
                            } else {
                                isClosingTag = false;
                                state = ParserState.TAG;
                                tagNameStart = j + 1;
                                lastTagOpenHtmlPos = html.length + (j - htmlStart);
                            }
                        }
                        break;

                    case ParserState.TAG:
                        if (ch === '>') {
                            if (tagNameStart !== -1) {
                                const tagStr = str.substring(tagNameStart, j);
                                const match = tagStr.match(/^[a-zA-Z0-9-]+/);
                                if (match) {
                                    currentTagName = match[0].toLowerCase();
                                }
                                tagNameStart = -1;
                            }
                            // Track namespace entry/exit
                            if (isClosingTag) {
                                // Closing tag — pop namespace if it matches
                                if (nsStack.length && nsStack[nsStack.length - 1] === currentTagName) {
                                    nsStack.pop();
                                }
                                isClosingTag = false;
                            } else {
                                // Opening tag — push namespace for svg/math
                                if (currentTagName === 'svg' || currentTagName === 'math') {
                                    nsStack.push(currentTagName);
                                }
                            }
                            state = ParserState.TEXT;
                        } else if (ch === '/' && str[j + 1] === '>') {
                            // Self-closing tag — no namespace push needed
                            currentTagName = '';
                            isClosingTag = false;
                            state = ParserState.TEXT;
                            j++;
                        } else if (/\s/.test(ch)) {
                            if (tagNameStart !== -1) {
                                const tagStr = str.substring(tagNameStart, j);
                                const match = tagStr.match(/^[a-zA-Z0-9-]+/);
                                if (match) {
                                    currentTagName = match[0].toLowerCase();
                                }
                                tagNameStart = -1;
                            }
                        } else if (tagNameStart === -1 && !/[\s/]/.test(ch) && ch !== '=' && ch !== '"' && ch !== "'") {
                            // We have already finished the tag name (tagNameStart === -1),
                            // so this must be the start of an attribute name.
                            attrNameStart = j;
                            state = ParserState.ATTR_NAME;
                        }
                        break;

                    case ParserState.ATTR_NAME:
                        if (ch === '=') {
                            lastAttrName = str.substring(attrNameStart, j);
                            state = ParserState.ATTR_EQ;
                        } else if (ch === '>' || /\s/.test(ch)) {
                            lastAttrName = str.substring(attrNameStart, j);
                            state = ch === '>' ? ParserState.TEXT : ParserState.TAG;
                            if (ch === '>') {
                                if (tagNameStart !== -1) {
                                    const tagStr = str.substring(tagNameStart, j);
                                    const match = tagStr.match(/^[a-zA-Z0-9-]+/);
                                    if (match) currentTagName = match[0].toLowerCase();
                                    tagNameStart = -1;
                                }
                            }
                        }
                        break;

                    case ParserState.ATTR_EQ:
                        if (ch === '"') {
                            state = ParserState.ATTR_VALUE_DQ;
                            openQuotePos = j;
                            attrValueContentStart = j + 1;
                        } else if (ch === "'") {
                            state = ParserState.ATTR_VALUE_SQ;
                            openQuotePos = j;
                            attrValueContentStart = j + 1;
                        } else if (!/\s/.test(ch)) {
                            // Unquoted value — scan to whitespace or >
                            const end = str.substring(j).search(/[\s>]/);
                            j += (end === -1 ? str.length - j : end) - 1;
                            state = ParserState.TAG;
                        }
                        break;

                    case ParserState.ATTR_VALUE_DQ:
                        if (ch === '"') {
                            state = ParserState.TAG;
                        }
                        break;

                    case ParserState.ATTR_VALUE_SQ:
                        if (ch === "'") {
                            state = ParserState.TAG;
                        }
                        break;

                    case ParserState.COMMENT:
                        if (ch === '-' && str[j + 1] === '-' && str[j + 2] === '>') {
                            state = ParserState.TEXT;
                            j += 2;
                        }
                        break;
                }
                j++;
            }

            // ── End of string part: if not last, there's an expression ${} here ──
            if (!isLast) {
                if (state === ParserState.COMMENT) {
                    // Expressions inside HTML comments are ignored entirely.
                    // We preserve the surrounding comment markup/text, but do not
                    // create bindings or emit marker placeholders.
                    html += str.substring(htmlStart);
                } else if (state === ParserState.ATTR_VALUE_DQ || state === ParserState.ATTR_VALUE_SQ) {
                    // Expression is inside an attribute value
                    const staticPart = str.substring(attrValueContentStart, str.length);

                    if (!attrCtx) {
                        // First expression in this attribute — start a new group
                        const prefix = lastAttrName.match(TemplateParser.ATTRIBUTE_PREFIX_REGEX)?.[0] || '';
                        const cleanName = prefix ? lastAttrName.slice(1) : lastAttrName;
                        let modifiers: string[] = [];

                        if (prefix === '@') {
                            modifiers = this.parseEventModifiers(cleanName);
                        }

                        attrCtx = {
                            name: lastAttrName,
                            prefix,
                            cleanName: prefix === '@' ? this.getEventBindingName(cleanName) : cleanName,
                            openQuotePos,
                            startBindingIndex: i,
                            strings: [staticPart],
                            partCount: 1,
                            modifiers,
                            foreignNs: inForeignNs(),
                        };

                        // Emit HTML: everything from htmlStart up to and including the opening quote,
                        // then a binding marker as placeholder, then closing quote
                        if (inForeignNs()) {
                            // Inside SVG/MathML: the HTML parser validates attribute values
                            // and rejects both "binding:N" and empty "" for numeric attrs.
                            // Completely omit the attribute and only emit a data-bN marker.
                            // Find where the attribute name starts (skip backwards past = and attr name)
                            let attrNameStartInStr = openQuotePos - 1; // before the opening quote is =
                            while (attrNameStartInStr >= 0 && str[attrNameStartInStr] === '=') attrNameStartInStr--;
                            while (attrNameStartInStr >= 0 && /\S/.test(str[attrNameStartInStr])) attrNameStartInStr--;
                            attrNameStartInStr++; // move to first char of attr name
                            html += str.substring(htmlStart, attrNameStartInStr);
                            html += `data-b${i}`;
                        } else {
                            html += str.substring(htmlStart, openQuotePos + 1);
                            html += `${TemplateParser.BINDING_MARKER}${i}"`;
                        }

                        bindings.push({
                            type: prefix === '%' ? BindingType.Utility : BindingType.Attribute,
                            name: lastAttrName,
                            index: i,
                            partIndex: 0,
                            groupStart: i,
                            debugLabel: this.buildBindingDebugLabel(prefix === '%' ? BindingType.Utility : BindingType.Attribute, lastAttrName, str, i, currentTagName),
                        });
                    } else {
                        // Subsequent expression in same attribute
                        attrCtx.strings.push(staticPart);
                        attrCtx.partCount++;

                        bindings.push({
                            type: attrCtx.prefix === '%' ? BindingType.Utility : BindingType.Attribute,
                            name: attrCtx.name,
                            index: i,
                            partIndex: attrCtx.partCount - 1,
                            groupStart: attrCtx.startBindingIndex,
                            debugLabel: this.buildBindingDebugLabel(attrCtx.prefix === '%' ? BindingType.Utility : BindingType.Attribute, attrCtx.name, str, i),
                        });

                        // Don't emit HTML for intermediate parts
                    }

                    // Next string's attribute content starts at position 0
                    attrValueContentStart = 0;

                } else if (state === ParserState.ATTR_EQ) {
                    // Expression IS the entire attribute value (unquoted): attr=${val}
                    const prefix = lastAttrName.match(TemplateParser.ATTRIBUTE_PREFIX_REGEX)?.[0] || '';
                    const cleanName = prefix ? lastAttrName.slice(1) : lastAttrName;
                    let modifiers: string[] = [];
                    let bindingName = cleanName;

                    if (prefix === '@') {
                        bindingName = this.getEventBindingName(cleanName);
                        modifiers = this.parseEventModifiers(cleanName);
                    }

                    const type = this.getSpecializedType(prefix, bindingName);
                    bindings.push({
                        type,
                        name: prefix === '@' ? bindingName : lastAttrName,
                        index: i,
                        modifiers: modifiers.length > 0 ? modifiers : undefined,
                        strings: ['', ''],
                        partIndex: 0,
                        groupStart: i,
                        debugLabel: this.buildBindingDebugLabel(type, lastAttrName, str, i, currentTagName),
                    });

                    // Emit HTML: up to the = sign, replace with marker
                    if (inForeignNs()) {
                        // Inside SVG/MathML: the HTML parser validates attribute values
                        // and rejects both "binding:N" and empty "" for numeric attrs.
                        // Completely omit the attribute and only emit a data-bN marker.
                        // Find where the attribute name starts (skip backwards past = and attr name)
                        const eqPos = str.lastIndexOf('=');
                        let attrNameStartInStr = eqPos - 1;
                        while (attrNameStartInStr >= 0 && /\S/.test(str[attrNameStartInStr])) attrNameStartInStr--;
                        attrNameStartInStr++; // move to first char of attr name
                        html += str.substring(htmlStart, attrNameStartInStr);
                        html += `data-b${i}`;
                    } else {
                        const eqPos = str.lastIndexOf('=');
                        html += str.substring(htmlStart, eqPos + 1);
                        html += `"${TemplateParser.BINDING_MARKER}${i}"`;
                    }

                    state = ParserState.TAG;

                } else {
                    // TEXT expression — check for Auto-Promotion
                    const autoPromoteTags: Record<string, string> = {
                        'textarea': '.value',
                        'style': '.textContent',
                        'title': '.textContent'
                    };

                    if (autoPromoteTags[currentTagName]) {
                        const propertyName = autoPromoteTags[currentTagName];
                        // Promotion: Convert text interpolation inside raw-text tags to a property binding
                        // on the element itself (e.g. <textarea> -> .value, <style> -> .textContent)

                        // 1. Emit the HTML up to the expression
                        html += str.substring(htmlStart);

                        // 2. We need to patch the opening tag.
                        if (lastTagOpenHtmlPos !== -1) {
                            const tagEndPos = html.indexOf('>', lastTagOpenHtmlPos);
                            if (tagEndPos !== -1) {
                                // Insert the marker attribute
                                const markerAttr = ` ${propertyName}="${TemplateParser.BINDING_MARKER}${i}"`;
                                html = html.slice(0, tagEndPos) + markerAttr + html.slice(tagEndPos);
                            }
                        }

                        bindings.push({
                            type: BindingType.Property,
                            name: propertyName,
                            index: i,
                            debugLabel: `[binding:${i}] text expression promoted to ${propertyName} for <${currentTagName}>`,
                        });
                    } else {
                        // Standard NodeBinding
                        html += str.substring(htmlStart);
                        html += `<!--binding:${i}--><!--/binding:${i}-->`;

                        bindings.push({
                            type: BindingType.Node,
                            index: i,
                            debugLabel: this.buildBindingDebugLabel(BindingType.Node, undefined, str, i, currentTagName),
                        });
                    }
                }
            } else {
                // Last string part — just emit remaining HTML
                html += str.substring(htmlStart);
            }
        }

        this.metrics.parseTime = performance.now() - startTime;
        debugLog('parser', 'Final parsed template', { html, bindings });
        return { html, bindings };
    }

    private getEventBindingName(name: string): string {
        return name.split('|')[0];
    }

    private parseEventModifiers(name: string): string[] {
        return name
            .split('|')
            .slice(1)
            .flatMap((segment) => segment.split(','))
            .map((modifier) => modifier.trim())
            .filter(Boolean)
            .map((modifier) => {
                const [modifierName, modifierValue] = modifier.split(':');
                return modifierValue ? `${modifierName}:${modifierValue}` : modifierName;
            });
    }

    /**
     * After an attribute value closes, determine the final binding type(s) for the group.
     * Single-expression attributes with special prefixes/names use specialized types.
     * Multi-expression or plain attributes use BindingType.Attribute.
     */
    private finalizeAttrGroup(bindings: TemplateBinding[], ctx: AttrContext): void {
        const isSingleExpr = ctx.partCount === 1 && ctx.strings[0] === '' && ctx.strings[1] === '';
        const firstBinding = bindings.find(b => b.index === ctx.startBindingIndex);
        if (!firstBinding) return;

        if (ctx.prefix === '%') {
            firstBinding.type = BindingType.Utility;
            firstBinding.name = ctx.name;
        } else if (isSingleExpr) {
            // Entire attribute value is a single expression — use specialized binding type
            const type = this.getSpecializedType(ctx.prefix, ctx.cleanName);
            firstBinding.type = type;
            firstBinding.name = ctx.prefix === '@' ? ctx.cleanName : ctx.name;
            firstBinding.modifiers = ctx.modifiers.length > 0 ? ctx.modifiers : undefined;
        } else {
            // Multi-expression or has static content — stays as Attribute
            firstBinding.name = ctx.name;
        }
    }

    /**
     * Determine the specialized binding type for a single-expression attribute.
     */
    private getSpecializedType(prefix: string, name: string): BindingType {
        switch (prefix) {
            case '@':
                return BindingType.Event;
            case '?':
                return BindingType.Boolean;
            case '.':
                return BindingType.Property;
            case '&':
                return BindingType.Bind;
            case ':':
                if (name === 'class') return BindingType.Class;
                if (name === 'style') return BindingType.Style;
                return BindingType.Property;
            case '~':
                return BindingType.Async;
            case '%':
                return BindingType.Utility;
            case '...':
                return BindingType.Spread;
            case '#': {
                const directiveName = name.replace(/^#/, '');
                const hasDirective = DirectiveManager.has(directiveName);
                return hasDirective ? BindingType.Directive : BindingType.Reference;
            }
            default:
                if (name === 'class') return BindingType.Class;
                if (name === 'style') return BindingType.Style;
                return BindingType.Attribute;
        }
    }

    private buildBindingDebugLabel(type: BindingType, name: string | undefined, source: string, index: number, currentTagName?: string): string {
        const compact = source.replace(/\s+/g, ' ').trim();
        const snippet = compact.length > 60 ? `...${compact.slice(Math.max(0, compact.length - 60))}` : compact;
        const prefix = `[binding:${index}]`;
        const tagContext = currentTagName ? ` inside <${currentTagName}>` : '';

        let suffix = '';
        if (currentTagName && type === BindingType.Node) {
            const hoistedTags = ['table', 'thead', 'tbody', 'tfoot', 'tr', 'select', 'colgroup'];
            if (hoistedTags.includes(currentTagName)) {
                suffix = ` (Warning: expressions inside <${currentTagName}> may be hoisted by the browser. Move them inside a child tag or use a directive.)`;
            }
        }

        switch (type) {
            case BindingType.Event:
                return `${prefix} event handler ${name ?? '(unknown)'}${tagContext} near "${snippet}"${suffix}`;
            case BindingType.Property:
                return `${prefix} property binding ${name ?? '(unknown)'}${tagContext} near "${snippet}"${suffix}`;
            case BindingType.Boolean:
                return `${prefix} boolean binding ${name ?? '(unknown)'}${tagContext} near "${snippet}"${suffix}`;
            case BindingType.Attribute:
                return `${prefix} attribute expression ${name ?? '(unknown)'}${tagContext} near "${snippet}"${suffix}`;
            case BindingType.Class:
            case BindingType.ObjectClass:
                return `${prefix} class binding${tagContext} near "${snippet}"${suffix}`;
            case BindingType.Style:
            case BindingType.ObjectStyle:
                return `${prefix} style binding${tagContext} near "${snippet}"${suffix}`;
            case BindingType.Bind:
                return `${prefix} two-way bind ${name ?? '(unknown)'}${tagContext} near "${snippet}"${suffix}`;
            case BindingType.Utility:
                return `${prefix} utility ${name ?? '(unknown)'}${tagContext} near "${snippet}"${suffix}`;
            case BindingType.Node:
                return `${prefix} text expression${tagContext} near "${snippet}"${suffix}`;
            case BindingType.Directive:
                return `${prefix} directive ${name ?? '(unknown)'}${tagContext} near "${snippet}"${suffix}`;
            default:
                return `${prefix} ${type} ${name ?? ''}${tagContext}${suffix}`.trim();
        }
    }

}
