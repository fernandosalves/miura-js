import { html, css } from '@miura/miura-element';
import { MuiBase } from '../base/mui-base.js';

type TimelineOrientation = 'vertical' | 'horizontal';

/**
 * Tokenized timeline that supports vertical/horizontal orientations.
 */
export class MuiTimeline extends MuiBase {
    static tagName = 'mui-timeline';

    static properties = {
        orientation: { type: String, reflect: true },
        tone: { type: String, reflect: true },
    };

    orientation: TimelineOrientation = 'vertical';
    tone: 'primary' | 'neutral' | 'success' | 'danger' = 'primary';

    static styles = css`
        :host {
            display: block;
        }

        .timeline {
            display: flex;
            flex-direction: column;
            gap: var(--mui-spacing-lg);
            position: relative;
            padding-left: 2.5rem;
        }

        :host([orientation='horizontal']) .timeline {
            flex-direction: row;
            padding-left: 0;
            padding-top: 2.5rem;
        }

        .line {
            position: absolute;
            background: color-mix(in srgb, var(--mui-color-border) 40%, transparent);
        }

        :host(:not([orientation='horizontal'])) .line {
            left: 1.25rem;
            top: 0;
            bottom: 0;
            width: 2px;
        }

        :host([orientation='horizontal']) .line {
            top: 1.25rem;
            left: 0;
            right: 0;
            height: 2px;
        }

        ::slotted(*) {
            position: relative;
            padding-left: 1rem;
        }

        :host([orientation='horizontal']) ::slotted(*) {
            padding-left: 0;
            padding-top: 1rem;
            flex: 1;
        }

        ::slotted(*)::before {
            content: '';
            position: absolute;
            width: 0.85rem;
            height: 0.85rem;
            border-radius: 50%;
            background: var(--mui-timeline-indicator, var(--mui-color-primary));
            border: 2px solid var(--mui-surface);
            box-shadow: 0 2px 6px rgba(15, 23, 42, 0.12);
        }

        :host(:not([orientation='horizontal'])) ::slotted(*)::before {
            left: -2rem;
            top: 0.35rem;
        }

        :host([orientation='horizontal']) ::slotted(*)::before {
            top: -2rem;
            left: calc(50% - 0.4rem);
        }

        :host([tone='neutral']) {
            --mui-timeline-indicator: var(--mui-color-neutral);
        }

        :host([tone='success']) {
            --mui-timeline-indicator: var(--mui-color-success);
        }

        :host([tone='danger']) {
            --mui-timeline-indicator: var(--mui-color-danger);
        }
    `;

    template() {
        return html`
            <div class="timeline" part="timeline">
                <div class="line" aria-hidden="true"></div>
                <slot></slot>
            </div>
        `;
    }
}

export function registerMuiTimeline() {
    if (!customElements.get(MuiTimeline.tagName)) {
        customElements.define(MuiTimeline.tagName, MuiTimeline);
    }
}

registerMuiTimeline();