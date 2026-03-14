import { DirectiveManager } from './directive-manager';

/**
 * Utility functions for directive management and lazy loading
 */
export class DirectiveUtils {
    /**
     * Preload specific directives for better performance
     * @param directiveNames - Array of directive names to preload
     */
    static async preloadDirectives(directiveNames: string[]): Promise<void> {
        const promises = directiveNames.map(name => DirectiveManager.preloadDirective(name));
        await Promise.all(promises);
    }

    /**
     * Preload all available directives
     */
    static async preloadAllDirectives(): Promise<void> {
        await DirectiveManager.preloadAllDirectives();
    }

    /**
     * Check if a directive is loaded
     * @param directiveName - Name of the directive to check
     */
    static isDirectiveLoaded(directiveName: string): boolean {
        return DirectiveManager.isLoaded(directiveName);
    }

    /**
     * Check if a directive is currently loading
     * @param directiveName - Name of the directive to check
     */
    static isDirectiveLoading(directiveName: string): boolean {
        return DirectiveManager.isLoading(directiveName);
    }

    /**
     * Get all loaded directives
     */
    static getLoadedDirectives(): string[] {
        return DirectiveManager.getLoadedDirectives();
    }

    /**
     * Get all registered directives (both loaded and lazy)
     */
    static getRegisteredDirectives(): string[] {
        return DirectiveManager.getRegisteredDirectives();
    }

    /**
     * Enable debug logging for directive manager
     */
    static enableDebug(): void {
        const { enableDebug } = require('../utils/debug');
        enableDebug({ directiveManager: true });
    }

    /**
     * Create a loading indicator for elements with lazy directives
     * @param element - The element to add loading indicator to
     * @param directiveName - The directive name being loaded
     */
    static addLoadingIndicator(element: Element, directiveName: string): void {
        element.setAttribute('data-directive-loading', directiveName);
        element.classList.add('directive-loading');
    }

    /**
     * Remove loading indicator from element
     * @param element - The element to remove loading indicator from
     */
    static removeLoadingIndicator(element: Element): void {
        element.removeAttribute('data-directive-loading');
        element.classList.remove('directive-loading');
    }

    /**
     * Get loading state of an element
     * @param element - The element to check
     */
    static getElementLoadingState(element: Element): string | null {
        return element.getAttribute('data-directive-loading');
    }
}

/**
 * CSS for directive loading indicators
 */
export const directiveLoadingStyles = `
    .directive-loading {
        position: relative;
        opacity: 0.7;
        pointer-events: none;
    }

    .directive-loading::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 20px;
        height: 20px;
        margin: -10px 0 0 -10px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid #3498db;
        border-radius: 50%;
        animation: directive-spin 1s linear infinite;
        z-index: 1000;
    }

    @keyframes directive-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

/**
 * Auto-inject directive loading styles
 */
export function injectDirectiveLoadingStyles(): void {
    if (!document.getElementById('miura-directive-loading-styles')) {
        const style = document.createElement('style');
        style.id = 'miura-directive-loading-styles';
        style.textContent = directiveLoadingStyles;
        document.head.appendChild(style);
    }
}

// Auto-inject styles when module is imported
injectDirectiveLoadingStyles(); 