export const MARKER_PREFIX = '<!--';
export const MARKER_SUFFIX = '-->';

export function createMarker(index: number): string {
  return `${MARKER_PREFIX}${index}${MARKER_SUFFIX}`;
}

export function createMarkerSelector(index: number): string {
  return `*:has(+ comment:contains("${index}"))`;
} 