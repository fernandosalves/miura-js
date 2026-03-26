import { Directive } from "./directive";
import { debugLog } from "../utils/debug";

interface DirectiveLoader {
    (): Promise<any>;
}

export class DirectiveManager {
    private static directives = new Map<string, any>();
    private static directiveLoaders = new Map<string, DirectiveLoader>();
    private static instances = new Map<string, Directive>();
    private static loadingPromises = new Map<string, Promise<any>>();
    private static initialized = false;

    static initialize(directives: Record<string, any>) {
        if (this.initialized) {
            console.warn('DirectiveManager already initialized');
            return;
        }
        
        Object.entries(directives).forEach(([name, directive]) => {
            this.directives.set(name, directive);
        });
        
        this.initialized = true;
    }

    static registerLazyDirective(name: string, loader: DirectiveLoader) {
        this.directiveLoaders.set(name, loader);
        debugLog('directives', `Registered lazy directive: ${name}`);
    }

    static register(name: string, directiveClass: any) {
        this.directives.set(name, directiveClass);
        debugLog('directives', `Registered directive: ${name}`);
    }

    static async create(name: string, element: Element): Promise<Directive | null> {
        // Check if directive is already loaded
        if (this.directives.has(name)) {
            return this.createInstance(name, element);
        }

        // Check if directive has a lazy loader
        const loader = this.directiveLoaders.get(name);
        if (loader) {
            try {
                // Prevent multiple simultaneous loads of the same directive
                if (!this.loadingPromises.has(name)) {
                    this.loadingPromises.set(name, loader());
                }
                
                const directive = await this.loadingPromises.get(name)!;
                this.directives.set(name, directive);
                this.loadingPromises.delete(name);
                
                debugLog('directives', `Lazy loaded directive: ${name}`);
                return this.createInstance(name, element);
            } catch (error) {
                console.error(`Failed to load directive ${name}:`, error);
                this.loadingPromises.delete(name);
                return null;
            }
        }

        debugLog('directives', `Directive not found: ${name}`);
        return null;
    }

    private static createInstance(name: string, element: Element): Directive | null {
        const DirectiveClass = this.directives.get(name);
        const instance = DirectiveClass ? new DirectiveClass(element) : null;
        if (instance) {
            const id = `${name}:${Math.random().toString(36).slice(2)}`;
            this.instances.set(id, instance);
            element.setAttribute('directive-id', id);
            debugLog('directives', `Created directive instance: ${name}`);
        }
        return instance;
    }

    static removeInstance(id: string): void {
        if (!id) return;
        this.instances.delete(id);
    }

    static has(name: string): boolean {
        return this.directives.has(name) || this.directiveLoaders.has(name);
    }

    static isLoaded(name: string): boolean {
        return this.directives.has(name);
    }

    static isLoading(name: string): boolean {
        return this.loadingPromises.has(name);
    }

    static getDirective(id: string): Directive | null {
        return this.instances.get(id) || null;
    }

    static getLoadedDirectives(): string[] {
        return Array.from(this.directives.keys());
    }

    static getRegisteredDirectives(): string[] {
        return [
            ...Array.from(this.directives.keys()),
            ...Array.from(this.directiveLoaders.keys())
        ];
    }

    static async preloadDirective(name: string): Promise<void> {
        if (this.directives.has(name)) {
            return; // Already loaded
        }

        const loader = this.directiveLoaders.get(name);
        if (loader) {
            try {
                if (!this.loadingPromises.has(name)) {
                    this.loadingPromises.set(name, loader());
                }
                const directive = await this.loadingPromises.get(name)!;
                this.directives.set(name, directive);
                this.loadingPromises.delete(name);
                debugLog('directives', `Preloaded directive: ${name}`);
            } catch (error) {
                console.error(`Failed to preload directive ${name}:`, error);
                this.loadingPromises.delete(name);
            }
        }
    }

    static async preloadAllDirectives(): Promise<void> {
        const lazyDirectives = Array.from(this.directiveLoaders.keys());
        const promises = lazyDirectives.map(name => this.preloadDirective(name));
        await Promise.all(promises);
        debugLog('directives', 'Preloaded all directives');
    }

    static clearInstances(): void {
        this.instances.clear();
    }
}
