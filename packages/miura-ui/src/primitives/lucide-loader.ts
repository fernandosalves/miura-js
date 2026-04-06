// Lucide SVG loader for dynamic icon resolution
// Loads SVGs from lucide-static npm package at runtime

export async function loadLucideIcon(name: string): Promise<string | null> {
  // Only allow valid icon names (basic check)
  if (!/^[a-z0-9-]+$/.test(name)) return null;
  try {
    // @ts-ignore - Vite/webpack will resolve this at build time
    const svg: string = await import(
      /* @vite-ignore */
      `lucide-static/icons/${name}.svg?raw`
    ).then(m => m.default || m);
    return svg;
  } catch (err) {
    // Not found or failed to load
    return null;
  }
}
