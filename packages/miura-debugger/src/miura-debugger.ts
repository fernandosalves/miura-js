// Shared diagnostics and developer-runtime support for the Miura framework.

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type DiagnosticSeverity = 'info' | 'warning' | 'error';
export type DiagnosticSubsystem = 'element' | 'render' | 'router' | 'framework' | 'data-flow' | 'island' | 'debugger';
export type DiagnosticStage =
    | 'render'
    | 'update'
    | 'binding'
    | 'directive'
    | 'navigation'
    | 'loader'
    | 'plugin'
    | 'hydration'
    | 'runtime';

export interface DebugConfig {
    processor?: boolean;
    parser?: boolean;
    compiler?: boolean;
    bindingManager?: boolean;
    eventModifier?: boolean;
    eventBinding?: boolean;
    styleBinding?: boolean;
    classBinding?: boolean;
    propertyBinding?: boolean;
    booleanBinding?: boolean;
    attributeBinding?: boolean;
    referenceBinding?: boolean;
    modifier?: boolean;
    directiveBinding?: boolean;
    directiveManager?: boolean;
    intersect?: boolean;
    focus?: boolean;
    lazy?: boolean;
    animate?: boolean;
    validate?: boolean;
    media?: boolean;
    gesture?: boolean;
    renderer?: boolean;
    element?: boolean;
    resize?: boolean;
    directives?: boolean;
    mutation?: boolean;
    structural?: boolean;
    if?: boolean;
    elseif?: boolean;
    for?: boolean;
    render?: boolean;
    switch?: boolean;
    virtualScroll?: boolean;
    async?: boolean;
}

export interface MiuraDebuggerOptions {
    disabled?: boolean;
    report?: boolean;
    overlay?: boolean;
    layers?: boolean;
    performance?: boolean;
    openOnError?: boolean;
    openOnWarning?: boolean;
    openOnTimeline?: boolean;
    maxDiagnostics?: number;
    maxTimelineEvents?: number;
}

export interface ComponentDebugOptions extends Omit<MiuraDebuggerOptions, 'maxDiagnostics'> {
    label?: string;
    color?: string;
    showName?: boolean;
    showRenderTime?: boolean;
}

export interface MiuraDiagnosticAdvice {
    title: string;
    detail: string;
}

export interface MiuraDiagnostic {
    id: string;
    timestamp: number;
    severity: DiagnosticSeverity;
    subsystem: DiagnosticSubsystem;
    stage: DiagnosticStage;
    message: string;
    summary?: string;
    stack?: string;
    componentTag?: string;
    componentClass?: string;
    propertyName?: string;
    bindingIndex?: number;
    bindingLabel?: string;
    bindingKind?: string;
    directiveName?: string;
    routePath?: string;
    pluginName?: string;
    elementTag?: string;
    templateFragment?: string;
    valuesSnapshot?: Record<string, unknown>;
    error?: unknown;
    advice?: MiuraDiagnosticAdvice[];
    element?: HTMLElement | null;
    internalDetails?: Record<string, unknown>;
}

export interface DebugLayerSnapshot {
    id: string;
    label: string;
    element: HTMLElement;
    status: 'idle' | 'updated' | 'error';
    componentTag?: string;
    componentClass?: string;
    renderTime?: number;
    updateCount?: number;
    errorMessage?: string;
    color?: string;
    showName?: boolean;
    showRenderTime?: boolean;
    valuesSnapshot?: Record<string, unknown>;
    metrics?: Record<string, unknown>;
    resources?: Array<Record<string, unknown>>;
    forms?: Array<Record<string, unknown>>;
    routes?: Array<Record<string, unknown>>;
}

export interface MiuraTimelineEvent {
    id: string;
    timestamp: number;
    subsystem: DiagnosticSubsystem;
    stage: DiagnosticStage;
    message: string;
    severity?: DiagnosticSeverity;
    componentTag?: string;
    componentClass?: string;
    routePath?: string;
    pluginName?: string;
    element?: HTMLElement | null;
    values?: Record<string, unknown>;
}

type DiagnosticListener = (diagnostics: MiuraDiagnostic[]) => void;
type LayerListener = (layers: DebugLayerSnapshot[]) => void;
type TimelineListener = (events: MiuraTimelineEvent[]) => void;
type DiagnosticFilter = 'all' | 'errors' | 'warnings';

const DEFAULT_OPTIONS: Required<MiuraDebuggerOptions> = {
    disabled: false,
    report: false,
    overlay: true,
    layers: false,
    performance: false,
    openOnError: true,
    openOnWarning: false,
    openOnTimeline: false,
    maxDiagnostics: 20,
    maxTimelineEvents: 80,
};

let debuggerOptions: Required<MiuraDebuggerOptions> = { ...DEFAULT_OPTIONS };
let diagnostics: MiuraDiagnostic[] = [];
let timelineEvents: MiuraTimelineEvent[] = [];
const diagnosticListeners = new Set<DiagnosticListener>();
const layerRegistry = new Map<HTMLElement, DebugLayerSnapshot>();
const layerListeners = new Set<LayerListener>();
const timelineListeners = new Set<TimelineListener>();
const COMPONENT_DEBUG_OPTIONS = Symbol.for('miura.component.debug.options');

