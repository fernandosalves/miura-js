import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MiuraElement, html, repeat } from '../index';

/**
 * REPRODUCTION ELEMENT
 * Replicates the exact Footer social-link hierarchy.
 */
class MiuraRepro extends MiuraElement {
    static properties = {
        links: { type: Array }
    };

    public links = [
        { label: 'LinkedIn', url: 'https://linkedin.com/in/fernandoalves', icon: 'linkedin.png' },
        { label: 'Medium', url: 'https://medium.com/@editorial', icon: 'medium.png' }
    ];

    template() {
        return html`
            <div class="social-links">
                ${repeat(this.links, (l) => l.label, (link) => html`
                    <a href="${link.url}" target="_blank" rel="noopener noreferrer">
                        <img src="${link.icon}" alt="${link.label}" />
                        <span>${link.label}</span>
                    </a>
                `)}
            </div>
        `;
    }
}

if (!customElements.get('miura-repro')) {
    customElements.define('miura-repro', MiuraRepro);
}

describe('MiuraElement End-to-End Rendering (Phase 2 Hardening)', () => {
    let element: MiuraRepro;

    beforeEach(async () => {
        document.body.innerHTML = '';
        element = document.createElement('miura-repro') as MiuraRepro;
        document.body.appendChild(element);
        await element.updateComplete;
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('should resolve high-fidelity reactive attributes in nested a > img hierarchy', async () => {
        const links = element.shadowRoot?.querySelectorAll('a');
        expect(links?.length).toBe(2);

        // Verify First Link (LinkedIn)
        const link1 = links![0];
        expect(link1.getAttribute('href')).toBe('https://linkedin.com/in/fernandoalves');
        
        const img1 = link1.querySelector('img');
        expect(img1?.getAttribute('src')).toBe('linkedin.png');
        expect(img1?.getAttribute('alt')).toBe('LinkedIn');

        // Verify Second Link (Medium)
        const link2 = links![1];
        expect(link2.getAttribute('href')).toBe('https://medium.com/@editorial');
        
        const img2 = link2.querySelector('img');
        expect(img2?.getAttribute('src')).toBe('medium.png');
        expect(img2?.getAttribute('alt')).toBe('Medium');

        console.log('E2E VERIFIED: MiuraElement correctly renders a > img > span with perfect attribute synchronization.');
    });

    it('should reactively update nested attributes when state changes', async () => {
        // Update the state
        element.links = [
            { label: 'Twitter', url: 'https://twitter.com', icon: 'twitter.png' }
        ];
        await element.updateComplete;

        const links = element.shadowRoot?.querySelectorAll('a');
        expect(links?.length).toBe(1);

        const link = links![0];
        expect(link.getAttribute('href')).toBe('https://twitter.com');
        
        const img = link.querySelector('img');
        expect(img?.getAttribute('src')).toBe('twitter.png');
        expect(img?.getAttribute('alt')).toBe('Twitter');
    });
});
