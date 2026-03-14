import { html, css } from '@miura/miura-element';
import { MuiBase } from '../base/mui-base.js';

type Orientation = 'horizontal' | 'vertical';

export class MuiCheckboxGroup extends MuiBase {
    static tagName = 'mui-checkbox-group';

    static properties = {
        name: { type: String },
        values: { type: Array },
        label: { type: String },
        orientation: { type: String, reflect: true },
        gap: { type: String, reflect: true },
        disabled: { type: Boolean, reflect: true },
        readonly: { type: Boolean, reflect: true },
        required: { type: Boolean, reflect: true },
    };

    name = '';
    values: string[] = [];
    label = '';
    orientation: Orientation = 'horizontal';
    gap = 'md';
    disabled = false;
    readonly = false;
    required = false;

    private boundCheckboxChange = (event: Event) => this.handleCheckboxChange(event);
    private slotElement?: HTMLSlotElement;

    constructor() {
        super();
        this.slotElement = this.shadowRoot?.querySelector('slot') ?? undefined;
    }

    connectedCallback(): void {
        super.connectedCallback?.();
        this.addEventListener('mui-change', this.boundCheckboxChange);
    }

    disconnectedCallback(): void {
        super.disconnectedCallback?.();
        this.removeEventListener('mui-change', this.boundCheckboxChange);
    }

    firstUpdated(): void {
        this.setRole('group');
        this.setAttribute('aria-orientation', this.orientation);
        this.slotElement = this.shadowRoot?.querySelector('slot') ?? undefined;
        this.slotElement?.addEventListener('slotchange', () => this.updateCheckboxes());
        this.updateCheckboxes();
    }

    updated(changed: Map<PropertyKey, unknown>): void {
        if (changed.has('values') || changed.has('name') || changed.has('disabled') || changed.has('readonly')) {
            this.updateCheckboxes();
        }
        if (changed.has('orientation')) {
            this.setAttribute('aria-orientation', this.orientation);
        }
    }

    private getCheckboxes(): Element[] {
        return Array.from(this.querySelectorAll('mui-checkbox'));
    }

    private updateCheckboxes(): void {
        this.getCheckboxes().forEach((checkbox) => {
            (checkbox as any).name = this.name;
            (checkbox as any).disabled = this.disabled || (checkbox as any).disabled;
            (checkbox as any).readonly = this.readonly;
            (checkbox as any).required = this.required;
            if (Array.isArray(this.values)) {
                (checkbox as any).checked = this.values.includes((checkbox as any).value);
            }
        });
    }

    private handleCheckboxChange(event: Event): void {
        const target = event.target as HTMLElement;
        if (target.tagName.toLowerCase() !== 'mui-checkbox') return;

        const checkbox = target as any;
        const value = checkbox.value;
        const checked = checkbox.checked;

        if (!value) return;

        if (checked && !this.values.includes(value)) {
            this.values = [...this.values, value];
        } else if (!checked && this.values.includes(value)) {
            this.values = this.values.filter((entry) => entry !== value);
        }

        this.emit('mui-group-change', { values: this.values.slice(), name: this.name });
    }

    static styles = css`
        :host {
            display: inline-flex;
            flex-direction: column;
            gap: var(--mui-spacing-sm);
            font-family: var(--mui-type-font-family);
            color: var(--mui-color-text, #0f172a);
        }

        fieldset {
            border: none;
            margin: 0;
            padding: 0;
        }

        legend {
            font-size: var(--mui-type-font-size-sm);
            font-weight: var(--mui-type-font-weight-medium);
            color: var(--mui-color-text-muted, #475569);
            margin-bottom: calc(var(--mui-spacing-xs) / 2);
        }

        .group {
            display: flex;
            gap: var(--mui-checkbox-group-gap, var(--mui-spacing-md));
            flex-wrap: wrap;
            align-items: flex-start;
        }

        :host([orientation='vertical']) .group {
            flex-direction: column;
        }

        :host([gap='sm']) {
            --mui-checkbox-group-gap: var(--mui-spacing-sm);
        }

        :host([gap='lg']) {
            --mui-checkbox-group-gap: var(--mui-spacing-lg);
        }

        :host([disabled]) {
            opacity: 0.6;
            pointer-events: none;
        }
    `;

    template() {
        return html`
            <fieldset role="group" aria-disabled=${this.disabled} aria-readonly=${this.readonly} part="fieldset">
                ${this.label ? html`<legend part="legend">${this.label}</legend>` : null}
                <div class="group" part="group">
                    <slot></slot>
                </div>
            </fieldset>
        `;
    }
}

export function registerMuiCheckboxGroup() {
    if (!customElements.get(MuiCheckboxGroup.tagName)) {
        customElements.define(MuiCheckboxGroup.tagName, MuiCheckboxGroup);
    }
}

registerMuiCheckboxGroup();
