import { defineNanoElement, MiuraNanoElement } from '../nano/index.js';

export interface IconDefinition {
  viewBox?: string;
  paths: string[];
}

const icons = new Map<string, IconDefinition>();

export function registerIcon(name: string, definition: IconDefinition): void {
  icons.set(normalizeIconName(name), definition);
}

export function getIcon(name: string): IconDefinition | undefined {
  return icons.get(normalizeIconName(name));
}

function normalizeIconName(name: string): string {
  return name.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`).replace(/^-/, '').toLowerCase();
}

registerIcon('menu', { paths: ['M4 6h16M4 12h16M4 18h16'] });
registerIcon('search', { paths: ['M11 19a8 8 0 1 1 5.657-13.657A8 8 0 0 1 11 19Zm5-3 4 4'] });
registerIcon('panel-left', { paths: ['M4 5h16v14H4zM9 5v14'] });
registerIcon('chevron-left', { paths: ['M15 18 9 12l6-6'] });
registerIcon('chevron-right', { paths: ['m9 18 6-6-6-6'] });
registerIcon('plus', { paths: ['M12 5v14M5 12h14'] });
registerIcon('folder', { paths: ['M3 7h7l2 2h9v10H3z'] });
registerIcon('file', { paths: ['M6 3h8l4 4v14H6zM14 3v5h5'] });
registerIcon('settings', { paths: ['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v3m0 12v3M4.2 4.2l2.1 2.1m11.4 11.4 2.1 2.1M3 12h3m12 0h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1'] });
registerIcon('calendar', { paths: ['M7 3v4M17 3v4M4 8h16M5 5h14v16H5z'] });
registerIcon('columns', { paths: ['M4 5h6v14H4zM14 5h6v14h-6z'] });
registerIcon('spark', { paths: ['M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z'] });

export class MuiIcon extends MiuraNanoElement {
  static observedAttributes = ['name', 'size', 'label'];

  static styles = `
    :host {
      display: inline-flex;
      width: var(--mui-icon-size, 1em);
      height: var(--mui-icon-size, 1em);
      color: inherit;
      vertical-align: -0.125em;
    }

    svg {
      width: 100%;
      height: 100%;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      fill: none;
    }
  `;

  protected render(): string {
    const name = this.getAttribute('name') ?? '';
    const size = this.getAttribute('size');
    const label = this.getAttribute('label');
    const icon = getIcon(name);

    if (size) {
      this.style.setProperty('--mui-icon-size', /^\d+$/.test(size) ? `${size}px` : size);
    }

    if (!icon) {
      return `<span part="missing" aria-hidden="true"></span>`;
    }

    const aria = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"';
    return `
      <svg part="svg" viewBox="${icon.viewBox ?? '0 0 24 24'}" ${aria}>
        ${icon.paths.map((path) => `<path d="${path}"></path>`).join('')}
      </svg>
    `;
  }
}

defineNanoElement('mui-icon', MuiIcon);
