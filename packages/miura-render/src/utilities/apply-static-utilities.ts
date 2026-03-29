import { applyUtilityValue } from './utility-resolver';

export function applyStaticUtilities(fragment: DocumentFragment): void {
    const doc = fragment.ownerDocument ?? document;
    const walker = doc.createTreeWalker(fragment, NodeFilter.SHOW_ELEMENT);
    let node = walker.nextNode();

    while (node) {
        const element = node as Element;
        const utilityAttrs = Array.from(element.attributes).filter((attr) => attr.name.startsWith('%'));

        for (const attr of utilityAttrs) {
            if (attr.value.startsWith('binding:')) {
                continue;
            }

            applyUtilityValue(element, attr.name, attr.value);
            element.removeAttribute(attr.name);
        }

        node = walker.nextNode();
    }
}
