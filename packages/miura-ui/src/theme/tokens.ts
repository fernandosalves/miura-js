// miura-ui: theme/tokens.ts
// TypeScript theme token definitions for MiuraJS design system

export type MuiThemeTokens = Record<string, string>;

export interface MuiThemeDefinition {
  colors: Record<string, string>;
  surfaces: Record<string, string>;
  spacing: Record<string, string>;
  radii: Record<string, string>;
  typography: Record<string, string>;
  shadows: Record<string, string>;
  motion: Record<string, string>;
}

export const lightTheme: MuiThemeDefinition = {
  colors: {
    'primary': '#0078d4',
    'primary-foreground': '#ffffff',
    'secondary': '#f3f2f1',
    'secondary-foreground': '#323130',
    'success': '#107c10',
    'warning': '#d83b01',
    'danger': '#d13438',
    'danger-foreground': '#ffffff',
    'neutral': '#605e5c',
    'muted': '#f3f2f1',
    'text': '#242424',
    'text-muted': '#605e5c',
    'border': '#edebe9',
  },
  surfaces: {
    'surface': '#ffffff',
    'surface-alt': '#fafafa',
    'surface-elevated': '#ffffff',
    'backdrop': 'rgba(0,0,0,0.4)',
  },
  spacing: {
    'xs': '4px',
    'sm': '8px',
    'md': '16px',
    'lg': '24px',
    'xl': '32px',
  },
  radii: {
    'xs': '2px',
    'sm': '2px',
    'md': '4px',
    'lg': '6px',
    'pill': '9999px',
  },
  typography: {
    'font-family': "'Segoe UI', 'SF Pro Display', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    'font-weight-regular': '400',
    'font-weight-medium': '600',
    'font-weight-semibold': '600',
    'font-size-xs': '0.75rem',
    'font-size-sm': '0.875rem',
    'font-size-md': '1rem',
    'font-size-lg': '1.125rem',
    'font-size-xl': '1.5rem',
    'line-height-tight': '1.2',
    'line-height-normal': '1.5',
    'line-height-relaxed': '1.75',
  },
  shadows: {
    'soft': '0 1.6px 3.6px 0 rgba(0,0,0,0.132), 0 0.3px 0.9px 0 rgba(0,0,0,0.108)',
    'medium': '0 3.2px 7.2px 0 rgba(0,0,0,0.132), 0 0.6px 1.8px 0 rgba(0,0,0,0.108)',
    'strong': '0 6.4px 14.4px 0 rgba(0,0,0,0.132), 0 1.2px 3.6px 0 rgba(0,0,0,0.108)',
  },
  motion: {
    'duration-fast': '120ms',
    'duration-normal': '200ms',
    'duration-slow': '320ms',
    'easing-standard': 'cubic-bezier(0.4,0,0.2,1)',
    'easing-emphasized': 'cubic-bezier(0.2,0,0,1)',
  },
};

export const darkTheme: MuiThemeDefinition = {
  ...lightTheme,
  colors: {
    'primary': '#0078d4',
    'primary-foreground': '#ffffff',
    'secondary': 'oklch(0.269 0 0)',
    'secondary-foreground': 'oklch(0.985 0 0)',
    'success': '#54b054',
    'warning': '#fce100',
    'danger': 'oklch(0.396 0.141 25.723)',
    'danger-foreground': 'oklch(0.637 0.237 25.331)',
    'neutral': 'oklch(0.708 0 0)',
    'muted': 'oklch(0.269 0 0)',
    'text': 'oklch(0.985 0 0)',
    'text-muted': 'oklch(0.708 0 0)',
    'border': 'oklch(0.269 0 0)',
  },
  surfaces: {
    'surface': 'oklch(0.205 0 0)',
    'surface-alt': 'oklch(0.145 0 0)',
    'surface-elevated': 'oklch(0.269 0 0)',
    'backdrop': 'rgba(0,0,0,0.6)',
  },
  shadows: {
    'soft': '0 1.6px 3.6px 0 rgba(0,0,0,0.26), 0 0.3px 0.9px 0 rgba(0,0,0,0.21)',
    'medium': '0 3.2px 7.2px 0 rgba(0,0,0,0.26), 0 0.6px 1.8px 0 rgba(0,0,0,0.21)',
    'strong': '0 6.4px 14.4px 0 rgba(0,0,0,0.26), 0 1.2px 3.6px 0 rgba(0,0,0,0.21)',
  },
};

export const THEME_PRESETS: Record<string, MuiThemeDefinition> = {
  light: lightTheme,
  dark: darkTheme,
};

export function getThemePreset(name: string | null | undefined): MuiThemeDefinition {
  if (!name) return lightTheme;
  return THEME_PRESETS[name] || lightTheme;
}

export function flattenTheme(theme: MuiThemeDefinition): MuiThemeTokens {
  const tokens: MuiThemeTokens = {};
  const appendCategory = (category: string, values: Record<string, string>) => {
    Object.entries(values).forEach(([key, value]) => {
      const cssVar = `--mui-${category}-${key}`;
      tokens[cssVar] = value;
    });
  };
  appendCategory('color', theme.colors);
  appendCategory('surface', theme.surfaces);
  appendCategory('spacing', theme.spacing);
  appendCategory('radius', theme.radii);
  appendCategory('type', theme.typography);
  appendCategory('shadow', theme.shadows);
  appendCategory('motion', theme.motion);
  return tokens;
}
