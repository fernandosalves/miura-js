import { BaseDirective } from '../directive';
import { debugLog } from '../../utils/debug';

export abstract class StructuralDirective extends BaseDirective {
    protected comment: Comment | null = null;
    protected content: Element | null = null;

    constructor(element: Element) {
        super(element);
        debugLog('structural', 'Creating structural directive');
    }

    mount(element: Element) {
        // Create a comment node as placeholder
        this.comment = document.createComment('structural-directive');
        element.parentNode?.replaceChild(this.comment, element);
        this.content = element;
    }

    protected abstract updateContent(value: unknown): void;

    update(value: unknown) {
        debugLog('structural', 'Updating content', { value });
        this.updateContent(value);
    }

    unmount() {
        debugLog('structural', 'Unmounting');
        if (this.content && this.comment?.parentNode) {
            this.comment.parentNode.removeChild(this.comment);
        }
        this.content = null;
        this.comment = null;
    }
} 