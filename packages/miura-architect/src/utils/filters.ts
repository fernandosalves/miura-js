import type { ComponentInfo, FilterOptions, SignalInfo } from '../types.js';

export function filterComponents(
  components: ComponentInfo[] | undefined | null,
  searchTerm: string,
  options: FilterOptions,
): ComponentInfo[] {
  let filtered = Array.isArray(components) ? components : [];

  if (options.hideInternal) {
    filtered = filtered.filter((component) => !component.tag.startsWith('__'));
  }

  if (options.collapseUnused) {
    filtered = filtered.filter((component) => (component.updateCount ?? 0) > 0 || component.mounted === false);
  }

  if (searchTerm.trim()) {
    const normalized = searchTerm.toLowerCase();
    filtered = filtered.filter((component) =>
      component.tag.toLowerCase().includes(normalized) || component.id.toLowerCase().includes(normalized),
    );
  }

  if (options.minRenderTime !== undefined) {
    filtered = filtered.filter((component) => (component.renderTime ?? 0) >= options.minRenderTime!);
  }

  return filtered;
}

export function filterSignals(signals: SignalInfo[] | undefined | null, options: FilterOptions): SignalInfo[] {
  const safeSignals = Array.isArray(signals) ? signals : [];
  if (!options.hideInternal) {
    return safeSignals;
  }

  return safeSignals.filter((signal) => !signal.label?.startsWith('__'));
}

export function debounce<T extends (...args: any[]) => void>(fn: T, waitMs: number): (...args: Parameters<T>) => void {
  let timeoutId = 0;
  return (...args: Parameters<T>) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => fn(...args), waitMs);
  };
}
