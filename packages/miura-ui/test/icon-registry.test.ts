import { describe, expect, it } from 'vitest';
import { getIcon, listIcons, registerIcon } from '../src/primitives/icon-registry.js';

describe('icon registry', () => {
    it('resolves built-in Lucide icons through canonical and kebab-case names', () => {
        const canonical = getIcon('cloudCheck');
        const alias = getIcon('cloud-check');
        const numericAlias = getIcon('columns-2');

        expect(canonical).toBeDefined();
        expect(alias).toEqual(canonical);
        expect(numericAlias).toEqual(getIcon('columns2'));
        expect(canonical?.iconNode.length).toBeGreaterThan(0);
        expect(listIcons()).toContain('save');
        expect(listIcons().length).toBeGreaterThan(1600);
    });

    it('keeps legacy path-based custom registrations working', () => {
        registerIcon('labFlask', {
            paths: ['M10 2v6', 'M6 22h12'],
        });

        expect(getIcon('lab-flask')).toEqual({
            viewBox: '0 0 24 24',
            iconNode: [
                ['path', { d: 'M10 2v6' }],
                ['path', { d: 'M6 22h12' }],
            ],
        });
    });

    it('accepts raw icon nodes for custom registrations', () => {
        registerIcon('orb', [['circle', { cx: 12, cy: 12, r: 5 }]]);

        expect(getIcon('orb')).toEqual({
            viewBox: '0 0 24 24',
            iconNode: [['circle', { cx: 12, cy: 12, r: 5 }]],
        });
    });
});
