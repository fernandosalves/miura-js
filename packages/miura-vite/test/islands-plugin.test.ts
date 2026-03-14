import { describe, it, expect } from 'vitest';
import { islandsPlugin } from '../src/islands-plugin.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Invoke the plugin's transformIndexHtml hook directly. */
function transform(html: string, options: Parameters<typeof islandsPlugin>[0] = {}): string {
    const plugin = islandsPlugin(options);
    const hook = plugin.transformIndexHtml as (html: string) => string;
    return hook(html);
}

// ── Passthrough ────────────────────────────────────────────────────────────────

describe('islandsPlugin — passthrough', () => {
    it('returns HTML unchanged when no islands are present', () => {
        const input = '<html><body><div>hello</div></body></html>';
        expect(transform(input)).toBe(input);
    });

    it('ignores elements without a component attribute', () => {
        const input = '<miura-island></miura-island>';
        expect(transform(input)).toBe(input);
    });
});

// ── hydrate attribute injection ────────────────────────────────────────────────

describe('islandsPlugin — hydrate attribute', () => {
    it('injects hydrate="load" when the attribute is missing', () => {
        const out = transform('<miura-island component="my-counter"></miura-island>');
        expect(out).toContain('hydrate="load"');
    });

    it('preserves an existing hydrate attribute', () => {
        const out = transform('<miura-island component="app-chart" hydrate="visible"></miura-island>');
        expect(out).toContain('hydrate="visible"');
        expect(out).not.toMatch(/hydrate="load"/);
    });

    it('uses the component config default hydrate when attribute is missing', () => {
        const out = transform(
            '<miura-island component="app-chart"></miura-island>',
            { components: { 'app-chart': { hydrate: 'idle' } } },
        );
        expect(out).toContain('hydrate="idle"');
    });
});

// ── <script type="application/json"> injection ────────────────────────────────

describe('islandsPlugin — props script injection', () => {
    it('injects a <script type="application/json"> with config props', () => {
        const out = transform(
            '<miura-island component="my-counter"></miura-island>',
            { components: { 'my-counter': { props: { count: 5 } } } },
        );
        expect(out).toContain('<script type="application/json">');
        expect(out).toContain('"count":5');
    });

    it('preserves an existing <script type="application/json">', () => {
        const input = `<miura-island component="my-counter">
  <script type="application/json">{"count":10}</script>
</miura-island>`;
        const out = transform(input);
        expect(out).toContain('"count":10');
    });

    it('merges config props with existing script props (existing wins)', () => {
        const input = `<miura-island component="my-counter">
  <script type="application/json">{"count":99,"extra":"yes"}</script>
</miura-island>`;
        const out = transform(input, {
            components: { 'my-counter': { props: { count: 0, label: 'x' } } },
        });
        // existing "count" overrides config default
        expect(out).toContain('"count":99');
        // config key not in existing script is merged in
        expect(out).toContain('"label":"x"');
        expect(out).toContain('"extra":"yes"');
    });

    it('emits {} when no props in config or HTML', () => {
        const out = transform('<miura-island component="x"></miura-island>');
        expect(out).toContain('<script type="application/json">{}');
    });
});

// ── Placeholder injection ─────────────────────────────────────────────────────

describe('islandsPlugin — placeholder injection', () => {
    it('injects default placeholder when island body is empty', () => {
        const out = transform('<miura-island component="my-counter"></miura-island>');
        expect(out).toContain('data-island-placeholder="my-counter"');
    });

    it('uses the string placeholder from component config', () => {
        const out = transform(
            '<miura-island component="my-counter"></miura-island>',
            { components: { 'my-counter': { placeholder: '<span>Loading…</span>' } } },
        );
        expect(out).toContain('<span>Loading…</span>');
    });

    it('calls a function placeholder with the resolved props', () => {
        let capturedProps: Record<string, unknown> | null = null;
        const out = transform(
            '<miura-island component="my-counter"></miura-island>',
            {
                components: {
                    'my-counter': {
                        props: { count: 7 },
                        placeholder: (props) => {
                            capturedProps = props;
                            return `<span>${props.count}</span>`;
                        },
                    },
                },
            },
        );
        expect(out).toContain('<span>7</span>');
        expect(capturedProps).toEqual({ count: 7 });
    });

    it('uses globalPlaceholder when no component placeholder is set', () => {
        const out = transform(
            '<miura-island component="app-chart"></miura-island>',
            {
                placeholder: (component) => `<div class="ph">${component}</div>`,
            },
        );
        expect(out).toContain('<div class="ph">app-chart</div>');
    });

    it('does not inject a placeholder when the island already has body content', () => {
        const input = `<miura-island component="my-counter">
  <script type="application/json">{"count":5}</script>
  <my-counter count="5">5</my-counter>
</miura-island>`;
        const out = transform(input);
        expect(out).not.toContain('data-island-placeholder');
        expect(out).toContain('<my-counter count="5">5</my-counter>');
    });
});

// ── Multiple islands in one HTML string ────────────────────────────────────────

describe('islandsPlugin — multiple islands', () => {
    it('processes all islands in the document', () => {
        const input = `
<miura-island component="a"></miura-island>
<miura-island component="b" hydrate="visible"></miura-island>
        `;
        const out = transform(input, {
            components: {
                a: { props: { x: 1 } },
                b: { props: { y: 2 } },
            },
        });
        expect(out).toContain('"x":1');
        expect(out).toContain('"y":2');
        expect(out).toContain('hydrate="visible"');
    });
});
