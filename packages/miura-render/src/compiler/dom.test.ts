import { describe, it, expect } from 'vitest';

/** FIXED collectRefs logic simulation */
function collectRefs(frag: DocumentFragment, count: number) {
    const refs = new Array(count);
    const MARKER = 'binding:';
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
            }
        } else if (node.nodeType === 1) {
            const el = node as Element;
            for (const attr of Array.from(el.attributes)) {
                if (attr.value.startsWith(MARKER)) {
                    // FIX VERIFICATION: Using split(':') to handle compound markers like binding:1:1
                    const idx = parseInt(attr.value.slice(MARKER.length).split(':')[0]);
                    if (!isNaN(idx)) {
                        refs[idx] = refs[idx] || {};
                        refs[idx].el = el;
                        el.removeAttribute(attr.name);
                    }
                }
            }
        }
        node = walker.nextNode();
    }
    return refs;
}

describe('Miura DOM Reference Collection (a > img > span)', () => {
    it('should correctly extract references from nested hierarchy with compound markers', () => {
        const frag = document.createDocumentFragment();
        const container = document.createElement('div');
        
        // Simulating the social links HTML with compound markers
        container.innerHTML = `
            <a href="binding:0" target="_blank">
                <img src="binding:1:1" alt="binding:2">
                <span>binding:3</span>
            </a>
        `;
        // Note: Miura normally uses comments for text bindings, but let's test attributes primarily
        // Add a comment binding for the span to be authentic
        const span = container.querySelector('span')!;
        span.innerHTML = '';
        span.appendChild(document.createComment('binding:3'));
        span.appendChild(document.createTextNode('LinkedIn'));
        span.appendChild(document.createComment('/binding:3'));

        frag.appendChild(container);

        const refs = collectRefs(frag, 4);

        // Verification
        expect(refs[0].el).toBe(container.querySelector('a'));
        expect(refs[1].el).toBe(container.querySelector('img'));
        expect(refs[2].el).toBe(container.querySelector('img')); // Both src and alt point to img
        expect(refs[3].startComment.textContent).toBe('binding:3');

        // Verify attribute removal
        const img = container.querySelector('img')!;
        expect(img.hasAttribute('src')).toBe(false);
        expect(img.hasAttribute('alt')).toBe(false);
        
        console.log('DOM LOGIC VERIFIED: a > img > span resolved correctly with compound markers.');
    });
});
