/**
 * MUI Icon Component
 * 
 * A flexible icon component that supports:
 * - Lucide icons via name prop
 * - Custom SVG via slot
 * - Various sizes and colors
 * - Animation (spin)
 * - Accessibility labels
 * 
 * @example
 * ```html
 * <mui-icon name="folder"></mui-icon>
 * <mui-icon name="chevron-right" size="sm" color="primary"></mui-icon>
 * <mui-icon name="loader-2" spin></mui-icon>
 * ```
 */

import { MiuraElement, html, css, component, property, state } from '@miurajs/miura-element';

// Icon size mapping in pixels
const SIZES: Record<string, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

// Cache for loaded icons
const iconCache = new Map<string, string>();


import { loadLucideIcon } from './lucide-loader';

/**
 * Load an icon SVG by name (Lucide or custom)
 */
async function loadIcon(name: string): Promise<string | null> {
  if (iconCache.has(name)) {
    return iconCache.get(name)!;
  }
  // Try to load from lucide-static dynamically
  const svg = await loadLucideIcon(name);
  if (svg) {
    iconCache.set(name, svg);
    return svg;
  }
  // Not found
  console.warn(`[mui-icon] Icon "${name}" not found in lucide-static`);
  return null;
}

/**
 * Pre-load commonly used icons
 */
export function preloadIcons(names: string[]): void {
  names.forEach(name => loadIcon(name));
}

/**
 * Register a custom SVG icon
 */
export function registerIcon(name: string, svg: string): void {
  iconCache.set(name, svg);
}

/**
 * Register multiple icons at once (for bundled icons)
 */
export function registerIcons(icons: Record<string, string>): void {
  Object.entries(icons).forEach(([name, svg]) => {
    iconCache.set(name, svg);
  });
}

@component({ tag: 'mui-icon' })
export class MuiIcon extends MiuraElement {
  /**
   * Lucide icon name (e.g., "folder", "chevron-right", "settings")
   * See https://lucide.dev/icons for full list
   */
  @property({ type: String })
  name = '';

  /**
   * Icon size
   * - xs: 12px
   * - sm: 16px
   * - md: 20px (default)
   * - lg: 24px
   * - xl: 32px
   */
  @property({ type: String })
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';

  /**
   * Icon color - can be a CSS color, token name (e.g., "primary"), or "currentColor"
   */
  @property({ type: String })
  color = 'currentColor';

  /**
   * SVG stroke width
   */
  @property({ type: Number, attribute: 'stroke-width' })
  strokeWidth = 2;

  /**
   * Enable spinning animation (useful for loading states)
   */
  @property({ type: Boolean })
  spin = false;

  /**
   * Flip the icon
   */
  @property({ type: String })
  flip: 'horizontal' | 'vertical' | 'both' | '' = '';

  /**
   * Accessible label for screen readers
   */
  @property({ type: String })
  label = '';

  @state()
  private _svgContent = '';

  @state()
  private _loading = false;

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 0;
      flex-shrink: 0;
    }

    .icon-wrapper {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .icon-wrapper.spin {
      animation: mui-icon-spin 1s linear infinite;
    }

    .icon-wrapper.flip-horizontal {
      transform: scaleX(-1);
    }

    .icon-wrapper.flip-vertical {
      transform: scaleY(-1);
    }

    .icon-wrapper.flip-both {
      transform: scale(-1);
    }

    @keyframes mui-icon-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    svg {
      display: block;
      width: var(--icon-size, 20px);
      height: var(--icon-size, 20px);
      stroke: var(--icon-color, currentColor);
      stroke-width: var(--icon-stroke-width, 2);
      stroke-linecap: round;
      stroke-linejoin: round;
      fill: none;
    }

    /* Allow slotted SVGs */
    ::slotted(svg) {
      display: block;
      width: var(--icon-size, 20px);
      height: var(--icon-size, 20px);
      stroke: var(--icon-color, currentColor);
      stroke-width: var(--icon-stroke-width, 2);
      stroke-linecap: round;
      stroke-linejoin: round;
      fill: none;
    }

    .fallback {
      width: var(--icon-size, 20px);
      height: var(--icon-size, 20px);
      background: var(--mui-border, #e5e7eb);
      border-radius: 2px;
    }
  `;

  connectedCallback(): void {
    super.connectedCallback?.();
    if (this.name) {
      this._loadIcon();
    }
  }

  updated(changedProps: Map<string, unknown>): void {
    if (changedProps.has('name') && this.name) {
      this._loadIcon();
    }
  }

  private async _loadIcon(): Promise<void> {
    if (!this.name) return;
    
    this._loading = true;
    const svg = await loadIcon(this.name);
    this._loading = false;
    
    if (svg) {
      if (svg.trim().startsWith('<svg')) {
        // Legacy support: extract the inner content of the SVG (removes the outer <svg> tag)
        const parser = new DOMParser();
        const doc = parser.parseFromString(svg, 'image/svg+xml');
        const svgEl = doc.querySelector('svg');
        if (svgEl) {
          this._svgContent = svgEl.innerHTML;
        }
      } else {
        // Already pre-processed into innerHTML (e.g. from our mapped Lucide AST loader)
        this._svgContent = svg;
      }
    }
  }

  private _getColor(): string {
    if (this.color === 'currentColor') return 'currentColor';
    
    // Check if it's a token name
    const tokenMap: Record<string, string> = {
      primary: 'var(--mui-primary)',
      secondary: 'var(--mui-text-secondary)',
      muted: 'var(--mui-text-muted)',
      success: 'var(--mui-success)',
      warning: 'var(--mui-warning)',
      error: 'var(--mui-error)',
      info: 'var(--mui-info)',
    };

    return tokenMap[this.color] || this.color;
  }

  template() {
    const sizeValue = SIZES[this.size] || SIZES.md;
    const color = this._getColor();

    const wrapperClasses = [
      'icon-wrapper',
      this.spin ? 'spin' : '',
      this.flip ? `flip-${this.flip}` : '',
    ].filter(Boolean).join(' ');

    const style = `
      --icon-size: ${sizeValue}px;
      --icon-color: ${color};
      --icon-stroke-width: ${this.strokeWidth};
    `;

    // Accessibility
    const ariaLabel = this.label || this.name;
    const ariaHidden = !this.label;

    return html`
      <span 
        class="${wrapperClasses}" 
        style="${style}"
        role="${this.label ? 'img' : 'presentation'}"
        aria-label="${ariaLabel}"
        aria-hidden="${ariaHidden}"
      >
        <slot>
          ${this._svgContent 
            ? html`<svg viewBox="0 0 24 24" .innerHTML="${this._svgContent}"></svg>`
            : this._loading 
              ? html`<span class="fallback"></span>`
              : html`<span class="fallback"></span>`
          }
        </slot>
      </span>
    `;
  }
}

export default MuiIcon;
