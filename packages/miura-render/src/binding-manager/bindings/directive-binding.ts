import { Binding } from './binding';
import { DirectiveManager } from '../../directives/directive-manager';
import { Directive } from '../../directives/directive';
import { debugLog } from '../../utils/debug';

export class DirectiveBinding implements Binding {
    private directive: Directive | null = null;
    private isLoading = false;
    private loadingPromise: Promise<void> | null = null;

    constructor(
        private element: Element,
        private directiveName: string
    ) {
        debugLog('directiveBinding', ' 🔴 Creating directive binding', {
            element,
            directiveName,
            hasDirective: DirectiveManager.has(directiveName)
        });
    }

    async setValue(value: unknown): Promise<void> {
        debugLog('directiveBinding', 'setValue', {
            value,
            hasDirective: this.directive !== null,
            isLoading: this.isLoading
        });

        if (!this.directive && !this.isLoading) {
            this.isLoading = true;
            
            // Add loading indicator to element
            this.element.setAttribute('data-directive-loading', this.directiveName);
            
            try {
                this.directive = await DirectiveManager.create(this.directiveName, this.element);
                debugLog('directiveBinding', 'Created directive', {
                    directive: this.directive
                });

                if (this.directive) {
                    this.directive.mount(this.element);
                }
            } catch (error) {
                console.error(`Failed to create directive ${this.directiveName}:`, error);
            } finally {
                this.isLoading = false;
                this.element.removeAttribute('data-directive-loading');
            }
        }

        if (this.directive?.update) {
            this.directive.update(value);
        }
    }

    clear(): void {
        if (this.directive?.unmount) {
            this.directive.unmount();
        }
        this.directive = null;
        this.isLoading = false;
        this.loadingPromise = null;
        this.element.removeAttribute('data-directive-loading');
    }

    disconnect(): void {
        this.clear();
    }

    // Helper method to check if directive is loaded
    isLoaded(): boolean {
        return this.directive !== null;
    }

    // Helper method to check if directive is loading
    getLoadingState(): boolean {
        return this.isLoading;
    }
} 