function canUseDom(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function notifyDiagnostics(): void {
    const snapshot = [...diagnostics];
    diagnosticListeners.forEach((listener) => listener(snapshot));
}

function notifyLayers(): void {
    const snapshot = Array.from(layerRegistry.values());
    layerListeners.forEach((listener) => listener(snapshot));
}

function notifyTimeline(): void {
    const snapshot = [...timelineEvents];
    timelineListeners.forEach((listener) => listener(snapshot));
}

function serializeUnknown(value: unknown, depth = 0): unknown {
    if (value == null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'function') {
        if ((value as any).__isSignal) {
            try {
                return { type: 'signal', value: serializeUnknown((value as any).peek?.(), depth + 1) };
            } catch {
                return { type: 'signal' };
            }
        }
        return '[Function]';
    }

    if (value instanceof Error) {
        return { name: value.name, message: value.message, stack: value.stack };
    }

    if (value instanceof HTMLElement) {
        return `<${value.tagName.toLowerCase()}>`;
    }

    if (depth > 2) {
        return '[Object]';
    }

    if (Array.isArray(value)) {
        return value.slice(0, 10).map((item) => serializeUnknown(item, depth + 1));
    }

    if (typeof value === 'object') {
        const entries = Object.entries(value as Record<string, unknown>).slice(0, 20);
        return Object.fromEntries(entries.map(([key, item]) => [key, serializeUnknown(item, depth + 1)]));
    }

    return String(value);
}

function createAdvice(diagnostic: Partial<MiuraDiagnostic>): MiuraDiagnosticAdvice[] {
    const advice: MiuraDiagnosticAdvice[] = [];

    if (diagnostic.bindingKind === 'text') {
        advice.push({
            title: 'Check the expression value',
            detail: 'This looks like a text expression. Guard undefined values or provide a fallback before rendering.',
        });
    }

    if (diagnostic.internalDetails?.code === 'template-function-value') {
        advice.push({
            title: 'Pass a value instead of a function',
            detail: 'If this is a signal, bind the signal object directly or call it before rendering. If this is a callback, use an event/property binding instead of node text.',
        });
    }

    if (diagnostic.internalDetails?.code === 'ambiguous-direct-read') {
        advice.push({
            title: 'Make the binding identity explicit',
            detail: 'Falsy fallback values like empty strings are ambiguous in templates. Bind a signal/field ref directly, call the value explicitly, or use a non-empty sentinel fallback.',
        });
    }

    if (diagnostic.internalDetails?.code === 'trusted-html-non-string') {
        advice.push({
            title: 'Check trustedHTML input',
            detail: 'trustedHTML() is intended for already-sanitized HTML strings. Convert or sanitize the value before marking it as trusted.',
        });
    }

    if (diagnostic.bindingKind === 'directive') {
        advice.push({
            title: 'Check the directive chain',
            detail: 'Verify nearby structural directives and make sure the generated DOM shape stays consistent between updates.',
        });
    }

    if (diagnostic.subsystem === 'router') {
        advice.push({
            title: 'Inspect route state',
            detail: 'Check matched params, loader data, and guards for this navigation. Missing loader keys and redirects are common causes.',
        });
    }

    if (diagnostic.subsystem === 'framework') {
        advice.push({
            title: 'Check framework integration',
            detail: 'Inspect plugin setup, component registration, and the configured router zones involved in this failure.',
        });
    }

    if (diagnostic.subsystem === 'element') {
        advice.push({
            title: 'Inspect component state',
            detail: 'Compare the changed properties and current values shown below with what the template expects at this update stage.',
        });
    }

    return advice;
}

function normalizeDiagnostic(input: Partial<MiuraDiagnostic>): MiuraDiagnostic {
    const error = input.error instanceof Error ? input.error : undefined;
    const valuesSnapshot = input.valuesSnapshot
        ? Object.fromEntries(Object.entries(input.valuesSnapshot).map(([key, value]) => [key, serializeUnknown(value)]))
        : undefined;

    return {
        id: input.id ?? `miura-diagnostic-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: input.timestamp ?? Date.now(),
        severity: input.severity ?? 'error',
        subsystem: input.subsystem ?? 'debugger',
        stage: input.stage ?? 'runtime',
        message: input.message ?? error?.message ?? 'Unknown Miura diagnostic',
        summary: input.summary,
        stack: input.stack ?? error?.stack,
        componentTag: input.componentTag,
        componentClass: input.componentClass,
        propertyName: input.propertyName,
        bindingIndex: input.bindingIndex,
        bindingLabel: input.bindingLabel,
        bindingKind: input.bindingKind,
        directiveName: input.directiveName,
        routePath: input.routePath,
        pluginName: input.pluginName,
        elementTag: input.elementTag,
        templateFragment: input.templateFragment,
        valuesSnapshot,
        error: error ?? input.error,
        advice: input.advice && input.advice.length > 0 ? input.advice : createAdvice(input),
        element: input.element ?? null,
        internalDetails: input.internalDetails,
    };
}

class DebuggerLogger {
    private enabled = false;
    private level: LogLevel = 'debug';
    private categories: Set<string> = new Set();
    private levelOrder: Record<LogLevel, number> = {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3,
    };

    setEnabled(val: boolean) { this.enabled = val; }
    setLevel(level: LogLevel) { this.level = level; }
    enableCategory(cat: string) { this.categories.add(cat); }
    disableCategory(cat: string) { this.categories.delete(cat); }
    clearCategories() { this.categories.clear(); }

    log(cat: string, level: LogLevel, ...args: any[]) {
        if (!this.enabled) return;
        if (this.categories.size && !this.categories.has(cat)) return;
        if (this.levelOrder[level] < this.levelOrder[this.level]) return;
        const prefix = `[${cat.toUpperCase()}][${level.toUpperCase()}]`;
        switch (level) {
            case 'debug':
            case 'info':
                console.log(prefix, ...args);
                break;
            case 'warn':
                console.warn(prefix, ...args);
                break;
            case 'error':
                console.error(prefix, ...args);
                break;
        }
    }
}

export const debug = new DebuggerLogger();

export let debugConfig: DebugConfig = {
    structural: false,
    if: false,
    for: false,
    switch: false,
    directiveManager: false,
};

export function enableDebug(config: DebugConfig) {
    debugConfig = { ...debugConfig, ...config };
}

export function disableDebug() {
    debugConfig = {
        switch: false,
    };
}

export function debugLog(part: keyof DebugConfig, ...args: any[]) {
    if (debugConfig[part]) {
        console.log(`[${part}]`, ...args);
    }
}

export enum DebugType {
    Element = 'element',
    Template = 'template',
    Property = 'property',
    Binding = 'binding',
}

export function getMiuraDebuggerOptions(): Required<MiuraDebuggerOptions> {
    return { ...debuggerOptions };
}

export function isMiuraDebuggerEnabled(): boolean {
    return debuggerOptions.disabled === false;
}

export function enableMiuraDebugger(options: MiuraDebuggerOptions = {}): Required<MiuraDebuggerOptions> {
    debuggerOptions = { ...debuggerOptions, ...options };
    if (!debuggerOptions.disabled && debuggerOptions.overlay) {
        mountMiuraDevOverlay();
    }
    if (debuggerOptions.disabled) {
        unmountMiuraDevOverlay();
    }
    notifyLayers();
    notifyDiagnostics();
    return getMiuraDebuggerOptions();
}

export function disableMiuraDebugger(): void {
    debuggerOptions = { ...DEFAULT_OPTIONS, disabled: true, overlay: false, layers: false, performance: false };
    unmountMiuraDevOverlay();
}

export function reportDiagnostic(input: Partial<MiuraDiagnostic>): MiuraDiagnostic {
    const diagnostic = normalizeDiagnostic(input);
    diagnostics = [diagnostic, ...diagnostics].slice(0, debuggerOptions.maxDiagnostics);
    notifyDiagnostics();
    if (debuggerOptions.overlay && !debuggerOptions.disabled) {
        mountMiuraDevOverlay();
    }
    return diagnostic;
}

export function reportError(input: Omit<Partial<MiuraDiagnostic>, 'severity'>): MiuraDiagnostic {
    return reportDiagnostic({ ...input, severity: 'error' });
}

export function reportWarning(input: Omit<Partial<MiuraDiagnostic>, 'severity'>): MiuraDiagnostic {
    return reportDiagnostic({ ...input, severity: 'warning' });
}

export function clearDiagnostics(): void {
    diagnostics = [];
    notifyDiagnostics();
}

export function getDiagnostics(): MiuraDiagnostic[] {
    return [...diagnostics];
}

export function subscribeDiagnostics(listener: DiagnosticListener): () => void {
    diagnosticListeners.add(listener);
    listener(getDiagnostics());
    return () => diagnosticListeners.delete(listener);
}

export function registerDebugLayer(snapshot: DebugLayerSnapshot): void {
    layerRegistry.set(snapshot.element, snapshot);
    notifyLayers();
}

export function unregisterDebugLayer(element: HTMLElement): void {
    if (layerRegistry.delete(element)) {
        notifyLayers();
    }
}

export function getDebugLayers(): DebugLayerSnapshot[] {
    return Array.from(layerRegistry.values());
}

export function clearDebugLayers(): void {
    layerRegistry.clear();
    notifyLayers();
}

export function subscribeDebugLayers(listener: LayerListener): () => void {
    layerListeners.add(listener);
    listener(getDebugLayers());
    return () => layerListeners.delete(listener);
}

export function reportTimelineEvent(event: Omit<Partial<MiuraTimelineEvent>, 'id' | 'timestamp'> & Pick<MiuraTimelineEvent, 'subsystem' | 'stage' | 'message'>): MiuraTimelineEvent {
    const normalized: MiuraTimelineEvent = {
        id: `miura-timeline-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: Date.now(),
        severity: event.severity ?? 'info',
        subsystem: event.subsystem,
        stage: event.stage,
        message: event.message,
        componentTag: event.componentTag,
        componentClass: event.componentClass,
        routePath: event.routePath,
        pluginName: event.pluginName,
        element: event.element ?? null,
        values: event.values
            ? Object.fromEntries(Object.entries(event.values).map(([key, value]) => [key, serializeUnknown(value)]))
            : undefined,
    };

    timelineEvents = [normalized, ...timelineEvents].slice(0, debuggerOptions.maxTimelineEvents);
    notifyTimeline();
    return normalized;
}

export function getTimelineEvents(): MiuraTimelineEvent[] {
    return [...timelineEvents];
}

export function clearTimelineEvents(): void {
    timelineEvents = [];
    notifyTimeline();
}

export function subscribeTimeline(listener: TimelineListener): () => void {
    timelineListeners.add(listener);
    listener(getTimelineEvents());
    return () => timelineListeners.delete(listener);
}

export function setComponentDebugOptions(target: Function, options: ComponentDebugOptions): void {
    const host = target as unknown as Record<PropertyKey, unknown>;
    host[COMPONENT_DEBUG_OPTIONS] = {
        ...(host[COMPONENT_DEBUG_OPTIONS] as ComponentDebugOptions | undefined),
        ...options,
    };
}

export function getComponentDebugOptions(target: object | Function | null | undefined): ComponentDebugOptions {
    if (!target) {
        return {};
    }

    const source = typeof target === 'function'
        ? target
        : (target as { constructor?: Function }).constructor;

    const value = source ? (source as unknown as Record<PropertyKey, unknown>)[COMPONENT_DEBUG_OPTIONS] : undefined;
    return (value && typeof value === 'object' ? value : {}) as ComponentDebugOptions;
}

class MiuraDevOverlayElement extends HTMLElement {
    private shadow!: ShadowRoot;
    private diagnosticsUnsub?: () => void;
    private layersUnsub?: () => void;
    private timelineUnsub?: () => void;
    private activeIndex = 0;
    private layerSnapshots: DebugLayerSnapshot[] = [];
    private timelineSnapshots: MiuraTimelineEvent[] = [];
    private rafId = 0;
    private dragPointerId: number | null = null;
    private dragOffset = { x: 0, y: 0 };
    private panelPosition = { x: 24, y: 24 };
    private controlsAttached = false;
    private dismissed = false;
    private lastDiagnosticId: string | null = null;
    private lastTimelineId: string | null = null;
    private diagnosticFilter: DiagnosticFilter = 'all';
    private mutedCodes = new Set<string>();
    private copyStatus = '';
    private readonly controlClickHandler = (event: Event) => {
        const target = event.target as HTMLElement | null;
        const action = target?.closest('[data-action]')?.getAttribute('data-action');
        if (!action) return;

        const items = this.getVisibleDiagnostics();
        if (action === 'prev') {
            if (items.length === 0) return;
            this.activeIndex = Math.max(0, this.activeIndex - 1);
            this.render();
            return;
        }

        if (action === 'next') {
            if (items.length === 0) return;
            this.activeIndex = Math.min(items.length - 1, this.activeIndex + 1);
            this.render();
            return;
        }

        if (action === 'filter') {
            const filter = target?.closest('[data-filter]')?.getAttribute('data-filter') as DiagnosticFilter | null;
            if (filter === 'all' || filter === 'errors' || filter === 'warnings') {
                this.diagnosticFilter = filter;
                this.activeIndex = 0;
                this.render();
            }
            return;
        }

        if (action === 'copy') {
            const item = items[this.activeIndex] ?? items[0] ?? null;
            void this.copyDiagnostic(item);
            return;
        }

        if (action === 'mute-code') {
            const item = items[this.activeIndex] ?? items[0] ?? null;
            const code = getDiagnosticCode(item);
            if (code) {
                this.mutedCodes.add(code);
                this.activeIndex = 0;
                this.render();
            }
            return;
        }

        if (action === 'clear') {
            clearDiagnostics();
            return;
        }

        if (action === 'close') {
            this.dismissed = true;
            cancelAnimationFrame(this.rafId);
            this.rafId = 0;
            this.renderFocusHighlight(null);
            this.renderLayerHighlights();
            this.render();
        }
    };

    connectedCallback(): void {
        if (!this.shadowRoot) {
            this.shadow = this.attachShadow({ mode: 'open' });
            this.shadow.innerHTML = this.template();
            this.attachDragHandlers();
        } else {
            this.shadow = this.shadowRoot;
        }

        this.diagnosticsUnsub = subscribeDiagnostics((items) => {
            const nextDiagnostic = items[0] ?? null;
            const nextId = nextDiagnostic?.id ?? null;
            const shouldOpenForDiagnostic = nextDiagnostic?.severity === 'error'
                ? debuggerOptions.openOnError
                : nextDiagnostic?.severity === 'warning'
                    ? debuggerOptions.openOnWarning
                    : false;
            if (nextId && nextId !== this.lastDiagnosticId && shouldOpenForDiagnostic) {
                this.dismissed = false;
            }
            this.lastDiagnosticId = nextId;
            this.activeIndex = Math.min(this.activeIndex, Math.max(this.getVisibleDiagnostics(items).length - 1, 0));
            this.render();
        });

        this.layersUnsub = subscribeDebugLayers((layers) => {
            this.layerSnapshots = layers;
            this.renderLayerHighlights();
        });

        this.timelineUnsub = subscribeTimeline((events) => {
            const nextId = events[0]?.id ?? null;
            if (nextId && nextId !== this.lastTimelineId && debuggerOptions.openOnTimeline) {
                this.dismissed = false;
            }
            this.lastTimelineId = nextId;
            this.timelineSnapshots = events;
            this.render();
        });

        this.render();
        this.renderLayerHighlights();
        this.attachControlHandlers();
    }

    disconnectedCallback(): void {
        this.diagnosticsUnsub?.();
        this.layersUnsub?.();
        this.timelineUnsub?.();
        this.shadow.removeEventListener('click', this.controlClickHandler);
        this.controlsAttached = false;
        cancelAnimationFrame(this.rafId);
        this.rafId = 0;
    }

    private template(): string {
        return `
            <style>
                :host {
                    position: fixed;
                    inset: 0;
                    pointer-events: none;
                    z-index: 2147483647;
                    font-family: ui-sans-serif, system-ui, sans-serif;
                    color: #f7f7f7;
                }
                .panel {
                    position: fixed;
                    top: 24px;
                    left: 24px;
                    width: min(720px, calc(100vw - 48px));
                    max-height: min(80vh, 760px);
                    overflow: auto;
                    border-radius: 18px;
                    background: rgba(8, 8, 10, 0.96);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
                    pointer-events: auto;
                    backdrop-filter: blur(18px);
                    z-index: 30;
                }
                .hidden { display: none; }
                .header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                    padding: 14px 18px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    cursor: move;
                    user-select: none;
                }
                .badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    padding: 6px 10px;
                    border-radius: 999px;
                    background: rgba(255, 94, 94, 0.12);
                    color: #ff8787;
                    font-weight: 700;
                    letter-spacing: 0.04em;
                    text-transform: uppercase;
                }
                .controls {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                button {
                    background: rgba(255, 255, 255, 0.08);
                    color: inherit;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    padding: 6px 10px;
                    font: inherit;
                    cursor: pointer;
                }
                button:hover {
                    background: rgba(255, 255, 255, 0.12);
                }
                button.active {
                    background: rgba(255, 255, 255, 0.18);
                    border-color: rgba(255, 255, 255, 0.26);
                }
                .body {
                    padding: 18px;
                    display: grid;
                    gap: 14px;
                }
                .message {
                    font-size: 28px;
                    line-height: 1.25;
                    color: #ff8f8f;
                    margin: 0;
                }
                .subtle {
                    color: rgba(255, 255, 255, 0.72);
                    font-size: 14px;
                    line-height: 1.55;
                }
                .section {
                    display: grid;
                    gap: 8px;
                    padding: 14px;
                    border-radius: 14px;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }
                .toolbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                    flex-wrap: wrap;
                }
                .filter-group {
                    display: inline-flex;
                    gap: 6px;
                    padding: 4px;
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.05);
                }
                .chip-row {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                .chip {
                    display: inline-flex;
                    align-items: center;
                    border-radius: 999px;
                    padding: 4px 8px;
                    background: rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.82);
                    font: 11px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace;
                }
                .chip.error {
                    background: rgba(255, 95, 95, 0.18);
                    color: #ffaaaa;
                }
                .chip.warning {
                    background: rgba(255, 190, 95, 0.18);
                    color: #ffd39a;
                }
                .section-title {
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    color: rgba(255, 255, 255, 0.58);
                    margin: 0;
                }
                .row {
                    display: grid;
                    grid-template-columns: 140px 1fr;
                    gap: 10px;
                    font-size: 14px;
                }
                pre {
                    margin: 0;
                    white-space: pre-wrap;
                    word-break: break-word;
                    font: 12px/1.55 ui-monospace, SFMono-Regular, Menlo, monospace;
                    color: #f3f3f3;
                }
                .advice {
                    display: grid;
                    gap: 8px;
                }
                .advice-item {
                    padding: 10px 12px;
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.05);
                }
                .layer-root {
                    position: fixed;
                    inset: 0;
                    pointer-events: none;
                    z-index: 10;
                }
                .focus-root {
                    position: fixed;
                    inset: 0;
                    pointer-events: none;
                    z-index: 20;
                }
                .focus-box {
                    position: fixed;
                    border: 2px solid rgba(255, 95, 95, 0.96);
                    background: rgba(255, 95, 95, 0.16);
                    border-radius: 10px;
                    box-sizing: border-box;
                    box-shadow: 0 0 0 1px rgba(255, 95, 95, 0.25), 0 0 40px rgba(255, 95, 95, 0.16);
                }
                .focus-label {
                    position: absolute;
                    top: -28px;
                    left: 0;
                    padding: 5px 10px;
                    border-radius: 999px;
                    background: rgba(24, 6, 6, 0.96);
                    border: 1px solid rgba(255, 95, 95, 0.35);
                    color: #ffb4b4;
                    font-size: 11px;
                    font-weight: 700;
                    white-space: nowrap;
                }
                .layer-box {
                    position: fixed;
                    border: 1px solid rgba(79, 172, 254, 0.9);
                    background: transparent;
                    border-radius: 8px;
                    box-sizing: border-box;
                    pointer-events: none;
                }
                .layer-box.error {
                    border-color: rgba(255, 95, 95, 0.95);
                    background: transparent;
                }
                .layer-label {
                    position: absolute;
                    top: -22px;
                    left: 0;
                    padding: 4px 8px;
                    border-radius: 999px;
                    background: rgba(8, 8, 10, 0.92);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    color: #fff;
                    font-size: 11px;
                    white-space: nowrap;
                    pointer-events: none;
                }
            </style>
            <div class="panel hidden" part="panel">
                <div class="header" part="header">
                    <div>
                        <div class="badge">Miura Debugger</div>
                    </div>
                    <div class="controls">
                        <button type="button" data-action="prev">Prev</button>
                        <button type="button" data-action="next">Next</button>
                        <button type="button" data-action="close">Close</button>
                        <button type="button" data-action="clear">Clear</button>
                    </div>
                </div>
                <div class="body" part="body"></div>
            </div>
            <div class="layer-root" part="layers"></div>
            <div class="focus-root" part="focus"></div>
        `;
    }

    private attachDragHandlers(): void {
        const header = this.shadow.querySelector('.header') as HTMLElement | null;
        const panel = this.shadow.querySelector('.panel') as HTMLElement | null;
        if (!header || !panel) return;

        header.addEventListener('pointerdown', (event) => {
            const target = event.target as HTMLElement | null;
            if (target?.closest('.controls, button')) {
                return;
            }
            this.dragPointerId = event.pointerId;
            this.dragOffset = {
                x: event.clientX - this.panelPosition.x,
                y: event.clientY - this.panelPosition.y,
            };
            header.setPointerCapture(event.pointerId);
        });

        header.addEventListener('pointermove', (event) => {
            if (this.dragPointerId !== event.pointerId) return;
            this.panelPosition = {
                x: Math.max(12, event.clientX - this.dragOffset.x),
                y: Math.max(12, event.clientY - this.dragOffset.y),
            };
            panel.style.left = `${this.panelPosition.x}px`;
            panel.style.top = `${this.panelPosition.y}px`;
        });

        header.addEventListener('pointerup', (event) => {
            if (this.dragPointerId !== event.pointerId) return;
            this.dragPointerId = null;
            header.releasePointerCapture(event.pointerId);
        });
    }

    private render(): void {
        const panel = this.shadow.querySelector('.panel') as HTMLElement | null;
        const body = this.shadow.querySelector('.body') as HTMLElement | null;
        if (!panel || !body) return;

        const allItems = getDiagnostics();
        const items = this.getVisibleDiagnostics(allItems);
        const hasTimeline = this.timelineSnapshots.length > 0;
        const shouldShowForError = debuggerOptions.openOnError && allItems.some((item) => item.severity === 'error' && !this.isMuted(item));
        const shouldShowForWarning = debuggerOptions.openOnWarning && allItems.some((item) => item.severity === 'warning' && !this.isMuted(item));
        const shouldShowForTimeline = debuggerOptions.openOnTimeline && allItems.length === 0 && hasTimeline;

        if ((!shouldShowForError && !shouldShowForWarning && !shouldShowForTimeline) || this.dismissed) {
            panel.classList.add('hidden');
            if (!shouldShowForError && !shouldShowForWarning && !shouldShowForTimeline) {
                body.innerHTML = '';
            }
            this.renderFocusHighlight(null);
            this.renderLayerHighlights();
            return;
        }

        panel.classList.remove('hidden');
        panel.style.left = `${this.panelPosition.x}px`;
        panel.style.top = `${this.panelPosition.y}px`;
        const item = items[this.activeIndex] ?? items[0] ?? null;
        const toolbar = this.renderDiagnosticsToolbar(allItems, item);

        if (!item) {
            body.innerHTML = `
                ${toolbar}
                <div class="section">
                    <div class="subtle">debugger / runtime timeline</div>
                    <p class="message">Miura debugger timeline</p>
                    <div class="subtle">
                        This view stays open while runtime events accumulate, even when there is no active error.
                    </div>
                </div>
                ${this.renderTimelineSection(null, 12)}
            `;
            this.renderFocusHighlight(null);
            return;
        }

        const adviceHtml = (item.advice ?? []).map((entry) => `
            <div class="advice-item">
                <strong>${entry.title}</strong>
                <div class="subtle">${entry.detail}</div>
            </div>
        `).join('');
        const contextRows = renderContextRows(item);
        const code = getDiagnosticCode(item);
        const elementPath = getElementPath(item.element);

        body.innerHTML = `
            ${toolbar}
            <div class="section">
                <div class="subtle">${item.subsystem} / ${item.stage}</div>
                <div class="chip-row">
                    <span class="chip ${item.severity}">${escapeHtml(item.severity)}</span>
                    ${code ? `<span class="chip">${escapeHtml(code)}</span>` : ''}
                    ${elementPath ? `<span class="chip">${escapeHtml(elementPath)}</span>` : ''}
                </div>
                <p class="message">${escapeHtml(item.message)}</p>
                ${item.summary ? `<div class="subtle">${escapeHtml(item.summary)}</div>` : ''}
            </div>
            ${contextRows ? `
                <div class="section">
                    <p class="section-title">Context</p>
                    ${contextRows}
                </div>
            ` : ''}
            ${item.templateFragment ? `
                <div class="section">
                    <p class="section-title">Template Fragment</p>
                    <pre>${escapeHtml(item.templateFragment)}</pre>
                </div>
            ` : ''}
            ${hasRenderableValues(item.valuesSnapshot) ? `
                <div class="section">
                    <p class="section-title">Values</p>
                    <pre>${escapeHtml(JSON.stringify(item.valuesSnapshot, null, 2))}</pre>
                </div>
            ` : ''}
            ${this.renderSelectedLayerDetails(item.element)}
            ${this.renderTimelineSection(item.element)}
            ${item.stack ? `
                <div class="section">
                    <p class="section-title">Stack</p>
                    <pre>${escapeHtml(formatStack(item.stack))}</pre>
                </div>
            ` : ''}
            ${(item.advice ?? []).length > 0 ? `
                <div class="section advice">
                    <p class="section-title">Advice</p>
                    ${adviceHtml}
                </div>
            ` : ''}
        `;
        this.renderFocusHighlight(item);
    }

    private getVisibleDiagnostics(items = getDiagnostics()): MiuraDiagnostic[] {
        return items.filter((item) => {
            if (this.isMuted(item)) return false;
            if (this.diagnosticFilter === 'errors') return item.severity === 'error';
            if (this.diagnosticFilter === 'warnings') return item.severity === 'warning';
            return true;
        });
    }

    private isMuted(item: MiuraDiagnostic): boolean {
        const code = getDiagnosticCode(item);
        return Boolean(code && this.mutedCodes.has(code));
    }

    private renderDiagnosticsToolbar(allItems: MiuraDiagnostic[], activeItem: MiuraDiagnostic | null): string {
        const visibleCount = this.getVisibleDiagnostics(allItems).length;
        const errorCount = allItems.filter((item) => item.severity === 'error' && !this.isMuted(item)).length;
        const warningCount = allItems.filter((item) => item.severity === 'warning' && !this.isMuted(item)).length;
        const code = getDiagnosticCode(activeItem);

        return `
            <div class="section toolbar">
                <div class="filter-group" aria-label="Diagnostic filter">
                    ${filterButton('All', 'all', this.diagnosticFilter, visibleCount)}
                    ${filterButton('Errors', 'errors', this.diagnosticFilter, errorCount)}
                    ${filterButton('Warnings', 'warnings', this.diagnosticFilter, warningCount)}
                </div>
                <div class="controls">
                    ${this.copyStatus ? `<span class="subtle">${escapeHtml(this.copyStatus)}</span>` : ''}
                    <button type="button" data-action="copy" ${activeItem ? '' : 'disabled'}>Copy Diagnostic</button>
                    <button type="button" data-action="mute-code" ${code ? '' : 'disabled'}>Mute This Code</button>
                </div>
            </div>
        `;
    }

    private async copyDiagnostic(item: MiuraDiagnostic | null): Promise<void> {
        if (!item) return;
        const text = JSON.stringify(serializeDiagnosticForCopy(item), null, 2);
        try {
            await navigator.clipboard?.writeText(text);
            this.copyStatus = 'Copied';
        } catch {
            this.copyStatus = 'Copy unavailable';
        }
        this.render();
        window.setTimeout(() => {
            this.copyStatus = '';
            this.render();
        }, 1200);
    }

    private renderSelectedLayerDetails(element: HTMLElement | null | undefined): string {
        const layer = element
            ? this.layerSnapshots.find((snapshot) => snapshot.element === element) ?? null
            : null;

        if (!layer) {
            return '';
        }

        return this.renderLayerDetailsSection(layer);
    }

    private renderTimelineSection(element?: HTMLElement | null, limit = 8): string {
        const items = this.timelineSnapshots
            .filter((event) => !element || event.element === element)
            .slice(0, limit);

        if (items.length === 0) {
            return '';
        }

        const rows = items.map((event) => {
            const values = event.values ? ` • ${escapeHtml(JSON.stringify(event.values))}` : '';
            const when = new Date(event.timestamp).toLocaleTimeString();
            return `<div class="subtle"><strong>${escapeHtml(when)}</strong> • ${escapeHtml(event.subsystem)} / ${escapeHtml(event.stage)} • ${escapeHtml(event.message)}${values}</div>`;
        }).join('');

        return `
            <div class="section">
                <p class="section-title">Timeline</p>
                ${rows}
            </div>
        `;
    }

    private renderLayerInspector(layer: DebugLayerSnapshot): string {
        return `
            <div class="section">
                <div class="subtle">inspector / component layer</div>
                <p class="message">${escapeHtml(layer.label)}</p>
                ${layer.errorMessage ? `<div class="subtle">${escapeHtml(layer.errorMessage)}</div>` : ''}
            </div>
            <div class="section">
                <p class="section-title">Context</p>
                ${row('Component', layer.componentTag ?? layer.componentClass ?? layer.label)}
                ${row('Status', layer.status)}
                ${row('Updates', String(layer.updateCount ?? 0))}
                ${row('Render', layer.renderTime !== undefined ? `${layer.renderTime.toFixed(2)}ms` : 'n/a')}
            </div>
            ${this.renderLayerDetailsSection(layer)}
        `;
    }

    private renderLayerDetailsSection(layer: DebugLayerSnapshot): string {
        const valuesBlock = layer.valuesSnapshot
            ? `
                <div class="section">
                    <p class="section-title">Component Values</p>
                    <pre>${escapeHtml(JSON.stringify(layer.valuesSnapshot, null, 2))}</pre>
                </div>
            `
            : '';

        const resourcesBlock = layer.resources && layer.resources.length > 0
            ? `
                <div class="section">
                    <p class="section-title">Resources</p>
                    <pre>${escapeHtml(JSON.stringify(layer.resources, null, 2))}</pre>
                </div>
            `
            : '';

        const formsBlock = layer.forms && layer.forms.length > 0
            ? `
                <div class="section">
                    <p class="section-title">Forms</p>
                    <pre>${escapeHtml(JSON.stringify(layer.forms, null, 2))}</pre>
                </div>
            `
            : '';

        const routesBlock = layer.routes && layer.routes.length > 0
            ? `
                <div class="section">
                    <p class="section-title">Route Signals</p>
                    <pre>${escapeHtml(JSON.stringify(layer.routes, null, 2))}</pre>
                </div>
            `
            : '';

        const metricsBlock = layer.metrics
            ? `
                <div class="section">
                    <p class="section-title">Metrics</p>
                    <pre>${escapeHtml(JSON.stringify(layer.metrics, null, 2))}</pre>
                </div>
            `
            : '';

        return `${valuesBlock}${resourcesBlock}${formsBlock}${routesBlock}${metricsBlock}`;
    }

    private attachControlHandlers(): void {
        if (this.controlsAttached) {
            return;
        }
        this.controlsAttached = true;
        this.shadow.addEventListener('click', this.controlClickHandler);
    }

    private renderFocusHighlight(item: MiuraDiagnostic | null): void {
        const root = this.shadow.querySelector('.focus-root') as HTMLElement | null;
        if (!root || debuggerOptions.disabled || !debuggerOptions.overlay) {
            return;
        }

        if (this.dismissed || !item) {
            root.innerHTML = '';
            return;
        }

        const element = item?.element;
        if (!element?.isConnected) {
            root.innerHTML = '';
            return;
        }

        const rect = element.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) {
            root.innerHTML = '';
            return;
        }

        const label = item?.componentTag ?? item?.componentClass ?? 'Error source';
        root.innerHTML = `
            <div class="focus-box"
                style="left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;">
                <div class="focus-label">${escapeHtml(label)}</div>
            </div>
        `;
    }

    private renderLayerHighlights(): void {
        const root = this.shadow.querySelector('.layer-root') as HTMLElement | null;
        if (!root) return;

        if (!debuggerOptions.layers || debuggerOptions.disabled || this.dismissed) {
            root.innerHTML = '';
            return;
        }

        const items = this.layerSnapshots
            .filter((snapshot) => snapshot.element.isConnected)
            .map((snapshot) => {
                const rect = snapshot.element.getBoundingClientRect();
                if (rect.width === 0 && rect.height === 0) return '';
                const showName = snapshot.showName !== false;
                const showRenderTime = snapshot.showRenderTime ?? debuggerOptions.performance;
                const label = showRenderTime && snapshot.renderTime !== undefined
                    ? `${snapshot.label} • ${snapshot.renderTime.toFixed(2)}ms`
                    : snapshot.label;
                const color = snapshot.color ?? (snapshot.status === 'error' ? '255, 95, 95' : '79, 172, 254');

                return `
                    <div class="layer-box ${snapshot.status === 'error' ? 'error' : ''}"
                        style="left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;border-color:rgba(${color},0.95);box-shadow:0 0 0 1px rgba(${color},0.18), 0 0 26px rgba(${color},0.18);">
                        ${showName ? `<div class="layer-label">${escapeHtml(label)}</div>` : ''}
                    </div>
                `;
            })
            .join('');

        root.innerHTML = items;
        if (this.rafId === 0 && debuggerOptions.layers) {
            const loop = () => {
                if (this.dismissed || debuggerOptions.disabled || !debuggerOptions.layers) {
                    this.rafId = 0;
                    root.innerHTML = '';
                    this.renderFocusHighlight(null);
                    return;
                }
                this.rafId = requestAnimationFrame(loop);
                this.renderLayerHighlights();
                this.renderFocusHighlight(getDiagnostics()[this.activeIndex] ?? getDiagnostics()[0] ?? null);
            };
            this.rafId = requestAnimationFrame(loop);
        }
    }
}

