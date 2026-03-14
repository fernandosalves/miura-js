// ── Message protocol ──────────────────────────────────────────────────────────

/** Direction: main thread → worker */
export interface WorkerRequest<TPayload = unknown> {
    __miura: true;
    id: string;
    method: string;
    payload: TPayload;
    /** Transferable objects to move (not copy) to the worker */
    transfer?: Transferable[];
}

/** Direction: worker → main thread (single response) */
export interface WorkerResponse<TResult = unknown> {
    __miura: true;
    id: string;
    type: 'result';
    result: TResult;
}

/** Direction: worker → main thread (streaming chunk) */
export interface WorkerChunk<TChunk = unknown> {
    __miura: true;
    id: string;
    type: 'chunk';
    chunk: TChunk;
    done: boolean;
}

/** Direction: worker → main thread (error) */
export interface WorkerError {
    __miura: true;
    id: string;
    type: 'error';
    message: string;
    stack?: string;
}

export type WorkerMessage<T = unknown> =
    | WorkerResponse<T>
    | WorkerChunk<T>
    | WorkerError;

// ── Handler types (worker side) ───────────────────────────────────────────────

/** A regular request handler — returns a single value */
export type TaskHandler<TPayload = unknown, TResult = unknown> =
    (payload: TPayload) => TResult | Promise<TResult>;

/** A streaming handler — yields multiple values */
export type StreamHandler<TPayload = unknown, TChunk = unknown> =
    (payload: TPayload) => AsyncGenerator<TChunk> | Generator<TChunk>;

export type AnyHandler = TaskHandler | StreamHandler;

/** Map of method names to handlers exposed by a worker */
export type HandlerMap = Record<string, AnyHandler>;

// ── Bridge state ──────────────────────────────────────────────────────────────

export type WorkerStatus = 'idle' | 'busy' | 'error' | 'terminated';

export interface WorkerBridgeOptions {
    /**
     * Number of concurrent tasks before queuing.
     * @default Infinity (no limit)
     */
    concurrency?: number;
    /**
     * Milliseconds before a task times out.
     * @default undefined (no timeout)
     */
    timeout?: number;
    /**
     * Called when a task is rejected due to a worker error.
     */
    onError?: (err: Error, method: string) => void;
}

// ── Transferable helpers ──────────────────────────────────────────────────────

/** Wrap a value with its transferable list for zero-copy transfer */
export interface Transferable_ {
    value: unknown;
    transfer: Transferable[];
}
