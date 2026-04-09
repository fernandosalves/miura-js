import { StructuralDirective } from './structural.directive';
import { debugLog } from '../../utils/debug';

/**
 * Represents one branch in an if / elseif / else chain.
 */
interface Branch {
    type: 'if' | 'elseif' | 'else';
    element: Element;
    comment: Comment;
    showing: boolean;
    /** For 'elseif' — the directive that owns this branch and receives condition updates */
    directive?: ElseIfDirective;
    /** Current condition value (always true for 'else') */
    condition: boolean;
}

/**
 * Enhanced If directive with #else and #elseif support.
 *
 * Usage:
 * ```html
 * <div #if=${condition1}>Shown when condition1 is truthy</div>
 * <div #elseif=${condition2}>Shown when condition2 is truthy</div>
 * <div #else>Shown when all conditions are falsy</div>
 * ```
 *
 * The IfDirective owns the entire chain. ElseIfDirectives register
 * themselves via registerElseIf(). #else elements (static attribute)
 * are detected and claimed during mount().
 */
export class IfDirective extends StructuralDirective {
    private condition = false;
    private chain: Branch[] = [];
    private static readonly OWNER_KEY = '__ifDirectiveOwner';

    mount(element: Element) {
        debugLog('if', 'Mounting if directive with chain support');

        // Create comment placeholder for this #if element
        this.comment = document.createComment('if');
        this.content = element;

        const parent = element.parentNode;
        if (!parent) return;

        parent.replaceChild(this.comment, element);

        // Store the chain owner on both placeholder and live element so
        // siblings can still discover the chain after the active branch is shown.
        (this.comment as any)[IfDirective.OWNER_KEY] = this;
        (element as any)[IfDirective.OWNER_KEY] = this;

        // First branch is always the #if itself
        this.chain.push({
            type: 'if',
            element,
            comment: this.comment,
            showing: false,
            condition: false,
        });

        // Scan forward siblings for #else (static attribute).
        // #elseif elements register themselves later via registerElseIf().
        this.collectElseBranch(this.comment);
    }

    /**
     * Scan forward from the #if comment to find an #else sibling element.
     * Skips over text nodes and #elseif elements (they register themselves).
     */
    private collectElseBranch(startNode: Node): void {
        let sibling = startNode.nextSibling;

        while (sibling) {
            if (sibling.nodeType === Node.ELEMENT_NODE) {
                const el = sibling as Element;

                if (el.hasAttribute('#else')) {
                    debugLog('if', 'Found #else sibling');
                    el.removeAttribute('#else');
                    const elseComment = document.createComment('else');
                    const nextSibling = sibling.nextSibling;
                    sibling.parentNode!.replaceChild(elseComment, sibling);

                    this.chain.push({
                        type: 'else',
                        element: el,
                        comment: elseComment,
                        showing: false,
                        condition: true, // else is always "true" as fallback
                    });
                    break; // #else is always last
                } else if (el.hasAttribute('#elseif') || el.getAttribute('#elseif') !== null) {
                    // Skip — ElseIfDirective will register itself
                    sibling = sibling.nextSibling;
                    continue;
                } else {
                    break; // Not part of the chain
                }
            }

            // Skip text/comment nodes (whitespace between elements)
            sibling = sibling.nextSibling;
        }
    }

    /**
     * Called by ElseIfDirective to register itself in the chain.
     */
    registerElseIf(directive: ElseIfDirective, element: Element, comment: Comment): void {
        debugLog('if', 'Registering #elseif branch');

        const branch: Branch = {
            type: 'elseif',
            element,
            comment,
            showing: false,
            directive,
            condition: false,
        };

        (comment as any)[IfDirective.OWNER_KEY] = this;
        (element as any)[IfDirective.OWNER_KEY] = this;

        // Insert before #else (if present), otherwise append
        const elseIdx = this.chain.findIndex(b => b.type === 'else');
        if (elseIdx !== -1) {
            this.chain.splice(elseIdx, 0, branch);
        } else {
            this.chain.push(branch);
        }

        this.evaluateChain();
    }

    /**
     * Called when a registered ElseIfDirective's condition changes.
     */
    updateElseIfCondition(directive: ElseIfDirective, condition: boolean): void {
        const branch = this.chain.find(b => b.directive === directive);
        if (branch) {
            branch.condition = condition;
            this.evaluateChain();
        }
    }

    protected updateContent(value: unknown): void {
        this.condition = Boolean(value);
        this.chain[0].condition = this.condition;
        this.evaluateChain();
    }

    /**
     * Evaluate the if/elseif/else chain and show exactly one branch.
     */
    private evaluateChain(): void {
        let activeBranch: Branch | null = null;

        for (const branch of this.chain) {
            if (branch.condition) {
                activeBranch = branch;
                break;
            }
        }

        debugLog('if', 'Evaluating chain', {
            chainLength: this.chain.length,
            activeBranch: activeBranch?.type,
        });

        for (const branch of this.chain) {
            const shouldShow = branch === activeBranch;

            if (shouldShow && !branch.showing) {
                // Show: replace comment with element
                branch.comment.parentNode?.replaceChild(branch.element, branch.comment);
                branch.showing = true;
            } else if (!shouldShow && branch.showing) {
                // Hide: replace element with comment
                branch.element.parentNode?.replaceChild(branch.comment, branch.element);
                branch.showing = false;
            }
        }
    }
}

/**
 * ElseIf directive — registers with the preceding IfDirective.
 *
 * Usage:
 * ```html
 * <div #if=${condition1}>A</div>
 * <div #elseif=${condition2}>B</div>
 * ```
 */
export class ElseIfDirective extends StructuralDirective {
    private parentIf: IfDirective | null = null;
    private condition = false;

    mount(element: Element) {
        debugLog('elseif', 'Mounting elseif directive');

        this.content = element;
        this.comment = document.createComment('elseif');

        // Remove the static #elseif attribute if present
        if (element.hasAttribute('#elseif')) {
            element.removeAttribute('#elseif');
        }

        // Scan backward to find the parent IfDirective's comment
        let prev: Node | null = element.previousSibling;
        while (prev) {
            const owner = (prev as any)[IfDirective['OWNER_KEY']];
            if (owner) {
                this.parentIf = owner;
                break;
            }

            // Skip whitespace text nodes
            if (prev.nodeType === Node.TEXT_NODE && prev.textContent?.trim() === '') {
                prev = prev.previousSibling;
                continue;
            }
            // If we hit a non-matching element or comment, stop
            break;
        }

        // Replace element with comment
        const parent = element.parentNode;
        if (parent) {
            parent.replaceChild(this.comment, element);
        }

        // Register with parent IfDirective
        if (this.parentIf) {
            this.parentIf.registerElseIf(this, element, this.comment);
        } else {
            console.warn('#elseif used without a preceding #if directive');
        }
    }

    protected updateContent(value: unknown): void {
        this.condition = Boolean(value);
        if (this.parentIf) {
            this.parentIf.updateElseIfCondition(this, this.condition);
        }
    }
} 
