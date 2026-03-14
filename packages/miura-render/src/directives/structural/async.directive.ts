import { BaseDirective } from '../directive';
import { debugLog } from '../../utils/debug';

/**
 * Async directive that tracks a Promise and renders the matching
 * `<template>` branch — pending, resolved, or rejected.
 *
 * Usage:
 * ```html
 * <div #async=${this.userPromise}>
 *   <template pending>
 *     <p>Loading…</p>
 *   </template>
 *   <template resolved>
 *     <p>User loaded!</p>
 *   </template>
 *   <template rejected>
 *     <p>Something went wrong</p>
 *   </template>
 * </div>
 * ```
 *
 * The directive scans child `<template>` elements for the `pending`,
 * `resolved`, and `rejected` attributes — exactly like `#switch` scans
 * for `case` / `default`.
 */
export class AsyncDirective extends BaseDirective {
    private pendingTemplate: HTMLTemplateElement | null = null;
    private resolvedTemplate: HTMLTemplateElement | null = null;
    private rejectedTemplate: HTMLTemplateElement | null = null;
    private activeTemplate: HTMLTemplateElement | null = null;
    private currentPromise: Promise<unknown> | null = null;
    private generation = 0;

    // ── Lifecycle ────────────────────────────────────────

    mount(element: Element) {
        debugLog('async', 'Mounting async directive');
        this.element = element;

        // Scan child <template> elements for pending / resolved / rejected
        const templates = Array.from(element.querySelectorAll('template'));
        for (const tpl of templates) {
            if (tpl.hasAttribute('pending')) {
                this.pendingTemplate = tpl;
            } else if (tpl.hasAttribute('resolved')) {
                this.resolvedTemplate = tpl;
            } else if (tpl.hasAttribute('rejected')) {
                this.rejectedTemplate = tpl;
            }
        }

        debugLog('async', 'Templates found', {
            pending: !!this.pendingTemplate,
            resolved: !!this.resolvedTemplate,
            rejected: !!this.rejectedTemplate,
        });
    }

    update(value: unknown) {
        if (!(value instanceof Promise)) {
            debugLog('async', 'Value is not a Promise', { value });
            return;
        }

        // Same promise reference — already tracking
        if (value === this.currentPromise) {
            return;
        }

        this.currentPromise = value;
        const gen = ++this.generation;

        // Show pending template immediately
        this.showTemplate(this.pendingTemplate);

        debugLog('async', 'Tracking promise', { generation: gen });

        value.then(
            (_resolved) => {
                if (gen !== this.generation) return;
                debugLog('async', 'Promise resolved', { generation: gen });
                this.showTemplate(this.resolvedTemplate);
            },
            (_error) => {
                if (gen !== this.generation) return;
                debugLog('async', 'Promise rejected', { generation: gen });
                this.showTemplate(this.rejectedTemplate);
            }
        );
    }

    unmount() {
        this.generation++;
        this.clearRendered();
        this.pendingTemplate = null;
        this.resolvedTemplate = null;
        this.rejectedTemplate = null;
        this.activeTemplate = null;
        this.currentPromise = null;
        this.element = null;
    }

    // ── Internal ─────────────────────────────────────────

    private showTemplate(tpl: HTMLTemplateElement | null): void {
        if (!this.element) return;

        // Remove previously cloned content (non-<template> children)
        this.clearRendered();

        if (tpl) {
            const content = tpl.content.cloneNode(true);
            this.element.appendChild(content);
            this.activeTemplate = tpl;
        }
    }

    private clearRendered(): void {
        if (!this.element) return;

        const nonTemplates = Array.from(this.element.children)
            .filter(child => !(child instanceof HTMLTemplateElement));
        for (const child of nonTemplates) {
            child.remove();
        }
        this.activeTemplate = null;
    }
}

// Re-export for backwards compat — config-based approach is removed
export type AsyncDirectiveConfig = never;
