 
import { describe, expect, it } from 'vitest';
import { directive, lazyDirective } from './decorators';
import { DirectiveManager } from './directive-manager';

describe('directive decorators', () => {
    it('registers eager directives immediately', async () => {
        const name = `test-directive-${crypto.randomUUID()}`;

        class TestDirective {
            constructor(public element: Element) {}
            mount() {}
            update() {}
        }

        directive(name)(TestDirective);

        expect(DirectiveManager.has(name)).toBe(true);

        const host = document.createElement('div');
        const instance = await DirectiveManager.create(name, host);
        expect(instance).toBeInstanceOf(TestDirective);
    });

    it('registers lazy directives through a loader', async () => {
        const name = `lazy-directive-${crypto.randomUUID()}`;

        class TestLazyDirective {
            constructor(public element: Element) {}
            mount() {}
            update() {}
        }

        lazyDirective(name)(TestLazyDirective);

        expect(DirectiveManager.has(name)).toBe(true);
        expect(DirectiveManager.isLoaded(name)).toBe(false);

        const host = document.createElement('div');
        const instance = await DirectiveManager.create(name, host);
        expect(instance).toBeInstanceOf(TestLazyDirective);
        expect(DirectiveManager.isLoaded(name)).toBe(true);
    });
});
