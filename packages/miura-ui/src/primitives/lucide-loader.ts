// Lucide SVG loader for dynamic icon resolution
// Loads SVGs from lucide-static npm package at runtime

// Helper: kebab-case to PascalCase
function toPascalCase(str: string): string {
  return str
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
}

export async function loadLucideIcon(name: string): Promise<string | null> {
  // Only allow valid icon names (basic check)
  if (!/^[a-z0-9-]+$/.test(name)) return null;

  try {
    // Dynamically import the lucide registry. 
    // This allows lazy loading of the large icon bundle, keeping initial JS small.
    const lucide = await import('lucide');
    const pascalName = toPascalCase(name);
    
    // Look up the AST definition directly from the exports
    const iconData = (lucide as Record<string, any>)[pascalName];
    if (!iconData || !Array.isArray(iconData)) return null;

    // Convert Lucide AST to SVG innerHTML string (SSR safe, no DOM required)
    const innerHTML = iconData.map(([tag, attrs]) => {
      const attrString = Object.entries(attrs)
        .map(([k, v]) => {
          // Convert camelCase to kebab-case handling attributes like strokeWidth -> stroke-width
          const kebabKey = k.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
          return `${kebabKey}="${v}"`;
        })
        .join(' ');
      return `<${tag} ${attrString}></${tag}>`;
    }).join('');

    return innerHTML;
  } catch (err) {
    // Not found or failed to load
    return null;
  }
}
