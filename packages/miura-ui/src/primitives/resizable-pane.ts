export interface ResizePaneState {
  size: number;
  min: number;
  max: number;
}

export function clampPaneSize(size: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, size));
}

export function createResizePaneState(size: number, min = 180, max = 720): ResizePaneState {
  return {
    size: clampPaneSize(size, min, max),
    min,
    max,
  };
}
