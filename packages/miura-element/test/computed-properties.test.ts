import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MiuraElement, html } from '../index.js';

class ComputedDirtyElement extends MiuraElement {
    static override properties = {
        formTitle: { type: String, default: '' },
        originalTitle: { type: String, default: '' },
    };

    declare formTitle: string;
    declare originalTitle: string;

    static override computed = () => ({
        canSave: {
            dependencies: ['formTitle', 'originalTitle'],
            get(this: ComputedDirtyElement) {
                return this.formTitle.trim().length > 0 && this.formTitle !== this.originalTitle;
            }
        }
    });

    declare canSave: boolean;

    template() {
        return html`<button ?disabled=${!this.canSave}>Save draft</button>`;
    }
}

const TAG_NAME = 'computed-dirty-element';
if (!customElements.get(TAG_NAME)) {
    customElements.define(TAG_NAME, ComputedDirtyElement);
}

const waitForRender = async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
};

describe('MiuraElement computed properties', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('recomputes dependent values when reactive properties change', async () => {
        const element = document.createElement(TAG_NAME) as ComputedDirtyElement;
        document.body.appendChild(element);
        await waitForRender();

        const button = element.shadowRoot?.querySelector('button');
        expect(element.canSave).toBe(false);
        expect(button?.disabled).toBe(true);

        element.formTitle = 'Draft title';
        await waitForRender();

        expect(element.canSave).toBe(true);
        expect(button?.disabled).toBe(false);

        element.originalTitle = 'Draft title';
        await waitForRender();

        expect(element.canSave).toBe(false);
        expect(button?.disabled).toBe(true);
    });
});
