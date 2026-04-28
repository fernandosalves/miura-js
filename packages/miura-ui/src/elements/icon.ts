import { defineNanoElement, MiuraNanoElement } from '../nano/index.js';
import * as LucideIcons from 'lucide';
import { icons as LucideIconMap } from 'lucide';
import type { IconNode } from 'lucide';

export interface IconDefinition {
  viewBox?: string;
  paths: string[];
}

const icons = new Map<string, IconDefinition | IconNode>();

export function registerIcon(name: string, definition: IconDefinition | IconNode): void {
  icons.set(normalizeIconName(name), definition);
}

export function getIcon(name: string): IconDefinition | IconNode | undefined {
  if (!name) return undefined;

  const normalized = normalizeIconName(name);
  const registered = icons.get(normalized);
  if (registered) return registered;

  const pascalName = toPascalCase(name);

  const lucideIcon =
    (LucideIconMap as any)?.[pascalName] ||
    (LucideIcons as any)?.[pascalName] ||
    (LucideIcons as any)?.icons?.[pascalName] ||
    (LucideIcons as any)?.default?.[pascalName] ||
    (LucideIcons as any)?.default?.icons?.[pascalName];

  if (Array.isArray(lucideIcon)) {
    return lucideIcon as IconNode;
  }

  return undefined;
}

function normalizeIconName(name: string): string {
  return name.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`).replace(/^-/, '').toLowerCase();
}

function toPascalCase(str: string): string {
  return str
    .replace(/^\$\{|\}$/g, '')
    .replace(/^["']|["']$/g, '')
    .trim()
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
}

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

    // Handle Lucide IconNode format
    if (Array.isArray(icon)) {
      const body = icon
        .map(([tag, attrs]) => {
          const attrStr = Object.entries(attrs || {})
            .map(([key, val]) => `${key}="${val}"`)
            .join(' ');
          return `<${tag} ${attrStr}></${tag}>`;
        })
        .join('');

      return `
        <svg part="svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ${aria}>
          ${body}
        </svg>
      `;
    }

    // Handle legacy IconDefinition format
    return `
      <svg part="svg" viewBox="${icon.viewBox ?? '0 0 24 24'}" ${aria}>
        ${icon.paths.map((path) => `<path d="${path}"></path>`).join('')}
      </svg>
    `;
  }
}

defineNanoElement('mui-icon', MuiIcon);
