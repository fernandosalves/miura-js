import type { MiuraFramework } from './miura-framework.js';
import type { Plugin, PluginManager as IPluginManager } from './types.js';

export class PluginManager implements IPluginManager {
    private readonly plugins = new Map<string, Plugin>();

    constructor(private readonly framework: MiuraFramework) { }

    async register(plugin: Plugin): Promise<void> {
        if (this.plugins.has(plugin.name)) {
            console.warn(`Plugin ${plugin.name} is already registered. Reinstalling...`);
            await this.unregister(plugin.name);
        }

        const missingDependencies = (plugin.dependencies || []).filter(
            (dependency) => !this.plugins.has(dependency),
        );

        if (missingDependencies.length > 0) {
            throw new Error(
                `Plugin ${plugin.name} is missing required dependencies: ${missingDependencies.join(', ')}`,
            );
        }

        this.plugins.set(plugin.name, plugin);
        await plugin.install(this.framework);
    }

    get(name: string): Plugin | undefined {
        return this.plugins.get(name);
    }

    getAll(): Plugin[] {
        return Array.from(this.plugins.values());
    }

    async unregister(name: string): Promise<void> {
        const plugin = this.plugins.get(name);
        if (!plugin) return;

        if (plugin.uninstall) {
            await plugin.uninstall(this.framework);
        }

        this.plugins.delete(name);
    }

    async unregisterAll(): Promise<void> {
        const names = Array.from(this.plugins.keys());
        for (const name of names) {
            await this.unregister(name);
        }
    }

    has(name: string): boolean {
        return this.plugins.has(name);
    }
}
