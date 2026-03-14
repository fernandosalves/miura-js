import { DirectiveManager } from './directive-manager';

export function directive(name: string) {
    return function(target: any) {
        DirectiveManager.register(name, target);
        return target;
    };
}

export function lazyDirective(name: string) {
    return function(target: any) {
        // For lazy directives, we register them as lazy loadable
        DirectiveManager.registerLazyDirective(name, async () => {
            return target;
        });
        return target;
    };
} 