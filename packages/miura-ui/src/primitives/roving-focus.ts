export interface RovingFocusOptions {
  orientation?: 'horizontal' | 'vertical' | 'both';
  loop?: boolean;
}

export function moveRovingFocus(
  currentIndex: number,
  key: string,
  itemCount: number,
  options: RovingFocusOptions = {},
): number {
  if (itemCount <= 0) return -1;

  const orientation = options.orientation ?? 'vertical';
  const loop = options.loop ?? true;
  const previousKeys = orientation === 'horizontal' ? ['ArrowLeft'] : orientation === 'vertical' ? ['ArrowUp'] : ['ArrowLeft', 'ArrowUp'];
  const nextKeys = orientation === 'horizontal' ? ['ArrowRight'] : orientation === 'vertical' ? ['ArrowDown'] : ['ArrowRight', 'ArrowDown'];

  if (key === 'Home') return 0;
  if (key === 'End') return itemCount - 1;

  if (previousKeys.includes(key)) {
    const next = currentIndex - 1;
    return next < 0 ? (loop ? itemCount - 1 : 0) : next;
  }

  if (nextKeys.includes(key)) {
    const next = currentIndex + 1;
    return next >= itemCount ? (loop ? 0 : itemCount - 1) : next;
  }

  return currentIndex;
}
