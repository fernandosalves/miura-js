import { TemplateResult, TRUSTED_SYMBOL, TrustedValue } from './processor/template-result';
export { TRUSTED_SYMBOL };
export type { TrustedValue };

export interface HtmlOptions {
  compiledMode?: boolean;
}

export interface TrustedHTMLOptions {
  afterRender?: (root: DocumentFragment | Element) => void;
}

export type TrustedHTMLAfterRender = NonNullable<TrustedHTMLOptions['afterRender']>;

/**
 * Compose post-render HTML enhancers into a single afterRender callback.
 */
export function enhance(...enhancers: Array<TrustedHTMLAfterRender | null | undefined | false>): TrustedHTMLAfterRender {
    const activeEnhancers = enhancers.filter((fn): fn is TrustedHTMLAfterRender => typeof fn === 'function');
    return (root) => {
        for (const enhancer of activeEnhancers) {
            enhancer(root);
        }
    };
}

/**
 * Marks a string as trusted HTML for raw subtree rendering.
 *
 * Use this only with already-sanitized HTML. Miura will insert the value as
 * DOM nodes and will call `afterRender` after those nodes are mounted.
 */
export function trustedHTML(value: string, options: TrustedHTMLOptions = {}): TrustedValue {
    return {
        [TRUSTED_SYMBOL]: true,
        value: String(value),
        afterRender: options.afterRender
    };
}

/** Backwards-compatible alias for trustedHTML(). */
export const trustHTML = trustedHTML;

/**
 * Performance tracking for html function
 */
const htmlMetrics = {
  callCount: 0,
  totalTime: 0
};

/**
 * Get performance metrics for html function
 */
export function getHtmlMetrics() {
  return { ...htmlMetrics };
}

/**
 * Reset performance metrics for html function
 */
export function resetHtmlMetrics() {
  htmlMetrics.callCount = 0;
  htmlMetrics.totalTime = 0;
}

export function html(strings: TemplateStringsArray, ...values: any[]): TemplateResult {
  const startTime = performance.now();
  htmlMetrics.callCount++;
  
  const result = new TemplateResult(strings, values);
  
  htmlMetrics.totalTime = performance.now() - startTime;
  return result;
}

export { TemplateResult };

export enum ElementNamespace {
    HTML = 'http://www.w3.org/1999/xhtml',
    SVG = 'http://www.w3.org/2000/svg',
    MathML = 'http://www.w3.org/1998/Math/MathML',
    // Add other namespaces as needed
}