function row(label: string, value: string): string {
    return `
        <div class="row">
            <div class="subtle">${escapeHtml(label)}</div>
            <div>${escapeHtml(value)}</div>
        </div>
    `;
}

function filterButton(label: string, filter: DiagnosticFilter, current: DiagnosticFilter, count: number): string {
    return `
        <button
            type="button"
            class="${filter === current ? 'active' : ''}"
            data-action="filter"
            data-filter="${filter}"
        >${label} (${count})</button>
    `;
}

function getDiagnosticCode(item: MiuraDiagnostic | null | undefined): string | undefined {
    const code = item?.internalDetails?.code;
    return typeof code === 'string' && code ? code : undefined;
}

function getElementPath(element: HTMLElement | null | undefined): string {
    if (!element) return '';
    const parts: string[] = [];
    let current: Element | null = element;

    while (current && parts.length < 4) {
        const id = current.id ? `#${current.id}` : '';
        const label = current.getAttribute('label') || current.getAttribute('name') || current.getAttribute('aria-label');
        const labelText = label ? `[${label}]` : '';
        parts.unshift(`${current.localName}${id}${labelText}`);
        const rootNode: Node = current.getRootNode();
        const host: Element | null = rootNode instanceof ShadowRoot ? rootNode.host : null;
        current = current.parentElement ?? host;
    }

    return parts.join(' > ');
}

