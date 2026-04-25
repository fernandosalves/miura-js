import { beforeEach, describe, expect, it } from 'vitest';
import { BindingManager } from './binding-manager';
import { clearDiagnostics, getDiagnostics } from '@miurajs/miura-debugger';
import { BindingType, type TemplateBinding } from '../processor/template-result';
import { html, trustedHTML } from '../html';
import { TemplateProcessor } from '../processor/processor';

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

    it('warns when a function value reaches node content', async () => {
        const processor = new TemplateProcessor();
        const leaked = () => () => 'not text';

        const instance = await processor.createInstance(html`<p>${leaked}</p>`);
        document.body.appendChild(instance.getFragment());

        const diagnostic = getDiagnostics()[0];
        expect(diagnostic?.severity).toBe('warning');
        expect(diagnostic?.message).toContain('Function value reached a render binding');
        expect(diagnostic?.internalDetails?.code).toBe('template-function-value');
        expect(diagnostic?.advice?.some((item) => item.title === 'Pass a value instead of a function')).toBe(true);
    });

    it('warns when trustedHTML receives non-string content', () => {
        trustedHTML(42 as any);

        const diagnostic = getDiagnostics()[0];
        expect(diagnostic?.severity).toBe('warning');
        expect(diagnostic?.message).toContain('trustedHTML() received a non-string value');
        expect(diagnostic?.internalDetails?.code).toBe('trusted-html-non-string');
    });
});
