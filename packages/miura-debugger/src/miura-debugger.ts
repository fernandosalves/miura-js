// Simple debug utility for miura framework
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Debugger {
  private enabled = false;
  private level: LogLevel = 'debug';
  private categories: Set<string> = new Set();
  private levelOrder: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  setEnabled(val: boolean) { this.enabled = val; }
  setLevel(level: LogLevel) { this.level = level; }
  enableCategory(cat: string) { this.categories.add(cat); }
  disableCategory(cat: string) { this.categories.delete(cat); }
  clearCategories() { this.categories.clear(); }

  log(cat: string, level: LogLevel, ...args: any[]) {
    if (!this.enabled) return;
    if (this.categories.size && !this.categories.has(cat)) return;
    if (this.levelOrder[level] < this.levelOrder[this.level]) return;
    const prefix = `[${cat.toUpperCase()}][${level.toUpperCase()}]`;
    switch (level) {
      case 'debug':
      case 'info':
        console.log(prefix, ...args);
        break;
      case 'warn':
        console.warn(prefix, ...args);
        break;
      case 'error':
        console.error(prefix, ...args);
        break;
    }
  }
}

export const debug = new Debugger();

// --- debugLog system (category-based toggle) ---

/**
 * Debug configuration for template parts and framework subsystems
 */
export interface DebugConfig {
    processor?: boolean;
    parser?: boolean;
    compiler?: boolean;
    bindingManager?: boolean;
    eventModifier?: boolean;
    eventBinding?: boolean;
    styleBinding?: boolean;
    classBinding?: boolean;
    propertyBinding?: boolean;
    booleanBinding?: boolean;
    attributeBinding?: boolean;
    referenceBinding?: boolean;
    modifier?: boolean;
    directiveBinding?: boolean;
    directiveManager?: boolean;
    intersect?: boolean;
    focus?: boolean;
    lazy?: boolean;
    animate?: boolean;
    validate?: boolean;
    media?: boolean;
    gesture?: boolean;
    renderer?: boolean;
    element?: boolean;
    resize?: boolean;
    directives?: boolean;
    mutation?: boolean;
    structural?: boolean;
    if?: boolean;
    elseif?: boolean;
    for?: boolean;
    render?: boolean;
    switch?: boolean;
    virtualScroll?: boolean;
    async?: boolean;
}

/**
 * Global debug configuration
 */
export let debugConfig: DebugConfig = {
    structural: false,
    if: false,
    for: false,
    switch: false,
    directiveManager: false
};

/**
 * Enable debug logging for specific parts
 */
export function enableDebug(config: DebugConfig) {
    debugConfig = { ...debugConfig, ...config };
}

/**
 * Disable all debug logging
 */
export function disableDebug() {
    debugConfig = {
        switch: false
    };
}

/**
 * Debug logger that only logs if debug is enabled for the specified part
 */
export function debugLog(part: keyof DebugConfig, ...args: any[]) {
    if (debugConfig[part]) {
        console.log(`[${part}]`, ...args);
    }
}

export enum DebugType {
    Element = 'element',
    Template = 'template',
    Property = 'property',
    Binding = 'binding'
} 