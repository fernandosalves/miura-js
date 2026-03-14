import { BaseDirective } from './directive';
import { debugLog } from '../utils/debug';

interface MutationCallback {
    (mutations: MutationRecord[]): void;
}

interface MutationOptions {
    attributes?: boolean;
    childList?: boolean;
    subtree?: boolean;
    attributeFilter?: string[];
    attributeOldValue?: boolean;
    characterData?: boolean;
    characterDataOldValue?: boolean;
}

export class MutationDirective extends BaseDirective {
    private observer: MutationObserver | null = null;
    private callback: MutationCallback | null = null;
    private options: MutationObserverInit = {
        attributes: true,
        childList: true,
        subtree: true
    };

    constructor(element: Element) {
        super(element);
        debugLog('mutation', 'Creating directive');
    }

    mount(element: Element) {
        debugLog('mutation', 'Mounting observer', { options: this.options });
        
        this.observer = new MutationObserver((mutations) => {
            debugLog('mutation', 'Mutations detected', { 
                count: mutations.length,
                mutations 
            });

            if (this.callback) {
                this.callback(mutations);
            }
        });

        this.observer.observe(element, this.options);
    }

    update(value: unknown) {
        debugLog('mutation', 'Updating', { value });

        // Handle callback update
        if (typeof value === 'function') {
            this.callback = value as MutationCallback;
        }
        
        // Handle options update
        if (value && typeof value === 'object' && 'options' in value) {
            const newOptions = (value as { options: MutationOptions }).options;
            
            // Only update observer if options actually changed
            if (JSON.stringify(newOptions) !== JSON.stringify(this.options)) {
                this.options = newOptions;
                
                // Remount observer with new options
                if (this.observer && this.element) {
                    this.observer.disconnect();
                    this.observer.observe(this.element, this.options);
                }
            }
        }
    }

    unmount() {
        debugLog('mutation', 'Unmounting observer');
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }
} 