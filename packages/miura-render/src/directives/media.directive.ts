import { BaseDirective } from './directive';
import { debugLog } from '../utils/debug';

interface MediaBreakpoints {
    mobile?: () => string;
    tablet?: () => string;
    desktop?: () => string;
    [key: string]: (() => string) | undefined;
}

interface MediaOptions {
    breakpoints?: MediaBreakpoints;
    defaultBreakpoint?: string;
    onBreakpointChange?: (breakpoint: string) => void;
}

export class MediaDirective extends BaseDirective {
    private options: MediaOptions = {};
    private currentBreakpoint = '';
    private mediaQueries: Map<string, MediaQueryList> = new Map();
    private breakpointHandlers: Map<string, (e: MediaQueryListEvent) => void> = new Map();

    mount(element: Element) {
        debugLog('media', 'Mounting media directive');

        this.options = {
            defaultBreakpoint: 'desktop',
            breakpoints: {},
            ...this.options
        };

        this.setupMediaQueries();
        this.updateContent(element);
    }

    private setupMediaQueries() {
        const breakpoints = {
            mobile: '(max-width: 768px)',
            tablet: '(min-width: 769px) and (max-width: 1024px)',
            desktop: '(min-width: 1025px)',
            ...this.options.breakpoints
        };

        // Create media query listeners for each breakpoint
        Object.entries(breakpoints).forEach(([breakpoint, query]) => {
            if (typeof query === 'string') {
                const mediaQuery = window.matchMedia(query);
                this.mediaQueries.set(breakpoint, mediaQuery);

                const handler = (e: MediaQueryListEvent) => {
                    if (e.matches) {
                        this.currentBreakpoint = breakpoint;
                        this.options.onBreakpointChange?.(breakpoint);
                        if (this.element) {
                            this.updateContent(this.element);
                        }
                        debugLog('media', 'Breakpoint changed to:', breakpoint);
                    }
                };

                this.breakpointHandlers.set(breakpoint, handler);
                mediaQuery.addEventListener('change', handler);

                // Set initial breakpoint
                if (mediaQuery.matches) {
                    this.currentBreakpoint = breakpoint;
                }
            }
        });

        // Set default if no breakpoint matches
        if (!this.currentBreakpoint) {
            this.currentBreakpoint = this.options.defaultBreakpoint || 'desktop';
        }
    }

    private updateContent(element: Element) {
        const breakpoint = this.currentBreakpoint;
        const breakpoints = this.options.breakpoints || {};
        const renderFunction = breakpoints[breakpoint];

        if (renderFunction && typeof renderFunction === 'function') {
            const content = renderFunction();
            
            if (element instanceof HTMLElement) {
                element.innerHTML = content;
                debugLog('media', 'Updated content for breakpoint:', breakpoint);
            }
        }
    }

    update(options: MediaOptions) {
        this.options = { ...this.options, ...options };
        
        // Re-setup media queries if breakpoints changed
        this.cleanup();
        this.setupMediaQueries();
        
        if (this.element) {
            this.updateContent(this.element);
        }
    }

    private cleanup() {
        // Remove all media query listeners
        this.mediaQueries.forEach((mediaQuery, breakpoint) => {
            const handler = this.breakpointHandlers.get(breakpoint);
            if (handler) {
                mediaQuery.removeEventListener('change', handler);
            }
        });

        this.mediaQueries.clear();
        this.breakpointHandlers.clear();
    }

    unmount() {
        this.cleanup();
    }

    // Public methods
    getCurrentBreakpoint(): string {
        return this.currentBreakpoint;
    }

    isBreakpoint(breakpoint: string): boolean {
        return this.currentBreakpoint === breakpoint;
    }

    isMobile(): boolean {
        return this.currentBreakpoint === 'mobile';
    }

    isTablet(): boolean {
        return this.currentBreakpoint === 'tablet';
    }

    isDesktop(): boolean {
        return this.currentBreakpoint === 'desktop';
    }
} 