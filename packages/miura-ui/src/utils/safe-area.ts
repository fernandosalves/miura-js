/**
 * getSafeAreaInsets - Returns an object with safe area insets from CSS env variables.
 * Usage: const insets = getSafeAreaInsets();
 */
export function getSafeAreaInsets(): {
  top: string;
  bottom: string;
  left: string;
  right: string;
} {
  const style = getComputedStyle(document.documentElement);
  return {
    top: style.getPropertyValue('env(safe-area-inset-top)') || '0px',
    bottom: style.getPropertyValue('env(safe-area-inset-bottom)') || '0px',
    left: style.getPropertyValue('env(safe-area-inset-left)') || '0px',
    right: style.getPropertyValue('env(safe-area-inset-right)') || '0px',
  };
} 