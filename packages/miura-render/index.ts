export * from './src/processor/template-result';
export * from './src/processor/processor';
export * from './src/processor/types';
export * from './src/css-result';
export * from './src/utils/debug';
export * from './src/utils/performance';
export { html, getHtmlMetrics, resetHtmlMetrics } from './src/html';
export { css, getCssMetrics, resetCssMetrics, clearCssCache } from './src/css';

export * from './src/directives';
export { TemplateCompiler } from './src/compiler/compiler';
export type { CompiledTemplate } from './src/compiler/compiler';
export { NodeBinding } from './src/binding-manager/bindings/node-binding';
export { DirectiveBinding } from './src/binding-manager/bindings/directive-binding';