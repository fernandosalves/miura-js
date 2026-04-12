import { TemplateProcessor } from './processor';
import { html } from '../html';
import { describe, beforeEach, afterEach, expect, it } from 'vitest';
import '../directives/lazy-setup';

describe('SVG and Foreign Namespace Bindings', () => {
    let processor: TemplateProcessor;
    let container: HTMLElement;

    beforeEach(() => {
        processor = new TemplateProcessor();
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        container.remove();
    });

    async function render(result: ReturnType<typeof html>) {
        const instance = await processor.createInstance(result);
        container.appendChild(instance.getFragment());
        return container;
    }

    // ── SVG attribute bindings ──

    it('should bind SVG numeric attributes (viewBox, x, y, width, height)', async () => {
        const vb = '0 0 600 200';
        const rectX = 10;
        const rectY = 20;
        const rectW = 100;
        const rectH = 50;

        const result = html`
            <svg viewBox=${vb} width="600" height="200">
                <rect x=${rectX} y=${rectY} width=${rectW} height=${rectH} fill="red" />
            </svg>
        `;

        await render(result);

        const svg = container.querySelector('svg');
        expect(svg).toBeTruthy();
        expect(svg!.getAttribute('viewBox')).toBe(vb);
        // SVG elements should be in the SVG namespace
        expect(svg!.namespaceURI).toBe('http://www.w3.org/2000/svg');

        const rect = container.querySelector('rect');
        expect(rect).toBeTruthy();
        expect(rect!.getAttribute('x')).toBe('10');
        expect(rect!.getAttribute('y')).toBe('20');
        expect(rect!.getAttribute('width')).toBe('100');
        expect(rect!.getAttribute('height')).toBe('50');
        expect(rect!.namespaceURI).toBe('http://www.w3.org/2000/svg');
    });

    it('should bind multi-expression SVG attributes', async () => {
        const x1 = 10;
        const y1 = 20;

        const result = html`
            <svg width="100" height="100">
                <line x1=${x1} y1=${y1} x2="90" y2="90" stroke="black" />
            </svg>
        `;

        await render(result);

        const line = container.querySelector('line');
        expect(line).toBeTruthy();
        expect(line!.getAttribute('x1')).toBe('10');
        expect(line!.getAttribute('y1')).toBe('20');
        expect(line!.namespaceURI).toBe('http://www.w3.org/2000/svg');
    });

    it('should bind SVG text content (text node inside SVG)', async () => {
        const label = 'Hello SVG';

        const result = html`
            <svg width="100" height="30">
                <text x="10" y="20">${label}</text>
            </svg>
        `;

        await render(result);

        const text = container.querySelector('text');
        expect(text).toBeTruthy();
        expect(text!.textContent).toBe('Hello SVG');
        expect(text!.namespaceURI).toBe('http://www.w3.org/2000/svg');
    });

    it('should bind SVG path d attribute', async () => {
        const pathD = 'M10,20 L90,20 L90,80 Z';

        const result = html`
            <svg width="100" height="100">
                <path d=${pathD} fill="blue" />
            </svg>
        `;

        await render(result);

        const path = container.querySelector('path');
        expect(path).toBeTruthy();
        expect(path!.getAttribute('d')).toBe(pathD);
    });

    it('should bind SVG circle attributes (cx, cy, r)', async () => {
        const cx = 50;
        const cy = 50;
        const r = 25;

        const result = html`
            <svg width="100" height="100">
                <circle cx=${cx} cy=${cy} r=${r} fill="green" />
            </svg>
        `;

        await render(result);

        const circle = container.querySelector('circle');
        expect(circle).toBeTruthy();
        expect(circle!.getAttribute('cx')).toBe('50');
        expect(circle!.getAttribute('cy')).toBe('50');
        expect(circle!.getAttribute('r')).toBe('25');
        expect(circle!.namespaceURI).toBe('http://www.w3.org/2000/svg');
    });

    it('should handle nested SVG elements (g, rect inside g)', async () => {
        const gx = 10;

        const result = html`
            <svg width="200" height="200">
                <g transform=${`translate(${gx}, 0)`}>
                    <rect x="0" y="0" width="50" height="50" fill="orange" />
                </g>
            </svg>
        `;

        await render(result);

        const g = container.querySelector('g');
        expect(g).toBeTruthy();
        expect(g!.getAttribute('transform')).toBe('translate(10, 0)');
        expect(g!.namespaceURI).toBe('http://www.w3.org/2000/svg');

        const rect = container.querySelector('rect');
        expect(rect).toBeTruthy();
        expect(rect!.namespaceURI).toBe('http://www.w3.org/2000/svg');
    });

    it('should update SVG attribute bindings on re-render', async () => {
        const result = html`
            <svg width="100" height="100">
                <circle cx=${50} cy=${50} r=${25} fill="red" />
            </svg>
        `;

        const instance = await processor.createInstance(result);
        container.appendChild(instance.getFragment());

        const circle = container.querySelector('circle')!;
        expect(circle.getAttribute('cx')).toBe('50');
        expect(circle.getAttribute('r')).toBe('25');

        // Update with new values
        await instance.update([75, 75, 30]);
        expect(circle.getAttribute('cx')).toBe('75');
        expect(circle.getAttribute('cy')).toBe('75');
        expect(circle.getAttribute('r')).toBe('30');
    });

    it('should handle SVG with mixed static and dynamic attributes', async () => {
        const fill = 'purple';

        const result = html`
            <svg width="100" height="100">
                <rect x="10" y="10" width="80" height="80" fill=${fill} />
            </svg>
        `;

        await render(result);

        const rect = container.querySelector('rect');
        expect(rect).toBeTruthy();
        expect(rect!.getAttribute('x')).toBe('10');
        expect(rect!.getAttribute('fill')).toBe('purple');
    });

    // ── MathML (another foreign namespace) ──

    it('should bind MathML attribute values', async () => {
        const mathDisplay = 'block';

        const result = html`
            <math display=${mathDisplay}>
                <mfrac>
                    <mi>x</mi>
                    <mn>1</mn>
                </mfrac>
            </math>
        `;

        await render(result);

        const math = container.querySelector('math');
        expect(math).toBeTruthy();
        expect(math!.getAttribute('display')).toBe('block');
        expect(math!.namespaceURI).toBe('http://www.w3.org/1998/Math/MathML');
    });

    // ── Property bindings on SVG elements ──

    it('should handle class attribute bindings on SVG elements', async () => {
        const cls = 'my-circle';

        const result = html`
            <svg width="100" height="100">
                <circle class=${cls} cx="50" cy="50" r="25" />
            </svg>
        `;

        await render(result);

        const circle = container.querySelector('circle');
        expect(circle).toBeTruthy();
        // jsdom may normalize SVG class attribute; check both attribute and className property
        expect(circle!.getAttribute('class') || (circle as any).className?.baseVal).toContain('my-circle');
    });

    it('should handle multi-expression viewBox attribute', async () => {
        const x = 0;
        const y = 0;
        const w = 600;
        const h = 200;

        const result = html`
            <svg viewBox="${x} ${y} ${w} ${h}">
                <rect x="10" y="10" width="50" height="50" />
            </svg>
        `;

        await render(result);

        const svg = container.querySelector('svg');
        expect(svg).toBeTruthy();
        expect(svg!.getAttribute('viewBox')).toBe('0 0 600 200');
    });

    it('should handle SVG style attribute binding', async () => {
        const opacity = '0.5';

        const result = html`
            <svg width="100" height="100">
                <rect style=${`opacity: ${opacity}`} x="0" y="0" width="100" height="100" />
            </svg>
        `;

        await render(result);

        const rect = container.querySelector('rect');
        expect(rect).toBeTruthy();
        // jsdom normalizes style with trailing semicolons
        expect(rect!.getAttribute('style')).toContain('opacity: 0.5');
    });

    // ── Property bindings on SVG elements ──

    it('should handle .className property binding on SVG elements (falls back to class attribute)', async () => {
        const cls = 'my-circle';

        const result = html`
            <svg width="100" height="100">
                <circle .className=${cls} cx="50" cy="50" r="25" />
            </svg>
        `;

        await render(result);

        const circle = container.querySelector('circle');
        expect(circle).toBeTruthy();
        // SVG className is read-only (SVGAnimatedString), so property binding
        // should fall back to setting the 'class' attribute
        expect(circle!.getAttribute('class')).toBe('my-circle');
    });

    // ── Event bindings on SVG elements ──

    it('should handle event bindings on SVG elements', async () => {
        let clicked = false;

        const result = html`
            <svg width="100" height="100">
                <rect @click=${() => { clicked = true; }} x="0" y="0" width="100" height="100" fill="blue" />
            </svg>
        `;

        await render(result);

        const rect = container.querySelector('rect')!;
        rect.dispatchEvent(new MouseEvent('click'));
        expect(clicked).toBe(true);
    });
});