function serializeDiagnosticForCopy(item: MiuraDiagnostic): Record<string, unknown> {
    return {
        severity: item.severity,
        subsystem: item.subsystem,
        stage: item.stage,
        message: item.message,
        summary: item.summary,
        code: getDiagnosticCode(item),
        component: item.componentTag ?? item.componentClass,
        property: item.propertyName,
        binding: item.bindingLabel ?? item.bindingKind,
        route: item.routePath,
        elementPath: getElementPath(item.element),
        values: item.valuesSnapshot,
        details: item.internalDetails,
        stack: item.stack,
    };
}

function formatStack(stack: string): string {
    const lines = stack.split('\n');
    const head = lines[0] ?? '';
    const frames = lines.slice(1);
    const preferred = frames.filter((line) => !line.includes('node_modules') && !line.includes('internal/'));
    const fallback = preferred.length > 0 ? preferred : frames;
    return [head, ...fallback.slice(0, 8)].filter(Boolean).join('\n');
}

function escapeHtml(value: string): string {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function hasRenderableValues(value: Record<string, unknown> | undefined): boolean {
    return !!value && Object.keys(value).length > 0;
}

function renderContextRows(item: MiuraDiagnostic): string {
    const rows: string[] = [];

    if (item.componentTag ?? item.componentClass) {
        rows.push(row('Component', item.componentTag ?? item.componentClass ?? 'Unknown component'));
    }

    if (item.bindingLabel ?? item.bindingKind) {
        rows.push(row('Binding', item.bindingLabel ?? item.bindingKind ?? 'n/a'));
    }

    if (item.propertyName) {
        rows.push(row('Property', item.propertyName));
    }

    if (item.routePath) {
        rows.push(row('Route', item.routePath));
    }

    if (item.pluginName) {
        rows.push(row('Plugin', item.pluginName));
    }

    return rows.join('');
}

function ensureOverlayElement(): HTMLElement | null {
    if (!canUseDom()) return null;
    if (!customElements.get('miura-dev-overlay')) {
        customElements.define('miura-dev-overlay', MiuraDevOverlayElement);
    }
    let overlay = document.querySelector('miura-dev-overlay') as HTMLElement | null;
    if (!overlay) {
        overlay = document.createElement('miura-dev-overlay');
        document.body.appendChild(overlay);
    }
    return overlay;
}

export function mountMiuraDevOverlay(): HTMLElement | null {
    if (debuggerOptions.disabled || !debuggerOptions.overlay) {
        return null;
    }
    return ensureOverlayElement();
}

export function unmountMiuraDevOverlay(): void {
    if (!canUseDom()) return;
    document.querySelector('miura-dev-overlay')?.remove();
}
