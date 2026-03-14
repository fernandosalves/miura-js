import { DirectiveManager } from './directive-manager';
import { IfDirective, ElseIfDirective } from './structural/if.directive';
import { ForDirective } from './structural/for.directive';
import { SwitchDirective } from './structural/switch.directive';
import { VirtualScrollDirective } from './structural/virtual-scroll.directive';
import { AsyncDirective } from './structural/async.directive';

// Initialize core structural directives (always loaded)
DirectiveManager.initialize({
  'if': IfDirective,
  'elseif': ElseIfDirective,
  'for': ForDirective,
  'switch': SwitchDirective,
  'virtualScroll': VirtualScrollDirective,
  'async': AsyncDirective
});

// Register utility directives as lazy loadable
DirectiveManager.registerLazyDirective('resize', async () => {
  const { ResizeDirective } = await import('./resize.directive');
  return ResizeDirective;
});

DirectiveManager.registerLazyDirective('intersect', async () => {
  const { IntersectionDirective } = await import('./intersection.directive');
  return IntersectionDirective;
});

DirectiveManager.registerLazyDirective('focus', async () => {
  const { FocusDirective } = await import('./focus.directive');
  return FocusDirective;
});

DirectiveManager.registerLazyDirective('mutation', async () => {
  const { MutationDirective } = await import('./mutation.directive');
  return MutationDirective;
});

DirectiveManager.registerLazyDirective('lazy', async () => {
  const { LazyDirective } = await import('./lazy.directive');
  return LazyDirective;
});

DirectiveManager.registerLazyDirective('animate', async () => {
  const { AnimateDirective } = await import('./animate.directive');
  return AnimateDirective;
});

DirectiveManager.registerLazyDirective('validate', async () => {
  const { ValidateDirective } = await import('./validate.directive');
  return ValidateDirective;
});

DirectiveManager.registerLazyDirective('media', async () => {
  const { MediaDirective } = await import('./media.directive');
  return MediaDirective;
});

DirectiveManager.registerLazyDirective('gesture', async () => {
  const { GestureDirective } = await import('./gesture.directive');
  return GestureDirective;
});

// Export for manual initialization if needed
export { DirectiveManager }; 