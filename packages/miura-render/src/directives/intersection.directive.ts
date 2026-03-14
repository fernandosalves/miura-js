import { BaseDirective } from './directive';
import { debugLog } from '../utils/debug';

interface IntersectionOptions {
    threshold?: number | number[];
    root?: Element | null;
    rootMargin?: string;
}

export class IntersectionDirective extends BaseDirective {
    private observer: IntersectionObserver | null = null;
    private callback: ((isVisible: boolean) => void) | null = null;
    private options: IntersectionOptions = {
        threshold: 0.1,
        rootMargin: '0px'
    };

    constructor(element: Element) {
        super(element);
        debugLog('intersect', 'Creating directive');
    }

    mount(element: Element) {
        debugLog('intersect', 'Mounting observer', { options: this.options });
        
        this.observer = new IntersectionObserver((entries) => {
            const [entry] = entries;
            debugLog('intersect', 'Intersection change', {
                isIntersecting: entry.isIntersecting,
                intersectionRatio: entry.intersectionRatio,
                threshold: this.options.threshold
            });

            if (this.callback) {
                this.callback(entry.isIntersecting);
            }
        }, this.options);

        this.observer.observe(element);
    }

    update(callback: (isVisible: boolean) => void) {
        debugLog('intersect', 'Updating callback');
        this.callback = callback;
    }

    unmount() {
        debugLog('intersect', 'Unmounting observer');
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }

    // Allow updating options
    setOptions(options: Partial<IntersectionOptions>) {
        Object.assign(this.options, options);
        // Remount observer if it exists
        if (this.observer && this.element) {
            this.observer.disconnect();
            this.mount(this.element);
        }
    }
} 