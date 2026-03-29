import { debugLog } from '../utils/debug';
import { UTILITY_STYLE_ELEMENT_ID, UTILITY_STYLE_TEXT } from './utility-styles';

export type UtilityApplicationState = {
    classes: Set<string>;
    styleKeys: Set<string>;
};

type UtilityInstruction = {
    classes: string[];
    styles: Record<string, string>;
};

const EMPTY_STATE = (): UtilityApplicationState => ({
    classes: new Set<string>(),
    styleKeys: new Set<string>(),
});

const STATIC_TOKEN_CLASS_MAP = new Map<string, string>([
    ['flex', 'miura-u-flex'],
    ['inline-flex', 'miura-u-inline-flex'],
    ['grid', 'miura-u-grid'],
    ['inline-grid', 'miura-u-inline-grid'],
    ['block', 'miura-u-block'],
    ['inline-block', 'miura-u-inline-block'],
    ['hidden', 'miura-u-hidden'],
    ['flex-1', 'miura-u-flex-1'],
    ['grow', 'miura-u-grow'],
    ['grow-0', 'miura-u-grow-0'],
    ['shrink', 'miura-u-shrink'],
    ['shrink-0', 'miura-u-shrink-0'],
    ['wrap', 'miura-u-wrap'],
    ['nowrap', 'miura-u-nowrap'],
    ['row', 'miura-u-row'],
    ['col', 'miura-u-col'],
    ['items-start', 'miura-u-items-start'],
    ['items-center', 'miura-u-items-center'],
    ['items-end', 'miura-u-items-end'],
    ['justify-start', 'miura-u-justify-start'],
    ['justify-center', 'miura-u-justify-center'],
    ['justify-between', 'miura-u-justify-between'],
    ['justify-end', 'miura-u-justify-end'],
    ['place-center', 'miura-u-place-center'],
    ['w-full', 'miura-u-w-full'],
    ['h-full', 'miura-u-h-full'],
    ['w-screen', 'miura-u-w-screen'],
    ['h-screen', 'miura-u-h-screen'],
]);

const TOKEN_PATTERNS: Array<{ regex: RegExp; className: (token: string) => string }> = [
    { regex: /^(gap|p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml)-[0-8]$/, className: (token) => `miura-u-${token}` },
    { regex: /^(cols|rows)-([1-9]|1[0-2])$/, className: (token) => `miura-u-${token}` },
];

const NAMED_STYLE_MAP: Record<string, string> = {
    grow: 'flexGrow',
    shrink: 'flexShrink',
    basis: 'flexBasis',
    padding: 'padding',
    margin: 'margin',
    width: 'width',
    height: 'height',
    'min-width': 'minWidth',
    'max-width': 'maxWidth',
    'min-height': 'minHeight',
    'max-height': 'maxHeight',
    cols: 'gridTemplateColumns',
    rows: 'gridTemplateRows',
    area: 'gridArea',
    place: 'placeItems',
};

function toTokens(value: unknown): string[] {
    if (typeof value === 'string') {
        return value.split(/\s+/).filter(Boolean);
    }

    if (Array.isArray(value)) {
        return value.flatMap((item) => toTokens(item));
    }

    if (value == null || value === false) {
        return [];
    }

    return String(value).split(/\s+/).filter(Boolean);
}

function resolveToken(token: string): string | null {
    const staticClass = STATIC_TOKEN_CLASS_MAP.get(token);
    if (staticClass) return staticClass;

    for (const pattern of TOKEN_PATTERNS) {
        if (pattern.regex.test(token)) {
            return pattern.className(token);
        }
    }

    console.warn(`[miura-render] Unknown utility token: "${token}"`);
    return null;
}

function resolveUtilityAttribute(name: string, value: unknown): UtilityInstruction {
    const cleanName = name.startsWith('%') ? name.slice(1) : name;

    if (!cleanName) {
        const classes = toTokens(value)
            .map(resolveToken)
            .filter((className): className is string => className !== null);

        return { classes, styles: {} };
    }

    if (value === '' && !(cleanName in NAMED_STYLE_MAP)) {
        const utilityClass = resolveToken(cleanName);
        return {
            classes: utilityClass ? [utilityClass] : [],
            styles: {},
        };
    }

    const styleProp = NAMED_STYLE_MAP[cleanName];
    if (styleProp) {
        return {
            classes: [],
            styles: value == null || value === false ? {} : { [styleProp]: String(value) },
        };
    }

    console.warn(`[miura-render] Unknown named utility attribute: "${name}"`);
    return { classes: [], styles: {} };
}

export function ensureUtilityStyles(doc: Document = document): void {
    ensureUtilityStylesInRoot(doc);
}

export function ensureUtilityStylesInRoot(root: Document | ShadowRoot): void {
    if (root.getElementById?.(UTILITY_STYLE_ELEMENT_ID)) return;

    const doc = root instanceof Document ? root : root.ownerDocument;
    if (!doc) return;

    const style = doc.createElement('style');
    style.id = UTILITY_STYLE_ELEMENT_ID;
    style.textContent = UTILITY_STYLE_TEXT;

    if (root instanceof Document) {
        if (!root.head) return;
        root.head.appendChild(style);
        return;
    }

    root.appendChild(style);
}

export function clearAppliedUtilities(
    element: Element,
    previousState?: UtilityApplicationState | null
): UtilityApplicationState {
    const state = previousState ?? EMPTY_STATE();
    const htmlElement = element as HTMLElement;

    state.classes.forEach((className) => element.classList.remove(className));
    state.styleKeys.forEach((styleKey) => {
        (htmlElement.style as any)[styleKey] = '';
    });

    return EMPTY_STATE();
}

export function applyUtilityValue(
    element: Element,
    name: string,
    value: unknown,
    previousState?: UtilityApplicationState | null
): UtilityApplicationState {
    const root = element.getRootNode();
    if (root instanceof ShadowRoot || root instanceof Document) {
        ensureUtilityStylesInRoot(root);
    } else {
        ensureUtilityStyles(element.ownerDocument ?? document);
    }

    const nextState = clearAppliedUtilities(element, previousState);
    const resolved = resolveUtilityAttribute(name, value);
    const htmlElement = element as HTMLElement;

    resolved.classes.forEach((className) => {
        element.classList.add(className);
        nextState.classes.add(className);
    });

    Object.entries(resolved.styles).forEach(([styleKey, styleValue]) => {
        (htmlElement.style as any)[styleKey] = styleValue;
        nextState.styleKeys.add(styleKey);
    });

    debugLog('processor', 'Applied utility value', {
        element: element.tagName,
        name,
        value,
        classes: Array.from(nextState.classes),
        styles: Object.fromEntries(Array.from(nextState.styleKeys).map((styleKey) => [styleKey, (htmlElement.style as any)[styleKey]])),
    });

    return nextState;
}
