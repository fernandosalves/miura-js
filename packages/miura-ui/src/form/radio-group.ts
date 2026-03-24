import { html, css } from '@miurajs/miura-element';
import { MuiBase } from '../base/mui-base.js';

type Orientation = 'horizontal' | 'vertical';

export class MuiRadioGroup extends MuiBase {
    static tagName = 'mui-radio-group';

    static properties = {
        name: { type: String },
        value: { type: String },
        label: { type: String },
        orientation: { type: String, reflect: true },
        gap: { type: String, reflect: true },
        disabled: { type: Boolean, reflect: true },
        readonly: { type: Boolean, reflect: true },
        required: { type: Boolean, reflect: true },
    };

    name = '';
    value = '';
    label = '';
    orientation: Orientation = 'horizontal';
    gap = 'md';
    disabled = false;
    readonly = false;
    required = false;

    private slotElement?: HTMLSlotElement;
    private boundRadioChange = (event: Event) => this.handleRadioChange(event);

    connectedCallback(): void {
        super.connectedCallback?.();
        this.addEventListener('mui-change', this.boundRadioChange);
        this.addEventListener('keydown', this.handleKeydown as EventListener);
    }

    disconnectedCallback(): void {
        super.disconnectedCallback?.();
        this.removeEventListener('mui-change', this.boundRadioChange);
        this.removeEventListener('keydown', this.handleKeydown as EventListener);
    }

    firstUpdated(): void {
        this.setRole('radiogroup');
        this.setAttribute('aria-orientation', this.orientation);
        this.slotElement = this.shadowRoot?.querySelector('slot') ?? undefined;
        this.slotElement?.addEventListener('slotchange', () => this.updateRadios());
        this.updateRadios();
    }

    updated(changed: Map<PropertyKey, unknown>): void {
        if (changed.has('value') || changed.has('name') || changed.has('disabled') || changed.has('readonly')) {
            this.updateRadios();
        }
        if (changed.has('orientation')) {
            this.setAttribute('aria-orientation', this.orientation);
        }
    }

    private getRadios(): HTMLElement[] {
        return Array.from(this.querySelectorAll('mui-radio')) as HTMLElement[];
    }

    private updateRadios(): void {
        const radios = this.getRadios();
        radios.forEach((radio, index) => {
            (radio as any).name = this.name;
            (radio as any).disabled = this.disabled || (radio as any).disabled;
            (radio as any).readonly = this.readonly;
            (radio as any).required = this.required;
            (radio as any).checked = (radio as any).value === this.value;
            radio.setAttribute('data-index', String(index));
        });
    }

    private handleRadioChange(event: Event): void {
        const target = event.target as HTMLElement;
        if (target.tagName.toLowerCase() !== 'mui-radio') return;
        const radio = target as any;
        const nextValue = radio.value;
        if (!nextValue) return;
        if (this.value !== nextValue) {
            this.value = nextValue;
            this.emit('mui-group-change', { value: this.value, name: this.name });
        }
    }

    private handleKeydown = (event: KeyboardEvent): void => {
        const radios = this.getRadios();
        if (radios.length === 0) return;
        const currentIndex = radios.findIndex((radio) => radio === event.target);
        if (currentIndex === -1) return;

        const isHorizontal = this.orientation === 'horizontal';
        let nextIndex = currentIndex;

        if ((isHorizontal && event.key === 'ArrowRight') || (!isHorizontal && event.key === 'ArrowDown')) {
            nextIndex = (currentIndex + 1) % radios.length;
        } else if ((isHorizontal && event.key === 'ArrowLeft') || (!isHorizontal && event.key === 'ArrowUp')) {
            nextIndex = (currentIndex - 1 + radios.length) % radios.length;
        } else {
            return;
        }

        event.preventDefault();
        const nextRadio = radios[nextIndex];
        const input = nextRadio.shadowRoot?.querySelector('input') as HTMLInputElement | null;
        if (input) {
            input.focus();
            input.click();
        } else {
            nextRadio.focus();
        }
    };

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
            gap: var(--mui-radio-group-gap, var(--mui-spacing-md));
            flex-wrap: wrap;
            align-items: flex-start;
        }

        :host([orientation='vertical']) .group {
            flex-direction: column;
        }

        :host([gap='sm']) {
            --mui-radio-group-gap: var(--mui-spacing-sm);
        }

        :host([gap='lg']) {
            --mui-radio-group-gap: var(--mui-spacing-lg);
        }

        :host([disabled]) {
            opacity: 0.6;
            pointer-events: none;
        }
    `;

    template() {
        return html`
            <fieldset role="radiogroup" aria-disabled=${this.disabled} aria-readonly=${this.readonly} part="fieldset">
                ${this.label ? html`<legend part="legend">${this.label}</legend>` : null}
                <div class="group" part="group">
                    <slot></slot>
                </div>
            </fieldset>
        `;
    }
}

export function registerMuiRadioGroup() {
    if (!customElements.get(MuiRadioGroup.tagName)) {
        customElements.define(MuiRadioGroup.tagName, MuiRadioGroup);
    }
}

registerMuiRadioGroup();
