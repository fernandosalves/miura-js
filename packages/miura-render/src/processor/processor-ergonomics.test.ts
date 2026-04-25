// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { TemplateProcessor } from './processor';
import { html, trustedHTML, trustHTML } from '../html';
import { signal } from '../../../miura-element/src/signals';

describe('MiuraJS Rendering Ergonomics', () => {
    it('handles multi-part class attributes with smart merging of strings and objects', async () => {
        const processor = new TemplateProcessor();
        const active = true;
        
        // Single expression with static text
        const template1 = html`<div class="btn ${ { active } } extra"></div>`;
        const instance1 = await processor.createInstance(template1);
        const div1 = instance1.getFragment().firstElementChild as HTMLElement;
        expect(div1.className).toBe('btn active extra');

        // Multiple expressions with static text
        const theme = 'dark';
        const template2 = html`<div class="base ${theme} ${ { large: true } }"></div>`;
        const instance2 = await processor.createInstance(template2);
        const div2 = instance2.getFragment().firstElementChild as HTMLElement;
        expect(div2.className).toBe('base dark large');

        // Updates
        await instance2.update(['light', { large: false }]);
        expect(div2.className).toBe('base light');
    });

    it('handles multi-part style attributes with smart merging', async () => {
        const processor = new TemplateProcessor();
        
        // Mixed static and dynamic styles
        const color = 'red';
        const padding = '10px';
        const template = html`<div style="color: ${color}; padding: ${padding}; ${ { marginTop: '5px', marginLeft: '2px' } }"></div>`;
        
        const instance = await processor.createInstance(template);
        const div = instance.getFragment().firstElementChild as HTMLElement;
        
        // Note: browser might normalize style strings
        expect(div.style.color).toBe('red');
        expect(div.style.padding).toBe('10px');
        expect(div.style.marginTop).toBe('5px');
        expect(div.style.marginLeft).toBe('2px');

        // Updates
        await instance.update(['blue', '20px', { marginTop: '0px' }]);
        expect(div.style.color).toBe('blue');
        expect(div.style.padding).toBe('20px');
        expect(div.style.marginTop).toBe('0px');
        expect(div.style.marginLeft).toBe('');
    });

    it('handles ternaries with nested html templates correctly', async () => {
        const processor = new TemplateProcessor();
        
        // Initial state
        const template = html`
            <div id="container">
                ${true ? html`<span id="nested">Nested</span>` : 'Empty'}
            </div>
        `;

        const instance = await processor.createInstance(template);
        document.body.innerHTML = '';
        document.body.appendChild(instance.getFragment());
        
        expect(document.getElementById('nested')).not.toBeNull();
        expect(document.getElementById('container')?.textContent?.trim()).toBe('Nested');

        // Update with text — should morph from TemplateResult to Text
        await instance.update(['Changed to Text']);
        expect(document.getElementById('nested')).toBeNull();
        expect(document.getElementById('container')?.textContent?.trim()).toBe('Changed to Text');

        // Update with another html template — should morph from Text to TemplateResult
        await instance.update([html`<p id="para">New Template</p>`]);
        expect(document.getElementById('para')).not.toBeNull();
        expect(document.getElementById('container')?.textContent?.trim()).toBe('New Template');
    });

    it('propagates context to nested templates in ternaries', async () => {
        const processor = new TemplateProcessor();
        const context = { value: 'secret' };
        
        const template = html`
            <div>
                ${true ? html`<span>Context: ${ (ctx: any) => ctx.value }</span>` : ''}
            </div>
        `;

        const instance = await processor.createInstance(template, context);
        document.body.innerHTML = '';
        document.body.appendChild(instance.getFragment());
        
        expect(document.body.textContent).toContain('Context: secret');
    });

    it('renders trustedHTML as DOM and calls afterRender with the containing element', async () => {
        const processor = new TemplateProcessor();
        let afterRenderRoot: Element | DocumentFragment | null = null;

        const template = html`
            <section id="trusted-root">
                ${trustedHTML('<strong data-kind="trusted">Trusted</strong>', {
                    afterRender(root) {
                        afterRenderRoot = root;
                    }
                })}
            </section>
        `;

        const instance = await processor.createInstance(template);
        document.body.innerHTML = '';
        document.body.appendChild(instance.getFragment());

        const root = document.getElementById('trusted-root') as HTMLElement;
        expect(root.querySelector('[data-kind="trusted"]')?.textContent).toBe('Trusted');
        expect(root.textContent).not.toContain('data-kind');
        expect(afterRenderRoot).toBe(root);
    });

    it('keeps trustHTML as a backwards-compatible alias', async () => {
        const processor = new TemplateProcessor();
        const template = html`<div>${trustHTML('<span id="legacy-trusted">Legacy</span>')}</div>`;
        const instance = await processor.createInstance(template);

        document.body.innerHTML = '';
        document.body.appendChild(instance.getFragment());

        expect(document.getElementById('legacy-trusted')?.textContent).toBe('Legacy');
    });
});
