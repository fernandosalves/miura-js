import { MiuraElement, html, css, component, property } from '@miurajs/miura-element';

/**
 * Persona — user display combining avatar, name, and detail lines
 *
 * <mui-persona name="John Doe" secondary="Software Engineer" status="online"></mui-persona>
 * <mui-persona name="John Doe" secondary="Lead Dev" tertiary="Last active 2h" size="lg" clickable>
 *   <mui-icon-button slot="action" icon="message-circle"></mui-icon-button>
 * </mui-persona>
 */
@component({ tag: 'mui-persona' })
export class MuiPersona extends MiuraElement {
    @property({ type: String, default: '' })
    name!: string;

    @property({ type: String, default: '' })
    secondary!: string;

    @property({ type: String, default: '' })
    tertiary!: string;

    @property({ type: String, default: '' })
    avatar!: string;

    @property({ type: String, default: 'md', reflect: true })
    size!: 'sm' | 'md' | 'lg';

    @property({ type: String, default: '', reflect: true })
    status!: 'online' | 'offline' | 'busy' | 'away' | '';

    @property({ type: Boolean, default: false, reflect: true })
    clickable!: boolean;

    static styles: any = css`
        :host { display: block; }

        .persona {
            display: flex;
            align-items: center;
            gap: var(--_gap, 10px);
            padding: var(--_pad, 8px 12px);
            border-radius: var(--mui-radius-md, 8px);
            transition: background 150ms;
            cursor: default;
        }

        :host([clickable]) .persona { cursor: pointer; }
        :host([clickable]) .persona:hover { background: var(--mui-surface-hover, rgba(0,0,0,0.04)); }

        /* sizes */
        :host([size="sm"]) { --_gap: 8px; --_pad: 6px 10px; }
        :host([size="lg"]) { --_gap: 12px; --_pad: 10px 14px; }

        .avatar-wrap { position: relative; flex-shrink: 0; }

        .avatar {
            width: var(--_av-size, 36px);
            height: var(--_av-size, 36px);
            border-radius: 50%;
            object-fit: cover;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: var(--_av-font, 13px);
            font-weight: var(--mui-weight-semibold, 600);
            color: #fff;
            background: var(--_av-bg, var(--mui-primary, #3b82f6));
            overflow: hidden;
            flex-shrink: 0;
        }

        :host([size="sm"]) { --_av-size: 28px; --_av-font: 10px; }
        :host([size="lg"]) { --_av-size: 48px; --_av-font: 16px; }

        .avatar img { width: 100%; height: 100%; object-fit: cover; }

        .status-dot {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 9px;
            height: 9px;
            border-radius: 50%;
            border: 2px solid var(--mui-surface, #fff);
            background: var(--_status-color, #9ca3af);
        }

        :host([status="online"])  .status-dot { --_status-color: #22c55e; }
        :host([status="busy"])    .status-dot { --_status-color: #ef4444; }
        :host([status="away"])    .status-dot { --_status-color: #f59e0b; }
        :host([status="offline"]) .status-dot { --_status-color: #9ca3af; }

        :host([size="sm"]) .status-dot { width: 7px; height: 7px; }
        :host([size="lg"]) .status-dot { width: 12px; height: 12px; }

        .info { flex: 1; min-width: 0; }

        .name {
            font-size: var(--_name-size, var(--mui-text-sm, 0.875rem));
            font-weight: var(--mui-weight-medium, 500);
            color: var(--mui-text, #1f2937);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        :host([size="lg"]) { --_name-size: var(--mui-text-md, 1rem); }

        .secondary {
            font-size: var(--mui-text-xs, 0.75rem);
            color: var(--mui-text-secondary, #6b7280);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-top: 1px;
        }

        .tertiary {
            font-size: var(--mui-text-xs, 0.75rem);
            color: var(--mui-text-muted, #9ca3af);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-top: 1px;
        }

        .actions {
            display: flex;
            align-items: center;
            gap: 4px;
            flex-shrink: 0;
            opacity: 0;
            transition: opacity 150ms;
        }

        .persona:hover .actions { opacity: 1; }
        .actions:focus-within { opacity: 1; }
    `;

    private _initials(name: string): string {
        return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    }

    private _autoBg(name: string): string {
        const colors = ['#3b82f6','#8b5cf6','#ec4899','#10b981','#f59e0b','#ef4444','#06b6d4','#84cc16'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    }

    template() {
        const initials = this._initials(this.name || '?');
        const bg = this._autoBg(this.name || '');
        const hasStatus = !!this.status;

        return html`
            <div class="persona" role="${this.clickable ? 'button' : 'presentation'}" tabindex="${this.clickable ? 0 : -1}">
                <div class="avatar-wrap">
                    <div class="avatar" style="background: ${bg}">
                        ${this.avatar
                            ? html`<img src="${this.avatar}" alt="${this.name}">`
                            : initials}
                    </div>
                    ${hasStatus ? html`<span class="status-dot"></span>` : ''}
                </div>
                <div class="info">
                    <div class="name">${this.name}</div>
                    ${this.secondary ? html`<div class="secondary">${this.secondary}</div>` : ''}
                    ${this.tertiary ? html`<div class="tertiary">${this.tertiary}</div>` : ''}
                </div>
                <div class="actions"><slot name="action"></slot></div>
            </div>
        `;
    }
}
