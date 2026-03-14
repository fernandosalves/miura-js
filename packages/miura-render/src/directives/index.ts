// Export base types
export * from './directive';
export * from './directive-manager';
export * from './decorators';

// Initialize lazy loading setup by default
import './lazy-setup';

// Export core directives (always available)
export * from './resize.directive';
export * from './intersection.directive';
export * from './focus.directive';
export * from './mutation.directive';
export { IfDirective, ElseIfDirective } from './structural/if.directive';
export * from './structural/for.directive';
export * from './structural/switch.directive';
export { VirtualScrollDirective } from './structural/virtual-scroll.directive';
export type { VirtualScrollDirectiveConfig } from './structural/virtual-scroll.directive';
export { AsyncDirective } from './structural/async.directive';
export type { AsyncDirectiveConfig } from './structural/async.directive';
export { repeat, RepeatResult } from './repeat';
export type { KeyFn, TemplateFn } from './repeat';
export { when } from './when';
export { choose } from './choose';
export type { ChoiceCase } from './choose';
export { resolveAsync, createAsyncTracker } from './await';
export type { AsyncTracker } from './await';
export { computeVirtualSlice } from './virtual-scroll';
export type { VirtualScrollConfig, VirtualScrollResult } from './virtual-scroll';

// Export innovative directives (lazy loaded)
// These are available but will only be loaded when used
export * from './lazy.directive';
export * from './animate.directive';
export * from './validate.directive';
export * from './media.directive';
export * from './gesture.directive';

// Export the directive manager for advanced usage
export * from './directive-manager';
export * from './lazy-setup';
export * from './utils';

// Export decorators for easy directive registration
export { directive, lazyDirective } from './decorators';