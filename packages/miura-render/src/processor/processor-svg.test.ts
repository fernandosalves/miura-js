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

    // ── Sub-template SVG elements (the real chart scenario) ──

    it('should render SVG sub-template with self-closing elements as siblings (not nested)', async () => {
        // This is the core bug: sub-templates like html`<circle cx=${x} cy=${y} r="3" />`
        // are parsed as HTML, where /> is ignored and <circle> becomes an opening tag,
        // nesting subsequent elements inside it.
        const cx = 10;
        const cy = 20;

        const result = html`
            <svg width="100" height="100">
                ${html`<circle cx=${cx} cy=${cy} r="3" fill="red" />`}
                ${html`<circle cx="50" cy="50" r="5" fill="blue" />`}
            </svg>
        `;

        await render(result);

        const circles = container.querySelectorAll('circle');
        expect(circles.length).toBe(2);
        // Both circles should be direct children of <svg>, not nested inside each other
        expect(circles[0].parentElement!.tagName.toLowerCase()).toBe('svg');
        expect(circles[1].parentElement!.tagName.toLowerCase()).toBe('svg');
        expect(circles[0].getAttribute('cx')).toBe('10');
        expect(circles[1].getAttribute('cx')).toBe('50');
    });

    it('should render SVG sub-template with multiple self-closing elements in one template', async () => {
        const x1 = 10;
        const y1 = 20;
        const x2 = 90;
        const y2 = 80;

        // Multiple self-closing elements in a single sub-template
        const result = html`
            <svg width="100" height="100">
                ${html`<line x1=${x1} y1=${y1} x2=${x2} y2=${y2} stroke="black" /><circle cx="50" cy="50" r="5" fill="red" />`}
            </svg>
        `;

        await render(result);

        const line = container.querySelector('line');
        const circle = container.querySelector('circle');
        expect(line).toBeTruthy();
        expect(circle).toBeTruthy();
        // Both should be siblings inside svg, not circle nested inside line
        expect(line!.parentElement!.tagName.toLowerCase()).toBe('svg');
        expect(circle!.parentElement!.tagName.toLowerCase()).toBe('svg');
        expect(line!.getAttribute('x1')).toBe('10');
    });

    it('should handle event bindings on SVG sub-template elements', async () => {
        let entered = false;
        let left = false;

        const result = html`
            <svg width="100" height="100">
                ${html`<circle @mouseenter=${() => { entered = true; }} @mouseleave=${() => { left = true; }} cx="50" cy="50" r="25" fill="red" />`}
            </svg>
        `;

        await render(result);

        const circle = container.querySelector('circle')!;
        expect(circle).toBeTruthy();
        circle.dispatchEvent(new MouseEvent('mouseenter'));
        expect(entered).toBe(true);
        circle.dispatchEvent(new MouseEvent('mouseleave'));
        expect(left).toBe(true);
    });

    it('should render chart-like template with mapped series', async () => {
        // Simulates the real mui-chart pattern
        const series = [
            { key: 'a', color: 'red' },
            { key: 'b', color: 'blue' },
        ];
        const data = [
            { a: 10, b: 20 },
            { a: 30, b: 40 },
        ];

        const result = html`
            <svg viewBox="0 0 100 100">
                ${series.map((s) => {
            const points = data.map((p, i) => ({ x: i * 50, y: 100 - Number(p[s.key]) }));
            const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
            return html`<path d=${d} stroke=${s.color} fill="none" />`;
        })}
            </svg>
        `;

        await render(result);

        const paths = container.querySelectorAll('path');
        expect(paths.length).toBe(2);
        expect(paths[0].getAttribute('stroke')).toBe('red');
        expect(paths[1].getAttribute('stroke')).toBe('blue');
        // Both paths should be direct children of svg
        expect(paths[0].parentElement!.tagName.toLowerCase()).toBe('svg');
        expect(paths[1].parentElement!.tagName.toLowerCase()).toBe('svg');
    });

    it('should render bar chart pattern with nested map + flat', async () => {
        const series = [
            { key: 'a', color: 'red' },
            { key: 'b', color: 'blue' },
        ];
        const data = [
            { label: 'X', a: 10, b: 20 },
            { label: 'Y', a: 30, b: 40 },
        ];

        const result = html`
            <svg viewBox="0 0 200 100">
                ${data.map((point, i) => {
            return series.map((s) => {
                const val = Number(point[s.key]) || 0;
                return html`<rect x=${i * 100} y=${100 - val} width="40" height=${val} fill=${s.color} />`;
            });
        }).flat()}
            </svg>
        `;

        await render(result);

        const rects = container.querySelectorAll('rect');
        expect(rects.length).toBe(4);
        // All rects should be direct children of svg
        for (const rect of rects) {
            expect(rect.parentElement!.tagName.toLowerCase()).toBe('svg');
        }
    });

    it('should not produce stray /> text nodes in SVG output', async () => {
        const result = html`
            <svg width="100" height="100">
                <line x1="10" y1="10" x2="90" y2="90" stroke="black" />
            </svg>
        `;

        await render(result);

        // Check no stray "/>" text nodes exist
        const svg = container.querySelector('svg')!;
        const textNodes: string[] = [];
        const walker = document.createTreeWalker(svg, NodeFilter.SHOW_TEXT);
        let node: Node | null;
        while ((node = walker.nextNode())) {
            if (node.textContent?.trim()) {
                textNodes.push(node.textContent.trim());
            }
        }
        expect(textNodes).not.toContain('/>');
        expect(textNodes.length).toBe(0);
    });
});
