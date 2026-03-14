import { html, css } from '@miura/miura-element';
import { MuiBase } from '../base/mui-base.js';

type DragAxis = 'x' | 'y' | 'both';

export class MuiDraggable extends MuiBase {
    static tagName = 'mui-draggable';

    static properties = {
        axis: { type: String, reflect: true },
        handle: { type: String },
        ghost: { type: Boolean, reflect: true },
        boundary: { type: String },
    };

    axis: DragAxis = 'both';
    handle: string | null = null;
    ghost = false;
    boundary: string | null = null;

    private startPosition = { x: 0, y: 0 };
    private elementOffset = { x: 0, y: 0 };
    private dragging = false;

    static styles = css`
        :host {
            display: inline-block;
            position: relative;
        }

        .draggable {
            cursor: grab;
            user-select: none;
            border: 1px dashed color-mix(in srgb, var(--mui-color-border) 70%, transparent);
            border-radius: var(--mui-radius-md);
            background: color-mix(in srgb, var(--mui-surface) 95%, transparent);
            padding: var(--mui-spacing-md);
            box-shadow: var(--mui-shadow-soft);
            transition: box-shadow var(--mui-motion-duration-fast) var(--mui-motion-easing-standard);
        }

        :host([ghost]) .draggable {
            box-shadow: none;
            border-style: dotted;
        }

        .draggable:active,
        .draggable.dragging {
            cursor: grabbing;
            box-shadow: var(--mui-shadow-medium);
        }

        .handle ::slotted(*) {
            cursor: grab;
        }
    `;

    firstUpdated(): void {
        const target = this.handle
            ? (this.querySelector(this.handle) as HTMLElement | null)
            : (this.shadowRoot?.querySelector('.draggable') as HTMLElement | null);
        target?.addEventListener('pointerdown', this.onPointerDown);
    }

    disconnectedCallback(): void {
        super.disconnectedCallback?.();
        this.removeEventListener('pointerdown', this.onPointerDown);
        window.removeEventListener('pointermove', this.onPointerMove);
        window.removeEventListener('pointerup', this.onPointerUp);
    }

    private onPointerDown = (event: PointerEvent) => {
        if (event.button !== 0) return;
        this.dragging = true;
        const host = this;
        const rect = host.getBoundingClientRect();
        this.startPosition = { x: event.clientX, y: event.clientY };
        this.elementOffset = { x: rect.left, y: rect.top };
        host.setPointerCapture(event.pointerId);
        window.addEventListener('pointermove', this.onPointerMove);
        window.addEventListener('pointerup', this.onPointerUp);
        this.emit('mui-drag-start', { x: rect.left, y: rect.top });
        this.shadowRoot?.querySelector('.draggable')?.classList.add('dragging');
    };

    private onPointerMove = (event: PointerEvent) => {
        if (!this.dragging) return;
        const deltaX = event.clientX - this.startPosition.x;
        const deltaY = event.clientY - this.startPosition.y;
        const next = { x: this.elementOffset.x + deltaX, y: this.elementOffset.y + deltaY };
        const constrained = this.applyBoundary(next);
        if (this.axis === 'x') {
            this.style.transform = `translate(${constrained.x}px, 0)`;
        } else if (this.axis === 'y') {
            this.style.transform = `translate(0, ${constrained.y}px)`;
        } else {
            this.style.transform = `translate(${constrained.x}px, ${constrained.y}px)`;
        }
        this.emit('mui-dragging', { x: constrained.x, y: constrained.y });
    };

    private onPointerUp = (event: PointerEvent) => {
        if (!this.dragging) return;
        this.dragging = false;
        this.releasePointerCapture(event.pointerId);
        window.removeEventListener('pointermove', this.onPointerMove);
        window.removeEventListener('pointerup', this.onPointerUp);
        this.shadowRoot?.querySelector('.draggable')?.classList.remove('dragging');
        const matrix = new DOMMatrixReadOnly(window.getComputedStyle(this).transform);
        this.emit('mui-drag-end', { x: matrix.m41, y: matrix.m42 });
    };

    private applyBoundary(position: { x: number; y: number }) {
        if (!this.boundary) return position;
        const boundaryElement = document.querySelector(this.boundary) as HTMLElement | null;
        if (!boundaryElement) return position;
        const boundaryRect = boundaryElement.getBoundingClientRect();
        const rect = this.getBoundingClientRect();
        return {
            x: Math.min(Math.max(position.x, boundaryRect.left - rect.left), boundaryRect.right - rect.right),
            y: Math.min(Math.max(position.y, boundaryRect.top - rect.top), boundaryRect.bottom - rect.bottom),
        };
    }

    template() {
        return html`<div class="draggable" part="draggable"><slot></slot></div>`;
    }
}

export function registerMuiDraggable() {
    if (!customElements.get(MuiDraggable.tagName)) {
        customElements.define(MuiDraggable.tagName, MuiDraggable);
    }
}

registerMuiDraggable();