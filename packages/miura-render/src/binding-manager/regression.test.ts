import { describe, expect, it } from 'vitest';
import { BindingManager } from './binding-manager';
import { BindingType, type TemplateBinding } from '../processor/template-result';

describe('Textarea and Diagnostic Regressions', () => {
    
    it('fails gracefully when child interpolation is used in textarea (regression)', async () => {
        // Create a fragment simulating what the browser does with <textarea><!--binding:0--></textarea>
        // It converts comments inside textarea to pure text/CDATA nodes.
        const fragment = document.createDocumentFragment();
        const textarea = document.createElement('textarea');
        textarea.textContent = '<!--binding:0--><!--/binding:0-->';
        fragment.appendChild(textarea);

        const bindings: TemplateBinding[] = [
            {
                type: BindingType.Node,
                index: 0,
                debugLabel: 'text expression inside textarea',
            },
        ];

        // This should throw because findNodeMarkers won't find comment nodes inside the textarea string
        await expect(
            BindingManager.createAndInitializeParts(fragment, bindings, ['some content']),
        ).rejects.toThrow(/Could not find node markers for text expression inside textarea/);
    });

    it('works correctly when .value property binding is used in textarea', async () => {
        const fragment = document.createDocumentFragment();
        const container = document.createElement('div');
        // Use innerHTML so jsdom accepts the .value attribute name Miura uses
        container.innerHTML = '<textarea .value="binding:0"></textarea>';
        const textarea = container.querySelector('textarea')!;
        fragment.appendChild(textarea);

        const bindings: TemplateBinding[] = [
            {
                type: BindingType.Property,
                name: '.value',
                index: 0,
                debugLabel: 'property binding .value for textarea',
            },
        ];

        // This should succeed because findBindingElement will find the attribute
        const parts = await BindingManager.createAndInitializeParts(fragment, bindings, ['initial value']);
        expect(parts).toHaveLength(1);
        expect(textarea.value).toBe('initial value');
    });

    it('displays the right debug label in BindingManager errors', async () => {
        const fragment = document.createDocumentFragment();
        const div = document.createElement('div');
        // No markers present
        fragment.appendChild(div);

        const bindings: TemplateBinding[] = [
            {
                type: BindingType.Node,
                index: 0,
                debugLabel: '<span>failed context</span> expression',
            },
        ];

        await expect(
            BindingManager.createAndInitializeParts(fragment, bindings, ['fail']),
        ).rejects.toThrow(/Could not find node markers for <span>failed context<\/span> expression/);
    });
});
