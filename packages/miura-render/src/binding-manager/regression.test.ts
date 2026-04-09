import { describe, expect, it } from 'vitest';
import { BindingManager } from './binding-manager';
import { TemplateParser } from '../processor/parser';
import { BindingType, type TemplateBinding } from '../processor/template-result';

describe('Textarea and Diagnostic Regressions', () => {
    const parser = new TemplateParser();

    it('automatically promotes style and title interpolation (Smart Upgrade)', async () => {
        const styleResult = parser.parse(['<style>', '</style>'] as unknown as TemplateStringsArray);
        expect(styleResult.html).toContain('<style .textContent="binding:0">');
        expect(styleResult.bindings[0].name).toBe('.textContent');

        const titleResult = parser.parse(['<title>', '</title>'] as unknown as TemplateStringsArray);
        expect(titleResult.html).toContain('<title .textContent="binding:0">');
        expect(titleResult.bindings[0].name).toBe('.textContent');
    });

    it('detects hoisted tag zones and adds warnings to labels', async () => {
        const tableResult = parser.parse(['<table>', '</table>'] as unknown as TemplateStringsArray);
        expect(tableResult.bindings[0].debugLabel).toContain('Warning: expressions inside <table> may be hoisted');

        const selectResult = parser.parse(['<select>', '</select>'] as unknown as TemplateStringsArray);
        expect(selectResult.bindings[0].debugLabel).toContain('Warning: expressions inside <select> may be hoisted');
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

    it('automatically promotes textarea interpolation to a .value property binding (Smart Upgrade)', async () => {
        const strings = [
            '<textarea>',
            '</textarea>'
        ] as unknown as TemplateStringsArray;
        // The parser should now automatically add .value="binding:0" to the open tag
        const result = parser.parse(strings);

        expect(result.html).toContain('<textarea .value="binding:0">');
        expect(result.html).not.toContain('<!--binding:0-->');
        expect(result.bindings[0].type).toBe(BindingType.Property);
        expect(result.bindings[0].name).toBe('.value');
        expect(result.bindings[0].debugLabel).toContain('[binding:0]');
    });

    it('displays the right debug label in BindingManager errors with searchable index', async () => {
        const fragment = document.createDocumentFragment();
        const bindings: TemplateBinding[] = [
            {
                type: BindingType.Node,
                index: 0,
                debugLabel: '[binding:0] text expression near ">"',
            },
        ];

        // Should fail because markers are missing
        await expect(
            BindingManager.createAndInitializeParts(fragment, bindings, ['hello']),
        ).rejects.toThrow(/Could not find marker comments \(<!--binding:x-->\) for \[binding:0\]/);
    });
});
