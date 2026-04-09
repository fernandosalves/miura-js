import { beforeEach, describe, expect, it } from 'vitest';
import { BindingManager } from './binding-manager';
import { clearDiagnostics, getDiagnostics } from '@miurajs/miura-debugger';
import { BindingType, type TemplateBinding } from '../processor/template-result';

describe('BindingManager diagnostics', () => {
    beforeEach(() => {
        clearDiagnostics();
    });

    it('reports semantic binding labels instead of raw binding indexes', async () => {
        const fragment = document.createDocumentFragment();
        const bindings: TemplateBinding[] = [
            {
                type: BindingType.Node,
                index: 0,
                debugLabel: '[binding:0] text expression for post.title',
            },
        ];

        await expect(
            BindingManager.createAndInitializeParts(fragment, bindings, ['hello']),
        ).rejects.toThrow(/Could not find marker comments \(<!--binding:x-->\) for \[binding:0\] text expression for post.title/);

        const diagnostic = getDiagnostics()[0];
        expect(diagnostic?.subsystem).toBe('render');
        expect(diagnostic?.bindingLabel).toBe('[binding:0] text expression for post.title');
        expect(diagnostic?.message).toContain('[binding:0] text expression for post.title');
        expect(diagnostic?.bindingIndex).toBe(0);
    });

    it('reports labels for missing attribute elements', async () => {
        const fragment = document.createDocumentFragment();
        const bindings: TemplateBinding[] = [
            {
                type: BindingType.Property,
                name: '.disabled',
                index: 0,
                debugLabel: '[binding:0] property .disabled for submit button',
            },
        ];

        // Should successfully report diagnostic via BindingManager.createAndInitializeParts catch block
        await expect(
            BindingManager.createAndInitializeParts(fragment, bindings, [true]),
        ).rejects.toThrow(/Could not find element for \[binding:0\] property .disabled for submit button/);

        const diagnostic = getDiagnostics()[0];
        expect(diagnostic?.message).toContain('[binding:0] property .disabled for submit button');
    });
});
