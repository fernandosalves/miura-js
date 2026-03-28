export type IconDefinition = {
    viewBox?: string;
    paths: string[];
};

const DEFAULT_VIEWBOX = '0 0 24 24';

const lucideIcons: Record<string, IconDefinition> = {
    plus: { paths: ['M12 5v14', 'M5 12h14'] },
    minus: { paths: ['M5 12h14'] },
    x: { paths: ['M18 6 6 18', 'm6 6 12 12'] },
    check: { paths: ['M20 6 9 17l-5-5'] },
    search: { paths: ['m21 21-4.34-4.34', 'M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z'] },
    menu: { paths: ['M4 12h16', 'M4 6h16', 'M4 18h16'] },
    maximize2: { paths: ['M15 3h6v6', 'M9 21H3v-6', 'M21 3l-7 7', 'M3 21l7-7'] },
    home: { paths: ['m3 10.5 9-7 9 7', 'M5 9.056V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.056'] },
    user: { paths: ['M19 21a7 7 0 0 0-14 0', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z'] },
    users: { paths: ['M16 21a4 4 0 0 0-8 0', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M22 21a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75', 'M2 21a4 4 0 0 1 3-3.87', 'M8 3.13a4 4 0 0 0 0 7.75'] },
    bell: { paths: ['M10.268 21a2 2 0 0 0 3.464 0', 'M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .737-1.674C19.41 13.858 18 11.6 18 8a6 6 0 0 0-12 0c0 3.6-1.411 5.858-2.738 7.326'] },
    settings: { paths: ['M12 3a2 2 0 0 1 2 2v.157a7.997 7.997 0 0 1 2.12.879l.111-.111a2 2 0 1 1 2.828 2.828l-.11.111A7.997 7.997 0 0 1 19.843 10H20a2 2 0 1 1 0 4h-.157a7.997 7.997 0 0 1-.879 2.12l.11.111a2 2 0 1 1-2.828 2.828l-.111-.11A7.997 7.997 0 0 1 14 19.843V20a2 2 0 1 1-4 0v-.157a7.997 7.997 0 0 1-2.12-.879l-.111.11a2 2 0 1 1-2.828-2.828l.11-.111A7.997 7.997 0 0 1 4.157 14H4a2 2 0 1 1 0-4h.157a7.997 7.997 0 0 1 .879-2.12l-.11-.111a2 2 0 1 1 2.828-2.828l.111.11A7.997 7.997 0 0 1 10 4.157V4a2 2 0 0 1 2-1Z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'] },
    eye: { paths: ['M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0', 'M14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0'] },
    image: { paths: ['M15 8h.01', 'M3 6.5A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z', 'm3 15 6-6c.928-.893 2.072-.893 3 0l6 6'] },
    upload: { paths: ['M12 16V4', 'm7 7-7-7-7 7', 'M20 16.742A4 4 0 0 1 18 24H6a4 4 0 0 1-2-7.258'] },
    download: { paths: ['M12 3v12', 'm7-5-7 7-7-7', 'M5 21h14'] },
    mail: { paths: ['m22 7-8.991 5.727a2 2 0 0 1-2.018 0L2 7', 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z'] },
    calendar: { paths: ['M8 2v4', 'M16 2v4', 'M3 10h18', 'M8 14h.01', 'M12 14h.01', 'M16 14h.01', 'M8 18h.01', 'M12 18h.01', 'M16 18h.01', 'M5 22h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z'] },
    chevronLeft: { paths: ['m15 18-6-6 6-6'] },
    chevronRight: { paths: ['m9 18 6-6-6-6'] },
    chevronUp: { paths: ['m18 15-6-6-6 6'] },
    chevronDown: { paths: ['m6 9 6 6 6-6'] },
    columns2: { paths: ['M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z', 'M12 3v18'] },
    arrowLeft: { paths: ['m12 19-7-7 7-7', 'M19 12H5'] },
    arrowRight: { paths: ['M5 12h14', 'm12 5 7 7-7 7'] },
    arrowUp: { paths: ['m12 5 7 7', 'm12 5-7 7', 'M12 19V5'] },
    arrowDown: { paths: ['m12 19 7-7', 'm12 19-7-7', 'M12 5v14'] },
    pencil: { paths: ['M12 20h9', 'M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4Z'] },
    copy: { paths: ['M15 2H6a2 2 0 0 0-2 2v11', 'M9 6h9a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z'] },
    info: { paths: ['M12 16v-4', 'M12 8h.01', 'M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Z'] },
    alertTriangle: { paths: ['m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3', 'M12 9v4', 'M12 17h.01'] },
    externalLink: { paths: ['M15 3h6v6', 'M10 14 21 3', 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'] },
    link: { paths: ['M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71', 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'] },
    refreshCw: { paths: ['M3 2v6h6', 'M21 22v-6h-6', 'M21 10A9 9 0 0 0 6 5.3L3 8', 'M3 14a9 9 0 0 0 15 4.7l3-2.7'] },
    moreHorizontal: { paths: ['M5 12h.01', 'M12 12h.01', 'M19 12h.01'] },
    trash: { paths: ['M3 6h18', 'M8 6V4h8v2', 'M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6', 'M10 11v6', 'M14 11v6'] },
    save: { paths: ['M15.2 3a2 2 0 0 1 1.4.586l3.814 3.814A2 2 0 0 1 21 8.814V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z', 'M17 21v-7a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v7', 'M7 3v4a2 2 0 0 0 2 2h6'] },
    loaderCircle: { paths: ['M21 12a9 9 0 1 1-6.219-8.56'] },
};

const registry = new Map<string, IconDefinition>();
const aliases = new Map<string, string>();

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

function addAliases(name: string): void {
    const normalized = normalizeIconName(name);
    aliases.set(normalized, name);
    aliases.set(name, name);
}

for (const [name, icon] of Object.entries(lucideIcons)) {
    registry.set(name, { viewBox: DEFAULT_VIEWBOX, ...icon });
    addAliases(name);
}

export function registerIcon(name: string, icon: IconDefinition): void {
    registry.set(name, { viewBox: DEFAULT_VIEWBOX, ...icon });
    addAliases(name);
}

export function registerIcons(icons: Record<string, IconDefinition>): void {
    for (const [name, icon] of Object.entries(icons)) {
        registerIcon(name, icon);
    }
}

export function getIcon(name: string): IconDefinition | undefined {
    const canonicalName = aliases.get(name) || aliases.get(normalizeIconName(name)) || name;
    return registry.get(canonicalName);
}

export function listIcons(): string[] {
    return Array.from(registry.keys()).sort();
}
