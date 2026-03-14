import { describe, it, expect, vi } from 'vitest';
import { miuraFramework } from '../src/miura-framework.js';
import type { Plugin } from '../src/types.js';

const uniqueTagName = () => `test-framework-${Math.random().toString(36).slice(2)}`;

function createFrameworkInstance(plugins: Plugin[]) {
    class TestFramework extends miuraFramework {
        static tagName = uniqueTagName();
        static plugins = plugins;
        template() {
            return null;
        }
    }

    const { tagName } = TestFramework;
    if (!customElements.get(tagName)) {
        customElements.define(tagName, TestFramework);
    }

    return document.createElement(tagName) as InstanceType<typeof TestFramework>;
}

describe('miuraFramework plugin lifecycle integration', () => {
    it('emits install/uninstall lifecycle events', async () => {
        const install = vi.fn().mockResolvedValue(undefined);
        const uninstall = vi.fn().mockResolvedValue(undefined);
        const plugin: Plugin = {
            name: 'lifecycle-plugin',
            version: '1.0.0',
            install,
            uninstall,
        };

        const framework = createFrameworkInstance([plugin]);
        const recorded: string[] = [];
        const off = [
            framework.eventBus.on('plugin:installing', (event) => recorded.push(event.type)),
            framework.eventBus.on('plugin:installed', (event) => recorded.push(event.type)),
            framework.eventBus.on('plugin:uninstalling', (event) => recorded.push(event.type)),
            framework.eventBus.on('plugin:uninstalled', (event) => recorded.push(event.type)),
        ];

        await (framework as any)._installPlugins();
        expect(recorded).toEqual(['plugin:installing', 'plugin:installed']);

        recorded.length = 0;
        await (framework as any)._teardownPlugins();
        expect(recorded).toEqual(['plugin:uninstalling', 'plugin:uninstalled']);

        off.forEach((dispose) => dispose());
    });

    it('emits install-failed when a plugin throws during install', async () => {
        const error = new Error('boom');
        const plugin: Plugin = {
            name: 'broken-plugin',
            version: '1.0.0',
            install: vi.fn().mockRejectedValue(error),
        };

        const framework = createFrameworkInstance([plugin]);
        const failures: any[] = [];
        framework.eventBus.on('plugin:install-failed', (event) => failures.push(event));

        await (framework as any)._installPlugins();

        expect(failures).toHaveLength(1);
        expect(failures[0].data.name).toBe('broken-plugin');
        expect(failures[0].data.error).toBe(error);
        expect(failures[0].type).toBe('plugin:install-failed');
    });
});
