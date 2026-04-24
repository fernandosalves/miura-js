import { ElementNamespace } from '../html';
import { applyStaticUtilities } from '../utilities/apply-static-utilities';

const HTML_NS = 'http://www.w3.org/1999/xhtml';

const NAMESPACE_ROOTS: Record<string, string> = {
    svg: ElementNamespace.SVG,
    math: ElementNamespace.MathML,
};

const SVG_CHILD_TAGS = new Set([
    'g', 'path', 'circle', 'rect', 'line', 'text', 'ellipse',
    'polygon', 'polyline', 'defs', 'clippath', 'use', 'symbol',
    'image', 'tspan', 'foreignobject', 'lineargradient',
    'radialgradient', 'stop', 'filter', 'fegaussianblur',
    'desc', 'title', 'metadata', 'marker', 'pattern', 'mask',
    'animate', 'animatetransform', 'animatemotion', 'set',
]);

const SVG_VOID_ELEMENTS = new Set([
    'circle', 'ellipse', 'line', 'path', 'polygon', 'polyline',
    'rect', 'stop', 'use', 'image',
]);

const BINDING_RE = /^binding:(\d+)(?::\d+)*$/;

type HoistedElement = Element & { _hoistedSiblings?: Node[] };

export function createDOMFragment(html: string): DocumentFragment {
    const template = document.createElement('template');
    template.innerHTML = html;
    const fragment = document.importNode(template.content, true);
    prepareDOMFragment(fragment);
    return fragment;
}

export function prepareDOMFragment(fragment: DocumentFragment): DocumentFragment {
    applyStaticUtilities(fragment);
    fixNamespaces(fragment);
    insertHoistedSiblings(fragment);
    return fragment;
}

function fixNamespaces(root: DocumentFragment): void {
    for (const [tag, ns] of Object.entries(NAMESPACE_ROOTS)) {
        const elements = root.querySelectorAll(tag);
        for (const el of elements) {
            if (el.namespaceURI === ns) continue;
            if (el.parentElement?.namespaceURI === ns) continue;

            const fixed = recreateInNamespace(el, ns);
            el.parentNode?.replaceChild(fixed, el);
        }
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    const toFix: [Element, string][] = [];
    let node: Element | null;
    while ((node = walker.nextNode() as Element | null)) {
        if (node.namespaceURI === HTML_NS && SVG_CHILD_TAGS.has(node.tagName.toLowerCase())) {
            toFix.push([node, ElementNamespace.SVG]);
        }
    }

    for (let i = toFix.length - 1; i >= 0; i--) {
        const [el, ns] = toFix[i];
        const fixed = recreateInNamespace(el, ns);
        el.parentNode?.replaceChild(fixed, el);
    }
}

function recreateInNamespace(source: Element, namespace: string): Element {
    const recreated = document.createElementNS(namespace, source.tagName.toLowerCase());

    for (const attr of Array.from(source.attributes)) {
        const match = BINDING_RE.exec(attr.value);
        if (match && attr.name.startsWith('@')) {
            recreated.setAttribute(`data-e${match[1]}`, '');
        } else if (match) {
            recreated.setAttribute(`data-b${match[1]}`, '');
        } else if (attr.name.startsWith('@')) {
            recreated.setAttribute(`data-e-${attr.name.slice(1)}`, attr.value);
        } else {
            recreated.setAttributeNS(attr.namespaceURI, attr.name, attr.value);
        }
    }

    const isVoidSvg = namespace === ElementNamespace.SVG &&
        SVG_VOID_ELEMENTS.has(source.tagName.toLowerCase());
    const hoisted: Node[] = [];

    for (const child of Array.from(source.childNodes)) {
        const fixed = child.nodeType === Node.ELEMENT_NODE
            ? recreateInNamespace(child as Element, namespace)
            : child.cloneNode(true);

        if (isVoidSvg) {
            hoisted.push(fixed);
        } else {
            recreated.appendChild(fixed);
        }
    }

    if (hoisted.length > 0) {
        (recreated as HoistedElement)._hoistedSiblings = hoisted;
    }

    return recreated;
}

function insertHoistedSiblings(root: DocumentFragment | Element): void {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    const toInsert: [Element, Node[]][] = [];
    let node: Element | null;
    while ((node = walker.nextNode() as Element | null)) {
        const hoisted = (node as HoistedElement)._hoistedSiblings;
        if (hoisted?.length) {
            toInsert.push([node, hoisted]);
            delete (node as HoistedElement)._hoistedSiblings;
        }
    }

    for (const [el, siblings] of toInsert) {
        const insertBefore = el.nextSibling;
        for (const sibling of siblings) {
            el.parentNode?.insertBefore(sibling, insertBefore);
        }
    }
}
