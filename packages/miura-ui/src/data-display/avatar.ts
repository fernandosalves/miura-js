/**
 * MUI Avatar Component
 * 
 * Displays a user avatar with image, initials, or icon fallback.
 * 
 * @example
 * ```html
 * <mui-avatar src="/user.jpg" alt="John Doe"></mui-avatar>
 * <mui-avatar name="John Doe"></mui-avatar>
 * <mui-avatar icon="user" size="lg"></mui-avatar>
 * <mui-avatar src="/user.jpg" status="online"></mui-avatar>
 * ```
 */

import { MiuraElement, html, css, component, property, state } from '@miurajs/miura-element';

// Generate a consistent color from a string
function stringToColor(str: string): string {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', 
    '#84cc16', '#22c55e', '#14b8a6', '#06b6d4',
    '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6',
    '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
  ];
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

// Extract initials from a name
function getInitials(name: string): string {
  if (!name) return '';
  
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

const SIZES: Record<string, { container: number; font: number; icon: string }> = {
  xs: { container: 24, font: 10, icon: 'xs' },
  sm: { container: 32, font: 12, icon: 'sm' },
  md: { container: 40, font: 14, icon: 'md' },
  lg: { container: 48, font: 16, icon: 'md' },
  xl: { container: 64, font: 20, icon: 'lg' },
  '2xl': { container: 80, font: 24, icon: 'lg' },
};

@component({ tag: 'mui-avatar' })
export class MuiAvatar extends MiuraElement {
  /**
   * Image source URL
   */
  @property({ type: String })
  src = '';

  /**
   * Alt text for the image
   */
  @property({ type: String })
  alt = '';

  /**
   * User's name - used for initials fallback and color generation
   */
  @property({ type: String })
  name = '';

  /**
   * Fallback icon name (defaults to "user")
   */
  @property({ type: String })
  icon = 'user';

  /**
   * Avatar size
   */
  @property({ type: String })
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'md';

  /**
   * Shape
   */
  @property({ type: String })
  shape: 'circle' | 'square' = 'circle';

  /**
   * Border color
   */
  @property({ type: String })
  border = '';

  /**
   * Status indicator
   */
  @property({ type: String })
  status: 'online' | 'offline' | 'busy' | 'away' | '' = '';

  /**
   * Custom background color (overrides auto-generated color)
   */
  @property({ type: String })
  color = '';

  @state()
  private _imageError = false;

  static styles = css`
    :host {
      display: inline-block;
      position: relative;
    }

    .avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      user-select: none;
      background: var(--avatar-bg);
      color: white;
      font-weight: 600;
      text-transform: uppercase;
      position: relative;
    }

    .avatar.shape-circle {
      border-radius: 50%;
    }

    .avatar.shape-square {
      border-radius: var(--mui-radius-md, 6px);
    }

    .avatar.has-border {
      box-shadow: 0 0 0 2px var(--avatar-border-color, var(--mui-background, white));
    }

    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .initials {
      font-family: inherit;
      line-height: 1;
    }

    /* Status indicator */
    .status {
      position: absolute;
      border-radius: 50%;
      background: var(--status-color);
      box-shadow: 0 0 0 2px var(--mui-background, white);
    }

    .status.status-online { --status-color: var(--mui-success, #22c55e); }
    .status.status-offline { --status-color: var(--mui-text-muted, #9ca3af); }
    .status.status-busy { --status-color: var(--mui-error, #ef4444); }
    .status.status-away { --status-color: var(--mui-warning, #f59e0b); }

    /* Size-specific status positioning */
    .avatar.size-xs .status { width: 6px; height: 6px; right: -1px; bottom: -1px; }
    .avatar.size-sm .status { width: 8px; height: 8px; right: 0px; bottom: 0px; }
    .avatar.size-md .status { width: 10px; height: 10px; right: 1px; bottom: 1px; }
    .avatar.size-lg .status { width: 12px; height: 12px; right: 2px; bottom: 2px; }
    .avatar.size-xl .status { width: 14px; height: 14px; right: 2px; bottom: 2px; }
    .avatar.size-2xl .status { width: 16px; height: 16px; right: 3px; bottom: 3px; }
  `;

  private _handleImageError = () => {
    this._imageError = true;
  };

  private _getBackgroundColor(): string {
    if (this.color) return this.color;
    if (this.name) return stringToColor(this.name);
    return 'var(--mui-text-muted, #9ca3af)';
  }

  template() {
    const sizeConfig = SIZES[this.size] || SIZES.md;
    const showImage = this.src && !this._imageError;
    const showInitials = !showImage && this.name;
    const showIcon = !showImage && !showInitials;

    const initials = showInitials ? getInitials(this.name) : '';
    const bgColor = showImage ? 'transparent' : this._getBackgroundColor();

    const style = `
      width: ${sizeConfig.container}px;
      height: ${sizeConfig.container}px;
      font-size: ${sizeConfig.font}px;
      --avatar-bg: ${bgColor};
      ${this.border ? `--avatar-border-color: ${this.border};` : ''}
    `;

    const classes = [
      'avatar',
      `shape-${this.shape}`,
      `size-${this.size}`,
      this.border ? 'has-border' : '',
    ].filter(Boolean).join(' ');

    return html`
      <div class="${classes}" style="${style}" role="img" aria-label="${this.alt || this.name || 'Avatar'}">
        ${showImage ? html`
          <img 
            src="${this.src}" 
            alt="${this.alt || this.name}" 
            @error="${this._handleImageError}"
          />
        ` : showInitials ? html`
          <span class="initials">${initials}</span>
        ` : html`
          <mui-icon name="${this.icon}" size="${sizeConfig.icon as any}"></mui-icon>
        `}
        
        ${this.status ? html`
          <span class="status status-${this.status}"></span>
        ` : ''}
      </div>
    `;
  }
}

/**
 * MUI Avatar Group Component
 * 
 * Displays a stack of overlapping avatars with an overflow counter.
 * 
 * @example
 * ```html
 * <mui-avatar-group max="3">
 *   <mui-avatar src="..." name="John"></mui-avatar>
 *   <mui-avatar src="..." name="Jane"></mui-avatar>
 *   <mui-avatar src="..." name="Bob"></mui-avatar>
 *   <mui-avatar src="..." name="Alice"></mui-avatar>
 * </mui-avatar-group>
 * ```
 */
@component({ tag: 'mui-avatar-group' })
export class MuiAvatarGroup extends MiuraElement {
  /**
   * Maximum number of avatars to display before showing overflow
   */
  @property({ type: Number })
  max = 5;

  /**
   * Size for all avatars in the group
   */
  @property({ type: String })
  size: 'xs' | 'sm' | 'md' | 'lg' = 'md';

  /**
   * Spacing between avatars (negative = overlap)
   */
  @property({ type: Number })
  spacing = -8;

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
    }

    .group {
      display: flex;
      flex-direction: row-reverse;
      align-items: center;
    }

    ::slotted(mui-avatar) {
      box-shadow: 0 0 0 2px var(--mui-background, white);
    }

    .overflow {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: var(--mui-surface-subtle, #f3f4f6);
      color: var(--mui-text-secondary, #6b7280);
      font-size: 12px;
      font-weight: 600;
      box-shadow: 0 0 0 2px var(--mui-background, white);
    }

    .overflow.size-xs { width: 24px; height: 24px; font-size: 9px; }
    .overflow.size-sm { width: 32px; height: 32px; font-size: 10px; }
    .overflow.size-md { width: 40px; height: 40px; font-size: 12px; }
    .overflow.size-lg { width: 48px; height: 48px; font-size: 14px; }
  `;

  template() {
    const sizeConfig = SIZES[this.size] || SIZES.md;

    return html`
      <div class="group" style="gap: ${this.spacing}px;">
        <slot></slot>
      </div>
    `;
  }

  // Note: In a full implementation, you would use slotchange event to:
  // 1. Count total avatars
  // 2. Hide avatars beyond max
  // 3. Show overflow indicator
  // This would require connectedCallback slot manipulation
}

export default MuiAvatar;
