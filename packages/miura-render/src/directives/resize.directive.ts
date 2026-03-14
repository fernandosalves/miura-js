import { BaseDirective } from './directive';
import { debugLog } from '../utils/debug';

interface ResizeCallback {
    (entry: ResizeObserverEntry): void;
}

export class ResizeDirective extends BaseDirective {
    private observer: ResizeObserver | null = null;
    private callback: ResizeCallback | null = null;

    constructor(element: Element) {
        super(element);
        debugLog('resize', ' 🟣 Constructor', { element });
    }

    mount(element: Element) {
        debugLog('resize', 'Mount', { element });
        
        this.observer = new ResizeObserver((entries) => {
            debugLog('resize', 'Observer callback', { entries });
            
            const [entry] = entries;
            if (!entry) return;

            let width = 0;
            let height = 0;

            if (entry.borderBoxSize && entry.borderBoxSize[0]) {
                width = entry.borderBoxSize[0].inlineSize;
                height = entry.borderBoxSize[0].blockSize;
            } else if (entry.contentRect) {
                width = entry.contentRect.width;
                height = entry.contentRect.height;
            }

            debugLog('resize', 'Size changed', { width, height });

            if (this.callback) {
                this.callback({
                    contentRect: {
                        width,
                        height,
                        x: 0,
                        y: 0,
                        top: 0,
                        right: width,
                        bottom: height,
                        left: 0
                    } as DOMRectReadOnly,
                    borderBoxSize: entry.borderBoxSize || [],
                    contentBoxSize: entry.contentBoxSize || [],
                    devicePixelContentBoxSize: entry.devicePixelContentBoxSize || [],
                    target: element
                });
            }
        });

        this.observer.observe(element);
    }

    update(callback: ResizeCallback) {
        debugLog('resize', 'Update', { 
            hasCallback: !!callback,
            element: this.element 
        });

        this.callback = callback;

        if (this.element) {
            const rect = this.element.getBoundingClientRect();
            debugLog('resize', 'Initial size', { rect });
            
            this.callback({
                contentRect: rect as DOMRectReadOnly,
                borderBoxSize: [{
                    inlineSize: rect.width,
                    blockSize: rect.height
                }],
                contentBoxSize: [{
                    inlineSize: rect.width,
                    blockSize: rect.height
                }],
                devicePixelContentBoxSize: [],
                target: this.element
            });
        }
    }

    unmount() {
        debugLog('resize', 'Unmount');
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }
} 