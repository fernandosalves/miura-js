import { CSSResult } from './css-result';
import { TRUSTED_SYMBOL, type TrustedValue } from './html';

/**
 * Marks a string as trusted CSS style text
 */
export function trustCSS(value: string): TrustedValue {
    return {
        [TRUSTED_SYMBOL]: true,
        value: String(value)
    };
}

/**
 * Performance tracking for css function
 */
const cssMetrics = {
  callCount: 0,
  totalTime: 0,
  cacheHits: 0,
  cacheMisses: 0
};

/**
 * CSS cache for repeated styles
 */
const cssCache = new Map<string, CSSResult>();

/**
 * Get performance metrics for css function
 */
export function getCssMetrics() {
  return { ...cssMetrics };
}

/**
 * Reset performance metrics for css function
 */
export function resetCssMetrics() {
  cssMetrics.callCount = 0;
  cssMetrics.totalTime = 0;
  cssMetrics.cacheHits = 0;
  cssMetrics.cacheMisses = 0;
}

/**
 * Clear CSS cache to free memory
 */
export function clearCssCache() {
  cssCache.clear();
}

/**
 * A template literal tag that creates a CSSResult with the given CSS string.
 * @param strings - The static strings from the template literal
 * @param values - The interpolated values from the template literal
 * @returns A CSSResult containing the processed CSS
 */
export function css(strings: TemplateStringsArray, ...values: unknown[]): CSSResult {
  const startTime = performance.now();
  cssMetrics.callCount++;
  
  const cssText = strings.reduce((result, string, i) => {
    const value = values[i];
    return result + string + (i < values.length ? String(value) : '');
  }, '');

  // Check cache for identical CSS
  const cached = cssCache.get(cssText);
  if (cached) {
    cssMetrics.cacheHits++;
    cssMetrics.totalTime = performance.now() - startTime;
    return cached;
  }

  cssMetrics.cacheMisses++;
  const result = new CSSResult(cssText);
  cssCache.set(cssText, result);
  
  cssMetrics.totalTime = performance.now() - startTime;
  return result;
}
