import {
    AlertTriangle,
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    Bell,
    Calendar,
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    CloudCheck,
    Columns2,
    Copy,
    Download,
    ExternalLink,
    Eye,
    Home,
    Image,
    Info,
    Link,
    LoaderCircle,
    Mail,
    Maximize2,
    Menu,
    Minus,
    MoreHorizontal,
    Pencil,
    Plus,
    RefreshCw,
    Save,
    Search,
    Settings,
    Trash,
    Upload,
    User,
    Users,
    X,
    type IconNode as LucideIconNode,
} from 'lucide';

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

const builtInIcons = {
    plus: Plus,
    minus: Minus,
    x: X,
    check: Check,
    search: Search,
    menu: Menu,
    maximize2: Maximize2,
    home: Home,
    user: User,
    users: Users,
    bell: Bell,
    settings: Settings,
    eye: Eye,
    image: Image,
    upload: Upload,
    download: Download,
    mail: Mail,
    calendar: Calendar,
    chevronLeft: ChevronLeft,
    chevronRight: ChevronRight,
    chevronUp: ChevronUp,
    chevronDown: ChevronDown,
    columns2: Columns2,
    arrowLeft: ArrowLeft,
    arrowRight: ArrowRight,
    arrowUp: ArrowUp,
    arrowDown: ArrowDown,
    pencil: Pencil,
    copy: Copy,
    info: Info,
    alertTriangle: AlertTriangle,
    externalLink: ExternalLink,
    link: Link,
    cloudCheck: CloudCheck,
    refreshCw: RefreshCw,
    moreHorizontal: MoreHorizontal,
    trash: Trash,
    save: Save,
    loaderCircle: LoaderCircle,
} satisfies Record<string, IconNode>;

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

function addAliases(name: string): void {
    const normalized = normalizeIconName(name);
    aliases.set(normalized, name);
    aliases.set(name, name);
}

for (const [name, iconNode] of Object.entries(builtInIcons)) {
    registry.set(name, normalizeIconDefinition(iconNode));
    addAliases(name);
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
