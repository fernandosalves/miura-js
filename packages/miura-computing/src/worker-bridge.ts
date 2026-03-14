import type {
    WorkerRequest,
    WorkerMessage,
    WorkerBridgeOptions,
    WorkerStatus,
} from './types.js';

let _idCounter = 0;
function _uid(): string {
    return `mw_${++_idCounter}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * WorkerBridge — reactive bridge between the main thread and a Web Worker.
 *
 * ── Main-thread usage ─────────────────────────────────────────────────────────
 *
 *   // worker.ts — expose handlers (see WorkerContext)
 *   // main.ts
 *   const bridge = new WorkerBridge(
 *     new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
 *   );
 *
 *   // Single result
 *   const sum = await bridge.call<number>('add', { a: 1, b: 2 });
 *
 *   // Streaming result
 *   for await (const chunk of bridge.stream<string>('tokenise', { text: '...' })) {
 *     console.log(chunk);
 *   }
 *
 *   // Reactive status signal
 *   bridge.status.subscribe(s => console.log('worker:', s));
 *
 *   bridge.terminate();
 */
export class WorkerBridge {
    private readonly _worker: Worker;
    private readonly _opts: Required<WorkerBridgeOptions>;

    // Pending single-result tasks: id → { resolve, reject, timer? }
    private _pending = new Map<
        string,
        { resolve: (v: unknown) => void; reject: (e: Error) => void; timer?: ReturnType<typeof setTimeout> }
    >();

    // Pending stream tasks: id → AsyncGenerator controller
    private _streams = new Map<
        string,
        { push: (v: unknown) => void; error: (e: Error) => void; done: () => void }
    >();

    private _activeTasks = 0;
    private _statusListeners = new Set<(s: WorkerStatus) => void>();
    private _currentStatus: WorkerStatus = 'idle';

    constructor(worker: Worker, options: WorkerBridgeOptions = {}) {
        this._worker = worker;
        this._opts = {
            concurrency: options.concurrency ?? Infinity,
            timeout:     options.timeout     ?? 0,
            onError:     options.onError     ?? (() => {}),
        };

        this._worker.addEventListener('message', this._onMessage.bind(this));
        this._worker.addEventListener('error',   this._onWorkerError.bind(this));
    }

    // ── Status (reactive) ─────────────────────────────────────────────────────

    /** Current worker status. Subscribe via `status.subscribe()`. */
    readonly status = {
        peek:      () => this._currentStatus,
        subscribe: (fn: (s: WorkerStatus) => void): (() => void) => {
            this._statusListeners.add(fn);
            return () => this._statusListeners.delete(fn);
        },
    };

    private _setStatus(s: WorkerStatus): void {
        if (s === this._currentStatus) return;
        this._currentStatus = s;
        this._statusListeners.forEach(l => l(s));
    }

    // ── call() — single result ────────────────────────────────────────────────

    /**
     * Send a task to the worker and await a single result.
     *
     * @param method  — handler name exposed in the worker via `expose()`
     * @param payload — serialisable payload
     * @param transfer — transferable objects (ArrayBuffer etc.) for zero-copy
     */
    call<TResult = unknown, TPayload = unknown>(
        method: string,
        payload?: TPayload,
        transfer: Transferable[] = [],
    ): Promise<TResult> {
        return new Promise<TResult>((resolve, reject) => {
            const id = _uid();

            let timer: ReturnType<typeof setTimeout> | undefined;
            if (this._opts.timeout > 0) {
                timer = setTimeout(() => {
                    this._pending.delete(id);
                    this._taskDone();
                    const err = new Error(`WorkerBridge: task "${method}" timed out after ${this._opts.timeout}ms`);
                    this._opts.onError(err, method);
                    reject(err);
                }, this._opts.timeout);
            }

            this._pending.set(id, {
                resolve: resolve as (v: unknown) => void,
                reject,
                timer,
            });

            this._taskStart();
            const msg: WorkerRequest<TPayload> = {
                __miura: true,
                id,
                method,
                payload: payload as TPayload,
            };
            this._worker.postMessage(msg, transfer);
        });
    }

    // ── stream() — async generator ────────────────────────────────────────────

    /**
     * Send a streaming task to the worker. Returns an async generator that
     * yields each chunk produced by the worker handler.
     *
     * @param method  — streaming handler name exposed in the worker
     * @param payload — serialisable payload
     * @param transfer — transferable objects for zero-copy
     */
    async *stream<TChunk = unknown, TPayload = unknown>(
        method: string,
        payload?: TPayload,
        transfer: Transferable[] = [],
    ): AsyncGenerator<TChunk> {
        const id = _uid();
        const queue: TChunk[] = [];
        let _resolve: (() => void) | null = null;
        let _done = false;
        let _error: Error | null = null;

        this._streams.set(id, {
            push: (v: unknown) => {
                queue.push(v as TChunk);
                _resolve?.();
                _resolve = null;
            },
            error: (e: Error) => {
                _error = e;
                _done  = true;
                _resolve?.();
                _resolve = null;
            },
            done: () => {
                _done = true;
                _resolve?.();
                _resolve = null;
            },
        });

        this._taskStart();
        const msg: WorkerRequest<TPayload> = {
            __miura: true,
            id,
            method,
            payload: payload as TPayload,
        };
        this._worker.postMessage(msg, transfer);

        try {
            while (!_done || queue.length > 0) {
                if (queue.length === 0 && !_done) {
                    await new Promise<void>(r => { _resolve = r; });
                }
                while (queue.length > 0) {
                    yield queue.shift()!;
                }
                if (_error) throw _error;
            }
        } finally {
            this._streams.delete(id);
            this._taskDone();
        }
    }

    // ── terminate ─────────────────────────────────────────────────────────────

    terminate(): void {
        this._worker.terminate();
        this._setStatus('terminated');
        const err = new Error('WorkerBridge: worker terminated');
        this._pending.forEach(p => { clearTimeout(p.timer); p.reject(err); });
        this._pending.clear();
        this._streams.forEach(s => s.error(err));
        this._streams.clear();
    }

    // ── Internal ──────────────────────────────────────────────────────────────

    private _taskStart(): void {
        this._activeTasks++;
        this._setStatus('busy');
    }

    private _taskDone(): void {
        this._activeTasks = Math.max(0, this._activeTasks - 1);
        if (this._activeTasks === 0) this._setStatus('idle');
    }

    private _onMessage(event: MessageEvent): void {
        const msg = event.data as WorkerMessage;
        if (!msg?.__miura) return;

        const { id, type } = msg;

        if (type === 'result') {
            const pending = this._pending.get(id);
            if (!pending) return;
            clearTimeout(pending.timer);
            this._pending.delete(id);
            this._taskDone();
            pending.resolve(msg.result);
            return;
        }

        if (type === 'chunk') {
            const stream = this._streams.get(id);
            if (!stream) return;
            if (msg.done) {
                stream.done();
            } else {
                stream.push(msg.chunk);
            }
            return;
        }

        if (type === 'error') {
            const err = Object.assign(new Error(msg.message), { stack: msg.stack });
            this._opts.onError(err, '?');

            const pending = this._pending.get(id);
            if (pending) {
                clearTimeout(pending.timer);
                this._pending.delete(id);
                this._taskDone();
                pending.reject(err);
            }

            const stream = this._streams.get(id);
            if (stream) {
                stream.error(err);
            }
        }
    }

    private _onWorkerError(event: ErrorEvent): void {
        this._setStatus('error');
        const err = new Error(event.message);
        this._opts.onError(err, '<worker>');
    }
}
