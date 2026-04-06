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
    'primary': '#2563eb',
    'primary-foreground': '#fff',
    'secondary': '#7c3aed',
    'secondary-foreground': '#fff',
    'success': '#16a34a',
    'warning': '#d97706',
    'danger': '#dc2626',
    'danger-foreground': '#fff',
    'neutral': '#64748b',
    'muted': '#94a3b8',
    'text': '#0f172a',
    'text-muted': '#475569',
    'border': '#e2e8f0',
  },
  surfaces: {
    'surface': '#fff',
    'surface-alt': '#f8fafc',
    'surface-elevated': '#fff',
    'backdrop': 'rgba(15,23,42,0.5)',
  },
  spacing: {
    'xs': '0.25rem',
    'sm': '0.5rem',
    'md': '1rem',
    'lg': '1.5rem',
    'xl': '2rem',
  },
  radii: {
    'xs': '2px',
    'sm': '4px',
    'md': '8px',
    'lg': '12px',
    'pill': '999px',
  },
  typography: {
    'font-family': "'Inter', 'SF Pro Display', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    'font-weight-regular': '400',
    'font-weight-medium': '500',
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
    'soft': '0 1px 2px rgba(15,23,42,0.08)',
    'medium': '0 4px 12px rgba(15,23,42,0.12)',
    'strong': '0 12px 32px rgba(15,23,42,0.16)',
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
    'primary': '#60a5fa',
    'primary-foreground': '#0f172a',
    'secondary': '#c084fc',
    'secondary-foreground': '#0f172a',
    'success': '#4ade80',
    'warning': '#fbbf24',
    'danger': '#f87171',
    'danger-foreground': '#0f172a',
    'neutral': '#94a3b8',
    'muted': '#64748b',
    'text': '#e2e8f0',
    'text-muted': '#94a3b8',
    'border': '#334155',
  },
  surfaces: {
    'surface': '#0f172a',
    'surface-alt': '#0b1220',
    'surface-elevated': '#1e293b',
    'backdrop': 'rgba(2,6,23,0.75)',
  },
  shadows: {
    'soft': '0 1px 2px rgba(15,23,42,0.6)',
    'medium': '0 4px 16px rgba(2,6,23,0.75)',
    'strong': '0 20px 40px rgba(2,6,23,0.85)',
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
