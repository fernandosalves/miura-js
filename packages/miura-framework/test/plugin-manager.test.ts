import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PluginManager } from '../src/plugin-manager.js';
import type { Plugin } from '../src/types.js';

describe('PluginManager', () => {
    const createFramework = () => ({
        eventBus: {
            on: vi.fn(),
            off: vi.fn(),
        },
    }) as any;

    let framework: any;
    let pluginManager: PluginManager;

    beforeEach(() => {
        framework = createFramework();
        pluginManager = new PluginManager(framework);
    });

    it('registers and installs plugins, awaiting async hooks', async () => {
        const install = vi.fn().mockResolvedValue(undefined);
        const plugin: Plugin = {
            name: 'async-plugin',
            version: '1.0.0',
            install,
        };

        await pluginManager.register(plugin);

        expect(install).toHaveBeenCalledWith(framework);
        expect(pluginManager.get(plugin.name)).toBe(plugin);
    });

    it('unregisters plugins and awaits uninstall', async () => {
        const uninstall = vi.fn().mockResolvedValue(undefined);
        const plugin: Plugin = {
            name: 'cleanup-plugin',
            version: '1.0.0',
            install: vi.fn(),
            uninstall,
        };

        await pluginManager.register(plugin);
        await pluginManager.unregister(plugin.name);

        expect(uninstall).toHaveBeenCalledWith(framework);
        expect(pluginManager.get(plugin.name)).toBeUndefined();
    });

    it('reinstalls plugin if already registered', async () => {
        const install = vi.fn().mockResolvedValue(undefined);
        const uninstall = vi.fn().mockResolvedValue(undefined);
        const plugin: Plugin = {
            name: 'duplicate-plugin',
            version: '1.0.0',
            install,
            uninstall,
        };

        await pluginManager.register(plugin);
        await pluginManager.register(plugin);

        expect(uninstall).toHaveBeenCalledTimes(1);
        expect(install).toHaveBeenCalledTimes(2);
    });

    it('unregisterAll tears down every plugin in order', async () => {
        const pluginA: Plugin = {
            name: 'a',
            version: '1.0.0',
            install: vi.fn(),
            uninstall: vi.fn(),
        };
        const pluginB: Plugin = {
            name: 'b',
            version: '1.0.0',
            install: vi.fn(),
            uninstall: vi.fn(),
        };

        await pluginManager.register(pluginA);
        await pluginManager.register(pluginB);
        await pluginManager.unregisterAll();

        expect(pluginA.uninstall).toHaveBeenCalledTimes(1);
        expect(pluginB.uninstall).toHaveBeenCalledTimes(1);
        expect(pluginManager.getAll()).toHaveLength(0);
    });

    it('throws when dependencies are missing', async () => {
        const plugin: Plugin = {
            name: 'needs-analytics',
            version: '1.0.0',
            dependencies: ['analytics', 'logger'],
            install: vi.fn(),
        };

        await expect(pluginManager.register(plugin)).rejects.toThrow(
            /missing required dependencies: analytics, logger/i,
        );
        expect(plugin.install).not.toHaveBeenCalled();
    });

    it('allows dependency resolution when prerequisites are installed first', async () => {
        const analytics: Plugin = {
            name: 'analytics',
            version: '1.0.0',
            install: vi.fn(),
        };
        const dependent: Plugin = {
            name: 'needs-analytics',
            version: '1.0.0',
            dependencies: ['analytics'],
            install: vi.fn(),
        };

        await pluginManager.register(analytics);
        await pluginManager.register(dependent);

        expect(analytics.install).toHaveBeenCalledTimes(1);
        expect(dependent.install).toHaveBeenCalledTimes(1);
    });
});
