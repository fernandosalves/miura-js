import { icons, type IconNode as LucideIconNode } from 'lucide';

export type IconNode = LucideIconNode;

export type IconDefinition = {
    viewBox?: string;
    iconNode?: IconNode;
    paths?: string[];
};

export type ResolvedIconDefinition = {
    viewBox: string;
    iconNode: IconNode;
};

type IconRegistration = IconDefinition | IconNode;

const DEFAULT_VIEWBOX = '0 0 24 24';

const registry = new Map<string, ResolvedIconDefinition>();
const aliases = new Map<string, string>();

function toIconNode(paths: string[]): IconNode {
    return paths.map((path) => ['path', { d: path }]);
}

function normalizeIconDefinition(icon: IconRegistration): ResolvedIconDefinition {
    if (Array.isArray(icon)) {
        return { viewBox: DEFAULT_VIEWBOX, iconNode: icon };
    }

    if (icon.iconNode) {
        return {
            viewBox: icon.viewBox ?? DEFAULT_VIEWBOX,
            iconNode: icon.iconNode,
        };
    }

    if (icon.paths) {
        return {
            viewBox: icon.viewBox ?? DEFAULT_VIEWBOX,
            iconNode: toIconNode(icon.paths),
        };
    }

    throw new Error('Invalid icon registration. Expected iconNode or paths.');
}

function toKebabCase(value: string): string {
    return value
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/([a-zA-Z])([0-9])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
}

function normalizeIconName(name: string): string {
    return toKebabCase(name.trim());
}

function toLowerCamelCase(value: string): string {
    return value.length > 0 ? `${value.charAt(0).toLowerCase()}${value.slice(1)}` : value;
}

function addAliases(name: string): void {
    const normalized = normalizeIconName(name);
    aliases.set(normalized, name);
    aliases.set(name, name);
}

for (const [exportName, iconNode] of Object.entries(icons)) {
    const canonicalName = toLowerCamelCase(exportName);
    registry.set(canonicalName, normalizeIconDefinition(iconNode));
    addAliases(canonicalName);
    aliases.set(exportName, canonicalName);
}

export function registerIcon(name: string, icon: IconRegistration): void {
    registry.set(name, normalizeIconDefinition(icon));
    addAliases(name);
}

export function registerIcons(icons: Record<string, IconRegistration>): void {
    for (const [name, icon] of Object.entries(icons)) {
        registerIcon(name, icon);
    }
}

export function getIcon(name: string): ResolvedIconDefinition | undefined {
    const canonicalName = aliases.get(name) || aliases.get(normalizeIconName(name)) || name;
    return registry.get(canonicalName);
}

export function listIcons(): string[] {
    return Array.from(registry.keys()).sort();
}
