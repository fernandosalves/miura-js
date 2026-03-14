import { BaseDirective } from './directive';
import { debugLog } from '../utils/debug';

interface LazyOptions {
    threshold?: number;
    placeholder?: string;
    onLoad?: () => void;
    onError?: (error: Error) => void;
    rootMargin?: string;
}

export class LazyDirective extends BaseDirective {
    private options: LazyOptions = {};
    private observer: IntersectionObserver | null = null;
    private isLoaded = false;

    mount(element: Element) {
        debugLog('lazy', 'Mounting lazy directive');

        this.options = {
            threshold: 0.1,
            rootMargin: '50px',
            ...this.options
        };

        // Set placeholder if provided
        if (this.options.placeholder && element instanceof HTMLImageElement) {
            element.src = this.options.placeholder;
        }

        // Create intersection observer
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !this.isLoaded) {
                        this.loadContent(element);
                    }
                });
            },
            {
                threshold: this.options.threshold,
                rootMargin: this.options.rootMargin
            }
        );

        this.observer.observe(element);
    }

    private loadContent(element: Element) {
        debugLog('lazy', 'Loading lazy content');

        if (element instanceof HTMLImageElement) {
            const originalSrc = element.dataset.src || element.src;
            
            if (originalSrc && originalSrc !== this.options.placeholder) {
                element.src = originalSrc;
                
                element.onload = () => {
                    this.isLoaded = true;
                    this.options.onLoad?.();
                    debugLog('lazy', 'Image loaded successfully');
                };

                element.onerror = (error) => {
                    this.options.onError?.(new Error('Failed to load image'));
                    debugLog('lazy', 'Image failed to load', error);
                };
            }
        } else if (element instanceof HTMLIFrameElement) {
            const originalSrc = element.dataset.src || element.src;
            
            if (originalSrc && originalSrc !== this.options.placeholder) {
                element.src = originalSrc;
                this.isLoaded = true;
                this.options.onLoad?.();
            }
        } else {
            // For other elements, trigger load callback
            this.isLoaded = true;
            this.options.onLoad?.();
        }
    }

    update(options: LazyOptions) {
        this.options = { ...this.options, ...options };
    }

    unmount() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        this.isLoaded = false;
    }
} 