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

const DEFAULT_OPTIONS: Required<MiuraDebuggerOptions> = {
    disabled: false,
    report: true,
    overlay: true,
    layers: false,
    performance: false,
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
    (target as Record<PropertyKey, unknown>)[COMPONENT_DEBUG_OPTIONS] = {
        ...((target as Record<PropertyKey, unknown>)[COMPONENT_DEBUG_OPTIONS] as ComponentDebugOptions | undefined),
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

    const value = source ? (source as Record<PropertyKey, unknown>)[COMPONENT_DEBUG_OPTIONS] : undefined;
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
    private selectedLayerId: string | null = null;
    private readonly controlClickHandler = (event: Event) => {
        const target = event.target as HTMLElement | null;
        const action = target?.closest('[data-action]')?.getAttribute('data-action');
        if (!action) return;

        const items = getDiagnostics();
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

        if (action === 'clear') {
            clearDiagnostics();
        }

        if (action === 'close-inspector') {
            this.selectedLayerId = null;
            this.render();
            return;
        }
    };
    private readonly layerClickHandler = (event: Event) => {
        const target = event.target as HTMLElement | null;
        const layerId = target?.closest('[data-layer-id]')?.getAttribute('data-layer-id');
        if (!layerId) return;
        this.selectedLayerId = layerId;
        this.render();
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
            this.activeIndex = Math.min(this.activeIndex, Math.max(items.length - 1, 0));
            this.render();
        });

        this.layersUnsub = subscribeDebugLayers((layers) => {
            this.layerSnapshots = layers;
            this.renderLayerHighlights();
        });

        this.timelineUnsub = subscribeTimeline((events) => {
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
        this.shadow.removeEventListener('click', this.layerClickHandler);
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
                }
                .focus-root {
                    position: fixed;
                    inset: 0;
                    pointer-events: none;
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
                    background: rgba(79, 172, 254, 0.08);
                    border-radius: 8px;
                    box-sizing: border-box;
                    pointer-events: auto;
                    cursor: pointer;
                }
                .layer-box.error {
                    border-color: rgba(255, 95, 95, 0.95);
                    background: rgba(255, 95, 95, 0.12);
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
                        <button type="button" data-action="close-inspector">Close Inspector</button>
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

        const items = getDiagnostics();
        const selectedLayer = this.selectedLayerId
            ? this.layerSnapshots.find((layer) => layer.id === this.selectedLayerId) ?? null
            : null;

        if (items.length === 0 && !selectedLayer) {
            panel.classList.add('hidden');
            body.innerHTML = '';
            this.renderFocusHighlight(null);
            return;
        }

        panel.classList.remove('hidden');
        panel.style.left = `${this.panelPosition.x}px`;
        panel.style.top = `${this.panelPosition.y}px`;
        const item = items[this.activeIndex] ?? items[0] ?? null;

        if (!item && selectedLayer) {
            body.innerHTML = `${this.renderLayerInspector(selectedLayer)}${this.renderTimelineSection(selectedLayer.element)}`;
            this.renderFocusHighlight({
                id: selectedLayer.id,
                timestamp: Date.now(),
                severity: 'info',
                subsystem: 'debugger',
                stage: 'runtime',
                message: selectedLayer.label,
                element: selectedLayer.element,
                valuesSnapshot: selectedLayer.valuesSnapshot,
            });
            return;
        }

        if (!item) {
            panel.classList.add('hidden');
            body.innerHTML = '';
            this.renderFocusHighlight(null);
            return;
        }

        const adviceHtml = (item.advice ?? []).map((entry) => `
            <div class="advice-item">
                <strong>${entry.title}</strong>
                <div class="subtle">${entry.detail}</div>
            </div>
        `).join('');

        body.innerHTML = `
            <div class="section">
                <div class="subtle">${item.subsystem} / ${item.stage}</div>
                <p class="message">${escapeHtml(item.message)}</p>
                ${item.summary ? `<div class="subtle">${escapeHtml(item.summary)}</div>` : ''}
            </div>
            <div class="section">
                <p class="section-title">Context</p>
                ${row('Component', item.componentTag ?? item.componentClass ?? 'Unknown component')}
                ${row('Binding', item.bindingLabel ?? item.bindingKind ?? 'n/a')}
                ${row('Property', item.propertyName ?? 'n/a')}
                ${row('Route', item.routePath ?? 'n/a')}
                ${row('Plugin', item.pluginName ?? 'n/a')}
            </div>
            ${item.templateFragment ? `
                <div class="section">
                    <p class="section-title">Template Fragment</p>
                    <pre>${escapeHtml(item.templateFragment)}</pre>
                </div>
            ` : ''}
            ${item.valuesSnapshot ? `
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

    private renderSelectedLayerDetails(element: HTMLElement | null | undefined): string {
        const layer = element
            ? this.layerSnapshots.find((snapshot) => snapshot.element === element) ?? null
            : null;

        if (!layer) {
            return '';
        }

        return this.renderLayerDetailsSection(layer);
    }

    private renderTimelineSection(element?: HTMLElement | null): string {
        const items = this.timelineSnapshots
            .filter((event) => !element || event.element === element)
            .slice(0, 8);

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
        this.shadow.addEventListener('click', this.layerClickHandler);
    }

    private renderFocusHighlight(item: MiuraDiagnostic | null): void {
        const root = this.shadow.querySelector('.focus-root') as HTMLElement | null;
        if (!root || debuggerOptions.disabled || !debuggerOptions.overlay) {
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

        if (!debuggerOptions.layers || debuggerOptions.disabled) {
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
                        data-layer-id="${escapeHtml(snapshot.id)}"
                        style="left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;border-color:rgba(${color},0.95);background:rgba(${color},0.12);">
                        ${showName ? `<div class="layer-label">${escapeHtml(label)}</div>` : ''}
                    </div>
                `;
            })
            .join('');

        root.innerHTML = items;
        if (this.rafId === 0 && debuggerOptions.layers) {
            const loop = () => {
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
