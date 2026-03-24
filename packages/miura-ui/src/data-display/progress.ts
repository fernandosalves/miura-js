import { html, css } from '@miurajs/miura-element';
import { MuiBase } from '../base/mui-base.js';

type ProgressVariant = 'linear' | 'circular';

/**
 * Tokenized progress indicator supporting linear/circular modes.
 */
export class MuiProgress extends MuiBase {
    static tagName = 'mui-progress';

    static properties = {
        value: { type: Number },
        max: { type: Number },
        variant: { type: String, reflect: true },
        indeterminate: { type: Boolean, reflect: true },
    };

    value = 0;
    max = 100;
    variant: ProgressVariant = 'linear';
    indeterminate = false;

    private get percent(): number {
        if (this.max <= 0) return 0;
        return Math.min(100, Math.max(0, (this.value / this.max) * 100));
    }

    static styles = css`
        :host {
            display: inline-flex;
            width: 100%;
            justify-content: center;
        }

        .linear {
            width: 100%;
            height: 0.5rem;
            background: color-mix(in srgb, var(--mui-color-border) 30%, transparent);
            border-radius: var(--mui-radius-pill);
            overflow: hidden;
            position: relative;
        }

        .bar {
            height: 100%;
            background: var(--mui-color-primary);
            transition: width 0.2s ease;
            width: var(--mui-progress-percent, 0%);
        }

        :host([indeterminate]) .bar {
            width: 40%;
            animation: indeterminate 1.5s infinite;
        }

        @keyframes indeterminate {
            0% {
                transform: translateX(-100%);
            }
            50% {
                transform: translateX(0%);
            }
            100% {
                transform: translateX(100%);
            }
        }

        .circular {
            width: 48px;
            height: 48px;
        }

        svg circle {
            fill: none;
            stroke-width: 4;
            stroke-linecap: round;
        }

        .track {
            stroke: color-mix(in srgb, var(--mui-color-border) 30%, transparent);
        }

        .indicator {
            stroke: var(--mui-color-primary);
            stroke-dasharray: 126;
            stroke-dashoffset: var(--mui-progress-offset, 126);
            transition: stroke-dashoffset 0.2s ease;
        }

        :host([indeterminate][variant='circular']) .indicator {
            animation: spin 1.4s ease infinite;
        }

        @keyframes spin {
            0% {
                stroke-dashoffset: 126;
            }
            50% {
                stroke-dashoffset: 50;
            }
            100% {
                stroke-dashoffset: 126;
            }
        }
    `;

    updated(): void {
        if (this.variant === 'linear') {
            const percent = this.indeterminate ? 40 : this.percent;
            this.style.setProperty('--mui-progress-percent', `${percent}%`);
        } else {
            const offset = this.indeterminate ? 126 : 126 - (this.percent / 100) * 126;
            this.style.setProperty('--mui-progress-offset', `${offset}`);
        }
    }

    template() {
        if (this.variant === 'circular') {
            return html`
                <div class="circular" part="circular" role="progressbar" aria-valuemin="0" aria-valuemax="${this.max}" aria-valuenow="${this.value}">
                    <svg viewBox="0 0 48 48">
                        <circle class="track" cx="24" cy="24" r="20"></circle>
                        <circle class="indicator" cx="24" cy="24" r="20"></circle>
                    </svg>
                </div>
            `;
        }

        return html`
            <div class="linear" part="linear" role="progressbar" aria-valuemin="0" aria-valuemax="${this.max}" aria-valuenow="${this.value}">
                <div class="bar"></div>
            </div>
        `;
    }
}

export function registerMuiProgress() {
    if (!customElements.get(MuiProgress.tagName)) {
        customElements.define(MuiProgress.tagName, MuiProgress);
    }
}

registerMuiProgress();