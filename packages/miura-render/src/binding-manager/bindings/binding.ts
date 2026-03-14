export interface Binding {
    setValue(value: unknown, context?: unknown): void | Promise<void>;
    clear(): void;
    disconnect?(): void;
} 