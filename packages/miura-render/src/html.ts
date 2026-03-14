import { TemplateResult } from './processor/template-result';

export interface HtmlOptions {
  compiledMode?: boolean;
}

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