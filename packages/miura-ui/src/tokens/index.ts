export const tokenLayerName = 'miura.tokens';

export type MiuraTheme = 'light' | 'dark';
export type MiuraDensity = 'compact' | 'cozy' | 'comfortable';

export function applyMiuraTheme(target: HTMLElement, theme: MiuraTheme): void {
  target.dataset.muiTheme = theme;
}

export function applyMiuraDensity(target: HTMLElement, density: MiuraDensity): void {
  target.dataset.muiDensity = density;
}
