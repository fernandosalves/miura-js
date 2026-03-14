import { TemplateResult } from './template-result';

/**
 * Minimal interface for TemplateProcessor, used by bindings and directives
 * to avoid circular imports with the concrete TemplateProcessor class.
 */
export interface ITemplateProcessor {
    createInstance(result: TemplateResult, context?: unknown): Promise<ITemplateInstance>;
}

export interface ITemplateInstance {
    getFragment(): DocumentFragment;
    update(values: unknown[], context?: unknown): Promise<void>;
    disconnect(): void;
}

/**
 * Global processor registry — allows ForDirective (and others) to obtain
 * a TemplateProcessor without importing the concrete class.
 * TemplateProcessor registers itself in its constructor.
 */
let _defaultProcessor: ITemplateProcessor | null = null;

export function registerDefaultProcessor(p: ITemplateProcessor): void {
    _defaultProcessor = p;
}

export function getDefaultProcessor(): ITemplateProcessor | null {
    return _defaultProcessor;
}
