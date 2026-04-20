import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MiuraElement, html, when, choose } from '../index';

class ConditionalTemplateRepro extends MiuraElement {
    static properties = {
        showArrow: { type: Boolean },
    };

    public showArrow = false;

    template() {
        return html`
            <div class="header-center">
                ${this.showArrow ? html`
                    <button class="nav-pill ternary-arrow" aria-label="Go up">
                        <span class="nav-arrow">↑</span>
                    </button>
                ` : ''}
                ${when(this.showArrow, () => html`
                    <button class="nav-pill when-arrow" aria-label="Go up">
                        <span class="nav-arrow">↑</span>
                    </button>
                `)}
                ${choose(this.showArrow, [
                    true, () => html`
                        <button class="nav-pill choose-arrow" aria-label="Go up">
                            <span class="nav-arrow">↑</span>
                        </button>
                    `
                ])}
            </div>
        `;
    }
}

if (!customElements.get('conditional-template-repro')) {
    customElements.define('conditional-template-repro', ConditionalTemplateRepro);
}

describe('Conditional template regression', () => {
    let element: ConditionalTemplateRepro;

    beforeEach(async () => {
        document.body.innerHTML = '';
        element = document.createElement('conditional-template-repro') as ConditionalTemplateRepro;
        document.body.appendChild(element);
        await element.updateComplete;
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('does not render either arrow when false', async () => {
        expect(element.shadowRoot?.querySelector('.ternary-arrow')).toBeNull();
        expect(element.shadowRoot?.querySelector('.when-arrow')).toBeNull();
        expect(element.shadowRoot?.querySelector('.choose-arrow')).toBeNull();
    });

    it('renders all arrows when toggled true', async () => {
        element.showArrow = true;
        await element.updateComplete;

        expect(element.shadowRoot?.querySelector('.ternary-arrow')).not.toBeNull();
        expect(element.shadowRoot?.querySelector('.when-arrow')).not.toBeNull();
        expect(element.shadowRoot?.querySelector('.choose-arrow')).not.toBeNull();
    });

    it('removes all arrows when toggled back to false', async () => {
        element.showArrow = true;
        await element.updateComplete;
        element.showArrow = false;
        await element.updateComplete;

        expect(element.shadowRoot?.querySelector('.ternary-arrow')).toBeNull();
        expect(element.shadowRoot?.querySelector('.when-arrow')).toBeNull();
        expect(element.shadowRoot?.querySelector('.choose-arrow')).toBeNull();
    });
});
