import { html, css } from '@miurajs/miura-element';
import { MuiBase } from '../base/mui-base.js';

export class MuiFileDrop extends MuiBase {
    static tagName = 'mui-file-drop';

    static properties = {
        accept: { type: String },
        multiple: { type: Boolean, reflect: true },
        disabled: { type: Boolean, reflect: true },
        name: { type: String },
        description: { type: String },
        icon: { type: String },
    };

    accept = '';
    multiple = false;
    disabled = false;
    name = '';
    description = 'Drop files here or click to browse';
    icon = '⬆️';

    private handleDrop = (event: DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        if (this.disabled) return;

        const files = event.dataTransfer?.files;
        if (files?.length) {
            this.emit('mui-files', { files, name: this.name });
        }
        this.classList.remove('dragover');
    };

    private handleDragOver = (event: DragEvent) => {
        event.preventDefault();
        if (this.disabled) return;
        this.classList.add('dragover');
    };

    private handleDragLeave = (event: DragEvent) => {
        event.preventDefault();
        this.classList.remove('dragover');
    };

    private handleInput = (event: Event) => {
        const target = event.target as HTMLInputElement;
        const files = target.files;
        if (files?.length) {
            this.emit('mui-files', { files, name: this.name });
            target.value = '';
        }
    };

    private openFileDialog = (): void => {
        if (this.disabled) return;
        const input = this.shadowRoot?.querySelector('input[type="file"]') as HTMLInputElement | null;
        input?.click();
    };

    static styles = css`
        :host {
            display: block;
            font-family: var(--mui-type-font-family);
            color: var(--mui-color-text, #0f172a);
        }

        .dropzone {
            border: 2px dashed color-mix(in srgb, var(--mui-color-border) 70%, transparent);
            border-radius: var(--mui-radius-lg);
            padding: var(--mui-spacing-lg);
            background: color-mix(in srgb, var(--mui-surface) 95%, transparent);
            cursor: pointer;
            transition: border-color var(--mui-motion-duration-fast) var(--mui-motion-easing-standard),
                background var(--mui-motion-duration-fast) var(--mui-motion-easing-standard),
                box-shadow var(--mui-motion-duration-fast) var(--mui-motion-easing-standard);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--mui-spacing-sm);
            text-align: center;
        }

        .dropzone.dragover {
            border-color: var(--mui-color-primary);
            background: color-mix(in srgb, var(--mui-color-primary) 8%, var(--mui-surface));
            box-shadow: 0 4px 20px rgba(37, 99, 235, 0.15);
        }

        .icon {
            font-size: 2.5rem;
        }

        .title {
            font-size: var(--mui-type-font-size-md);
            font-weight: var(--mui-type-font-weight-medium);
        }

        .description {
            font-size: var(--mui-type-font-size-sm);
            color: var(--mui-color-text-muted, #475569);
        }

        input[type='file'] {
            display: none;
        }

        :host([disabled]) {
            opacity: 0.6;
            pointer-events: none;
        }
    `;

    template() {
        return html`
            <div
                class="dropzone"
                part="dropzone"
                @click=${this.openFileDialog}
                @drop=${this.handleDrop}
                @dragover=${this.handleDragOver}
                @dragleave=${this.handleDragLeave}
            >
                <div class="icon" part="icon">${this.icon}</div>
                <div class="title" part="title"><slot>Upload files</slot></div>
                <div class="description" part="description">${this.description}</div>
                <input
                    type="file"
                    part="input"
                    name=${this.name}
                    accept=${this.accept}
                    ?multiple=${this.multiple}
                    @change=${this.handleInput}
                />
            </div>
        `;
    }
}

export function registerMuiFileDrop() {
    if (!customElements.get(MuiFileDrop.tagName)) {
        customElements.define(MuiFileDrop.tagName, MuiFileDrop);
    }
}

registerMuiFileDrop();
